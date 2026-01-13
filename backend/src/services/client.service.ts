import { pool } from '../config/database.config';
import { clientQueries } from '../database/queries/client.queries';
import { Client, ClientSearchFilters, ClientStats } from '../types/client.types';

export const getClientById = async (id: string): Promise<Client | null> => {
  const result = await pool.query(clientQueries.getById, [id]);
  return result.rows[0] || null;
};

export const getAllClients = async (
  page: number = 1,
  limit: number = 50
): Promise<{ clients: Client[]; total: number }> => {
  const offset = (page - 1) * limit;
  const result = await pool.query(clientQueries.getAll, [limit, offset]);
  const countResult = await pool.query(clientQueries.count);

  return {
    clients: result.rows as Client[],
    total: parseInt(countResult.rows[0].count),
  };
};

export const searchClients = async (
  filters: ClientSearchFilters
): Promise<{ clients: Client[]; total: number }> => {
  const {
    name,
    email,
    city,
    has_active_cases,
    is_active,
    limit = 50,
    offset = 0,
  } = filters;

  const filterKeys: string[] = [];
  const values: any[] = [];

  if (name) {
    filterKeys.push('name');
    values.push(`%${name}%`);
  }
  if (email) {
    filterKeys.push('email');
    values.push(`%${email}%`);
  }
  if (city) {
    filterKeys.push('city');
    values.push(`%${city}%`);
  }
  if (has_active_cases !== undefined) {
    filterKeys.push('has_active_cases');
  }
  if (is_active !== undefined) {
    filterKeys.push('is_active');
    values.push(is_active);
  }

  values.push(limit, offset);

  const query = clientQueries.search(filterKeys);
  const countQuery = clientQueries.countSearch(filterKeys);

  const result = await pool.query(query, values);
  const countResult = await pool.query(
    countQuery,
    values.slice(0, values.length - 2)
  );

  return {
    clients: result.rows as Client[],
    total: parseInt(countResult.rows[0].count),
  };
};

export const getClientsByLawyer = async (
  lawyerId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ clients: Client[]; total: number }> => {
  const result = await pool.query(clientQueries.getClientsByLawyer, [
    lawyerId,
    limit,
    offset,
  ]);

  const countQuery = `
    SELECT COUNT(DISTINCT u.id)
    FROM users u
    INNER JOIN cases c ON c.client_id = u.id
    WHERE u.role = 'client' AND c.lawyer_id = $1
  `;
  const countResult = await pool.query(countQuery, [lawyerId]);

  return {
    clients: result.rows as Client[],
    total: parseInt(countResult.rows[0].count),
  };
};

export const updateClient = async (
  id: string,
  data: Partial<Client>
): Promise<Client | null> => {
  const fields = Object.keys(data);
  const values = Object.values(data);

  if (fields.length === 0) {
    const result = await pool.query(clientQueries.getById, [id]);
    return result.rows[0] || null;
  }

  const query = clientQueries.update(fields);
  values.push(id);

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

export const deleteClient = async (id: string): Promise<boolean> => {
  const result = await pool.query(clientQueries.delete, [id]);
  return result.rows.length > 0;
};

export const getClientStats = async (userId: string): Promise<ClientStats | null> => {
  const result = await pool.query(clientQueries.getStats, [userId]);

  if (result.rows.length === 0) {
    return null;
  }

  return {
    total_cases: parseInt(result.rows[0].total_cases) || 0,
    active_cases: parseInt(result.rows[0].active_cases) || 0,
    pending_cases: parseInt(result.rows[0].pending_cases) || 0,
    completed_cases: parseInt(result.rows[0].completed_cases) || 0,
    upcoming_appointments: parseInt(result.rows[0].upcoming_appointments) || 0,
    total_documents: parseInt(result.rows[0].total_documents) || 0,
  };
};

export const updateClientCaseStats = async (
  clientId: string,
  totalCases: number,
  activeCases: number
): Promise<void> => {
  await pool.query(clientQueries.updateStats, [totalCases, activeCases, clientId]);
};