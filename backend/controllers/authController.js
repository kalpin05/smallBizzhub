import supabase from "../config/supabase.js";
import jwt from "jsonwebtoken";
import { sendNewBusinessEmail } from "../utils/emailService.js";


/* ─── SIGNUP ─────────────────────────────────────────────── */
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json("All fields required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    /* 1. Check if profile already exists */
    const { data: existingProfile } = await supabase
      .from("users")
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
        emailRedirectTo: undefined  // Don't send confirmation email
      }
    });

    if (authError) {
      console.error("Auth Signup Error:", authError.message, "Status:", authError.status);

      // SMTP not configured — Supabase can't send confirmation email
      if (authError.status === 500 || authError.message.toLowerCase().includes("sending confirmation email") || authError.message.toLowerCase().includes("smtp")) {
        return res.status(503).json(
          "Supabase cannot send confirmation emails because SMTP is not configured. " +
          "Please go to: Supabase Dashboard → Authentication → Providers → Email → turn OFF 'Confirm email', then try again."
        );
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
      return res.status(400).json(
        "Signup failed - no user returned. " +
        "ACTION REQUIRED: Go to Supabase Dashboard → Authentication → Providers → Email → turn OFF 'Confirm email'."
      );
    }

    /* 3. Insert profile into public.users (only columns that exist) */
    const { data: userData, error: dbError } = await supabase
      .from("users")
      .insert([{ id: authData.user.id, name, email: normalizedEmail, role }])
      .select()
      .single();

    if (dbError) {
      console.error("DB Insert Error:", dbError.message);
      return res.status(500).json("Profile setup failed: " + dbError.message);
    }

    /* 4. If a business just registered, notify all existing clients */
    if (role === "business") {
      notifyClientsOfNewBusiness(userData).catch(err =>
        console.error("Client notification failed (non-blocking):", err.message)
      );
    }

    res.json({
      message: "Signup successful!",
      user: userData
    });

  } catch (err) {
    console.error("Signup Crash:", err.message);
    res.status(500).json({ error: "Signup failed", details: err.message });
  }
};

/* ─── HELPER: Notify clients of new business ─────────────── */
/* ─── HELPER: Notify clients of new business ─────────────── */
async function notifyClientsOfNewBusiness(newBusiness) {
  try {
    /* Fetch all client emails */
    const { data: clients, error } = await supabase
      .from("users")
      .select("email, name")
      .eq("role", "client");

    if (error || !clients || clients.length === 0) {
      console.log("No clients to notify or error:", error?.message);
      return;
    }

    console.log(`Notifying ${clients.length} client(s) about new business: ${newBusiness.name}`);

    // Send email using our new service
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
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.log("Auth Error:", authError.message);
      return res.status(401).json(authError.message);
    }

    if (!authData?.user) {
      return res.status(401).json("Authentication failed");
    }

    console.log("Auth OK for UID:", authData.user.id);

    /* 2. Fetch profile from public.users */
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError.message);
      return res.status(500).json("Error fetching user profile");
    }

    if (!userProfile) {
      console.log("No profile found for UID:", authData.user.id);
      return res.status(404).json("Profile not found. Please sign up again.");
    }

    /* 3. Issue JWT */
    const token = jwt.sign(
      { id: userProfile.id, role: userProfile.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: userProfile });

  } catch (err) {
    console.error("Login Crash:", err.message);
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};


/* ─── GET PROFILE ────────────────────────────────────────── */
export const getProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, role, location, business_name, category, created_at")
      .eq("id", req.user.id)
      .single();

    if (error) throw error;
    res.json(user);
  } catch (err) {
    console.error("Get Profile Error:", err.message);
    res.status(500).json({ error: "Failed to get profile", details: err.message });
  }
};


/* ─── UPDATE PROFILE ─────────────────────────────────────── */
export const updateProfile = async (req, res) => {
  try {
    const { name, location, business_name, category } = req.body;

    const { data, error } = await supabase
      .from("users")
      .update({ name, location, business_name, category })
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: "Profile updated successfully", user: data });
  } catch (err) {
    console.error("Update Profile Error:", err.message);
    res.status(500).json({ error: "Failed to update profile", details: err.message });
  }
};


/* ─── FORGOT PASSWORD (Supabase sends the email) ─────────── */
/* ─── FORGOT PASSWORD (Custom Email Service) ─────────── */
import { sendEmail } from "../utils/emailService.js";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json("Email is required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name")
      .eq("email", normalizedEmail)
      .single();

    if (userError || !user) {
      // For security, strictly don't reveal if email exists or not, but for dev debugging we log it
      console.log("Forgot password: Email not found:", normalizedEmail);
      return res.json({ message: "If this email is registered, you will receive a password reset link." });
    }

    // 2. Generate Password Reset Link using Supabase Admin API
    // This creates a valid action link without sending the email from Supabase
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: normalizedEmail,
      options: {
        redirectTo: `${req.headers.origin || "http://localhost:3000"}/forgot-password`
      }
    });

    if (linkError) {
      console.error("Error generating reset link:", linkError.message);
      return res.status(500).json("Failed to generate reset link");
    }

    // 3. Send Email using our NodeMailer service
    const resetLink = linkData.properties.action_link;
    const subject = "Reset Your Password - WAD Shop";
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2c3e50;">Password Reset Request</h2>
        <p>Hello ${user.name || "User"},</p>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        <a href="${resetLink}" style="background-color: #e74c3c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p style="font-size: 12px; color: #777;">This link will expire soon.</p>
      </div>
    `;

    await sendEmail(normalizedEmail, subject, html);
    console.log(`Password reset email sent to ${normalizedEmail}`);

    res.json({ message: "Password reset link sent to your email" });

  } catch (err) {
    console.error("Forgot password crash:", err.message);
    res.status(500).json({ error: "Failed to send reset link", details: err.message });
  }
};


/* ─── RESET PASSWORD ─────────────────────────────────────── */
export const resetPassword = async (req, res) => {
  try {
    const { newPassword, accessToken, refreshToken } = req.body;

    if (!newPassword) {
      return res.status(400).json("New password is required");
    }

    if (accessToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || ""
      });

      if (sessionError) {
        console.error("Set Session Error:", sessionError.message);
        return res.status(401).json("Invalid or expired session. Please request a new reset link.");
      }
    }

    const { data, error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error("Reset password error:", error.message);
      return res.status(500).json(error.message);
    }

    res.json({ message: "Password updated successfully. You can now log in.", user: data.user });

  } catch (err) {
    console.error("Reset password crash:", err.message);
    res.status(500).json({ error: "Password reset failed", details: err.message });
  }
};


/* ─── GET BUSINESSES ─────────────────────────────────────── */
export const getBusinesses = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, business_name, category, location")
      .eq("role", "business");

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Get Businesses Error:", err.message);
    res.status(500).json({ error: "Failed to get businesses", details: err.message });
  }
};
