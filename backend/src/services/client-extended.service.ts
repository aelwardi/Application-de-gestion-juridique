import { pool } from "../config/database.config";
import {
  ClientRequest,
  CreateClientRequestInput,
  UpdateClientRequestInput,
  ClientNote,
  CreateClientNoteInput,
  UpdateClientNoteInput,
  ClientPayment,
  CreateClientPaymentInput,
  UpdateClientPaymentInput,
  ClientCommunication,
  CreateClientCommunicationInput,
  ClientFinancialSummary,
  ClientActivitySummary,
} from "../types/client-extended.types";
import {
  clientRequestQueries,
  clientNoteQueries,
  clientPaymentQueries,
  clientCommunicationQueries,
} from "../database/queries/client-extended.queries";

export class ClientExtendedService {
  async createClientRequest(data: CreateClientRequestInput): Promise<ClientRequest> {
    const {
      client_id,
      lawyer_id,
      request_type,
      title,
      description,
      case_category,
      urgency = 'normal',
      budget_min,
      budget_max,
      preferred_date,
    } = data;

    // Résoudre le lawyer_id : peut être soit un user_id soit un lawyer.id
    let resolvedLawyerId = lawyer_id;

    if (lawyer_id) {
      // Vérifier si c'est un user_id valide
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND role = $2',
        [lawyer_id, 'lawyer']
      );

      if (userCheck.rows.length === 0) {
        // Si pas trouvé comme user_id, essayer de le récupérer depuis la table lawyers
        const lawyerCheck = await pool.query(
          'SELECT user_id FROM lawyers WHERE id = $1',
          [lawyer_id]
        );

        if (lawyerCheck.rows.length > 0) {
          resolvedLawyerId = lawyerCheck.rows[0].user_id;
          console.log(`[SERVICE] Converted lawyer table ID ${lawyer_id} to user_id ${resolvedLawyerId}`);
        } else {
          // Si toujours pas trouvé, erreur
          throw new Error(`Lawyer with ID ${lawyer_id} not found in users or lawyers table`);
        }
      } else {
        console.log(`[SERVICE] Using user_id directly: ${lawyer_id}`);
      }
    }

    const result = await pool.query(clientRequestQueries.create, [
      client_id,
      resolvedLawyerId || null,
      request_type,
      title,
      description,
      case_category || null,
      urgency,
      budget_min || null,
      budget_max || null,
      preferred_date || null,
    ]);

