import supabase from "../config/supabase.js";
import jwt from "jsonwebtoken";
import { sendNewBusinessEmail, sendEmail } from "../utils/emailService.js";

/* ─── HELPER: Create a notification for a user ──────────────── */
async function createNotification(userId, message) {
  try {
    /* 1. Always create in-app notification */
    await supabase
      .from("notifications")
      .insert([{ user_id: userId, message, is_read: false }]);

    /* 2. Check user's notification prefs and contact info */
    const { data: user } = await supabase
      .from("users1")
      .select("email, name, phone, notification_prefs")
      .eq("id", userId)
      .maybeSingle();

    if (!user) return;

    const prefs = user.notification_prefs || { email: true, sms: false };

    /* 3. Send email notification if enabled */
    if (prefs.email && user.email) {
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h3 style="color: #2c3e50;">SmallBizzHub Notification</h3>
          <p>Hello ${user.name || "User"},</p>
          <p>${message}</p>
          <p style="font-size: 12px; color: #777; margin-top: 20px;">You can manage notification preferences in your settings.</p>
        </div>
      `;
      sendEmail(user.email, "Notification - SmallBizzHub", html).catch(() => {});
    }

    /* 4. Send SMS notification if enabled and phone exists */
    if (prefs.sms && user.phone) {
      try {
        const { sendSMS } = await import("../utils/emailService.js");
        await sendSMS(user.phone, `SmallBizzHub: ${message}`);
      } catch (smsErr) {
        console.error("SMS notification failed (non-blocking):", smsErr.message);
      }
    }
  } catch (err) {
    console.error("Notification insert error:", err.message);
  }
}


/* ─── HELPER: get client row from user_id ─────────────────── */
async function getClientByUserId(userId) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return { data, error };
}

/* ─── HELPER: get business row from user_id ──────────────── */
async function getBusinessByUserId(userId) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return { data, error };
}


/* ─── SIGNUP ─────────────────────────────────────────────── */
export const signup = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json("All fields required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    /* 1. Check if profile already exists */
    const { data: existingProfile } = await supabase
      .from("users1")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingProfile) {
      return res.status(400).json("Email already exists. Please log in.");
    }

    /* 2. Create Supabase Auth account */
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: undefined,
      },
    });

    if (authError) {
      console.error("Auth Signup Error:", authError.message, "Status:", authError.status);
      if (authError.status === 500 || authError.message.toLowerCase().includes("sending confirmation email") || authError.message.toLowerCase().includes("smtp")) {
        return res.status(503).json("Supabase cannot send confirmation emails. Please disable 'Confirm email' in Supabase Auth settings.");
      }
      if (authError.status === 429 || authError.message.includes("rate limit")) {
        return res.status(429).json("Too many signups. Please wait a few minutes and try again.");
      }
      if (authError.message.includes("already registered") || authError.message.includes("already been registered")) {
        return res.status(400).json("This email is already registered. Please log in instead.");
      }
      return res.status(400).json(authError.message);
    }

    if (!authData?.user) {
      return res.status(400).json("Signup failed - no user returned. Please disable 'Confirm email' in Supabase Auth settings.");
    }

    /* 3. Insert into users1 table */
    const { data: userData, error: dbError } = await supabase
      .from("users1")
      .insert([{ id: authData.user.id, name, email: normalizedEmail, password: "managed_by_supabase_auth", role, phone: phone || null }])
      // phone is stored in users1.phone
      .select()
      .single();

    if (dbError) {
      console.error("DB Insert Error:", dbError.message);
      return res.status(500).json("Profile setup failed: " + dbError.message);
    }

    /* 4. Create client or business profile row */
    if (role === "client") {
      const { error: clientError } = await supabase
        .from("clients")
        .insert([{ user_id: userData.id }]);
      if (clientError) {
        console.error("Client profile creation error:", clientError.message);
      }
      /* Welcome notification for new client */
      createNotification(userData.id, `Welcome to SmallBizzHub, ${name}! Start discovering local businesses.`);
    } else if (role === "business") {
      const { error: bizError } = await supabase
        .from("businesses")
        .insert([{ user_id: userData.id, business_name: name }]);
      if (bizError) {
        console.error("Business profile creation error:", bizError.message);
      }
      /* Welcome notification for new business */
      createNotification(userData.id, `Welcome, ${name}! Your business account is ready. Add products to get started.`);

      /* Notify existing clients */
      notifyClientsOfNewBusiness(userData).catch((err) =>
        console.error("Client notification failed (non-blocking):", err.message)
      );
    }

    res.json({ message: "Signup successful!", user: userData });
  } catch (err) {
    console.error("Signup Crash:", err.message);
    res.status(500).json({ error: "Signup failed", details: err.message });
  }
};


/* ─── HELPER: Notify clients of new business ─────────────── */
async function notifyClientsOfNewBusiness(newBusiness) {
  try {
    const { data: clients, error } = await supabase
      .from("users1")
      .select("email, name")
      .eq("role", "client");

    if (error || !clients || clients.length === 0) {
      console.log("No clients to notify or error:", error?.message);
      return;
    }

    console.log(`Notifying ${clients.length} client(s) about new business: ${newBusiness.name}`);
    await sendNewBusinessEmail(clients, newBusiness);
  } catch (err) {
    console.error("notifyClientsOfNewBusiness error:", err.message);
  }
}


/* ─── LOGIN ──────────────────────────────────────────────── */
export const login = async (req, res) => {
  try {
    const { email: identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json("Email and password are required");
    }

    const email = identifier.trim().toLowerCase();
    console.log("Login attempt for:", email);

    /* 1. Sign in with Supabase Auth */
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      console.log("Auth Error:", authError.message);
      return res.status(401).json(authError.message);
    }

    if (!authData?.user) {
      return res.status(401).json("Authentication failed");
    }

    console.log("Auth OK for UID:", authData.user.id);

    /* 2. Fetch profile from users1 */
    const { data: userProfile, error: profileError } = await supabase
      .from("users1")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError.message);
      return res.status(500).json("Error fetching user profile");
    }

    if (!userProfile) {
      return res.status(404).json("Profile not found. Please sign up again.");
    }

    /* 3. Attach client or business profile info */
    let profileExtra = {};
    if (userProfile.role === "client") {
      const { data: clientData } = await getClientByUserId(userProfile.id);
      profileExtra = clientData || {};
    } else if (userProfile.role === "business") {
      const { data: bizData } = await getBusinessByUserId(userProfile.id);
      profileExtra = bizData || {};
    }

    /* 4. Issue JWT */
    const token = jwt.sign(
      { id: userProfile.id, role: userProfile.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: { ...userProfile, ...profileExtra } });
  } catch (err) {
    console.error("Login Crash:", err.message);
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};


/* ─── GET PROFILE ────────────────────────────────────────── */
export const getProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users1")
      .select("id, name, email, phone, role, created_at")
      .eq("id", req.user.id)
      .single();

    if (error) throw error;

    let profileExtra = {};
    if (user.role === "client") {
      const { data: clientData } = await getClientByUserId(user.id);
      if (clientData) {
        // Map clients.address -> location for frontend compatibility
        profileExtra = { ...clientData, location: clientData.address };
      }
    } else if (user.role === "business") {
      const { data: bizData } = await getBusinessByUserId(user.id);
      profileExtra = bizData || {};
    }

    res.json({ ...user, ...profileExtra });
  } catch (err) {
    console.error("Get Profile Error:", err.message);
    res.status(500).json({ error: "Failed to get profile", details: err.message });
  }
};


/* ─── UPDATE PROFILE ─────────────────────────────────────── */
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, location, business_name, category } = req.body;

    /* Always update name/phone in users1 */
    const { data: updatedUser, error: userError } = await supabase
      .from("users1")
      .update({ name, phone })
      .eq("id", req.user.id)
      .select()
      .single();

    if (userError) throw userError;

    let profileExtra = {};

    if (req.user.role === "client") {
      // Frontend sends 'location' — stored as clients.address
      const clientAddress = address || location || null;
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .update({ address: clientAddress })
        .eq("user_id", req.user.id)
        .select()
        .single();
      if (clientError) throw clientError;
      // Return 'location' back so frontend state stays consistent
      profileExtra = { ...clientData, location: clientData?.address };
    } else if (req.user.role === "business") {
      const { data: bizData, error: bizError } = await supabase
        .from("businesses")
        .update({ business_name, category, location })
        .eq("user_id", req.user.id)
        .select()
        .single();
      if (bizError) throw bizError;
      profileExtra = bizData || {};
    }

    res.json({ message: "Profile updated successfully", user: { ...updatedUser, ...profileExtra } });
  } catch (err) {
    console.error("Update Profile Error:", err.message);
    res.status(500).json({ error: "Failed to update profile", details: err.message });
  }
};


/* ─── OTP Store (in-memory, keyed by email) ──────────────── */
const otpStore = new Map(); // email -> { otp, expiresAt, userId }

/* ─── FORGOT PASSWORD (sends OTP via email) ──────────────── */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json("Email is required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: user, error: userError } = await supabase
      .from("users1")
      .select("id, name, phone")
      .eq("email", normalizedEmail)
      .single();

    if (userError || !user) {
      console.log("Forgot password: Email not found:", normalizedEmail);
      // Return generic message so attacker can't enumerate emails
      return res.json({ message: "If this email is registered, you will receive an OTP." });
    }

    /* Generate 6-digit OTP */
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(normalizedEmail, { otp, expiresAt, userId: user.id });

    /* Send OTP via email */
    const subject = "Your Password Reset OTP - SmallBizzHub";
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2c3e50;">Password Reset OTP</h2>
        <p>Hello ${user.name || "User"},</p>
        <p>We received a request to reset your password. Use the OTP below to proceed:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #e74c3c;">${otp}</span>
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p style="font-size: 12px; color: #777;">Do not share this code with anyone.</p>
      </div>
    `;

    await sendEmail(normalizedEmail, subject, html);

    /* Also send OTP via SMS if user has phone number */
    if (user.phone) {
      try {
        const { sendSMS } = await import("../utils/emailService.js");
        await sendSMS(user.phone, `SmallBizzHub: Your password reset OTP is ${otp}. Valid for 10 minutes. Do not share this code.`);
      } catch (smsErr) {
        console.error("SMS send failed (non-blocking):", smsErr.message);
      }
    }

    console.log(`OTP sent to ${normalizedEmail}`);

    res.json({ message: "OTP has been sent to your email" + (user.phone ? " and phone" : "") });
  } catch (err) {
    console.error("Forgot password crash:", err.message);
    res.status(500).json({ error: "Failed to send OTP", details: err.message });
  }
};


/* ─── VERIFY OTP ─────────────────────────────────────────── */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json("Email and OTP are required");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const stored = otpStore.get(normalizedEmail);

    if (!stored) {
      return res.status(400).json("No OTP found for this email. Please request a new one.");
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json("OTP has expired. Please request a new one.");
    }

    if (stored.otp !== otp.trim()) {
      return res.status(400).json("Invalid OTP. Please try again.");
    }

    /* OTP is valid — mark as verified (keep in store for resetPassword step) */
    stored.verified = true;
    otpStore.set(normalizedEmail, stored);

    res.json({ message: "OTP verified successfully. You can now set a new password.", verified: true });
  } catch (err) {
    console.error("Verify OTP crash:", err.message);
    res.status(500).json({ error: "OTP verification failed", details: err.message });
  }
};


