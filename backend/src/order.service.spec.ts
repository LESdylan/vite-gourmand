/**
 * Order Business Logic Unit Tests
 * ================================
 * 
 * Tests order-related business logic at the service level:
 * - Price calculations
 * - Status transitions
 * - Validation rules
 * - Delivery fee logic
 * 
 * Run with: npm test
 */

// ============================================
// Order Status Constants
// ============================================
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERING: 'delivering',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// Valid status transitions
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivering'],
  delivering: ['delivered'],
  delivered: ['completed'],
  completed: [],
  cancelled: [],
};

// ============================================
// Business Logic Functions (Pure)
// ============================================

/**
 * Calculate menu price based on price per person and guest count
 */
export function calculateMenuPrice(pricePerPerson: number, personCount: number): number {
  if (pricePerPerson < 0 || personCount < 0) {
    throw new Error('Price and person count must be non-negative');
  }
  return Math.round(pricePerPerson * personCount * 100) / 100;
}

/**
 * Calculate delivery fee based on distance and order value
 */
export function calculateDeliveryFee(
  distanceKm: number,
  orderValue: number,
  options?: { freeDeliveryThreshold?: number; baseRate?: number; perKmRate?: number }
): number {
  const {
    freeDeliveryThreshold = 1000,
    baseRate = 30,
    perKmRate = 2.5,
  } = options || {};

  // Free delivery for large orders
  if (orderValue >= freeDeliveryThreshold) {
    return 0;
  }

  // Base rate + per km charge
  const fee = baseRate + (distanceKm * perKmRate);
  return Math.round(fee * 100) / 100;
}

/**
 * Calculate total order amount
 */
export function calculateOrderTotal(
  menuPrice: number,
  deliveryFee: number,
  discount: number = 0
): number {
  const total = menuPrice + deliveryFee - discount;
  return Math.max(0, Math.round(total * 100) / 100);
}

/**
 * Validate status transition
 */
export function isValidStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  const allowedTransitions = STATUS_TRANSITIONS[from];
  return allowedTransitions?.includes(to) || false;
}

/**
 * Validate order can be cancelled
 */
export function canCancelOrder(status: OrderStatus): boolean {
  return ['pending', 'confirmed', 'preparing'].includes(status);
}

/**
 * Check if order is in final state
 */
export function isOrderFinal(status: OrderStatus): boolean {
  return ['completed', 'cancelled'].includes(status);
}

/**
 * Validate minimum person count against menu requirement
 */
export function validatePersonCount(personCount: number, menuMinPerson: number): boolean {
  return personCount >= menuMinPerson;
}

/**
 * Calculate material lending deposit
 */
export function calculateMaterialDeposit(
  personCount: number,
  baseDepositPerPerson: number = 5
): number {
  return personCount * baseDepositPerPerson;
}

// ============================================
// Unit Tests
// ============================================

