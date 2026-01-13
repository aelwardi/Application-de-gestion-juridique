import {
  optimizeRoute,
  generateGoogleMapsUrl,
} from '../../../src/services/route-optimizer.service';
import { pool } from '../../../src/config/database.config';

jest.mock('../../../src/config/database.config');

describe('RouteOptimizerService', () => {
  let mockQuery: jest.Mock;

  beforeEach(() => {
    mockQuery = jest.fn();
    (pool.query as jest.Mock) = mockQuery;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('optimizeRoute', () => {
    it('should optimize route for appointments with locations', async () => {
      const mockAppointments = [
        {
          id: 'apt-1',
          title: 'Meeting 1',
          start_time: '2026-01-20T09:00:00Z',
          location_latitude: '48.8566',
          location_longitude: '2.3522',
          location_address: 'Paris, France',
        },
        {
          id: 'apt-2',
          title: 'Meeting 2',
          start_time: '2026-01-20T14:00:00Z',
          location_latitude: '48.8584',
          location_longitude: '2.2945',
          location_address: 'Tour Eiffel, Paris',
        },
        {
          id: 'apt-3',
          title: 'Meeting 3',
          start_time: '2026-01-20T16:00:00Z',
          location_latitude: '48.8738',
          location_longitude: '2.2950',
          location_address: 'Arc de Triomphe, Paris',
        },
      ];

      mockQuery.mockResolvedValue({ rows: mockAppointments });

      const result = await optimizeRoute('lawyer-1', '2026-01-20');

      expect(result.success).toBe(true);
      expect(result.appointments).toEqual(mockAppointments);
      expect(result.optimizedRoute).toHaveLength(3);
      expect(result.optimizedRoute[0].order).toBe(1);
      expect(result.totalDistance).toBeDefined();
      expect(result.estimatedTime).toBeGreaterThan(0);
      expect(result.savings).toBeDefined();
    });

    it('should return empty result when no appointments', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await optimizeRoute('lawyer-1', '2026-01-20');

      expect(result.success).toBe(true);
      expect(result.appointments).toEqual([]);
      expect(result.optimizedRoute).toEqual([]);
      expect(result.totalDistance).toBe(0);
      expect(result.estimatedTime).toBe(0);
      expect(result.message).toBe('Aucun rendez-vous géolocalisé ce jour');
    });

    it('should query appointments for specific date range', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await optimizeRoute('lawyer-1', '2026-01-20');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE lawyer_id = $1'),
        expect.arrayContaining(['lawyer-1'])
      );
    });

    it('should only include pending and confirmed appointments', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await optimizeRoute('lawyer-1', '2026-01-20');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("status IN ('pending', 'confirmed')"),
        expect.any(Array)
      );
    });

    it('should only include appointments with coordinates', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await optimizeRoute('lawyer-1', '2026-01-20');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('location_latitude IS NOT NULL'),
        expect.any(Array)
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('location_longitude IS NOT NULL'),
        expect.any(Array)
      );
    });

    it('should calculate distance between consecutive locations', async () => {
      const mockAppointments = [
        {
          id: 'apt-1',
          title: 'Meeting 1',
          start_time: '2026-01-20T09:00:00Z',
          location_latitude: '48.8566',
          location_longitude: '2.3522',
          location_address: 'Paris',
        },
        {
          id: 'apt-2',
          title: 'Meeting 2',
          start_time: '2026-01-20T14:00:00Z',
          location_latitude: '48.8584',
          location_longitude: '2.2945',
          location_address: 'Tour Eiffel',
        },
      ];

      mockQuery.mockResolvedValue({ rows: mockAppointments });

      const result = await optimizeRoute('lawyer-1', '2026-01-20');

      expect(result.optimizedRoute[0].distanceFromPrevious).toBe(0);
      expect(result.optimizedRoute[1].distanceFromPrevious).toBeDefined();
      expect(parseFloat(result.optimizedRoute[1].distanceFromPrevious)).toBeGreaterThan(0);
    });

    it('should estimate travel time based on distance', async () => {
      const mockAppointments = [
        {
          id: 'apt-1',
          title: 'Meeting 1',
          start_time: '2026-01-20T09:00:00Z',
          location_latitude: '48.8566',
          location_longitude: '2.3522',
          location_address: 'Paris',
        },
        {
          id: 'apt-2',
          title: 'Meeting 2',
          start_time: '2026-01-20T14:00:00Z',
          location_latitude: '48.9000',
          location_longitude: '2.3000',
          location_address: 'North Paris',
        },
      ];

      mockQuery.mockResolvedValue({ rows: mockAppointments });

      const result = await optimizeRoute('lawyer-1', '2026-01-20');

      expect(result.estimatedTime).toBeGreaterThan(0);
      expect(typeof result.estimatedTime).toBe('number');
    });

    it('should handle single appointment', async () => {
      const mockAppointment = [
        {
          id: 'apt-1',
          title: 'Meeting 1',
          start_time: '2026-01-20T09:00:00Z',
          location_latitude: '48.8566',
          location_longitude: '2.3522',
          location_address: 'Paris',
        },
      ];

      mockQuery.mockResolvedValue({ rows: mockAppointment });

      const result = await optimizeRoute('lawyer-1', '2026-01-20');

      expect(result.success).toBe(true);
      expect(result.optimizedRoute).toHaveLength(1);
      expect(result.totalDistance).toBe('0.00');
    });

    it('should calculate savings compared to original route', async () => {
      const mockAppointments = [
        {
          id: 'apt-1',
          title: 'Meeting 1',
          start_time: '2026-01-20T09:00:00Z',
          location_latitude: '48.8566',
          location_longitude: '2.3522',
          location_address: 'Location 1',
        },
        {
          id: 'apt-2',
          title: 'Meeting 2',
          start_time: '2026-01-20T14:00:00Z',
          location_latitude: '48.9000',
          location_longitude: '2.3000',
          location_address: 'Location 2',
        },
        {
          id: 'apt-3',
          title: 'Meeting 3',
          start_time: '2026-01-20T16:00:00Z',
          location_latitude: '48.8500',
          location_longitude: '2.3500',
          location_address: 'Location 3',
        },
      ];

      mockQuery.mockResolvedValue({ rows: mockAppointments });

      const result = await optimizeRoute('lawyer-1', '2026-01-20');

      expect(result.savings).toBeDefined();
      expect(result.savings).toMatch(/km/);
      expect(result.savings).toMatch(/%/);
    });

    it('should handle date parsing correctly', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await optimizeRoute('lawyer-1', '2026-01-20');

      const calls = mockQuery.mock.calls[0];
      const startDate = calls[1][1];
      const endDate = calls[1][2];

      expect(new Date(startDate).getHours()).toBe(0);
      expect(new Date(endDate).getHours()).toBe(23);
    });

    it('should throw error on database failure', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));

      await expect(optimizeRoute('lawyer-1', '2026-01-20')).rejects.toThrow('Database error');
    });

    it('should format total distance to 2 decimal places', async () => {
      const mockAppointments = [
        {
          id: 'apt-1',
          title: 'Meeting 1',
          start_time: '2026-01-20T09:00:00Z',
          location_latitude: '48.8566',
          location_longitude: '2.3522',
          location_address: 'Paris',
        },
        {
          id: 'apt-2',
          title: 'Meeting 2',
          start_time: '2026-01-20T14:00:00Z',
          location_latitude: '48.8584',
          location_longitude: '2.2945',
          location_address: 'Tour Eiffel',
        },
      ];

      mockQuery.mockResolvedValue({ rows: mockAppointments });

      const result = await optimizeRoute('lawyer-1', '2026-01-20');

      expect(result.totalDistance).toMatch(/^\d+\.\d{2}$/);
    });
  });

  describe('generateGoogleMapsUrl', () => {
    it('should generate Google Maps URL for multiple locations', () => {
      const locations = [
        {
          id: 'apt-1',
          lat: 48.8566,
          lng: 2.3522,
          address: 'Paris',
          title: 'Meeting 1',
          time: '2026-01-20T09:00:00Z',
        },
        {
          id: 'apt-2',
          lat: 48.8584,
          lng: 2.2945,
          address: 'Tour Eiffel',
          title: 'Meeting 2',
          time: '2026-01-20T14:00:00Z',
        },
        {
          id: 'apt-3',
          lat: 48.8738,
          lng: 2.295,
          address: 'Arc de Triomphe',
          title: 'Meeting 3',
          time: '2026-01-20T16:00:00Z',
        },
      ];

      const url = generateGoogleMapsUrl(locations);

      expect(url).toContain('https://www.google.com/maps/dir/');
      expect(url).toContain('origin=48.8566,2.3522');
      expect(url).toContain('destination=48.8738,2.295');
      expect(url).toContain('waypoints=48.8584,2.2945');
      expect(url).toContain('travelmode=driving');
    });

    it('should generate URL for two locations without waypoints', () => {
      const locations = [
        {
          id: 'apt-1',
          lat: 48.8566,
          lng: 2.3522,
          address: 'Paris',
          title: 'Meeting 1',
          time: '2026-01-20T09:00:00Z',
        },
        {
          id: 'apt-2',
          lat: 48.8584,
          lng: 2.2945,
          address: 'Tour Eiffel',
          title: 'Meeting 2',
          time: '2026-01-20T14:00:00Z',
        },
      ];

      const url = generateGoogleMapsUrl(locations);

      expect(url).toContain('origin=48.8566,2.3522');
      expect(url).toContain('destination=48.8584,2.2945');
      expect(url).not.toContain('waypoints');
    });

    it('should return empty string for no locations', () => {
      const url = generateGoogleMapsUrl([]);

      expect(url).toBe('');
    });

    it('should handle single location', () => {
      const locations = [
        {
          id: 'apt-1',
          lat: 48.8566,
          lng: 2.3522,
          address: 'Paris',
          title: 'Meeting 1',
          time: '2026-01-20T09:00:00Z',
        },
      ];

      const url = generateGoogleMapsUrl(locations);

      expect(url).toContain('origin=48.8566,2.3522');
      expect(url).toContain('destination=48.8566,2.3522');
    });

    it('should include multiple waypoints', () => {
      const locations = [
        { id: '1', lat: 48.8566, lng: 2.3522, address: 'A', title: 'A', time: '09:00' },
        { id: '2', lat: 48.8584, lng: 2.2945, address: 'B', title: 'B', time: '10:00' },
        { id: '3', lat: 48.8738, lng: 2.295, address: 'C', title: 'C', time: '11:00' },
        { id: '4', lat: 48.8600, lng: 2.3400, address: 'D', title: 'D', time: '12:00' },
      ];

      const url = generateGoogleMapsUrl(locations);

      expect(url).toContain('waypoints=48.8584,2.2945|48.8738,2.295');
    });
  });
});