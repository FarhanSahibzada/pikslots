import { describe, it, expect } from 'vitest';
import { Service } from './service.entity';

// ── canRegisterService permission matrix ──────────────────────────────────────
//
// Signature: canRegisterService(callerRole, isPartOfSameBusiness)
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

describe('Service.canRegisterService', () => {
  // ── Platform Owner ──────────────────────────────────────────────────────────

  describe('Platform Owner', () => {
    it('can register a service outside their business', () => {
      expect(Service.canRegisterService('Platform Owner', false)).toBe(true);
    });

    it('can register a service inside their business', () => {
      expect(Service.canRegisterService('Platform Owner', true)).toBe(true);
    });
  });

  // ── Business Owner ──────────────────────────────────────────────────────────

  describe('Business Owner', () => {
    it('can register a service for their own business', () => {
      expect(Service.canRegisterService('Business Owner', true)).toBe(true);
    });

    it('cannot register a service for a different business', () => {
      expect(Service.canRegisterService('Business Owner', false)).toBe(false);
    });
  });

  // ── Admin ───────────────────────────────────────────────────────────────────

  describe('Admin', () => {
    it('can register a service for the business they belong to', () => {
      expect(Service.canRegisterService('Admin', true)).toBe(true);
    });

    it('cannot register a service for a different business', () => {
      expect(Service.canRegisterService('Admin', false)).toBe(false);
    });
  });

  // ── Enhanced ────────────────────────────────────────────────────────────────

  describe('Enhanced', () => {
    it('cannot register a service even within the same business', () => {
      expect(Service.canRegisterService('Enhanced', true)).toBe(false);
    });

    it('cannot register a service for a different business', () => {
      expect(Service.canRegisterService('Enhanced', false)).toBe(false);
    });
  });

  // ── Standard ────────────────────────────────────────────────────────────────

  describe('Standard', () => {
    it('cannot register a service even within the same business', () => {
      expect(Service.canRegisterService('Standard', true)).toBe(false);
    });

    it('cannot register a service for a different business', () => {
      expect(Service.canRegisterService('Standard', false)).toBe(false);
    });
  });

  // ── No Access ───────────────────────────────────────────────────────────────

  describe('No Access', () => {
    it('cannot register a service even within the same business', () => {
      expect(Service.canRegisterService('No Access', true)).toBe(false);
    });

    it('cannot register a service for a different business', () => {
      expect(Service.canRegisterService('No Access', false)).toBe(false);
    });
  });
});