describe('Order Business Logic', () => {
  describe('calculateMenuPrice', () => {
    it('should calculate correct menu price', () => {
      expect(calculateMenuPrice(50, 20)).toBe(1000);
      expect(calculateMenuPrice(85, 50)).toBe(4250);
      expect(calculateMenuPrice(35.50, 15)).toBe(532.5);
    });

    it('should handle zero values', () => {
      expect(calculateMenuPrice(0, 20)).toBe(0);
      expect(calculateMenuPrice(50, 0)).toBe(0);
    });

    it('should throw for negative values', () => {
      expect(() => calculateMenuPrice(-10, 20)).toThrow();
      expect(() => calculateMenuPrice(50, -5)).toThrow();
    });

    it('should round to 2 decimal places', () => {
      expect(calculateMenuPrice(33.33, 3)).toBe(99.99);
    });
  });

  describe('calculateDeliveryFee', () => {
    it('should calculate standard delivery fee', () => {
      // Base 30 + (10km * 2.5) = 55
      expect(calculateDeliveryFee(10, 500)).toBe(55);
    });

    it('should offer free delivery for large orders', () => {
      expect(calculateDeliveryFee(20, 1000)).toBe(0);
      expect(calculateDeliveryFee(50, 2000)).toBe(0);
    });

    it('should use custom options', () => {
      expect(calculateDeliveryFee(10, 500, {
        freeDeliveryThreshold: 500,
      })).toBe(0);

      expect(calculateDeliveryFee(10, 400, {
        baseRate: 20,
        perKmRate: 1.5,
      })).toBe(35);
    });

    it('should handle zero distance', () => {
      expect(calculateDeliveryFee(0, 500)).toBe(30);
    });
  });

  describe('calculateOrderTotal', () => {
    it('should calculate total without discount', () => {
      expect(calculateOrderTotal(1000, 50)).toBe(1050);
    });

    it('should apply discount', () => {
      expect(calculateOrderTotal(1000, 50, 100)).toBe(950);
    });

    it('should not go below zero', () => {
      expect(calculateOrderTotal(100, 50, 200)).toBe(0);
    });
  });

  describe('Status Transitions', () => {
    it('should validate correct transitions', () => {
      expect(isValidStatusTransition('pending', 'confirmed')).toBe(true);
      expect(isValidStatusTransition('confirmed', 'preparing')).toBe(true);
      expect(isValidStatusTransition('preparing', 'ready')).toBe(true);
      expect(isValidStatusTransition('ready', 'delivering')).toBe(true);
      expect(isValidStatusTransition('delivering', 'delivered')).toBe(true);
      expect(isValidStatusTransition('delivered', 'completed')).toBe(true);
    });

    it('should reject invalid transitions', () => {
      expect(isValidStatusTransition('pending', 'delivered')).toBe(false);
      expect(isValidStatusTransition('completed', 'pending')).toBe(false);
      expect(isValidStatusTransition('cancelled', 'confirmed')).toBe(false);
    });

    it('should allow cancellation from appropriate states', () => {
      expect(isValidStatusTransition('pending', 'cancelled')).toBe(true);
      expect(isValidStatusTransition('confirmed', 'cancelled')).toBe(true);
      expect(isValidStatusTransition('preparing', 'cancelled')).toBe(true);
    });

    it('should not allow cancellation from late stages', () => {
      expect(isValidStatusTransition('ready', 'cancelled')).toBe(false);
      expect(isValidStatusTransition('delivering', 'cancelled')).toBe(false);
      expect(isValidStatusTransition('delivered', 'cancelled')).toBe(false);
    });
  });

  describe('canCancelOrder', () => {
    it('should allow cancellation for early statuses', () => {
      expect(canCancelOrder('pending')).toBe(true);
      expect(canCancelOrder('confirmed')).toBe(true);
      expect(canCancelOrder('preparing')).toBe(true);
    });

    it('should not allow cancellation for late statuses', () => {
      expect(canCancelOrder('ready')).toBe(false);
      expect(canCancelOrder('delivering')).toBe(false);
      expect(canCancelOrder('delivered')).toBe(false);
      expect(canCancelOrder('completed')).toBe(false);
      expect(canCancelOrder('cancelled')).toBe(false);
    });
  });

  describe('isOrderFinal', () => {
    it('should identify final states', () => {
      expect(isOrderFinal('completed')).toBe(true);
      expect(isOrderFinal('cancelled')).toBe(true);
    });

    it('should identify non-final states', () => {
      expect(isOrderFinal('pending')).toBe(false);
      expect(isOrderFinal('confirmed')).toBe(false);
      expect(isOrderFinal('preparing')).toBe(false);
      expect(isOrderFinal('delivering')).toBe(false);
    });
  });

  describe('validatePersonCount', () => {
    it('should accept valid person count', () => {
      expect(validatePersonCount(50, 50)).toBe(true);
      expect(validatePersonCount(100, 50)).toBe(true);
    });

    it('should reject insufficient person count', () => {
      expect(validatePersonCount(10, 50)).toBe(false);
      expect(validatePersonCount(0, 10)).toBe(false);
    });
  });

  describe('calculateMaterialDeposit', () => {
    it('should calculate deposit based on person count', () => {
      expect(calculateMaterialDeposit(20)).toBe(100);
      expect(calculateMaterialDeposit(50)).toBe(250);
    });

    it('should use custom deposit rate', () => {
      expect(calculateMaterialDeposit(20, 10)).toBe(200);
    });
  });
});
