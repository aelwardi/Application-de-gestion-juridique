import { pool } from "../config/database.config";
import {
  Client,
  ClientWithUser,
  CreateClientInput,
  UpdateClientInput,
  ClientSearchFilters,
  ClientStats,
} from "../types/client.types";
import { clientQueries } from "../database/queries/client.queries";

export class ClientService {
  async createClient(data: CreateClientInput): Promise<Client> {
    const {
      user_id,
      address,
      city,
      postal_code,
      emergency_contact_name,
      emergency_contact_phone,
      notes,
    } = data;

    const result = await pool.query(clientQueries.create, [
      user_id,
      address || null,
      city || null,
      postal_code || null,
      emergency_contact_name || null,
      emergency_contact_phone || null,
      notes || null,
    ]);

    return result.rows[0] as Client;
  }

  async getClientById(id: string): Promise<ClientWithUser | null> {
    const result = await pool.query(clientQueries.getWithUserInfo, [id]);
    return result.rows[0] || null;
  }

  async getClientByUserId(userId: string): Promise<ClientWithUser | null> {
    const result = await pool.query(clientQueries.getByUserIdWithInfo, [userId]);
    return result.rows[0] || null;
  }

  async getAllClients(
    limit = 50,
    offset = 0
  ): Promise<{ clients: ClientWithUser[]; total: number }> {
    const result = await pool.query(clientQueries.getAll, [limit, offset]);
    const countResult = await pool.query(clientQueries.count);

    return {
      clients: result.rows as ClientWithUser[],
      total: parseInt(countResult.rows[0].count),
    };
  }

  async searchClients(
    filters: ClientSearchFilters
  ): Promise<{ clients: ClientWithUser[]; total: number }> {
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
      clients: result.rows as ClientWithUser[],
      total: parseInt(countResult.rows[0].count),
    };
  }

  async getClientsByLawyer(
    lawyerId: string,
    limit = 50,
    offset = 0
  ): Promise<{ clients: ClientWithUser[]; total: number }> {
    const result = await pool.query(clientQueries.getClientsByLawyer, [
      lawyerId,
      limit,
      offset,
    ]);

    const countQuery = `
      SELECT COUNT(DISTINCT c.id)
      FROM clients c
      INNER JOIN cases cs ON cs.client_id = c.user_id
      WHERE cs.lawyer_id = $1
    `;
    const countResult = await pool.query(countQuery, [lawyerId]);

    return {
      clients: result.rows as ClientWithUser[],
      total: parseInt(countResult.rows[0].count),
    };
  }

  async updateClient(
    id: string,
    data: UpdateClientInput
  ): Promise<Client | null> {
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
  }

  async updateClientByUserId(
    userId: string,
    data: UpdateClientInput
  ): Promise<Client | null> {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) {
      const result = await pool.query(clientQueries.getByUserId, [userId]);
      return result.rows[0] || null;
    }

    const query = clientQueries.updateByUserId(fields);
    values.push(userId);

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteClient(id: string): Promise<boolean> {
    const result = await pool.query(clientQueries.delete, [id]);
    return result.rows.length > 0;
  }

  async deleteClientByUserId(userId: string): Promise<boolean> {
    const result = await pool.query(clientQueries.deleteByUserId, [userId]);
    return result.rows.length > 0;
  }

  async getClientStats(userId: string): Promise<ClientStats | null> {
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
      unread_messages: 0, // TODO: Implement when messages are ready
    };
  }

  async getClientCases(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<{ cases: any[]; total: number }> {
    const result = await pool.query(clientQueries.getCases, [
      userId,
      limit,
      offset,
    ]);

    const countQuery = `SELECT COUNT(*) FROM cases WHERE client_id = $1`;
    const countResult = await pool.query(countQuery, [userId]);

    return {
      cases: result.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  async getClientAppointments(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<{ appointments: any[]; total: number }> {
    const result = await pool.query(clientQueries.getAppointments, [
      userId,
      limit,
      offset,
    ]);

    const countQuery = `SELECT COUNT(*) FROM appointments WHERE client_id = $1`;
    const countResult = await pool.query(countQuery, [userId]);

    return {
      appointments: result.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  async getClientDocuments(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<{ documents: any[]; total: number }> {
    const result = await pool.query(clientQueries.getDocuments, [
      userId,
      limit,
      offset,
    ]);

    const countQuery = `
      SELECT COUNT(*)
      FROM case_documents cd
      INNER JOIN cases cs ON cd.case_id = cs.id
      WHERE cs.client_id = $1
    `;
    const countResult = await pool.query(countQuery, [userId]);

    return {
      documents: result.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }
}