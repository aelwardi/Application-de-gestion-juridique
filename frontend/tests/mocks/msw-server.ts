import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:3000/api';

export const handlers = [
  http.post(`${API_BASE_URL}/auth/register`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'client',
          firstName: 'Test',
          lastName: 'User',
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
      message: 'Registration successful',
    });
  }),

  http.post(`${API_BASE_URL}/auth/login`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'client',
          firstName: 'Test',
          lastName: 'User',
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
      message: 'Login successful',
    });
  }),

  http.get(`${API_BASE_URL}/clients`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          userId: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      },
    });
  }),

  http.get(`${API_BASE_URL}/clients/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      },
    });
  }),

  http.get(`${API_BASE_URL}/lawyers`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          userId: 'lawyer-1',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          barNumber: 'BAR123',
          specialties: ['Droit civil', 'Droit pénal'],
          rating: 4.5,
          totalReviews: 10,
          experienceYears: 5,
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      },
    });
  }),

  http.get(`${API_BASE_URL}/cases`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          title: 'Test Case',
          description: 'Test description',
          status: 'open',
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    });
  }),

  http.get(`${API_BASE_URL}/documents`, () => {
    return HttpResponse.json({
      success: true,
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    });
  }),

  http.get(`${API_BASE_URL}/appointments`, () => {
    return HttpResponse.json({
      success: true,
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    });
  }),
];

export const server = setupServer(...handlers);

export const mockApiSuccess = <T>(endpoint: string, data: T, method: 'get' | 'post' | 'put' | 'delete' = 'get') => {
  const httpMethod = http[method];
  server.use(
    httpMethod(`${API_BASE_URL}${endpoint}`, () => {
      return HttpResponse.json({
        success: true,
        data,
      });
    })
  );
};

export const mockApiError = (endpoint: string, status: number, message: string, method: 'get' | 'post' | 'put' | 'delete' = 'get') => {
  const httpMethod = http[method];
  server.use(
    httpMethod(`${API_BASE_URL}${endpoint}`, () => {
      return HttpResponse.json(
        {
          success: false,
          message,
        },
        { status }
      );
    })
  );
};

export const mockApiLoading = (endpoint: string, delay: number = 3000) => {
  server.use(
    http.get(`${API_BASE_URL}${endpoint}`, async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return HttpResponse.json({
        success: true,
        data: [],
      });
    })
  );
};