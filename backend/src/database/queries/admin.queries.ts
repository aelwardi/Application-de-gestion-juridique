import { pool } from '../../config/database.config';
import { QueryResult } from 'pg';

export interface AdminStats {
  totalUsers: number;
  totalLawyers: number;
  totalClients: number;
  totalCollaborators: number;
  totalCases: number;
  totalAppointments: number;
  totalMessages: number;
  activeUsers: number;
  newUsersThisMonth: number;
  newCasesThisMonth: number;
}

export interface UserListItem {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_login_at: Date | null;
  created_at: Date;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
  user_email?: string;
  user_name?: string;
}

/**
 * Get dashboard statistics (compatible avec table users unifiée)
 */
export const getDashboardStats = async (): Promise<AdminStats> => {
  const queries = {
    totalUsers: 'SELECT COUNT(*) as count FROM users',
    totalLawyers: "SELECT COUNT(*) as count FROM users WHERE role = 'avocat'",
    totalClients: "SELECT COUNT(*) as count FROM users WHERE role = 'client'",
    totalCollaborators: "SELECT COUNT(*) as count FROM users WHERE role = 'collaborateur'",
    activeUsers: 'SELECT COUNT(*) as count FROM users WHERE is_active = true',
    newUsersThisMonth: `SELECT COUNT(*) as count FROM users 
      WHERE created_at >= date_trunc('month', CURRENT_DATE)`,
  };

  const results = await Promise.all([
    pool.query(queries.totalUsers),
    pool.query(queries.totalLawyers),
    pool.query(queries.totalClients),
    pool.query(queries.totalCollaborators),
    pool.query(queries.activeUsers),
    pool.query(queries.newUsersThisMonth),
  ]);

  let totalCases = 0;
  let newCasesThisMonth = 0;
  let totalMessages = 0;
  try {
    const casesResult = await pool.query('SELECT COUNT(*) as count FROM cases');
    totalCases = parseInt(casesResult.rows[0].count) || 0;

    const newCasesResult = await pool.query(`SELECT COUNT(*) as count FROM cases WHERE created_at >= date_trunc('month', CURRENT_DATE)`);
    newCasesThisMonth = parseInt(newCasesResult.rows[0].count) || 0;
  } catch (error) {
    console.error('Error fetching cases stats:', error);
  }

  let totalAppointments = 0;
  try {
    const apptResult = await pool.query('SELECT COUNT(*) as count FROM appointments');
    totalAppointments = parseInt(apptResult.rows[0].count) || 0;
  } catch (error) {
    console.error('Error fetching appointments stats:', error);
  }

  try {
    const messagesResult = await pool.query('SELECT COUNT(*) as count FROM messages');
    totalMessages = parseInt(messagesResult.rows[0].count) || 0;
  } catch (error) {
    console.error('Error fetching messages stats:', error);
  }

  return {
    totalUsers: parseInt(results[0].rows[0].count),
    totalLawyers: parseInt(results[1].rows[0].count),
    totalClients: parseInt(results[2].rows[0].count),
    totalCollaborators: parseInt(results[3].rows[0].count),
    totalCases,
    totalAppointments,
    totalMessages,
    activeUsers: parseInt(results[4].rows[0].count),
    newUsersThisMonth: parseInt(results[5].rows[0].count),
    newCasesThisMonth,
  };
};

/**
 * Get all users with filters
 */
export const getAllUsers = async (
  page: number = 1,
  limit: number = 20,
  role?: string,
  search?: string,
  isActive?: boolean
): Promise<{ users: UserListItem[]; total: number }> => {
  let query = 'SELECT * FROM users WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (role) {
    query += ` AND role = $${paramIndex}`;
    params.push(role);
    paramIndex++;
  }

  if (search) {
    query += ` AND (email ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (isActive !== undefined) {
    query += ` AND is_active = $${paramIndex}`;
    params.push(isActive);
    paramIndex++;
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count);

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, (page - 1) * limit);

  const result: QueryResult<UserListItem> = await pool.query(query, params);

  return { users: result.rows, total };
};

/**
 * Get user by ID with full details
 */
export const getUserById = async (userId: string): Promise<UserListItem | null> => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result: QueryResult<UserListItem> = await pool.query(query, [userId]);
  return result.rows[0] || null;
};

/**
 * Update user status (activate/deactivate)
 */
export const updateUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
  const query = `
    UPDATE users 
    SET is_active = $1, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $2
    RETURNING id
  `;
  const result = await pool.query(query, [isActive, userId]);

  if (result.rowCount === 0) {
    throw new Error('User not found');
  }
};

/**
 * Update user verification status
 */
export const updateUserVerification = async (userId: string, isVerified: boolean): Promise<void> => {
  const query = `
    UPDATE users 
    SET is_verified = $1, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $2
  `;
  await pool.query(query, [isVerified, userId]);
};

/**
 * Delete user permanently
 */
export const deleteUser = async (userId: string): Promise<void> => {
  const query = 'DELETE FROM users WHERE id = $1';
  await pool.query(query, [userId]);
};

/**
 * Get user growth statistics
 */
export const getUserGrowthStats = async (days: number = 30): Promise<any[]> => {
  const query = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as count,
      role
    FROM users
    WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY DATE(created_at), role
    ORDER BY date DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Create activity log
 */
export const createActivityLog = async (
  userId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  ipAddress: string | null,
  userAgent: string | null,
  metadata?: any
): Promise<void> => {
  const query = `
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  await pool.query(query, [
    userId,
    action,
    entityType,
    entityId,
    ipAddress,
    userAgent,
    metadata ? JSON.stringify(metadata) : null,
  ]);
};

/**
 * Get activity logs
 */
export const getActivityLogs = async (
  page: number = 1,
  limit: number = 50,
  userId?: string
): Promise<{ logs: ActivityLog[]; total: number }> => {
  let query = `
    SELECT 
      al.*,
      u.email as user_email,
      u.role as user_role,
      CONCAT(u.first_name, ' ', u.last_name) as user_name
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (userId) {
    query += ` AND al.user_id = $${paramIndex}`;
    params.push(userId);
    paramIndex++;
  }

  const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM').replace(/LEFT JOIN.*user_name/, '');
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count);

  query += ` ORDER BY al.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, (page - 1) * limit);

  const result: QueryResult<ActivityLog> = await pool.query(query, params);

  return { logs: result.rows, total };
};