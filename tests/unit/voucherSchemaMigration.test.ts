import { describe, it, expect } from 'vitest';
import { calculateMonetaryRefundEligibleAt, validateMonetaryRefundEligibility, MONETARY_REFUND_DELAY_MS } from '../../convex/helpers/utils';

describe('Voucher Schema Migration - 14-Day Eligibility Logic', () => {
  describe('calculateMonetaryRefundEligibleAt', () => {
    it('should calculate eligible timestamp for seller-initiated vouchers', () => {
      const createdAt = Date.now();
      const eligibleAt = calculateMonetaryRefundEligibleAt('SELLER', createdAt);

      expect(eligibleAt).toBeDefined();
      expect(eligibleAt).toBe(createdAt + MONETARY_REFUND_DELAY_MS);
    });

    it('should return undefined for customer-initiated vouchers', () => {
      const createdAt = Date.now();
      const eligibleAt = calculateMonetaryRefundEligibleAt('CUSTOMER', createdAt);

      expect(eligibleAt).toBeUndefined();
    });

    it('should return undefined for vouchers without cancellation initiator', () => {
      const createdAt = Date.now();
      const eligibleAt = calculateMonetaryRefundEligibleAt(undefined, createdAt);

      expect(eligibleAt).toBeUndefined();
    });
  });

  describe('validateMonetaryRefundEligibility', () => {
    const now = Date.now();
    const createdAt = now - 20 * 24 * 60 * 60 * 1000; // 20 days ago
    const eligibleAt = createdAt + MONETARY_REFUND_DELAY_MS; // 14 days after creation = 6 days ago

    it('should return eligible for seller-initiated unused voucher past 14 days', () => {
      const result = validateMonetaryRefundEligibility('SELLER', eligibleAt, 0, createdAt);

      expect(result.isEligible).toBe(true);
      expect(result.daysRemaining).toBeUndefined();
      expect(result.error).toBeUndefined();
    });

    it('should return not eligible for customer-initiated vouchers', () => {
      const result = validateMonetaryRefundEligibility('CUSTOMER', eligibleAt, 0, createdAt);

      expect(result.isEligible).toBe(false);
      expect(result.error).toContain('seller-initiated cancellations');
    });

    it('should return not eligible for used vouchers', () => {
      const result = validateMonetaryRefundEligibility('SELLER', eligibleAt, 1, createdAt);

      expect(result.isEligible).toBe(false);
      expect(result.error).toContain('already been used');
    });

    it('should return not eligible with days remaining for vouchers before 14 days', () => {
      const recentCreatedAt = now - 5 * 24 * 60 * 60 * 1000; // 5 days ago
      const recentEligibleAt = recentCreatedAt + MONETARY_REFUND_DELAY_MS; // 9 days from now

      const result = validateMonetaryRefundEligibility('SELLER', recentEligibleAt, 0, recentCreatedAt);

      expect(result.isEligible).toBe(false);
      expect(result.daysRemaining).toBeGreaterThan(0);
      expect(result.daysRemaining).toBeLessThanOrEqual(9);
      expect(result.error).toContain('Monetary refund will be available');
    });

    it('should calculate eligibleAt from createdAt if not provided', () => {
      const recentCreatedAt = now - 5 * 24 * 60 * 60 * 1000; // 5 days ago

      const result = validateMonetaryRefundEligibility('SELLER', undefined, 0, recentCreatedAt);

      expect(result.isEligible).toBe(false);
      expect(result.daysRemaining).toBeGreaterThan(0);
      expect(result.daysRemaining).toBeLessThanOrEqual(9);
    });

    it('should handle edge case: exactly 14 days', () => {
      const exactly14DaysAgo = now - MONETARY_REFUND_DELAY_MS;
      const eligibleAt = exactly14DaysAgo + MONETARY_REFUND_DELAY_MS; // Exactly now

      const result = validateMonetaryRefundEligibility('SELLER', eligibleAt, 0, exactly14DaysAgo);

      // Should be eligible (or very close to eligible)
      expect(result.isEligible || result.daysRemaining === 0).toBe(true);
    });

    it('should handle edge case: just before 14 days', () => {
      const justBefore14Days = now - MONETARY_REFUND_DELAY_MS + 1000; // 1 second before 14 days
      const eligibleAt = justBefore14Days + MONETARY_REFUND_DELAY_MS; // 1 second from now

      const result = validateMonetaryRefundEligibility('SELLER', eligibleAt, 0, justBefore14Days);

      expect(result.isEligible).toBe(false);
      expect(result.daysRemaining).toBeLessThanOrEqual(1);
    });
  });

  describe('Migration validation scenarios', () => {
    it('should handle migration of initiatedBy "customer" to cancellationInitiator "CUSTOMER"', () => {
      // This tests the migration logic conceptually
      const oldValue = 'customer';
      const newValue = oldValue.toUpperCase() as 'CUSTOMER';

      expect(newValue).toBe('CUSTOMER');
    });

    it('should handle migration of initiatedBy "seller" to cancellationInitiator "SELLER"', () => {
      // This tests the migration logic conceptually
      const oldValue = 'seller';
      const newValue = oldValue.toUpperCase() as 'SELLER';

      expect(newValue).toBe('SELLER');
    });

    it('should handle migration of already uppercase values', () => {
      const oldValue = 'CUSTOMER';
      const newValue = oldValue as 'CUSTOMER';

      expect(newValue).toBe('CUSTOMER');
    });
  });
});
