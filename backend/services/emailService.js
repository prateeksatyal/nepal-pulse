const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  // If live credentials provided, use standard transport
  if (
    process.env.EMAIL_HOST &&
    process.env.EMAIL_HOST !== 'smtp.ethereal.email' &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_USER !== 'demo@ethereal.email'
  ) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // For development, testing, and university grading: create a test Ethereal account
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(' Nodemailer test account initialized:', testAccount.user);
    } catch (err) {
      console.warn(' Nodemailer fallback transport:', err.message);
      // Fallback mock transporter
      transporter = {
        sendMail: async (mailOptions) => ({
          messageId: `mock-${Date.now()}`,
          mock: true,
          previewUrl: 'Simulated email sent in test environment',
        }),
      };
    }
  }

  return transporter;
}

/**
 * Feature 10: Warranty Expiry Email Reminder
 * Sends an email reminder containing product name, provider, expiry date, days remaining, and link.
 */
async function sendWarrantyReminder(recipientEmail, recipientName, details) {
  const { productName, provider, endDate, daysRemaining, productId, warrantyId } = details;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const productLink = `${clientUrl}/products/${productId}`;

  const subject = `⚠️ Warranty Expiry Reminder: ${productName} expires in ${daysRemaining} days`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0284c7; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 22px;">Warranty Management System</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Warranty Expiry Notice</p>
      </div>
      <div style="padding: 24px;">
        <p>Hello <strong>${recipientName || 'Valued User'}</strong>,</p>
        <p>This is an automated reminder that the warranty for your registered product is approaching expiration:</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 4px 0;"><strong>Product:</strong> ${productName}</p>
          <p style="margin: 4px 0;"><strong>Warranty Provider:</strong> ${provider}</p>
          <p style="margin: 4px 0;"><strong>Expiry Date:</strong> ${endDate}</p>
          <p style="margin: 4px 0;"><strong>Days Remaining:</strong> <span style="color: #d97706; font-weight: bold;">${daysRemaining} day(s)</span></p>
        </div>

        <p>To view your warranty details, download receipts, or request service before expiration, click below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${productLink}" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Product & Warranty Details
          </a>
        </div>

        <p style="font-size: 13px; color: #64748b;">
          If you have already renewed this warranty or no longer own this product, you can update your records in the dashboard.
        </p>
      </div>
      <div style="background-color: #f1f5f9; padding: 12px 24px; font-size: 12px; color: #64748b; text-align: center;">
        Warranty Management System &bull; 3rd Semester Web Development Project
      </div>
    </div>
  `;

  const textContent = `Hello ${recipientName || 'User'},\n\n` +
    `Your warranty for ${productName} (Provider: ${provider}) is expiring on ${endDate} (${daysRemaining} days remaining).\n\n` +
    `View details here: ${productLink}\n\n` +
    `Warranty Management System`;

  try {
    const activeTransporter = await getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Warranty Management" <no-reply@warrantymanager.local>',
      to: recipientEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    };

    const info = await activeTransporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || info.previewUrl,
    };
  } catch (error) {
    console.error('Failed to send email reminder:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  sendWarrantyReminder,
  getTransporter,
};
