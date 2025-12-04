import { defineSchema } from 'convex/server';

// Import all table definitions
import { users } from './models/users';
import {
  organizations,
  organizationMembers,
  organizationInviteLinks,
  organizationPermissions,
  organizationJoinRequests,
} from './models/organizations';
import { products, reviews } from './models/products';
import { orders, orderItems, orderLogs } from './models/orders';
import { payments } from './models/payments';
import { payoutInvoices, payoutSettings } from './models/payouts';
import { carts, cartItems } from './models/carts';
import { categories } from './models/categories';
import { permissions, userPermissions } from './models/permissions';
import { files } from './models/files';
import { logs } from './models/logs';
import { messages } from './models/messages';
import { announcements } from './models/announcements';
import { surveyResponses, surveyCategories } from './models/surveys';
import { tickets, ticketUpdates, ticketReads } from './models/tickets';
import { chatRooms, chatParticipants, chatMessages, messageReactions, chatRoomState } from './models/chats';
import { vouchers, voucherUsages } from './models/vouchers';

export default defineSchema({
  // User management
  users,

  // Organization management
  organizations,
  organizationMembers,
  organizationInviteLinks,
  organizationPermissions,
  organizationJoinRequests,

  // Product management
  products,
  reviews,
  categories,

  // Order management
  orders,
  orderItems,
  orderLogs,

  // Payment management
  payments,

  // Payout management
  payoutInvoices,
  payoutSettings,

  // Cart management
  carts,
  cartItems,

  // Permission management
  permissions,
  userPermissions,

  // File management
  files,

  // Logging
  logs,

  // Communication
  messages,
  announcements,

  // Chat functionality
  chatRooms,
  chatParticipants,
  chatMessages,
  messageReactions,
  chatRoomState,

  // Surveys
  surveyResponses,
  surveyCategories,

  // Support
  tickets,
  ticketUpdates,
  ticketReads,

  // Vouchers
  vouchers,
  voucherUsages,
});
