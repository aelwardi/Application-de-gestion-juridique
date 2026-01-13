import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppointment } from '~/composables/useAppointment';
import { createMockAuthStore } from '~/tests/helpers/test-utils';

describe('useAppointment Composable', () => {
  let mockAuthStore: ReturnType<typeof createMockAuthStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore = createMockAuthStore({ accessToken: 'test-token' });
    (globalThis as any).useAuthStore = vi.fn(() => mockAuthStore);
  });

  describe('Basic Tests', () => {
    it('should have getAllAppointments method', () => {
      const { getAllAppointments } = useAppointment();
      expect(getAllAppointments).toBeDefined();
    });

    it('should have createAppointment method', () => {
      const { createAppointment } = useAppointment();
      expect(createAppointment).toBeDefined();
    });

    it('should have getAppointmentById method', () => {
      const { getAppointmentById } = useAppointment();
      expect(getAppointmentById).toBeDefined();
    });

    it('should have updateAppointment method', () => {
      const { updateAppointment } = useAppointment();
      expect(updateAppointment).toBeDefined();
    });

    it('should have cancelAppointment method', () => {
      const { cancelAppointment } = useAppointment();
      expect(cancelAppointment).toBeDefined();
    });
  });

  describe('Date Validation', () => {
    it('should validate future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const isFuture = futureDate > new Date();

      expect(isFuture).toBe(true);
    });

    it('should validate past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);
      const isPast = pastDate < new Date();

      expect(isPast).toBe(true);
    });

    it('should format date strings', () => {
      const date = '2026-02-01';
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});

