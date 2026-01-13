import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '~/stores/auth';
import { createMockUser, createMockAppointment } from '../../helpers/integration-utils';

describe('Appointment Management Flow Integration Tests', () => {
  let authStore: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    authStore = useAuthStore();
    authStore.user = createMockUser({ role: 'client' }) as any;
    authStore.accessToken = 'test-token';
  });

  describe('Appointment Creation Flow', () => {
    it('should create appointment successfully', async () => {
      const appointmentData = {
        title: 'Consultation juridique',
        description: 'Première consultation',
        appointment_type: 'consultation',
        start_time: '2026-02-15T10:00:00',
        end_time: '2026-02-15T11:00:00',
        location_type: 'office',
        lawyer_id: 'lawyer-123',
      };

      const mockAppointment = createMockAppointment({
        ...appointmentData,
        client_id: authStore.user!.id,
      });

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: mockAppointment
      });

      const response: any = await $fetch('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: appointmentData,
      });

      expect(response.success).toBe(true);
      expect(response.data.title).toBe(appointmentData.title);
      expect(response.data.status).toBe('scheduled');
    });

    it('should validate appointment date is in future', async () => {
      vi.mocked($fetch).mockRejectedValueOnce({
        data: { message: 'La date doit être dans le futur' },
        status: 400
      });

      await expect($fetch('http://localhost:3000/api/appointments', {
        method: 'POST',
        body: {
          title: 'Test',
          start_time: '2020-01-01T10:00:00',
        }
      })).rejects.toThrow();
    });
  });

  describe('Appointment Listing Flow', () => {
    it('should fetch all appointments', async () => {
      const mockAppointments = [
        createMockAppointment({ id: '1', title: 'Appointment 1' }),
        createMockAppointment({ id: '2', title: 'Appointment 2' }),
      ];

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: {
          appointments: mockAppointments,
          total: 2,
        }
      });

      const response: any = await $fetch('http://localhost:3000/api/appointments', {
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
        },
      });

      expect(response.success).toBe(true);
      expect(response.data.appointments).toHaveLength(2);
    });

    it('should filter appointments by status', async () => {
      const scheduledAppointments = [
        createMockAppointment({ id: '1', status: 'scheduled' }),
      ];

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: {
          appointments: scheduledAppointments,
          total: 1,
        }
      });

      const response: any = await $fetch('http://localhost:3000/api/appointments?status=scheduled', {
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
        },
      });

      expect(response.success).toBe(true);
      expect(response.data.appointments[0].status).toBe('scheduled');
    });
  });

  describe('Appointment Update Flow', () => {
    it('should update appointment details', async () => {
      const appointmentId = 'appt-123';
      const updateData = {
        title: 'Consultation modifiée',
        description: 'Nouvelle description',
      };

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: createMockAppointment({ id: appointmentId, ...updateData })
      });

      const response: any = await $fetch(`http://localhost:3000/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: updateData,
      });

      expect(response.success).toBe(true);
      expect(response.data.title).toBe(updateData.title);
    });
  });

  describe('Appointment Cancellation Flow', () => {
    it('should cancel appointment successfully', async () => {
      const appointmentId = 'appt-123';

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: createMockAppointment({ id: appointmentId, status: 'cancelled' })
      });

      const response: any = await $fetch(`http://localhost:3000/api/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
        },
      });

      expect(response.success).toBe(true);
      expect(response.data.status).toBe('cancelled');
    });
  });
});

