/**
 * Email Service for Purchase Notifications
 * 
 * Sends transactional emails for purchases, confirmations, and receipts
 */

import nodemailer from 'nodemailer';

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  // Check if SMTP is configured
  if (
    process.env.EMAIL_ENABLED === 'false' ||
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  ) {
    console.warn('SMTP not configured. Emails will be logged to console only.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transporter;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(options: EmailOptions) {
  const transport = getTransporter();

  if (!transport) {
    // Log to console if SMTP not configured
    console.log('📧 Email (would be sent):', {
      to: options.to,
      subject: options.subject,
      preview: options.text || options.html.substring(0, 100),
    });
    return { messageId: 'mock-' + Date.now() };
  }

  try {
    const info = await transport.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'KOREX'}" <${
        process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
      }>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('📧 Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

/**
 * Send purchase confirmation email to buyer
 */
export async function sendPurchaseConfirmation(params: {
  to: string;
  userName: string;
  templateName: string;
  price: number;
  orderId: string;
  instanceId: string;
}) {
  const { to, userName, templateName, price, orderId, instanceId } = params;

  const subject = `Purchase Confirmed - ${templateName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Purchase Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          
          <p>Thank you for your purchase! Your template is ready to customize.</p>
          
          <div class="details">
            <h3>Order Details:</h3>
            <p><strong>Template:</strong> ${templateName}</p>
            <p><strong>Amount:</strong> ${formatPrice(price)}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
          </div>
          
          <p>You can now start customizing your template:</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/editor/${instanceId}" class="button">
            Start Customizing →
          </a>
          
          <p>Need help? Visit our <a href="${process.env.NEXT_PUBLIC_APP_URL}/support">support center</a> or contact our team.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} KOREX. All rights reserved.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/purchases">View Purchase History</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Purchase Confirmed!

Hi ${userName},

Thank you for your purchase! Your template is ready to customize.

Order Details:
- Template: ${templateName}
- Amount: ${formatPrice(price)}
- Order ID: ${orderId}

Start customizing: ${process.env.NEXT_PUBLIC_APP_URL}/editor/${instanceId}

© ${new Date().getFullYear()} KOREX
  `;

  return sendEmail({ to, subject, html, text });
}

/**
 * Send earnings notification to contributor
 */
export async function sendEarningsNotification(params: {
  to: string;
  contributorName: string;
  templateName: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  orderId: string;
}) {
  const { to, contributorName, templateName, grossAmount, platformFee, netAmount, orderId } = params;
  const feePercent =
    grossAmount > 0 ? Math.round((platformFee / grossAmount) * 100) : 0;

  const subject = `New Sale - ${templateName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .earnings { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981; }
        .amount { font-size: 32px; color: #10b981; font-weight: bold; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 You Made a Sale!</h1>
        </div>
        <div class="content">
          <p>Hi ${contributorName},</p>
          
          <p>Congratulations! Your template "<strong>${templateName}</strong>" has been purchased.</p>
          
          <div class="earnings">
            <h3>Your Earnings:</h3>
            <div class="amount">${formatPrice(netAmount)}</div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
              Gross: ${formatPrice(grossAmount)} - Platform Fee (${feePercent}%): ${formatPrice(platformFee)} = Net: ${formatPrice(netAmount)}
            </p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Status:</strong> Pending (will be paid out at the end of the month)</p>
          </div>
          
          <p>Keep creating amazing templates!</p>
          
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/contributor/earnings">View All Earnings →</a></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} KOREX. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
You Made a Sale!

Hi ${contributorName},

Congratulations! Your template "${templateName}" has been purchased.

Your Earnings:
- Gross: ${formatPrice(grossAmount)}
- Platform Fee (${feePercent}%): ${formatPrice(platformFee)}
- Net: ${formatPrice(netAmount)}

Order ID: ${orderId}
Status: Pending (will be paid out at the end of the month)

View all earnings: ${process.env.NEXT_PUBLIC_APP_URL}/contributor/earnings

© ${new Date().getFullYear()} KOREX
  `;

  return sendEmail({ to, subject, html, text });
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailedNotification(params: {
  to: string;
  userName: string;
  templateName: string;
  orderId: string;
  reason?: string;
}) {
  const { to, userName, templateName, orderId, reason } = params;

  const subject = `Payment Failed - ${templateName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Payment Failed</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          
          <p>Unfortunately, your payment for <strong>${templateName}</strong> could not be processed.</p>
          
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          
          <p><strong>Order ID:</strong> ${orderId}</p>
          
          <p>Please try again or use a different payment method.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/marketplace/${templateName.toLowerCase().replace(/\s+/g, '-')}" class="button">
            Try Again →
          </a>
          
          <p>Need help? Contact our support team.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} KOREX. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Payment Failed

Hi ${userName},

Unfortunately, your payment for "${templateName}" could not be processed.

${reason ? `Reason: ${reason}` : ''}

Order ID: ${orderId}

Please try again: ${process.env.NEXT_PUBLIC_APP_URL}/marketplace

© ${new Date().getFullYear()} KOREX
  `;

  return sendEmail({ to, subject, html, text });
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

export default {
  sendPurchaseConfirmation,
  sendEarningsNotification,
  sendPaymentFailedNotification,
};
