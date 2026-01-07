import { pool } from '../config/database.config';
import { v4 as uuidv4 } from 'uuid';
import {
  sendNewRequestToLawyer,
  sendRequestAcceptedToClient,
  sendRequestRejectedToClient
} from '../utils/email.util';

export interface LawyerRequest {
  id: string;
  client_id: string;
  lawyer_id: string;
  request_type: string;
  title: string;
  description: string;
  case_category: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  budget_min: number | null;
  budget_max: number | null;
  preferred_date: Date | null;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: Date;
  updated_at: Date;
  client_first_name?: string;
  client_last_name?: string;
  client_email?: string;
  client_phone?: string;
  lawyer_first_name?: string;
  lawyer_last_name?: string;
  lawyer_email?: string;
}

export interface CreateLawyerRequestInput {
  client_id: string;
  lawyer_id: string;
  request_type: string;
  title: string;
  description: string;
  case_category: string;
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  budget_min?: number;
  budget_max?: number;
  preferred_date?: Date;
}

export interface LawyerRequestStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
}

/**
 * Créer une nouvelle demande vers un avocat
 */
export const createLawyerRequest = async (data: CreateLawyerRequestInput): Promise<LawyerRequest> => {
  const query = `
    INSERT INTO client_requests (
      id, client_id, lawyer_id, request_type, title, description,
      case_category, urgency, budget_min, budget_max, preferred_date, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
    RETURNING *
  `;

  const values = [
    uuidv4(),
    data.client_id,
    data.lawyer_id,
    data.request_type,
    data.title,
    data.description,
    data.case_category,
    data.urgency || 'medium',
    data.budget_min || null,
    data.budget_max || null,
    data.preferred_date || null,
  ];

  const result = await pool.query(query, values);
  const createdRequest = result.rows[0];

  try {
    const userQuery = `
      SELECT 
        uc.first_name as client_first_name,
        uc.last_name as client_last_name,
        ul.first_name as lawyer_first_name,
        ul.last_name as lawyer_last_name,
        ul.email as lawyer_email
      FROM users uc
      CROSS JOIN users ul
      WHERE uc.id = $1 AND ul.id = $2
    `;

    const userResult = await pool.query(userQuery, [data.client_id, data.lawyer_id]);

    if (userResult.rows.length > 0) {
      const userData = userResult.rows[0];
      const clientFullName = `${userData.client_first_name} ${userData.client_last_name}`;

      sendNewRequestToLawyer(
        userData.lawyer_email,
        userData.lawyer_first_name,
        clientFullName,
        data.title,
        data.description,
        data.urgency || 'medium',
        data.case_category
      ).catch(error => {
        console.error('Erreur lors de l\'envoi de l\'email à l\'avocat:', error);
      });
    }
  } catch (emailError) {
    console.error('Erreur lors de la récupération des données pour l\'email:', emailError);
  }

  return createdRequest;
};

/**
 * Récupérer une demande par ID
 */
export const getLawyerRequestById = async (requestId: string): Promise<LawyerRequest | null> => {
  const query = `
    SELECT 
      r.*,
      uc.first_name as client_first_name,
      uc.last_name as client_last_name,
      uc.email as client_email,
      uc.phone as client_phone,
      ul.first_name as lawyer_first_name,
      ul.last_name as lawyer_last_name,
      ul.email as lawyer_email
    FROM client_requests r
    LEFT JOIN users uc ON r.client_id = uc.id
    LEFT JOIN users ul ON r.lawyer_id = ul.id
    WHERE r.id = $1
  `;

  const result = await pool.query(query, [requestId]);
  return result.rows[0] || null;
};

/**
 * Récupérer les demandes d'un client
 */
export const getClientRequests = async (
  clientId: string,
  status?: string,
  limit = 20,
  offset = 0
): Promise<{ requests: LawyerRequest[]; total: number }> => {
  let query = `
    SELECT 
      r.*,
      u.first_name as lawyer_first_name,
      u.last_name as lawyer_last_name,
      u.email as lawyer_email
    FROM client_requests r
    LEFT JOIN users u ON r.lawyer_id = u.id
    WHERE r.client_id = $1
  `;

  const params: any[] = [clientId];
  let paramIndex = 2;

  if (status) {
    query += ` AND r.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM');
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count);

  query += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return { requests: result.rows, total };
};

/**
 * Récupérer les demandes reçues par un avocat
 */
export const getLawyerRequests = async (
  lawyerId: string,
  status?: string,
  limit = 20,
  offset = 0
): Promise<{ requests: LawyerRequest[]; total: number }> => {
  let query = `
    SELECT 
      r.*,
      u.first_name as client_first_name,
      u.last_name as client_last_name,
      u.email as client_email,
      u.phone as client_phone
    FROM client_requests r
    INNER JOIN users u ON r.client_id = u.id
    WHERE r.lawyer_id = $1
  `;

  const params: any[] = [lawyerId];
  let paramIndex = 2;

  if (status) {
    query += ` AND r.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM');
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count);

  query += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return { requests: result.rows, total };
};

