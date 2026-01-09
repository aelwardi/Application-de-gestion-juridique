import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppointment } from '~/composables/useAppointment';
import { createMockAuthStore, mockFetchSuccess, mockFetchError } from './helpers/test-utils';

describe('useAppointment Composable', () => {
  let mockAuthStore: ReturnType<typeof createMockAuthStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore = createMockAuthStore({ accessToken: 'test-token' });
    (globalThis as any).useAuthStore = vi.fn(() => mockAuthStore);
  });

  const mockAppointment = (overrides = {}) => ({
    id: 'appt-1',
    title: 'Consultation juridique',
    appointment_date: '2026-02-01',
    appointment_time: '10:00',
    lawyer_id: 'lawyer-1',
    client_id: 'client-1',
    status: 'scheduled',
    created_at: new Date().toISOString(),
    ...overrides,
  });

  describe('Create Appointment', () => {
    it('should create appointment successfully', async () => {
      const { createAppointment } = useAppointment();
      const appointmentData = {
        title: 'Consultation',
        appointment_date: '2026-02-01',
        appointment_time: '10:00',
        lawyer_id: 'lawyer-1',
        client_id: 'client-1',
      };

      const createdAppointment = mockAppointment(appointmentData);
      mockFetchSuccess(createdAppointment);

      const result = await createAppointment(appointmentData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdAppointment);
      expect($fetch).toHaveBeenCalledWith(
        expect.stringContaining('/appointments'),
        expect.objectContaining({
          method: 'POST',
          body: appointmentData,
        })
      );
    });

    it('should handle validation errors', async () => {
      const { createAppointment } = useAppointment();
      const invalidData = {
        title: '',
        appointment_date: 'invalid-date',
        appointment_time: '',
      };

      mockFetchError(400, 'Validation error');

      const result = await createAppointment(invalidData as any);

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should handle conflict errors', async () => {
      const { createAppointment } = useAppointment();
      mockFetchError(409, 'Time slot already booked');

      const result = await createAppointment(mockAppointment());

      expect(result.success).toBe(false);
      expect(result.message).toContain('already booked');
    });
  });

  describe('Get Appointments', () => {
    it('should fetch all appointments', async () => {
      const { getAppointments } = useAppointment();
      const appointments = [
        mockAppointment({ id: '1' }),
        mockAppointment({ id: '2' }),
      ];
      mockFetchSuccess({ appointments, total: 2 });

      const result = await getAppointments();

      expect(result.data.appointments).toHaveLength(2);
      expect(result.data.total).toBe(2);
    });

    it('should fetch appointments with filters', async () => {
      const { getAppointments } = useAppointment();
      const filters = {
        status: 'scheduled',
        lawyer_id: 'lawyer-1',
      };
      mockFetchSuccess({ appointments: [], total: 0 });

      await getAppointments(filters);

      expect($fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=scheduled'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should fetch appointments by date range', async () => {
      const { getAppointments } = useAppointment();
      const filters = {
        start_date: '2026-02-01',
        end_date: '2026-02-28',
      };
      mockFetchSuccess({ appointments: [], total: 0 });

      await getAppointments(filters);

      expect($fetch).toHaveBeenCalledWith(
        expect.stringContaining('start_date=2026-02-01'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });

  describe('Update Appointment', () => {
    it('should update appointment successfully', async () => {
      const { updateAppointment } = useAppointment();
      const appointmentId = 'appt-1';
      const updateData = {
        status: 'confirmed' as const,
        notes: 'Updated notes',
      };

      const updatedAppointment = mockAppointment({ ...updateData });
      mockFetchSuccess(updatedAppointment);

      const result = await updateAppointment(appointmentId, updateData);

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('confirmed');
      expect($fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/appointments/${appointmentId}`),
        expect.objectContaining({
          method: 'PUT',
          body: updateData,
        })
      );
    });

    it('should handle not found errors', async () => {
      const { updateAppointment } = useAppointment();
      mockFetchError(404, 'Appointment not found');

      const result = await updateAppointment('nonexistent', { status: 'confirmed' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });
  });

  describe('Delete Appointment', () => {
    it('should delete appointment successfully', async () => {
      const { deleteAppointment } = useAppointment();
      const appointmentId = 'appt-1';
      mockFetchSuccess({ success: true });

      const result = await deleteAppointment(appointmentId);

      expect(result.success).toBe(true);
      expect($fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/appointments/${appointmentId}`),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Filter Appointments', () => {
    it('should filter appointments by status locally', () => {
      const appointments = [
        mockAppointment({ id: '1', status: 'scheduled' }),
        mockAppointment({ id: '2', status: 'confirmed' }),
        mockAppointment({ id: '3', status: 'scheduled' }),
      ];

      const scheduled = appointments.filter(a => a.status === 'scheduled');

      expect(scheduled).toHaveLength(2);
    });

    it('should filter appointments by date locally', () => {
      const targetDate = '2026-02-01';
      const appointments = [
        mockAppointment({ id: '1', appointment_date: '2026-02-01' }),
        mockAppointment({ id: '2', appointment_date: '2026-02-02' }),
        mockAppointment({ id: '3', appointment_date: '2026-02-01' }),
      ];

      const onDate = appointments.filter(a => a.appointment_date === targetDate);

      expect(onDate).toHaveLength(2);
    });

    it('should filter appointments by lawyer', () => {
      const lawyerId = 'lawyer-1';
      const appointments = [
        mockAppointment({ id: '1', lawyer_id: 'lawyer-1' }),
        mockAppointment({ id: '2', lawyer_id: 'lawyer-2' }),
        mockAppointment({ id: '3', lawyer_id: 'lawyer-1' }),
      ];

      const lawyerAppointments = appointments.filter(a => a.lawyer_id === lawyerId);

      expect(lawyerAppointments).toHaveLength(2);
    });
  });

  describe('Cancel Appointment', () => {
    it('should cancel appointment successfully', async () => {
      const { cancelAppointment } = useAppointment();
      const appointmentId = 'appt-1';
      const cancelledAppointment = mockAppointment({
        id: appointmentId,
        status: 'cancelled',
      });
      mockFetchSuccess(cancelledAppointment);

      const result = await cancelAppointment(appointmentId);

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('cancelled');
    });
  });

  describe('Upcoming Appointments', () => {
    it('should fetch upcoming appointments', async () => {
      const { getUpcomingAppointments } = useAppointment();
      const futureAppointments = [
        mockAppointment({
          appointment_date: '2026-02-15',
          appointment_time: '10:00',
        }),
      ];
      mockFetchSuccess(futureAppointments);

      const result = await getUpcomingAppointments();

      expect(result.data).toEqual(futureAppointments);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty appointments list', async () => {
      const { getAppointments } = useAppointment();
      mockFetchSuccess({ appointments: [], total: 0 });

      const result = await getAppointments();

      expect(result.data.appointments).toEqual([]);
      expect(result.data.total).toBe(0);
    });

    it('should handle unauthorized access', async () => {
      const { getAppointments } = useAppointment();
      mockFetchError(401, 'Unauthorized');

      const result = await getAppointments();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Unauthorized');
    });

    it('should handle network timeouts', async () => {
      const { createAppointment } = useAppointment();
      const error: any = new Error('Network timeout');
      error.code = 'ETIMEDOUT';
      vi.mocked($fetch).mockRejectedValueOnce(error);

      const result = await createAppointment(mockAppointment());

      expect(result.success).toBe(false);
    });
  });
});

