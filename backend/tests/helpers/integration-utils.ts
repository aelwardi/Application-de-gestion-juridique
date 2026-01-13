import request from 'supertest';
import { Pool } from 'pg';
import express, { Application } from 'express';


export const createTestApp = (): Application => {
  const app = express();
  return app;
};

export interface TestUser {
  id?: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'client' | 'avocat' | 'admin';
  accessToken?: string;
}

export interface TestContext {
  pool: Pool;
  app?: Application;
  users: {
    admin?: TestUser;
    lawyer?: TestUser;
    client?: TestUser;
  };
}


export const setupTestDatabase = (): Pool => {
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'gestion_juridique',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });
};


export const cleanupDatabase = async (pool: Pool) => {
  await pool.query('DELETE FROM appointments WHERE 1=1');
  await pool.query('DELETE FROM documents WHERE 1=1');
  await pool.query('DELETE FROM cases WHERE 1=1');
  await pool.query('DELETE FROM lawyer_requests WHERE 1=1');
  await pool.query('DELETE FROM clients WHERE 1=1');
  await pool.query('DELETE FROM lawyers WHERE 1=1');
  await pool.query('DELETE FROM users WHERE email LIKE \'%@test.com\'');
};

export const createTestUser = async (app: Application, userData: Partial<TestUser>): Promise<TestUser> => {
  const defaultData: TestUser = {
    email: `test${Date.now()}@test.com`,
    password: 'Test123!@#',
    first_name: 'Test',
    last_name: 'User',
    role: 'client',
    ...userData,
  };

  const response = await request(app)
    .post('/api/auth/register')
    .send(defaultData);

  if (response.status !== 201 && response.status !== 200) {
    throw new Error(`Failed to create test user: ${JSON.stringify(response.body)}`);
  }

  return {
    ...defaultData,
    id: response.body.data?.user?.id || response.body.user?.id,
    accessToken: response.body.data?.accessToken || response.body.accessToken,
  };
};


export const loginTestUser = async (app: Application, email: string, password: string): Promise<string> => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  if (response.status !== 200) {
    throw new Error(`Failed to login test user: ${JSON.stringify(response.body)}`);
  }

  return response.body.data?.accessToken || response.body.accessToken;
};


export const authenticatedRequest = (token: string) => {
  return {
    get: (url: string) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) => request(app).post(url).set('Authorization', `Bearer ${token}`),
    put: (url: string) => request(app).put(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
    patch: (url: string) => request(app).patch(url).set('Authorization', `Bearer ${token}`),
  };
};


export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


export const setupTestContext = async (app: Application): Promise<TestContext> => {
  const pool = setupTestDatabase();

  try {
    const admin = await createTestUser(app, {
      email: `admin${Date.now()}@test.com`,
      role: 'admin',
      first_name: 'Admin',
      last_name: 'Test',
    });

    const lawyer = await createTestUser(app, {
      email: `lawyer${Date.now()}@test.com`,
      role: 'avocat',
      first_name: 'Lawyer',
      last_name: 'Test',
    });

    const client = await createTestUser(app, {
      email: `client${Date.now()}@test.com`,
      role: 'client',
      first_name: 'Client',
      last_name: 'Test',
    });

    return {
      pool,
      app,
      users: { admin, lawyer, client },
    };
  } catch (error) {
    console.error('Failed to setup test context:', error);
    throw error;
  }
};


export const teardownTestContext = async (context: TestContext) => {
  try {
    await cleanupDatabase(context.pool);
    await context.pool.end();
  } catch (error) {
    console.error('Failed to teardown test context:', error);
  }
};

