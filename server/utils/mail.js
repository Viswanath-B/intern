import nodemailer from "nodemailer";
import { Resend } from "resend";

const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function getTransportOptions() {
  const host = process.env.SMTP_HOST;
  const port = Number.parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host: host || "smtp.gmail.com",
    port: 465, // Use 465 for SSL (more stable on many cloud providers)
    secure: true, 
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: "TLSv1.2"
    },
    family: 4, // Force IPv4 to avoid IPv6 routing/firewall issues
    pool: true,
    connectionTimeout: 45000, 
    greetingTimeout: 45000,
    socketTimeout: 60000
  };
}

function getFromAddress(companyName) {
  const from = (process.env.EMAIL_FROM || "").trim();

  if (from && /@/.test(from)) {
    return from;
  }

  const smtpUser = (process.env.SMTP_USER || "").trim();

  if (smtpUser && /@/.test(smtpUser)) {
    return `${companyName} <${smtpUser}>`;
  }

  return from || companyName;
}

export async function sendApplicationConfirmationEmail({ to, fullName, internshipType, internshipMode, domain, role, rollNo, collegeName, city }) {
  if (!to) {
    return { skipped: true };
  }

  const transportOptions = getTransportOptions();

  if (!transportOptions) {
    return { skipped: true };
  }

  const companyName = process.env.COMPANY_NAME || "Spheronix Labs";
  const transport = nodemailer.createTransport(transportOptions);
  const internshipLabel = internshipType === "short" ? "Short-Term Internship (2 months)" : "Long-Term Internship (4 months)";
  const modeLabel = internshipMode === "online" ? "Online" : "Offline";
  const experienceNote = role === "Work Based" ? "You will receive an experience letter from the company." : "You have opted for a training-based internship track.";
  const fromAddress = getFromAddress(companyName);

  console.log(`[Email] Attempting to send confirmation email to: ${to}`);
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; background: #f8fafc; padding: 24px;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 32px; border: 1px solid #e2e8f0;">
        <p style="text-transform: uppercase; letter-spacing: 0.24em; font-size: 12px; color: #2563eb; font-weight: 700;">Application received</p>
        <h1 style="margin: 12px 0 16px; font-size: 28px; color: #020617;">Thank you for applying, ${fullName}</h1>
        <p style="margin: 0 0 24px; color: #475569;">We have received your application for <strong>${internshipLabel}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #0f172a;">
          <tr><td style="padding: 8px 0; color: #64748b; width: 180px;">Mode</td><td style="padding: 8px 0;">${modeLabel}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Domain</td><td style="padding: 8px 0;">${domain}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Role</td><td style="padding: 8px 0;">${role}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Roll No</td><td style="padding: 8px 0;">${rollNo}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">College</td><td style="padding: 8px 0;">${collegeName}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">City</td><td style="padding: 8px 0;">${city}</td></tr>
        </table>
        <div style="margin-top: 24px; padding: 16px 18px; border-radius: 18px; background: #eff6ff; color: #1d4ed8; font-weight: 600;">${experienceNote}</div>
        <p style="margin-top: 24px; color: #475569;">Thank you for applying with ${companyName}.</p>
      </div>
    </div>
  `;

  try {
    if (resendClient) {
      console.log(`[Email] Sending via Resend API to: ${to}`);
      const { error } = await resendClient.emails.send({
        from: fromAddress,
        to: [to],
        subject: `${companyName} Internship Application Received`,
        html: htmlContent
      });

      if (error) {
        throw new Error(`Resend Error: ${error.message}`);
      }

      console.log(`[Email] Resend API success to: ${to}`);
      return { skipped: false, driver: "resend" };
    }

    console.log(`[Email] Falling back to Nodemailer SMTP for: ${to}`);
    const transportOptions = getTransportOptions();
    if (!transportOptions) {
      console.warn("[Email] No SMTP driver available and Resend is not configured.");
      return { skipped: true };
    }
    const transport = nodemailer.createTransport(transportOptions);
    await transport.sendMail({
      from: fromAddress,
      to,
      subject: `${companyName} Internship Application Received`,
      html: htmlContent
    });
    console.log(`[Email] Nodemailer success to: ${to}`);
    return { skipped: false, driver: "nodemailer" };
  } catch (error) {
    console.error(`[Email] Critical failure sending email to ${to}:`);
    console.error(`- Error Code: ${error.code}`);
    console.error(`- Command: ${error.command}`);
    console.error(`- Response: ${error.response}`);
    console.error(`- Stack: ${error.stack}`);
    throw error;
  }

  return { skipped: false };
}
