const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const APP_NAME = 'Super Cash';
const PRIMARY_COLOR = '#22c55e'; // Institutional Green
const SYSTEM_EMAIL = 'no-reply@supercash.com'; // Default placeholder

const baseTemplate = (content, signature = true) => `
<div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; padding: 40px; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.02);">
  <div style="text-align: left; border-b: 2px solid ${PRIMARY_COLOR}; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="color: ${PRIMARY_COLOR}; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -1px;">${APP_NAME}</h1>
    <p style="color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; font-weight: 700; margin-top: 5px;">Institutional Notification Hub</p>
  </div>
  <div style="line-height: 1.8; color: #334155; font-size: 15px;">
    ${content}
  </div>
  ${signature ? `
  <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #f1f5f9;">
    <p style="margin: 0; font-weight: 800; color: #1e293b; font-size: 14px;">The ${APP_NAME} Protocol Team</p>
    <p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px;">Global Agricultural Investment Infrastructure</p>
  </div>
  ` : ''}
  <div style="margin-top: 40px; text-align: center; background-color: #f8fafc; padding: 20px; border-radius: 12px;">
    <p style="color: #94a3b8; font-size: 11px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
      This is an automated institutional message.
    </p>
    <p style="color: #cbd5e1; font-size: 10px; margin: 5px 0 0 0; font-weight: 500;">
      Please do not reply to this email. For assistance, visit our official support portal.
    </p>
  </div>
  <div style="margin-top: 30px; text-align: center; color: #e2e8f0; font-size: 10px;">
    <p>© ${new Date().getFullYear()} ${APP_NAME} Global Cluster. All rights reserved.</p>
  </div>
</div>
`;

exports.sendWelcomeEmail = async (to, fullName) => {
  const html = baseTemplate(`
    <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin-bottom: 20px;">Congratulations & Welcome, ${fullName}! 🎉</h2>
    <p>We are absolutely delighted to have you join our elite investment family. Your institutional account at <strong>${APP_NAME}</strong> has been successfully synchronized.</p>
    <p>You've taken the first step toward significant financial growth. Your path to wealth is now active and ready for exploration!</p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="${process.env.FRONTEND_URL}/login" style="background: ${PRIMARY_COLOR}; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.4);">Enter Your Dashboard</a>
    </div>
  `);
  
  await transporter.sendMail({
    from: `"${APP_NAME} Protocol" <no-reply@${process.env.EMAIL_DOMAIN || 'supercash.com'}>`,
    to,
    subject: `🎉 Congratulations: Your ${APP_NAME} Account is Live!`,
    html,
  }).catch(e => console.error("Email Error:", e));
};

exports.sendReferralCommissionEmail = async (to, referrerName, amount, currency) => {
  const html = baseTemplate(`
    <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin-bottom: 20px;">Huge Congratulations, ${referrerName}! 🎊</h2>
    <p>Great news! Your influence is paying off. A new member has successfully joined the protocol through your link.</p>
    <div style="background-color: #f0fdf4; border-left: 4px solid ${PRIMARY_COLOR}; padding: 25px; margin: 25px 0; border-radius: 0 12px 12px 0;">
      <p style="margin: 0; font-size: 13px; color: #166534; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Instant Reward Earned</p>
      <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: 900; color: #14532d;">+${amount} ${currency}</p>
    </div>
    <p>This "Sweet Result" has been added to your balance. Keep sharing the success!</p>
  `);

  await transporter.sendMail({
    from: `"${APP_NAME} Protocol" <no-reply@${process.env.EMAIL_DOMAIN || 'supercash.com'}>`,
    to,
    subject: `🎁 Congratulations! You've Earned a Commission - ${APP_NAME}`,
    html,
  }).catch(e => console.error("Email Error:", e));
};

exports.sendWithdrawalRequestEmail = async (to, amount, currency, method) => {
  const html = baseTemplate(`
    <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-bottom: 20px;">Nice Choice! Withdrawal Synced ⚡</h2>
    <p>Hello! We've received your request to withdraw <strong>${amount} ${currency}</strong> via <strong>${method}</strong>.</p>
    <p>Our team is already working hard to verify this transaction so you can enjoy your earnings as soon as possible!</p>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">Reference Index: #WF-${new Date().getTime().toString().slice(-6)}</p>
  `);

  await transporter.sendMail({
    from: `"${APP_NAME} Protocol" <no-reply@${process.env.EMAIL_DOMAIN || 'supercash.com'}>`,
    to,
    subject: `⚡ Your Withdrawal Request is Being Processed - ${APP_NAME}`,
    html,
  }).catch(e => console.error("Email Error:", e));
};

