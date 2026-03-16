import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: "gmail", // Use "gmail" for Gmail, or configure host/port for others
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error("❌ Email Service Error: Connection failed");
        console.error(error);
    } else {
        console.log("✅ Email Service is ready to send emails");
    }
});

/**
 * Send a generic email
 * @param {string} to - Recipient email(s)
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 */
export const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"WAD React App" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            html, // html body
        });

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        // Don't throw, just log. We don't want to break the main flow if email fails.
    }
};

/**
 * Send email notification to clients about a new product
 * @param {Array} clients - List of client objects { email, name }
 * @param {Object} product - Product object
 * @param {Object} business - Business object
 */
export const sendNewProductEmail = async (clients, product, business) => {
    if (!clients || clients.length === 0) return;

    const clientEmails = clients.map((c) => c.email).join(",");
    const subject = `New Product Alert: ${product.name} from ${business.name}`;

    const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2c3e50;">New Product Alert!</h2>
      <p>Hello,</p>
      <p>A new product has just been added by <strong>${business.name}</strong>!</p>
      
      <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${product.name}</h3>
        <p><strong>Price:</strong> $${product.price}</p>
        <p>${product.description || "Check it out now!"}</p>
        ${product.image
            ? `<img src="${product.image}" alt="${product.name}" style="max-width: 100%; height: auto; border-radius: 5px; margin-top: 10px;" />`
            : ""
        }
      </div>

      <p>Visit our website to view more details.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit Website</a>
      
      <p style="margin-top: 30px; font-size: 12px; color: #777;">You are receiving this email because you are a registered client.</p>
    </div>
  `;

    // Sending individually or as BCC to avoid exposing all emails?
    // For simplicity and privacy, let's send as BCC or individual emails.
    // Using BCC for single transaction efficiency:
    try {
        await transporter.sendMail({
            from: `"WAD Shop" <${process.env.EMAIL_USER}>`,
            bcc: clientEmails, // Use BCC to hide recipients from each other
            subject,
            html,
        });
        console.log(`New Product email sent to ${clients.length} clients.`);
    } catch (error) {
        console.error("Error sending new product email:", error);
    }
};

/**
 * Send email notification to clients about a new business
 * @param {Array} clients - List of client objects { email, name }
 * @param {Object} business - Business object
 */
export const sendNewBusinessEmail = async (clients, business) => {
    if (!clients || clients.length === 0) return;

    const clientEmails = clients.map((c) => c.email).join(",");
    const subject = `Welcome New Business: ${business.name || business.business_name || "New Business"}!`;

    const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2e7d32;">New Business Alert!</h2>
      <p>Hello,</p>
      <p>We are excited to welcome a new business to our platform!</p>
      
      <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0; background-color: #f9fbe7;">
        <h3 style="margin-top: 0;">${business.name || business.business_name}</h3>
        <p><strong>Category:</strong> ${business.category || "General"}</p>
        <p><strong>Location:</strong> ${business.location || "Online"}</p>
      </div>

      <p>Check out their profile and products on our website.</p>
       <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background-color: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Discover Now</a>

      <p style="margin-top: 30px; font-size: 12px; color: #777;">You are receiving this email because you are a registered client.</p>
    </div>
  `;

    try {
        await transporter.sendMail({
            from: `"WAD Shop" <${process.env.EMAIL_USER}>`,
            bcc: clientEmails,
            subject,
            html,
        });
        console.log(`New Business email sent to ${clients.length} clients.`);
    } catch (error) {
        console.error("Error sending new business email:", error);
    }
};


/**
 * Send an SMS message using Twilio
 * Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env
 * @param {string} to - Recipient phone number (e.g., +911234567890)
 * @param {string} message - SMS body text
 */
export const sendSMS = async (to, message) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromPhone = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromPhone) {
            console.warn("⚠️ SMS not configured: Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER in .env");
            return null;
        }

        // Dynamically import twilio to avoid crash if not installed
        const twilio = (await import("twilio")).default;
        const client = twilio(accountSid, authToken);

        // Ensure phone number has country code
        let formattedPhone = to.trim();
        if (!formattedPhone.startsWith("+")) {
            formattedPhone = "+91" + formattedPhone; // Default to India (+91)
        }

        const result = await client.messages.create({
            body: message,
            from: fromPhone,
            to: formattedPhone,
        });

        console.log(`SMS sent to ${formattedPhone}: SID ${result.sid}`);
        return result;
    } catch (error) {
        console.error("Error sending SMS:", error.message);
        // Don't throw — SMS failure should not break the main flow
        return null;
    }
};