/* ─── RESET PASSWORD (after OTP verification) ────────────── */
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json("Email and new password are required");
    }

    if (newPassword.length < 6) {
      return res.status(400).json("Password must be at least 6 characters");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const stored = otpStore.get(normalizedEmail);

    if (!stored || !stored.verified) {
      return res.status(400).json("OTP not verified. Please verify OTP first.");
    }

    /* Update password via Supabase Admin API */
    const { error } = await supabase.auth.admin.updateUserById(stored.userId, {
      password: newPassword,
    });

    if (error) {
      console.error("Reset password error:", error.message);
      return res.status(500).json(error.message);
    }

    /* Clean up OTP */
    otpStore.delete(normalizedEmail);

    /* Notify user */
    createNotification(stored.userId, "Your password was reset successfully. If this wasn't you, contact support immediately.");

    res.json({ message: "Password updated successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password crash:", err.message);
    res.status(500).json({ error: "Password reset failed", details: err.message });
  }
};


/* ─── GET BUSINESSES ─────────────────────────────────────── */
export const getBusinesses = async (req, res) => {
  try {
    /* Join users1 with businesses to get full business info */
    const { data, error } = await supabase
      .from("businesses")
      .select("id, business_name, category, location, user_id, users1(id, name, email)");

    if (error) throw error;

    /* Flatten the response */
    const result = data.map((b) => ({
      id: b.id,
      user_id: b.user_id,
      business_name: b.business_name,
      category: b.category,
      location: b.location,
      name: b.users1?.name,
      email: b.users1?.email,
    }));

    res.json(result);
  } catch (err) {
    console.error("Get Businesses Error:", err.message);
    res.status(500).json({ error: "Failed to get businesses", details: err.message });
  }
};


