import { KeywordResponse } from './types';

/**
 * Platform-level keyword responses for the Chatwoot bot.
 * These are checked against incoming customer messages.
 *
 * Add or modify keyword responses here.
 * Each response can match multiple keywords and use different match types:
 * - 'exact': Message must exactly match the keyword
 * - 'contains': Message must contain the keyword anywhere
 * - 'startsWith': Message must start with the keyword
 */
export const KEYWORD_RESPONSES: KeywordResponse[] = [
  // Greeting responses
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    response: "Hello! 👋 Welcome to Merchkins! I'm here to help you with any questions. What can I assist you with today?",
    matchType: 'contains',
  },

  // Operating hours
  {
    keywords: ['hours', 'open', 'schedule', 'when are you open', 'business hours'],
    response:
      "🕐 Our customer support is available Monday to Friday, 9:00 AM to 6:00 PM (Philippine Time). For urgent matters, please leave a message and we'll get back to you as soon as possible!",
    matchType: 'contains',
  },

  // Shipping inquiries
  {
    keywords: ['shipping', 'delivery', 'ship', 'deliver', 'how long'],
    response:
      '📦 Shipping times vary by seller and location. Most orders are processed within 1-3 business days. You can check the specific shipping details on the product page or in your order confirmation email. If you have a specific order inquiry, please provide your order number!',
    matchType: 'contains',
  },

  // Order tracking
  {
    keywords: ['track', 'tracking', 'where is my order', 'order status'],
    response: "📍 To track your order, please go to your Account > Orders section, or provide your order number and I'll help you check the status!",
    matchType: 'contains',
  },

  // Return policy
  {
    keywords: ['return', 'refund', 'exchange', 'money back'],
    response:
      '🔄 Our return and refund policies vary by seller. Generally, items can be returned within 7 days of delivery if unused and in original packaging. To request a refund, go to your Order Details and click "Request Refund". Need help with a specific order?',
    matchType: 'contains',
  },

  // Payment issues
  {
    keywords: ['payment', 'pay', 'gcash', 'bank', 'how to pay'],
    response:
      "💳 We accept various payment methods including GCash, bank transfer, and other e-wallets through Xendit. If you're having trouble with payment, please make sure you complete the payment within the invoice expiry time. Having issues? Let me know your order number!",
    matchType: 'contains',
  },

  // Contact/Support
  {
    keywords: ['contact', 'email', 'phone', 'support', 'help'],
    response:
      "📧 You're already connected to our support! Feel free to describe your issue here and our team will assist you. For complex issues, our human agents are also available to help.",
    matchType: 'contains',
  },

  // Thank you responses
  {
    keywords: ['thank', 'thanks', 'salamat'],
    response: "You're welcome! 😊 Is there anything else I can help you with? Feel free to ask anytime!",
    matchType: 'contains',
  },

  // Fallback for common questions
  {
    keywords: ['price', 'cost', 'how much'],
    response:
      "💰 Product prices are shown on each product page. If you're looking for something specific, you can browse our sellers' storefronts or use the search feature. Can I help you find something?",
    matchType: 'contains',
  },
];

/**
 * Check if a message matches any keyword and return the appropriate response.
 * Returns null if no keywords match.
 */
export function findKeywordResponse(message: string): string | null {
  const normalizedMessage = message.toLowerCase().trim();

  for (const keywordConfig of KEYWORD_RESPONSES) {
    for (const keyword of keywordConfig.keywords) {
      const normalizedKeyword = keyword.toLowerCase();

      let matches = false;

      switch (keywordConfig.matchType) {
        case 'exact':
          matches = normalizedMessage === normalizedKeyword;
          break;
        case 'contains':
          matches = normalizedMessage.includes(normalizedKeyword);
          break;
        case 'startsWith':
          matches = normalizedMessage.startsWith(normalizedKeyword);
          break;
      }

      if (matches) {
        return keywordConfig.response;
      }
    }
  }

  return null;
}
