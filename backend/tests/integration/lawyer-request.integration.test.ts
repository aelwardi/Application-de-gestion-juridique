import request from 'supertest';
import express, { Express } from 'express';
import * as lawyerRequestController from '../../src/controllers/lawyer-request.controller';
import { authenticate } from '../../src/middleware/auth.middleware';

jest.mock('../../src/controllers/lawyer-request.controller');
jest.mock('../../src/middleware/auth.middleware');

describe('LawyerRequest API Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    (authenticate as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
      req.user = { id: 'user-123', role: 'client' };
      next();
    });

    const lawyerRequestRoutes = require('../../src/routes/lawyer-request.routes').default;
    app.use('/api/lawyer-requests', lawyerRequestRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/lawyer-requests', () => {
    it('should create lawyer request successfully', async () => {
      (lawyerRequestController.createLawyerRequest as jest.Mock).mockImplementation((req: any, res: any) => {
        res.status(201).json({
          success: true,
          message: 'Lawyer request created successfully',
          data: {
            id: 'request-123',
            client_id: 'user-123',
            lawyer_id: 'lawyer-123',
            title: 'Legal Consultation',
            status: 'pending',
          },
        });
      });

      const response = await request(app)
        .post('/api/lawyer-requests')
        .send({
          client_id: 'user-123',
          lawyer_id: 'lawyer-123',
          title: 'Legal Consultation',
          description: 'Need help with contract review',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.status).toBe('pending');
    });

    it('should require authentication', async () => {
      (authenticate as jest.Mock).mockImplementationOnce((req: any, res: any) => {
        res.status(401).json({ success: false, message: 'Authentication required' });
      });

      const response = await request(app)
        .post('/api/lawyer-requests')
        .send({
          client_id: 'user-123',
          lawyer_id: 'lawyer-123',
          title: 'Legal Consultation',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/lawyer-requests/client/:clientId', () => {
    it('should get client lawyer requests successfully', async () => {
      (lawyerRequestController.getClientRequests as jest.Mock).mockImplementation((req: any, res: any) => {
        res.json({
          success: true,
          data: [
            {
              id: 'request-1',
              status: 'pending',
              created_at: new Date(),
            },
            {
              id: 'request-2',
              status: 'accepted',
              created_at: new Date(),
            },
          ],
        });
      });

      const response = await request(app)
        .get('/api/lawyer-requests/client/user-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/lawyer-requests/:id', () => {
    it('should get lawyer request by id', async () => {
      (lawyerRequestController.getLawyerRequestById as jest.Mock).mockImplementation((req: any, res: any) => {
        res.json({
          success: true,
          data: {
            id: 'request-123',
            client_id: 'user-123',
            lawyer_id: 'lawyer-123',
            title: 'Legal Consultation',
            status: 'pending',
          },
        });
      });

      const response = await request(app)
        .get('/api/lawyer-requests/request-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('request-123');
    });
  });

  describe('POST /api/lawyer-requests/:id/accept', () => {
    it('should accept lawyer request', async () => {
      (lawyerRequestController.acceptRequest as jest.Mock).mockImplementation((req: any, res: any) => {
        res.json({
          success: true,
          message: 'Request accepted successfully',
          data: {
            id: 'request-123',
            status: 'accepted',
          },
        });
      });

      const response = await request(app)
        .post('/api/lawyer-requests/request-123/accept')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('accepted');
    });
  });

  describe('POST /api/lawyer-requests/:id/reject', () => {
    it('should reject lawyer request', async () => {
      (lawyerRequestController.rejectRequest as jest.Mock).mockImplementation((req: any, res: any) => {
        res.json({
          success: true,
          message: 'Request rejected successfully',
          data: {
            id: 'request-123',
            status: 'rejected',
          },
        });
      });

      const response = await request(app)
        .post('/api/lawyer-requests/request-123/reject')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('rejected');
    });
  });

  describe('DELETE /api/lawyer-requests/:id', () => {
    it('should delete lawyer request successfully', async () => {
      (lawyerRequestController.deleteLawyerRequest as jest.Mock).mockImplementation((req: any, res: any) => {
        res.json({
          success: true,
          message: 'Request deleted successfully',
        });
      });

      const response = await request(app)
        .delete('/api/lawyer-requests/request-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });
  });
});

