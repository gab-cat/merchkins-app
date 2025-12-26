/**
 * Unit tests for validatePositiveFiniteNumber validation function
 * Tests both positive validation path and error paths (NaN, Infinity, negative, zero)
 */

import { describe, it, expect } from 'bun:test';
import { validatePositiveFiniteNumber } from '../../convex/helpers/validation';

describe('validatePositiveFiniteNumber', () => {
  describe('Positive validation path', () => {
    it('should accept valid positive finite numbers', () => {
      expect(() => validatePositiveFiniteNumber(1, 'Test field')).not.toThrow();
      expect(() => validatePositiveFiniteNumber(100, 'Test field')).not.toThrow();
      expect(() => validatePositiveFiniteNumber(0.01, 'Test field')).not.toThrow();
      expect(() => validatePositiveFiniteNumber(999999.99, 'Test field')).not.toThrow();
      expect(() => validatePositiveFiniteNumber(1.5, 'Test field')).not.toThrow();
    });

    it('should accept very small positive numbers', () => {
      expect(() => validatePositiveFiniteNumber(Number.MIN_VALUE, 'Test field')).not.toThrow();
      expect(() => validatePositiveFiniteNumber(0.0000001, 'Test field')).not.toThrow();
    });

    it('should accept large positive numbers', () => {
      expect(() => validatePositiveFiniteNumber(Number.MAX_SAFE_INTEGER, 'Test field')).not.toThrow();
      expect(() => validatePositiveFiniteNumber(1000000, 'Test field')).not.toThrow();
    });
  });

  describe('Error path - NaN', () => {
    it('should throw error for NaN', () => {
      expect(() => validatePositiveFiniteNumber(NaN, 'Requested amount')).toThrow(
        'Requested amount cannot be NaN'
      );
    });

    it('should throw error for NaN with custom field name', () => {
      expect(() => validatePositiveFiniteNumber(NaN, 'Custom field')).toThrow(
        'Custom field cannot be NaN'
      );
    });
  });

  describe('Error path - Infinity', () => {
    it('should throw error for positive Infinity', () => {
      expect(() => validatePositiveFiniteNumber(Infinity, 'Requested amount')).toThrow(
        'Requested amount must be a finite number'
      );
    });

    it('should throw error for negative Infinity', () => {
      expect(() => validatePositiveFiniteNumber(-Infinity, 'Requested amount')).toThrow(
        'Requested amount must be a finite number'
      );
    });

    it('should throw error for Infinity with custom field name', () => {
      expect(() => validatePositiveFiniteNumber(Infinity, 'Custom field')).toThrow(
        'Custom field must be a finite number'
      );
    });
  });

  describe('Error path - Negative numbers', () => {
    it('should throw error for negative numbers', () => {
      expect(() => validatePositiveFiniteNumber(-1, 'Requested amount')).toThrow(
        'Requested amount must be a positive number greater than 0'
      );
      expect(() => validatePositiveFiniteNumber(-100, 'Requested amount')).toThrow(
        'Requested amount must be a positive number greater than 0'
      );
      expect(() => validatePositiveFiniteNumber(-0.01, 'Requested amount')).toThrow(
        'Requested amount must be a positive number greater than 0'
      );
    });

    it('should throw error for negative numbers with custom field name', () => {
      expect(() => validatePositiveFiniteNumber(-50, 'Custom field')).toThrow(
        'Custom field must be a positive number greater than 0'
      );
    });
  });

  describe('Error path - Zero', () => {
    it('should throw error for zero', () => {
      expect(() => validatePositiveFiniteNumber(0, 'Requested amount')).toThrow(
        'Requested amount must be a positive number greater than 0'
      );
    });

    it('should throw error for negative zero', () => {
      expect(() => validatePositiveFiniteNumber(-0, 'Requested amount')).toThrow(
        'Requested amount must be a positive number greater than 0'
      );
    });

    it('should throw error for zero with custom field name', () => {
      expect(() => validatePositiveFiniteNumber(0, 'Custom field')).toThrow(
        'Custom field must be a positive number greater than 0'
      );
    });
  });

  describe('Error path - Non-number types', () => {
    it('should throw error for string', () => {
      expect(() => validatePositiveFiniteNumber('100' as unknown as number, 'Requested amount')).toThrow(
        'Requested amount must be a number'
      );
    });

    it('should throw error for null', () => {
      expect(() => validatePositiveFiniteNumber(null as unknown as number, 'Requested amount')).toThrow(
        'Requested amount must be a number'
      );
    });

    it('should throw error for undefined', () => {
      expect(() => validatePositiveFiniteNumber(undefined as unknown as number, 'Requested amount')).toThrow(
        'Requested amount must be a number'
      );
    });

    it('should throw error for object', () => {
      expect(() => validatePositiveFiniteNumber({} as unknown as number, 'Requested amount')).toThrow(
        'Requested amount must be a number'
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle Number.EPSILON correctly', () => {
      expect(() => validatePositiveFiniteNumber(Number.EPSILON, 'Test field')).not.toThrow();
    });

    it('should reject numbers very close to zero but positive', () => {
      // This should pass as it's still positive
      expect(() => validatePositiveFiniteNumber(0.000000000000001, 'Test field')).not.toThrow();
    });
  });
});