/**
 * Accepter une demande (avocat)
 */
export const acceptLawyerRequest = async (requestId: string): Promise<LawyerRequest> => {
  const query = `
    UPDATE client_requests
    SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;

  const result = await pool.query(query, [requestId]);

  if (result.rows.length === 0) {
    throw new Error('Request not found');
  }

  const acceptedRequest = result.rows[0];

  try {
    const userQuery = `
      SELECT 
        uc.first_name as client_first_name,
        uc.last_name as client_last_name,
        uc.email as client_email,
        ul.first_name as lawyer_first_name,
        ul.last_name as lawyer_last_name
      FROM client_requests r
      INNER JOIN users uc ON r.client_id = uc.id
      INNER JOIN users ul ON r.lawyer_id = ul.id
      WHERE r.id = $1
    `;

    const userResult = await pool.query(userQuery, [requestId]);

    if (userResult.rows.length > 0) {
      const userData = userResult.rows[0];
      const lawyerFullName = `${userData.lawyer_first_name} ${userData.lawyer_last_name}`;

      sendRequestAcceptedToClient(
        userData.client_email,
        userData.client_first_name,
        lawyerFullName,
        acceptedRequest.title
      ).catch(error => {
        console.error('Erreur lors de l\'envoi de l\'email au client:', error);
      });
    }
  } catch (emailError) {
    console.error('Erreur lors de la récupération des données pour l\'email:', emailError);
  }

  return acceptedRequest;
};

/**
 * Rejeter une demande (avocat)
 */
export const rejectLawyerRequest = async (requestId: string): Promise<LawyerRequest> => {
  const query = `
    UPDATE client_requests
    SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;

  const result = await pool.query(query, [requestId]);

  if (result.rows.length === 0) {
    throw new Error('Request not found');
  }

  const rejectedRequest = result.rows[0];

  try {
    const userQuery = `
      SELECT 
        uc.first_name as client_first_name,
        uc.last_name as client_last_name,
        uc.email as client_email,
        ul.first_name as lawyer_first_name,
        ul.last_name as lawyer_last_name
      FROM client_requests r
      INNER JOIN users uc ON r.client_id = uc.id
      INNER JOIN users ul ON r.lawyer_id = ul.id
      WHERE r.id = $1
    `;

    const userResult = await pool.query(userQuery, [requestId]);

    if (userResult.rows.length > 0) {
      const userData = userResult.rows[0];
      const lawyerFullName = `${userData.lawyer_first_name} ${userData.lawyer_last_name}`;

      sendRequestRejectedToClient(
        userData.client_email,
        userData.client_first_name,
        lawyerFullName,
        rejectedRequest.title
      ).catch(error => {
        console.error('Erreur lors de l\'envoi de l\'email au client:', error);
      });
    }
  } catch (emailError) {
    console.error('Erreur lors de la récupération des données pour l\'email:', emailError);
  }

  return rejectedRequest;
};

/**
 * Annuler une demande (client)
 */
export const cancelLawyerRequest = async (requestId: string, clientId: string): Promise<LawyerRequest> => {
  const query = `
    UPDATE client_requests
    SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND client_id = $2 AND status = 'pending'
    RETURNING *
  `;

  const result = await pool.query(query, [requestId, clientId]);

  if (result.rows.length === 0) {
    throw new Error('Request not found or cannot be cancelled');
  }

  return result.rows[0];
};

/**
 * Statistiques des demandes pour un client
 */
export const getClientRequestStats = async (clientId: string): Promise<LawyerRequestStats> => {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
    FROM client_requests
    WHERE client_id = $1
  `;

  const result = await pool.query(query, [clientId]);
  return result.rows[0];
};

/**
 * Statistiques des demandes pour un avocat
 */
export const getLawyerRequestStats = async (lawyerId: string): Promise<LawyerRequestStats> => {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
    FROM client_requests
    WHERE lawyer_id = $1
  `;

  const result = await pool.query(query, [lawyerId]);
  return result.rows[0];
};

/**
 * Supprimer une demande
 */
export const deleteLawyerRequest = async (requestId: string): Promise<boolean> => {
  const query = `DELETE FROM client_requests WHERE id = $1`;
  const result = await pool.query(query, [requestId]);
  return result.rowCount !== null && result.rowCount > 0;
};