import { pool } from '../../config/database.config';
import { QueryResult } from 'pg';

export interface SupportTicket {
  id: string;
  user_id: string;
  assigned_to: string | null;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string | null;
  created_at: Date;
  updated_at: Date;
  resolved_at: Date | null;
  user_email?: string;
  user_name?: string;
  admin_name?: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  attachments: any;
  created_at: Date;
  user_name?: string;
}

/**
 * Get all support tickets with pagination and filters
 */
export const getAllTickets = async (
  page: number = 1,
  limit: number = 20,
  status?: string,
  priority?: string,
  assignedToMe?: boolean,
  adminId?: string
): Promise<{ tickets: SupportTicket[]; total: number }> => {
  let query = `
    SELECT 
      st.*,
      u.email as user_email,
      CONCAT(u.first_name, ' ', u.last_name) as user_name,
      CONCAT(a.first_name, ' ', a.last_name) as admin_name
    FROM support_tickets st
    LEFT JOIN users u ON st.user_id = u.id
    LEFT JOIN users a ON st.assigned_to = a.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (status) {
    query += ` AND st.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (priority) {
    query += ` AND st.priority = $${paramIndex}`;
    params.push(priority);
    paramIndex++;
  }

  if (assignedToMe && adminId) {
    query += ` AND st.assigned_to = $${paramIndex}`;
    params.push(adminId);
    paramIndex++;
  }

  const countQuery = `
    SELECT COUNT(*) 
    FROM support_tickets st
    LEFT JOIN users u ON st.user_id = u.id
    LEFT JOIN users a ON st.assigned_to = a.id
    WHERE 1=1
    ${status ? ` AND st.status = $${params.indexOf(status) + 1}` : ''}
    ${priority ? ` AND st.priority = $${params.indexOf(priority) + 1}` : ''}
    ${assignedToMe && adminId ? ` AND st.assigned_to = $${params.indexOf(adminId) + 1}` : ''}
  `;

  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count);

  query += ` ORDER BY st.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, (page - 1) * limit);

  const result: QueryResult<SupportTicket> = await pool.query(query, params);

  return { tickets: result.rows, total };
};

/**
 * Get user's tickets
 */
export const getUserTickets = async (userId: string): Promise<SupportTicket[]> => {
  const query = `
    SELECT 
      st.*,
      CONCAT(a.first_name, ' ', a.last_name) as admin_name
    FROM support_tickets st
    LEFT JOIN users a ON st.assigned_to = a.id
    WHERE st.user_id = $1
    ORDER BY st.created_at DESC
  `;

  const result: QueryResult<SupportTicket> = await pool.query(query, [userId]);
  return result.rows;
};

/**
 * Get ticket by ID with messages
 */
export const getTicketById = async (ticketId: string): Promise<SupportTicket | null> => {
  const query = `
    SELECT 
      st.*,
      u.email as user_email,
      CONCAT(u.first_name, ' ', u.last_name) as user_name,
      CONCAT(a.first_name, ' ', a.last_name) as admin_name
    FROM support_tickets st
    LEFT JOIN users u ON st.user_id = u.id
    LEFT JOIN users a ON st.assigned_to = a.id
    WHERE st.id = $1
  `;
  const result: QueryResult<SupportTicket> = await pool.query(query, [ticketId]);
  return result.rows[0] || null;
};

/**
 * Get messages for a ticket
 */
export const getTicketMessages = async (ticketId: string, includeInternal: boolean = false): Promise<SupportMessage[]> => {
  let query = `
    SELECT 
      sm.*,
      CONCAT(u.first_name, ' ', u.last_name) as user_name,
      u.role as user_role,
      CASE WHEN u.role = 'admin' THEN true ELSE false END as is_admin
    FROM support_messages sm
    LEFT JOIN users u ON sm.user_id = u.id
    WHERE sm.ticket_id = $1
  `;

  if (!includeInternal) {
    query += ` AND sm.is_internal = FALSE`;
  }

  query += ` ORDER BY sm.created_at ASC`;

  const result: QueryResult<SupportMessage> = await pool.query(query, [ticketId]);
  return result.rows;
};

/**
 * Create a new support ticket
 */
export const createTicket = async (
  userId: string,
  subject: string,
  description: string,
  priority: string,
  category: string | null
): Promise<SupportTicket> => {
  const query = `
    INSERT INTO support_tickets (user_id, subject, description, priority, category)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result: QueryResult<SupportTicket> = await pool.query(query, [
    userId,
    subject,
    description,
    priority,
    category,
  ]);
  return result.rows[0];
};

/**
 * Add message to ticket
 */
export const addTicketMessage = async (
  ticketId: string,
  userId: string,
  message: string,
  isInternal: boolean = false,
  attachments: any = null
): Promise<SupportMessage> => {
  const query = `
    INSERT INTO support_messages (ticket_id, user_id, message, is_internal, attachments)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result: QueryResult<SupportMessage> = await pool.query(query, [
    ticketId,
    userId,
    message,
    isInternal,
    attachments ? JSON.stringify(attachments) : null,
  ]);

  await pool.query('UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [ticketId]);

  return result.rows[0];
};

/**
 * Update ticket status
 */
export const updateTicketStatus = async (
  ticketId: string,
  status: string,
  adminId: string
): Promise<void> => {
  const query = `
    UPDATE support_tickets
    SET status = $1::varchar, updated_at = CURRENT_TIMESTAMP, resolved_at = CASE WHEN $1::varchar = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END
    WHERE id = $2
  `;
  await pool.query(query, [status, ticketId]);
};

/**
 * Assign ticket to admin
 */
export const assignTicket = async (
  ticketId: string,
  adminId: string
): Promise<void> => {
  const query = `
    UPDATE support_tickets
    SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP, status = 'in_progress'
    WHERE id = $2
  `;
  await pool.query(query, [adminId, ticketId]);
};

/**
 * Get ticket statistics
 */
export const getTicketStats = async (): Promise<any> => {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
      COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
      COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
      COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
      COUNT(CASE WHEN priority = 'urgent' AND status != 'resolved' AND status != 'closed' THEN 1 END) as urgent_pending
    FROM support_tickets
  `;
  const result = await pool.query(query);
  return result.rows[0];
};