exports.sendWithdrawalApprovalEmail = async (to, amount, currency) => {
  const html = baseTemplate(`
    <h2 style="color: #2563eb; font-size: 24px; font-weight: 900; margin-bottom: 20px;">Congratulations! Your Funds are on the Way! 🥂</h2>
    <p>Wonderful news! Your withdrawal of <strong>${amount} ${currency}</strong> has been fully approved and the capital has been dispatched.</p>
    <p>It’s time to enjoy the fruits of your investment! The funds should reflect in your account very shortly.</p>
    <div style="text-align: center; margin: 30px 0;">
      <p style="font-size: 13px; font-weight: 800; color: ${PRIMARY_COLOR}; text-transform: uppercase; letter-spacing: 2px;">Status: SUCCESSFULLY DISBURSED</p>
    </div>
  `);

  await transporter.sendMail({
    from: `"${APP_NAME} Protocol" <no-reply@${process.env.EMAIL_DOMAIN || 'supercash.com'}>`,
    to,
    subject: `🎊 Congratulations! Your Withdrawal is Approved - ${APP_NAME}`,
    html,
  }).catch(e => console.error("Email Error:", e));
};


exports.sendVerificationEmail = async (to, token) => {
  const html = baseTemplate(`
    <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-bottom: 20px;">Identity Verification Required</h2>
    <p>To ensure the security of your institutional assets, please verify your email address via the secure link below.</p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="${process.env.FRONTEND_URL}/verify/${token}" style="background: #0f172a; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Verify Identity</a>
    </div>
    <p style="font-size: 12px; color: #64748b;">This link will expire in 24 hours for security purposes.</p>
  `, false);
  
  await transporter.sendMail({
    from: `"${APP_NAME} Protocol" <no-reply@${process.env.EMAIL_DOMAIN || 'supercash.com'}>`,
    to,
    subject: `Security: Verify your email address - ${APP_NAME}`,
    html,
  }).catch(e => console.error("Email Error:", e));
};

exports.sendAdminOTPEmail = async (to, otp) => {
  const html = `
  <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 500px; margin: auto; background-color: #0f172a; border-radius: 24px; padding: 40px; color: #f8fafc; border: 1px solid #1e293b; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; padding: 12px; background: rgba(34, 197, 94, 0.1); border-radius: 16px; border: 1px solid rgba(34, 197, 94, 0.2); margin-bottom: 20px;">
        <span style="font-size: 24px;">🔐</span>
      </div>
      <h1 style="margin: 0; font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; text-transform: uppercase;">Nexus Protocol Verification</h1>
      <p style="margin: 8px 0 0 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 2px;">Administrative Security Layer</p>
    </div>

    <div style="background-color: #1e293b; border-radius: 20px; padding: 35px; text-align: center; border: 1px solid #334155; margin-bottom: 30px;">
      <p style="margin: 0 0 20px 0; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Universal Logic Token (ULT)</p>
      <div style="display: flex; justify-content: center; gap: 15px;">
        ${otp.split('').map(digit => `
          <div style="width: 60px; height: 80px; background: #0f172a; border: 1px solid #34d399; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin: 0 4px;">
            <span style="font-size: 42px; font-weight: 900; color: #34d399; font-family: 'Courier New', monospace;">${digit}</span>
          </div>
        `).join('')}
      </div>
      <p style="margin: 25px 0 0 0; font-size: 10px; font-weight: 800; color: #34d399; text-transform: uppercase; letter-spacing: 1px;">VALID FOR 10 MINUTES ONLY</p>
    </div>

    <div style="font-size: 13px; line-height: 1.6; color: #94a3b8; text-align: center; padding: 0 20px;">
      <p style="margin: 0;">This temporary clearance code was requested for an administrative node login. If this was not you, please trigger a <strong>System Lockdown</strong> immediately.</p>
    </div>

    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #1e293b; text-align: center;">
      <p style="margin: 0; font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 1px;">Super Cash Security Cluster v4.2.0</p>
      <p style="margin: 5px 0 0 0; font-size: 9px; color: #334155;">Network Identity: ${to ? to.replace(/(.{3})(.*)(@.*)/, "$1***$3") : 'Hidden'}</p>
    </div>
  </div>
  `;

  await transporter.sendMail({
    from: `"${APP_NAME} Security" <security@${process.env.EMAIL_DOMAIN || 'supercash.com'}>`,
    to,
    subject: `[SECURE] Administrative Verification: ${otp}`,
    html,
  }).catch(e => console.error("Email Error:", e));
};

