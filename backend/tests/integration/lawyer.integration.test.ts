import request from 'supertest';
import express, { Express } from 'express';
import { pool } from '../../src/config/database.config';

jest.mock('../../src/config/database.config');
jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: 'lawyer-123', role: 'lawyer' };
    next();
  },
}));

describe('Lawyer Routes Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    const lawyerRoutes = require('../../src/routes/lawyer.routes').default;
    app.use('/api/lawyers', lawyerRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/lawyers', () => {
    it('should get all lawyers', async () => {
      const mockLawyers = [
        {
          id: 'lawyer-1',
          email: 'lawyer1@example.com',
          first_name: 'John',
          last_name: 'Attorney',
          specialties: ['family', 'criminal'],
          phone: '+1234567890',
          is_active: true,
        },
        {
          id: 'lawyer-2',
          email: 'lawyer2@example.com',
          first_name: 'Jane',
          last_name: 'Counsel',
          specialties: ['business'],
          phone: '+0987654321',
          is_active: true,
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockLawyers });

      const response = await request(app)
        .get('/api/lawyers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter lawyers by specialty', async () => {
      const mockLawyers = [
        {
          id: 'lawyer-1',
          email: 'lawyer1@example.com',
          first_name: 'John',
          last_name: 'Attorney',
          specialties: ['family'],
          phone: '+1234567890',
          is_active: true,
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockLawyers });

      const response = await request(app)
        .get('/api/lawyers')
        .query({ specialty: 'family' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should handle database errors', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/lawyers')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/lawyers/:id', () => {
    it('should get lawyer by id with details', async () => {
      const mockLawyer = {
        id: 'lawyer-123',
        email: 'lawyer@example.com',
        first_name: 'John',
        last_name: 'Attorney',
        specialties: ['family', 'criminal'],
        phone: '+1234567890',
        bio: 'Experienced lawyer',
        rating: 4.5,
        total_reviews: 20,
        is_active: true,
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockLawyer] });

      const response = await request(app)
        .get('/api/lawyers/lawyer-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockLawyer);
    });

    it('should return 404 if lawyer not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/lawyers/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/lawyers/:id/availability', () => {
    it('should get lawyer availability', async () => {
      const mockAvailability = [
        {
          day_of_week: 1,
          start_time: '09:00',
          end_time: '17:00',
        },
        {
          day_of_week: 2,
          start_time: '09:00',
          end_time: '17:00',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockAvailability });

      const response = await request(app)
        .get('/api/lawyers/lawyer-123/availability')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle lawyer with no availability', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/lawyers/lawyer-123/availability')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('POST /api/lawyers/:id/availability', () => {
    it('should create availability slot', async () => {
      const mockAvailability = {
        id: 'avail-123',
        lawyer_id: 'lawyer-123',
        day_of_week: 1,
        start_time: '09:00',
        end_time: '12:00',
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockAvailability] });

      const response = await request(app)
        .post('/api/lawyers/lawyer-123/availability')
        .set('Authorization', 'Bearer mock-token')
        .send({
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '12:00',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockAvailability);
    });

    it('should validate availability data', async () => {
      const response = await request(app)
        .post('/api/lawyers/lawyer-123/availability')
        .set('Authorization', 'Bearer mock-token')
        .send({
          dayOfWeek: 8, // Invalid day
          startTime: '09:00',
          endTime: '12:00',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/lawyers/:id/reviews', () => {
    it('should get lawyer reviews', async () => {
      const mockReviews = [
        {
          id: 'review-1',
          client_name: 'John Doe',
          rating: 5,
          comment: 'Excellent service',
          created_at: new Date(),
        },
        {
          id: 'review-2',
          client_name: 'Jane Smith',
          rating: 4,
          comment: 'Very professional',
          created_at: new Date(),
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockReviews });

      const response = await request(app)
        .get('/api/lawyers/lawyer-123/reviews')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should paginate reviews', async () => {
      const mockReviews = Array(5).fill(null).map((_, i) => ({
        id: `review-${i}`,
        rating: 5,
        comment: `Comment ${i}`,
      }));

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockReviews });

      const response = await request(app)
        .get('/api/lawyers/lawyer-123/reviews')
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/lawyers/:id/cases', () => {
    it('should get lawyer cases', async () => {
      const mockCases = [
        {
          id: 'case-1',
          title: 'Case 1',
          case_number: 'CASE-001',
          status: 'active',
          client_name: 'John Doe',
        },
        {
          id: 'case-2',
          title: 'Case 2',
          case_number: 'CASE-002',
          status: 'pending',
          client_name: 'Jane Smith',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockCases });

      const response = await request(app)
        .get('/api/lawyers/lawyer-123/cases')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter cases by status', async () => {
      const mockCases = [
        {
          id: 'case-1',
          title: 'Case 1',
          status: 'active',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockCases });

      const response = await request(app)
        .get('/api/lawyers/lawyer-123/cases')
        .query({ status: 'active' })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });
});