/* ═════════════════════════════════════════════════════════════
   CHANGE PASSWORD (Authenticated user)
   PUT /api/auth/change-password
   ─────────────────────────────────────────────────────────── */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }

    /* 1. Get user's email to verify current password */
    const { data: userRow } = await supabase
      .from("users1")
      .select("email")
      .eq("id", req.user.id)
      .single();

    if (!userRow?.email) {
      return res.status(404).json({ error: "User not found." });
    }

    /* 2. Verify current password by re-authenticating */
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: userRow.email,
      password: currentPassword,
    });

    if (verifyError) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    /* 3. Update password in Supabase Auth */
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    /* 4. Security notification */
    createNotification(req.user.id, "Your password was changed successfully. If this wasn't you, contact support immediately.");

    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("Change password crash:", err.message);
    res.status(500).json({ error: "Password change failed.", details: err.message });
  }
};


/* ═════════════════════════════════════════════════════════════
   TOGGLE 2-FACTOR AUTHENTICATION
   PUT /api/auth/toggle-2fa
   Body: { enabled: true | false }
   REQUIRES in Supabase SQL Editor:
     ALTER TABLE users1 ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
   ─────────────────────────────────────────────────────────── */
export const toggle2FA = async (req, res) => {
  try {
    const { enabled } = req.body;

    const { error } = await supabase
      .from("users1")
      .update({ two_factor_enabled: !!enabled })
      .eq("id", req.user.id);

    if (error) {
      if (error.message?.includes("two_factor_enabled") || error.code === "PGRST204" || error.code === "42703") {
        return res.status(400).json({
          error: "Column 'two_factor_enabled' is missing from users1 table. Please run this SQL in Supabase:\nALTER TABLE users1 ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;"
        });
      }
      throw error;
    }

    /* Notify the user */
    const msg = enabled
      ? "Two-Factor Authentication has been ENABLED. A code will be sent to your email on every login."
      : "Two-Factor Authentication has been DISABLED on your account.";
    createNotification(req.user.id, msg);

    /* Confirmation email when enabling */
    if (enabled) {
      const { data: userRow } = await supabase
        .from("users1")
        .select("email, name")
        .eq("id", req.user.id)
        .single();

      if (userRow?.email) {
        const html = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Two-Factor Authentication Enabled</h2>
            <p>Hello ${userRow.name || "User"},</p>
            <p>2FA has been enabled on your SmallBizzHub account. A verification code will be emailed on every login.</p>
            <p style="color:#c0392b;">If you did not enable this, contact support immediately.</p>
          </div>
        `;
        await sendEmail(userRow.email, "2FA Enabled - SmallBizzHub", html).catch(() => {});
      }
    }

    res.json({ message: `2FA ${enabled ? "enabled" : "disabled"} successfully.`, two_factor_enabled: !!enabled });
  } catch (err) {
    console.error("Toggle 2FA crash:", err.message);
    res.status(500).json({ error: "Failed to toggle 2FA.", details: err.message });
  }
};


/* ═════════════════════════════════════════════════════════════
   SAVE / GET NOTIFICATION PREFERENCES
   PUT /api/auth/notification-preferences
   GET /api/auth/notification-preferences
   REQUIRES in Supabase SQL Editor:
     ALTER TABLE users1 ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{"email":true,"sms":false,"marketing":true}';
   ─────────────────────────────────────────────────────────── */
export const saveNotificationPreferences = async (req, res) => {
  try {
    const { email, sms, marketing } = req.body;
    const prefs = { email: !!email, sms: !!sms, marketing: !!marketing };

    const { error } = await supabase
      .from("users1")
      .update({ notification_prefs: prefs })
      .eq("id", req.user.id);

    if (error) {
      if (error.message?.includes("notification_prefs") || error.code === "PGRST204" || error.code === "42703") {
        return res.status(400).json({
          error: "Column 'notification_prefs' is missing from users1 table. Please run this SQL in Supabase:\nALTER TABLE users1 ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{\"email\":true,\"sms\":false,\"marketing\":true}';"
        });
      }
      throw error;
    }

    createNotification(req.user.id, "Your notification preferences have been updated.");
    res.json({ message: "Notification preferences saved!", prefs });
  } catch (err) {
    res.status(500).json({ error: "Failed to save preferences.", details: err.message });
  }
};

export const getNotificationPreferences = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users1")
      .select("notification_prefs, two_factor_enabled")
      .eq("id", req.user.id)
      .single();

    // If columns don't exist yet, return safe defaults instead of crashing
    if (error && (error.code === "42703" || error.message?.includes("notification_prefs") || error.message?.includes("two_factor_enabled"))) {
      return res.json({
        prefs: { email: true, sms: false, marketing: true },
        two_factor_enabled: false,
        _warning: "Run ALTER TABLE to add two_factor_enabled and notification_prefs columns."
      });
    }

    if (error) throw error;

    res.json({
      prefs: data?.notification_prefs || { email: true, sms: false, marketing: true },
      two_factor_enabled: data?.two_factor_enabled || false,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch preferences.", details: err.message });
  }
};
