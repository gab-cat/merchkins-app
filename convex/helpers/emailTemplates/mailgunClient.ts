/**
 * Mailgun Client for Convex Actions
 * Shared utility for sending emails from Convex actions
 */

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  fromName?: string;
}

export interface SendEmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

/**
 * Send an email using Mailgun
 * Must be called from within a Convex action (Node.js environment)
 */
export const sendEmail = async (options: SendEmailOptions): Promise<SendEmailResult> => {
  const { to, subject, html, from, fromName = 'Merchkins' } = options;

  try {
    // Dynamically import Mailgun and form-data to avoid bundling issues
    const Mailgun = (await import('mailgun.js')).default;
    const formData = (await import('form-data')).default;

    // Validate environment variables
    if (!process.env.MAILGUN_API_KEY) {
      return { success: false, error: 'MAILGUN_API_KEY is not defined' };
    }
    if (!process.env.MAILGUN_DOMAIN) {
      return { success: false, error: 'MAILGUN_DOMAIN is not defined' };
    }

    // Initialize Mailgun client
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    });

    // Determine from address
    const fromAddress = from || `no-reply@${process.env.MAILGUN_DOMAIN}`;
    const fromField = `${fromName} <${fromAddress}>`;

    // Send email
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: fromField,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    return {
      success: true,
      messageId: result.id,
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Get the support email address
 */
export const getSupportFromAddress = (): string => {
  return `support@${process.env.MAILGUN_DOMAIN}`;
};

/**
 * Get the payouts email address
 */
export const getPayoutsFromAddress = (): string => {
  return `payouts@${process.env.MAILGUN_DOMAIN}`;
};

/**
 * Get the notifications email address
 */
export const getNotificationsFromAddress = (): string => {
  return `notifications@${process.env.MAILGUN_DOMAIN}`;
};