    return result.rows[0] as ClientRequest;
  }

  async getClientRequestById(id: string): Promise<ClientRequest | null> {
    const result = await pool.query(clientRequestQueries.getById, [id]);
    return result.rows[0] || null;
  }

  async getClientRequestsByClientId(
    clientId: string,
    limit = 20,
    offset = 0
  ): Promise<{ requests: any[]; total: number }> {
    const result = await pool.query(clientRequestQueries.getByClientId, [
      clientId,
      limit,
      offset,
    ]);
    const countResult = await pool.query(clientRequestQueries.countByClient, [clientId]);

    return {
      requests: result.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  async getClientRequestsByLawyerId(
    lawyerId: string,
    limit = 20,
    offset = 0
  ): Promise<{ requests: any[]; total: number }> {
    const result = await pool.query(clientRequestQueries.getByLawyerId, [
      lawyerId,
      limit,
      offset,
    ]);
    const countResult = await pool.query(clientRequestQueries.countByLawyer, [lawyerId]);

    return {
      requests: result.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  async updateClientRequest(
    id: string,
    data: UpdateClientRequestInput
  ): Promise<ClientRequest | null> {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) return await this.getClientRequestById(id);

    const query = clientRequestQueries.update(fields);
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteClientRequest(id: string): Promise<boolean> {
    const result = await pool.query(clientRequestQueries.delete, [id]);
    return result.rows.length > 0;
  }

  async createClientNote(data: CreateClientNoteInput): Promise<ClientNote> {
    const {
      client_id,
      created_by,
      note_type = 'general',
      title,
      content,
      is_private = true,
      remind_at,
    } = data;

    const result = await pool.query(clientNoteQueries.create, [
      client_id,
      created_by,
      note_type,
      title || null,
      content,
      is_private,
      remind_at || null,
    ]);

    return result.rows[0] as ClientNote;
  }

  async getClientNoteById(id: string): Promise<ClientNote | null> {
    const result = await pool.query(clientNoteQueries.getById, [id]);
    return result.rows[0] || null;
  }

  async getClientNotesByClientId(
    clientId: string,
    limit = 20,
    offset = 0
  ): Promise<{ notes: any[]; total: number }> {
    const result = await pool.query(clientNoteQueries.getByClientId, [
      clientId,
      limit,
      offset,
    ]);
    const countResult = await pool.query(clientNoteQueries.countByClient, [clientId]);

    return {
      notes: result.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  async getPendingReminders(
    lawyerId: string,
    upToDate: Date = new Date()
  ): Promise<any[]> {
    const result = await pool.query(clientNoteQueries.getReminders, [
      lawyerId,
      upToDate,
    ]);
    return result.rows;
  }

  async updateClientNote(
    id: string,
    data: UpdateClientNoteInput
  ): Promise<ClientNote | null> {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) return await this.getClientNoteById(id);

    const query = clientNoteQueries.update(fields);
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteClientNote(id: string): Promise<boolean> {
    const result = await pool.query(clientNoteQueries.delete, [id]);
    return result.rows.length > 0;
  }

  async createClientPayment(data: CreateClientPaymentInput): Promise<ClientPayment> {
    const {
      client_id,
      case_id,
      amount,
      payment_type,
      payment_method,
      status = 'pending',
      due_date,
      paid_date,
      invoice_number,
      description,
      notes,
      created_by,
    } = data;

    const result = await pool.query(clientPaymentQueries.create, [
      client_id,
      case_id || null,
      amount,
      payment_type,
      payment_method || null,
      status,
      due_date || null,
      paid_date || null,
      invoice_number || null,
      description || null,
      notes || null,
      created_by || null,
    ]);

    return result.rows[0] as ClientPayment;
  }

  async getClientPaymentById(id: string): Promise<any | null> {
    const result = await pool.query(clientPaymentQueries.getById, [id]);
    return result.rows[0] || null;
  }

  async getClientPaymentsByClientId(
    clientId: string,
    limit = 20,
    offset = 0
  ): Promise<{ payments: any[]; total: number }> {
    const result = await pool.query(clientPaymentQueries.getByClientId, [
      clientId,
      limit,
      offset,
    ]);
    const countResult = await pool.query(clientPaymentQueries.countByClient, [clientId]);

    return {
      payments: result.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  async getClientFinancialSummary(clientId: string): Promise<ClientFinancialSummary> {
    const summaryResult = await pool.query(clientPaymentQueries.getFinancialSummary, [
      clientId,
    ]);
    const paymentsResult = await pool.query(clientPaymentQueries.getByClientId, [
      clientId,
      10,
      0,
    ]);

    return {
      total_billed: parseFloat(summaryResult.rows[0].total_billed) || 0,
      total_paid: parseFloat(summaryResult.rows[0].total_paid) || 0,
      total_pending: parseFloat(summaryResult.rows[0].total_pending) || 0,
      total_overdue: parseFloat(summaryResult.rows[0].total_overdue) || 0,
      payment_history: paymentsResult.rows,
    };
  }

  async getOverduePayments(lawyerId: string): Promise<any[]> {
    const result = await pool.query(clientPaymentQueries.getOverduePayments, [lawyerId]);
    return result.rows;
  }

  async updateClientPayment(
    id: string,
    data: UpdateClientPaymentInput
  ): Promise<ClientPayment | null> {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) return await this.getClientPaymentById(id);

    const query = clientPaymentQueries.update(fields);
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteClientPayment(id: string): Promise<boolean> {
    const result = await pool.query(clientPaymentQueries.delete, [id]);
    return result.rows.length > 0;
  }

  async createClientCommunication(
    data: CreateClientCommunicationInput
  ): Promise<ClientCommunication> {
    const {
      client_id,
      case_id,
      communication_type,
      direction,
      subject,
      summary,
      duration_minutes,
      outcome,
      follow_up_required = false,
      follow_up_date,
      created_by,
    } = data;

    const result = await pool.query(clientCommunicationQueries.create, [
      client_id,
      case_id || null,
      communication_type,
      direction,
      subject || null,
      summary || null,
      duration_minutes || null,
      outcome || null,
      follow_up_required,
      follow_up_date || null,
      created_by,
    ]);

    return result.rows[0] as ClientCommunication;
  }

  async getClientCommunicationById(id: string): Promise<any | null> {
    const result = await pool.query(clientCommunicationQueries.getById, [id]);
    return result.rows[0] || null;
  }

  async getClientCommunicationsByClientId(
    clientId: string,
    limit = 20,
    offset = 0
  ): Promise<{ communications: any[]; total: number }> {
    const result = await pool.query(clientCommunicationQueries.getByClientId, [
      clientId,
      limit,
      offset,
    ]);
    const countResult = await pool.query(
      clientCommunicationQueries.countByClient,
      [clientId]
    );

    return {
      communications: result.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  async getClientActivitySummary(clientId: string): Promise<ClientActivitySummary> {
    const result = await pool.query(clientCommunicationQueries.getActivitySummary, [
      clientId,
    ]);

    const row = result.rows[0];

    return {
      total_communications: parseInt(row.total_communications) || 0,
      last_contact_date: row.last_contact_date || null,
      pending_follow_ups: parseInt(row.pending_follow_ups) || 0,
      upcoming_reminders: 0,
      communication_breakdown: {
        email: parseInt(row.email_count) || 0,
        phone: parseInt(row.phone_count) || 0,
        meeting: parseInt(row.meeting_count) || 0,
        sms: parseInt(row.sms_count) || 0,
        video_call: parseInt(row.video_call_count) || 0,
        other: parseInt(row.other_count) || 0,
      },
    };
  }

  async getPendingFollowUps(
    lawyerId: string,
    upToDate: Date = new Date()
  ): Promise<any[]> {
    const result = await pool.query(clientCommunicationQueries.getPendingFollowUps, [
      lawyerId,
      upToDate,
    ]);
    return result.rows;
  }

  async deleteClientCommunication(id: string): Promise<boolean> {
    const result = await pool.query(clientCommunicationQueries.delete, [id]);
    return result.rows.length > 0;
  }
}