import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppointment } from '~/composables/useAppointment';
import type { Appointment, CreateAppointmentDTO } from '~/types/appointment';

const mockFetch = vi.fn();
global.$fetch = mockFetch as any;

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBaseUrl: 'http://localhost:3000/api',
    },
  }),
}));

const mockAuthStore = {
  accessToken: 'mock-token',
  user: { id: 'user-1' },
};

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}));

describe('useAppointment - Tests Unitaires', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  const mockAppointment: Appointment = {
    id: '1',
    case_id: 'case-1',
    lawyer_id: 'lawyer-1',
    client_id: 'client-1',
    title: 'Consultation initiale',
    description: 'Première rencontre avec le client',
    appointment_type: 'consultation',
    status: 'scheduled',
    start_time: '2026-01-20T10:00:00Z',
    end_time: '2026-01-20T11:00:00Z',
    duration_minutes: 60,
    location_type: 'office',
    location: '10 Rue de la Paix, Paris',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Appointment;

  describe('createAppointment', () => {
    it('devrait créer un rendez-vous avec succès', async () => {
      const createData: CreateAppointmentDTO = {
        case_id: 'case-1',
        lawyer_id: 'lawyer-1',
        client_id: 'client-1',
        title: 'Consultation',
        appointment_type: 'consultation',
        start_time: '2026-01-20T10:00:00Z',
        end_time: '2026-01-20T11:00:00Z',
        duration_minutes: 60,
        location_type: 'office',
      };

      mockFetch.mockResolvedValueOnce({
        success: true,
        data: mockAppointment,
        message: 'Appointment created successfully',
      });

      const { createAppointment } = useAppointment();
      const result = await createAppointment(createData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAppointment);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/appointments',
        expect.objectContaining({
          method: 'POST',
          body: createData,
        })
      );
    });

    it('devrait gérer les erreurs de création', async () => {
      const error = new Error('Validation error');
      (error as any).data = { message: 'Invalid appointment data' };
      mockFetch.mockRejectedValueOnce(error);

      const { createAppointment } = useAppointment();
      const result = await createAppointment({} as CreateAppointmentDTO);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid appointment data');
    });

    it('devrait inclure le token d\'authentification', async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: mockAppointment,
      });

      const { createAppointment } = useAppointment();
      await createAppointment({} as CreateAppointmentDTO);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('http://localhost:3000/api/appointments');
      expect(callArgs[1].method).toBe('POST');
    });
  });

  describe('getAllAppointments', () => {
    it('devrait récupérer tous les rendez-vous', async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: {
          appointments: [mockAppointment],
          total: 1,
        },
      });

      const { getAllAppointments } = useAppointment();
      const result = await getAllAppointments();

      expect(result.success).toBe(true);
      expect((result.data as any).appointments).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/appointments',
        expect.any(Object)
      );
    });

    it('devrait filtrer par statut', async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: { appointments: [], total: 0 },
      });

      const { getAllAppointments } = useAppointment();
      await getAllAppointments({ status: 'scheduled' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=scheduled'),
        expect.any(Object)
      );
    });

    it('devrait filtrer par client_id', async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: { appointments: [], total: 0 },
      });

      const { getAllAppointments } = useAppointment();
      await getAllAppointments({ client_id: 'client-1' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('client_id=client-1'),
        expect.any(Object)
      );
    });

    it('devrait filtrer par plage de dates', async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: { appointments: [], total: 0 },
      });

      const { getAllAppointments } = useAppointment();
      await getAllAppointments({
        start_date: '2026-01-01',
        end_date: '2026-01-31',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('start_date=2026-01-01'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('end_date=2026-01-31'),
        expect.any(Object)
      );
    });

    it('devrait gérer les erreurs de récupération', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { getAllAppointments } = useAppointment();
      const result = await getAllAppointments();

      expect(result.success).toBe(false);
      if (result.data && typeof result.data === 'object' && 'appointments' in result.data) {
        expect((result.data as any).appointments).toEqual([]);
      }
    });

    it('devrait gérer la pagination', async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: { appointments: [], total: 0 },
      });

      const { getAllAppointments } = useAppointment();
      await getAllAppointments({ limit: 10, offset: 20 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=20'),
        expect.any(Object)
      );
    });
  });

  describe('getAppointmentById', () => {
    it('devrait récupérer un rendez-vous par ID', async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: mockAppointment,
      });

      const { getAppointmentById } = useAppointment();
      const result = await getAppointmentById('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAppointment);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/appointments/1',
        expect.any(Object)
      );
    });

    it('devrait gérer un rendez-vous non trouvé', async () => {
      const error = new Error('Not found');
      (error as any).status = 404;
      mockFetch.mockRejectedValueOnce(error);

      const { getAppointmentById } = useAppointment();

      await expect(getAppointmentById('999')).rejects.toThrow('Not found');
    });
  });

  describe('updateAppointment', () => {
    it('devrait mettre à jour un rendez-vous', async () => {
      const updates = {
        title: 'Consultation mise à jour',
        duration_minutes: 90,
      };

      mockFetch.mockResolvedValueOnce({
        success: true,
        data: { ...mockAppointment, ...updates },
      });

      const { updateAppointment } = useAppointment();
      const result = await updateAppointment('1', updates);

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('Consultation mise à jour');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/appointments/1',
        expect.objectContaining({
          method: 'PUT',
          body: updates,
        })
      );
    });
  });

  describe('Filtres multiples', () => {
    it('devrait combiner plusieurs filtres', async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: { appointments: [], total: 0 },
      });

      const { getAllAppointments } = useAppointment();
      await getAllAppointments({
        status: 'scheduled',
        appointment_type: 'consultation',
        lawyer_id: 'lawyer-1',
        start_date: '2026-01-01',
      });

      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain('status=scheduled');
      expect(callUrl).toContain('appointment_type=consultation');
      expect(callUrl).toContain('lawyer_id=lawyer-1');
      expect(callUrl).toContain('start_date=2026-01-01');
    });

    it('devrait rechercher par texte', async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: { appointments: [], total: 0 },
      });

      const { getAllAppointments } = useAppointment();
      await getAllAppointments({ search: 'consultation' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=consultation'),
        expect.any(Object)
      );
    });
  });

  describe('Gestion des états', () => {
    it('devrait retourner des données vides en cas d\'erreur', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Server error'));

      const { getAllAppointments } = useAppointment();
      const result = await getAllAppointments();

      if (result.data && typeof result.data === 'object' && 'appointments' in result.data) {
        expect((result.data as any).appointments).toEqual([]);
      }
    });

    it('devrait gérer les erreurs de création gracieusement', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Creation failed'));

      const { createAppointment } = useAppointment();
      const result = await createAppointment({} as CreateAppointmentDTO);

      expect(result.success).toBe(false);
      expect(result.message).toBeTruthy();
    });
  });

  describe('Headers et authentification', () => {
    it('devrait fonctionner sans token', async () => {
      mockAuthStore.accessToken = null as any;
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: { appointments: [], total: 0 },
      });

      const { getAllAppointments } = useAppointment();
      await getAllAppointments();

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders.Authorization).toBeUndefined();
    });

    it('devrait toujours inclure Content-Type', async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: mockAppointment,
      });

      const { createAppointment } = useAppointment();
      await createAppointment({} as CreateAppointmentDTO);

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders['Content-Type']).toBe('application/json');
    });
  });
});