import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';

interface EmailData {
  to: string;
  subject: string;
  template: 'purchase' | 'earnings' | 'template-approved' | 'template-rejected';
  data: Record<string, any>;
}

// Email templates
const emailTemplates = {
  purchase: (data: Record<string, any>) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4F46E5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Purchase Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${data.userName},</p>
          <p>Thank you for your purchase! Your template is ready to use.</p>
          
          <div class="info-box">
            <h3>Order Details</h3>
            <p><strong>Template:</strong> ${data.templateName}</p>
            <p><strong>Price:</strong> Rp ${data.price.toLocaleString('id-ID')}</p>
            <p><strong>Subdomain:</strong> ${data.subdomain}.yourdomain.com</p>
            ${data.customDomain ? `<p><strong>Custom Domain:</strong> ${data.customDomain}</p>` : ''}
          </div>
          
          <p>You can now customize your template using our editor:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/editor/${data.instanceId}" class="button">
            Open Editor
          </a>
          
          <p>Your site will be live at: <br>
            <strong>https://${data.subdomain}.yourdomain.com</strong>
          </p>
          
          <p>Need help? Check our documentation or contact support.</p>
        </div>
        <div class="footer">
          <p>Template Marketplace © 2026</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  earnings: (data: Record<string, any>) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #f9fafb; }
        .amount { font-size: 32px; font-weight: bold; color: #10B981; text-align: center; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #10B981; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 New Sale!</h1>
        </div>
        <div class="content">
          <p>Congratulations!</p>
          <p>You've made a new sale for your template: <strong>${data.templateName}</strong></p>
          
          <div class="amount">
            Rp ${data.amount.toLocaleString('id-ID')}
          </div>
          
          <div class="info-box">
            <h3>Sale Details</h3>
            <p><strong>Buyer:</strong> ${data.buyerEmail}</p>
            <p><strong>Date:</strong> ${data.purchaseDate}</p>
            <p><strong>Your Earnings:</strong> Rp ${data.amount.toLocaleString('id-ID')} (70%)</p>
            <p><em>Platform fee: 30% (Already deducted)</em></p>
          </div>
          
          <p>Your earnings will be paid out at the end of the month.</p>
          <p>Keep creating amazing templates!</p>
        </div>
        <div class="footer">
          <p>Template Marketplace © 2026</p>
        </div>
      </div>
    </body>
    </html>
  `,

  'template-approved': (data: Record<string, any>) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Template Approved!</h1>
        </div>
        <div class="content">
          <p>Good news!</p>
          <p>Your template <strong>${data.templateName}</strong> has been approved and is now live in the marketplace!</p>
          
          <p>Users can now purchase and use your template. You'll earn 70% from each sale.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/marketplace/${data.templateSlug}" class="button">
            View in Marketplace
          </a>
        </div>
        <div class="footer">
          <p>Template Marketplace © 2026</p>
        </div>
      </div>
    </body>
    </html>
  `,

  'template-rejected': (data: Record<string, any>) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #f9fafb; }
        .reason-box { background: #FEF2F2; padding: 15px; margin: 15px 0; border-left: 4px solid #EF4444; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Template Needs Revision</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Unfortunately, your template <strong>${data.templateName}</strong> was not approved.</p>
          
          <div class="reason-box">
            <h3>Reason:</h3>
            <p>${data.reason}</p>
          </div>
          
          <p>Please make the necessary changes and resubmit your template for review.</p>
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
        </div>
        <div class="footer">
          <p>Template Marketplace © 2026</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

/**
 * Send email using nodemailer
 */
export async function sendEmail({ to, subject, template, data }: EmailData): Promise<void> {
  if (
    process.env.EMAIL_ENABLED === 'false' ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  ) {
    logger.info('Email skipped (SMTP not configured)', { to, template });
    return;
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
      },
    });

    // Get template HTML
    const html = emailTemplates[template](data);

    // Send email
    const info = await transporter.sendMail({
      from: `"Template Marketplace" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    logger.info('Email sent successfully', {
      messageId: info.messageId,
      to,
      template,
    });
  } catch (error: any) {
    logger.error('Failed to send email', error, {
      to,
      template,
    });
    // Don't throw - email failures shouldn't break the main flow
  }
}

/**
 * Send bulk emails (for notifications, etc)
 */
export async function sendBulkEmails(emails: EmailData[]): Promise<void> {
  const promises = emails.map((email) => sendEmail(email));
  await Promise.allSettled(promises);
}
