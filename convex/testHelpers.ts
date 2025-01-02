import { PaymongoWebhookEvent } from '../types/paymongo';
import { Id } from './_generated/dataModel';

/**
 * Test helper utilities for Convex tests
 * Provides factory functions and common test data
 */

// ============================================================================
// Mock Identity Helpers
// ============================================================================

export interface MockUserIdentity {
  name?: string;
  email?: string;
  subject?: string;
  tokenIdentifier?: string;
  issuer?: string;
}

/**
 * Creates a mock user identity for authenticated tests
 */
export function createMockIdentity(overrides?: Partial<MockUserIdentity>): MockUserIdentity {
  const id = Math.random().toString(36).slice(2, 10);
  return {
    name: `Test User ${id}`,
    email: `testuser-${id}@example.com`,
    subject: `user_${id}`,
    ...overrides,
  };
}

// ============================================================================
// Test Data Factories
// ============================================================================

/**
 * Creates test user data with all required fields
 */
export function createTestUserData(overrides?: Record<string, unknown>) {
  const id = Math.random().toString(36).slice(2, 8);
  return {
    isDeleted: false,
    clerkId: `clerk_${id}`,
    isOnboarded: true,
    firstName: 'Test',
    lastName: `User${id}`,
    imageUrl: `https://example.com/avatar/${id}.png`,
    email: `user-${id}@test.com`,
    phone: `+63912345${id}`,
    isStaff: false,
    isAdmin: false,
    isSetupDone: true,
    isMerchant: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

/**
 * Creates test organization data with all required fields
 */
export function createTestOrganizationData(overrides?: Record<string, unknown>) {
  const id = Math.random().toString(36).slice(2, 8);
  return {
    isDeleted: false,
    name: `Test Org ${id}`,
    slug: `test-org-${id}`,
    description: 'A test organization',
    organizationType: 'PUBLIC' as const,
    memberCount: 1,
    adminCount: 1,
    activeProductCount: 0,
    totalOrderCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

/**
 * Creates test organization member data with all required embedded fields
 */
export function createTestOrgMemberData(
  userId: Id<'users'>,
  organizationId: Id<'organizations'>,
  role: 'ADMIN' | 'STAFF' | 'MEMBER' = 'ADMIN',
  overrides?: Record<string, unknown>
) {
  const now = Date.now();
  return {
    userId,
    organizationId,
    userInfo: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      phone: '+639123456789',
      isStaff: role !== 'MEMBER',
    },
    organizationInfo: {
      name: 'Test Org',
      slug: 'test-org',
      organizationType: 'PUBLIC',
    },
    role,
    isActive: true,
    joinedAt: now,
    permissions: [],
    orderCount: 0,
    messageCount: 0,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Creates test product data with all required fields
 */
export function createTestProductData(organizationId: Id<'organizations'>, createdById: Id<'users'>, overrides?: Record<string, unknown>) {
  const id = Math.random().toString(36).slice(2, 8);
  return {
    isDeleted: false,
    postedById: createdById,
    organizationId,
    creatorInfo: {
      firstName: 'Test',
      lastName: 'Creator',
      email: 'creator@test.com',
    },
    slug: `test-product-${id}`,
    title: `Test Product ${id}`,
    isActive: true,
    description: 'A test product',
    rating: 0,
    reviewsCount: 0,
    imageUrl: [],
    tags: [],
    isBestPrice: false,
    inventory: 50,
    inventoryType: 'STOCK' as const,
    variants: [],
    recentReviews: [],
    totalVariants: 0,
    totalOrders: 0,
    viewCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

/**
 * Creates test cart data with all required fields
 */
export function createTestCartData(userId: Id<'users'>, overrides?: Record<string, unknown>) {
  const now = Date.now();
  return {
    userId,
    userInfo: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
    },
    embeddedItems: [],
    totalItems: 0,
    selectedItems: 0,
    totalValue: 0,
    selectedValue: 0,
    lastActivity: now,
    isAbandoned: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Creates test order data with all required fields
 */
export function createTestOrderData(organizationId: Id<'organizations'>, customerId: Id<'users'>, overrides?: Record<string, unknown>) {
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  return {
    isDeleted: false,
    organizationId,
    customerId,
    orderNumber,
    orderDate: Date.now(),
    status: 'PENDING' as const,
    paymentStatus: 'PENDING' as const,
    customerInfo: {
      firstName: 'Test',
      lastName: 'Customer',
      email: 'customer@test.com',
      phone: '+639123456789',
    },
    totalAmount: 100,
    discountAmount: 0,
    itemCount: 1,
    uniqueProductCount: 1,
    recentStatusHistory: [] as Array<{
      status: string;
      changedBy: Id<'users'>;
      changedByName: string;
      reason?: string;
      changedAt: number;
    }>,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

/**
 * Creates test voucher data for promotional vouchers
 */
export function createTestVoucherData(createdById: Id<'users'>, overrides?: Record<string, unknown>) {
  const code = `TEST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  return {
    isDeleted: false,
    code,
    name: `Test Voucher ${code}`,
    discountType: 'PERCENTAGE' as const,
    discountValue: 10,
    isActive: true,
    usedCount: 0,
    usageLimitPerUser: 1,
    validFrom: Date.now(),
    createdById,
    creatorInfo: {
      firstName: 'Test',
      lastName: 'Admin',
      email: 'admin@test.com',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

/**
 * Creates test refund voucher data
 */
export function createTestRefundVoucherData(
  assignedToUserId: Id<'users'>,
  createdById: Id<'users'>,
  amount: number,
  cancellationInitiator: 'CUSTOMER' | 'SELLER',
  overrides?: Record<string, unknown>
) {
  const code = `REFUND-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const createdAt = Date.now();

  // Calculate monetary refund eligibility
  // Seller-initiated: eligible after 14 days
  // Customer-initiated: not eligible
  const MONETARY_REFUND_DELAY_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
  const monetaryRefundEligibleAt = cancellationInitiator === 'SELLER' ? createdAt + MONETARY_REFUND_DELAY_MS : undefined;

  return {
    isDeleted: false,
    code,
    name: `Refund Voucher - ${code}`,
    discountType: 'REFUND' as const,
    discountValue: amount,
    isActive: true,
    usedCount: 0,
    usageLimitPerUser: 1,
    usageLimit: 1,
    validFrom: createdAt,
    assignedToUserId,
    cancellationInitiator,
    monetaryRefundEligibleAt,
    createdById,
    creatorInfo: {
      firstName: 'System',
      lastName: '',
      email: 'system@merchkins.com',
    },
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  };
}

/**
 * Creates test payment data with all required fields
 */
export function createTestPaymentData(
  orderId: Id<'orders'>,
  userId: Id<'users'>,
  organizationId: Id<'organizations'>,
  overrides?: Record<string, unknown>
) {
  const now = Date.now();
  const refNo = `REF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  return {
    isDeleted: false,
    orderId,
    userId,
    organizationId,
    orderInfo: {
      orderNumber: 'ORD-TEST-001',
      customerName: 'Test Customer',
      customerEmail: 'customer@test.com',
      totalAmount: 100,
      orderDate: now,
      status: 'PENDING',
    },
    userInfo: {
      firstName: 'Test',
      lastName: 'Customer',
      email: 'customer@test.com',
      phone: '+639123456789',
    },
    paymentDate: now,
    amount: 100,
    paymentMethod: 'XENDIT' as const,
    paymentSite: 'OFFSITE' as const,
    paymentStatus: 'VERIFIED' as const,
    referenceNo: refNo,
    currency: 'PHP',
    reconciliationStatus: 'PENDING' as const,
    statusHistory: [
      {
        status: 'PENDING',
        changedAt: now - 60000,
      },
      {
        status: 'VERIFIED',
        changedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ============================================================================
// Time Helpers
// ============================================================================

export const ONE_HOUR_MS = 60 * 60 * 1000;
export const ONE_DAY_MS = 24 * ONE_HOUR_MS;
export const REFUND_WINDOW_MS = 24 * ONE_HOUR_MS; // 24 hours
export const MONETARY_REFUND_DELAY_MS = 14 * ONE_DAY_MS; // 14 days

/**
 * Gets a timestamp from the past
 */
export function getPastTimestamp(hoursAgo: number): number {
  return Date.now() - hoursAgo * ONE_HOUR_MS;
}

/**
 * Gets a timestamp in the future
 */
export function getFutureTimestamp(hoursFromNow: number): number {
  return Date.now() + hoursFromNow * ONE_HOUR_MS;
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Asserts that a Convex mutation throws an error with the expected message
 */
export async function expectMutationError(mutationPromise: Promise<unknown>, expectedMessage: string | RegExp): Promise<void> {
  try {
    await mutationPromise;
    throw new Error(`Expected mutation to throw, but it succeeded`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (typeof expectedMessage === 'string') {
      if (!message.includes(expectedMessage)) {
        throw new Error(`Expected error to contain "${expectedMessage}", but got: ${message}`);
      }
    } else {
      if (!expectedMessage.test(message)) {
        throw new Error(`Expected error to match ${expectedMessage}, but got: ${message}`);
      }
    }
  }
}

// ============================================================================
// Paymongo Test Helpers
// ============================================================================

/**
 * Creates test checkout session data for grouped orders
 */
export function createTestCheckoutSessionData(customerId: Id<'users'>, orderIds: Id<'orders'>[], overrides?: Record<string, unknown>) {
  const checkoutId = crypto.randomUUID();
  const now = Date.now();
  return {
    checkoutId,
    customerId,
    orderIds,
    totalAmount: 1000,
    status: 'PENDING' as const,
    expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Creates mock Paymongo webhook event for testing
 * @param type - The webhook event type
 * @param checkoutIdOrOrderNumber - For checkout sessions: checkoutId, for single orders: orderNumber
 * @param overrides - Optional overrides for the webhook event
 */
export function createMockPaymongoWebhookEvent(
  type: 'checkout_session.payment.paid' | 'payment.failed',
  checkoutIdOrOrderNumber: string,
  overrides?: Record<string, unknown>
): PaymongoWebhookEvent {
  const paymentId = `pay_${Math.random().toString(36).slice(2, 10)}`;
  const amount = 10000; // 100 PHP in centavos

  // For single-order payment.failed events, the structure is different
  if (type === 'payment.failed' && !checkoutIdOrOrderNumber.startsWith('checkout-')) {
    // Single order payment.failed event
    return {
      id: `evt_${Math.random().toString(36).slice(2, 10)}`,
      type: 'payment.failed',
      livemode: false,
      data: {
        id: paymentId,
        type: 'payment',
        attributes: {
          access_url: null,
          amount,
          balance_transaction_id: `btxn_${Math.random().toString(36).slice(2, 10)}`,
          billing: {
            name: 'Test Customer',
            email: 'test@test.com',
            phone: '+639123456789',
          },
          currency: 'PHP',
          description: 'Test payment',
          disputed: false,
          external_reference_number: checkoutIdOrOrderNumber, // This is the orderNumber for single orders
          fee: Math.round(amount * 0.035),
          livemode: false,
          net_amount: amount - Math.round(amount * 0.035),
          origin: 'api',
          payment_intent_id: `pi_${Math.random().toString(36).slice(2, 10)}`,
          payout: null,
          source: {
            id: `src_${Math.random().toString(36).slice(2, 10)}`,
            type: 'gcash',
          },
          statement_descriptor: 'TEST',
          status: 'failed',
          metadata: {
            external_id: checkoutIdOrOrderNumber,
          },
          refunds: [],
          taxes: [],
          available_at: Math.floor(Date.now() / 1000),
          created_at: Math.floor(Date.now() / 1000),
          updated_at: Math.floor(Date.now() / 1000),
        },
      },
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
      ...overrides,
    };
  }

  // Checkout session event (default behavior)
  return {
    id: `evt_${Math.random().toString(36).slice(2, 10)}`,
    type,
    livemode: false,
    data: {
      id: checkoutIdOrOrderNumber,
      type: 'checkout_session',
      attributes: {
        status: type === 'checkout_session.payment.paid' ? 'paid' : 'expired',
        checkout_url: `https://checkout.paymongo.com/${checkoutIdOrOrderNumber}`,
        client_key: `client_${Math.random().toString(36).slice(2, 10)}`,
        line_items: [
          {
            amount,
            currency: 'PHP',
            name: 'Test Item',
            quantity: 1,
          },
        ],
        livemode: false,
        merchant: `merchant_${Math.random().toString(36).slice(2, 10)}`,
        payment_intent: {
          id: `pi_${Math.random().toString(36).slice(2, 10)}`,
          type: 'payment_intent',
          attributes: {
            amount,
            capture_type: 'automatic',
            client_key: `client_${Math.random().toString(36).slice(2, 10)}`,
            currency: 'PHP',
            description: 'Test payment intent',
            livemode: false,
            statement_descriptor: 'TEST',
            status: 'succeeded',
            last_payment_error: null,
            payment_method_allowed: ['gcash'],
            payments: [],
            next_action: null,
            setup_future_usage: null,
            created_at: Math.floor(Date.now() / 1000),
            updated_at: Math.floor(Date.now() / 1000),
          },
        },
        payments: [
          {
            id: paymentId,
            type: 'payment',
            attributes: {
              access_url: null,
              amount,
              balance_transaction_id: `btxn_${Math.random().toString(36).slice(2, 10)}`,
              billing: {
                name: 'Test Customer',
                email: 'test@test.com',
                phone: '+639123456789',
              },
              currency: 'PHP',
              description: 'Test payment',
              disputed: false,
              external_reference_number: null,
              fee: Math.round(amount * 0.035), // 3.5% Paymongo fee
              livemode: false,
              net_amount: amount - Math.round(amount * 0.035),
              origin: 'api',
              payment_intent_id: `pi_${Math.random().toString(36).slice(2, 10)}`,
              payout: null,
              source: {
                id: `src_${Math.random().toString(36).slice(2, 10)}`,
                type: 'gcash',
              },
              statement_descriptor: 'TEST',
              status: type === 'checkout_session.payment.paid' ? 'paid' : 'failed',
              metadata: {},
              refunds: [],
              taxes: [],
              available_at: Math.floor(Date.now() / 1000),
              created_at: Math.floor(Date.now() / 1000),
              paid_at: type === 'checkout_session.payment.paid' ? Math.floor(Date.now() / 1000) : undefined,
              updated_at: Math.floor(Date.now() / 1000),
            },
          },
        ],
        payment_method_types: ['gcash'],
        send_email_receipt: false,
        show_description: false,
        show_line_items: true,
        success_url: `https://example.com/success`,
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
        metadata: {
          external_id: `checkout-${checkoutIdOrOrderNumber}`,
        },
        ...overrides,
      },
    },
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
  };
}
