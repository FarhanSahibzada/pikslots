import { describe, it, expect } from 'vitest';
import { Class } from './class.entity';

// ── canRegisterClass permission matrix ────────────────────────────────────────
//
// Signature: canRegisterClass(callerRole, isPartOfSameBusiness)
//
// ┌────────────────┬──────────────────────┬────────┐
// │ Role           │ isPartOfSameBusiness  │ Result │
// ├────────────────┼──────────────────────┼────────┤
// │ Platform Owner │ false                 │ true   │ ← unrestricted
// │ Platform Owner │ true                  │ true   │ ← unrestricted
// ├────────────────┼──────────────────────┼────────┤
// │ Business Owner │ true                  │ true   │ ← same business
// │ Business Owner │ false                 │ false  │ ← different business
// ├────────────────┼──────────────────────┼────────┤
// │ Admin          │ true                  │ true   │ ← same business
// │ Admin          │ false                 │ false  │ ← different business
// ├────────────────┼──────────────────────┼────────┤
// │ Enhanced       │ true                  │ false  │ ← read-only
// │ Enhanced       │ false                 │ false  │ ← read-only
// ├────────────────┼──────────────────────┼────────┤
// │ Standard       │ true                  │ false  │ ← read-only
// │ Standard       │ false                 │ false  │ ← read-only
// ├────────────────┼──────────────────────┼────────┤
// │ No Access      │ true                  │ false  │ ← never allowed
// │ No Access      │ false                 │ false  │ ← never allowed
// └────────────────┴──────────────────────┴────────┘

describe('Class.canRegisterClass', () => {
  // ── Platform Owner ──────────────────────────────────────────────────────────

  describe('Platform Owner', () => {
    it('can register a class outside their business', () => {
      expect(Class.canRegisterClass('Platform Owner', false)).toBe(true);
    });

    it('can register a class inside their business', () => {
      expect(Class.canRegisterClass('Platform Owner', true)).toBe(true);
    });
  });

  // ── Business Owner ──────────────────────────────────────────────────────────

  describe('Business Owner', () => {
    it('can register a class for their own business', () => {
      expect(Class.canRegisterClass('Business Owner', true)).toBe(true);
    });

    it('cannot register a class for a different business', () => {
      expect(Class.canRegisterClass('Business Owner', false)).toBe(false);
    });
  });

  // ── Admin ───────────────────────────────────────────────────────────────────

  describe('Admin', () => {
    it('can register a class for the business they belong to', () => {
      expect(Class.canRegisterClass('Admin', true)).toBe(true);
    });

    it('cannot register a class for a different business', () => {
      expect(Class.canRegisterClass('Admin', false)).toBe(false);
    });
  });

  // ── Enhanced ────────────────────────────────────────────────────────────────

  describe('Enhanced', () => {
    it('cannot register a class even within the same business', () => {
      expect(Class.canRegisterClass('Enhanced', true)).toBe(false);
    });

    it('cannot register a class for a different business', () => {
      expect(Class.canRegisterClass('Enhanced', false)).toBe(false);
    });
  });

  // ── Standard ────────────────────────────────────────────────────────────────

  describe('Standard', () => {
    it('cannot register a class even within the same business', () => {
      expect(Class.canRegisterClass('Standard', true)).toBe(false);
    });

    it('cannot register a class for a different business', () => {
      expect(Class.canRegisterClass('Standard', false)).toBe(false);
    });
  });

  // ── No Access ───────────────────────────────────────────────────────────────

  describe('No Access', () => {
    it('cannot register a class even within the same business', () => {
      expect(Class.canRegisterClass('No Access', true)).toBe(false);
    });

    it('cannot register a class for a different business', () => {
      expect(Class.canRegisterClass('No Access', false)).toBe(false);
    });
  });
});
