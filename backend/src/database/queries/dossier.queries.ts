import { pool } from '../../config/database.config';
import { Case, CaseWithDetails, CreateCaseDTO, UpdateCaseDTO, CaseFilters, CaseStats } from '../../types/case.types';

export const caseQueries = {
  // Créer un nouveau dossier
  createCase: async (data: CreateCaseDTO): Promise<Case> => {
    const caseNumber = `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const query = `
      INSERT INTO cases (
        case_number, title, description, case_type, priority, 
        client_id, lawyer_id, court_name, judge_name, 
        next_hearing_date, estimated_duration_months
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      caseNumber,
      data.title,
      data.description,
      data.case_type,
      data.priority || 'medium',
      data.client_id,
      data.lawyer_id, // Directement users.id
      data.court_name,
      data.judge_name,
      data.next_hearing_date,
      data.estimated_duration_months
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Récupérer tous les dossiers avec filtres
  getAllCases: async (filters: CaseFilters = {}): Promise<CaseWithDetails[]> => {
    let query = `
      SELECT 
        c.*,
        cu.first_name as client_first_name,
        cu.last_name as client_last_name,
        cu.email as client_email,
        cu.phone as client_phone,
        lu.first_name as lawyer_first_name,
        lu.last_name as lawyer_last_name,
        lu.email as lawyer_email,
        lu.phone as lawyer_phone
      FROM cases c
      LEFT JOIN users cu ON c.client_id = cu.id
      LEFT JOIN users lu ON c.lawyer_id = lu.id
      WHERE 1=1
    `;
    
    const values: any[] = [];
    let paramCount = 1;
    
    if (filters.status) {
      query += ` AND c.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }
    
    if (filters.priority) {
      query += ` AND c.priority = $${paramCount}`;
      values.push(filters.priority);
      paramCount++;
    }
    
    if (filters.case_type) {
      query += ` AND c.case_type = $${paramCount}`;
      values.push(filters.case_type);
      paramCount++;
    }
    
    if (filters.lawyer_id) {
      query += ` AND c.lawyer_id = $${paramCount}`;
      values.push(filters.lawyer_id);
      paramCount++;
    }
    
    if (filters.client_id) {
      query += ` AND c.client_id = $${paramCount}`;
      values.push(filters.client_id);
      paramCount++;
    }
    
    if (filters.search) {
      query += ` AND (
        c.title ILIKE $${paramCount} OR 
        c.description ILIKE $${paramCount} OR 
        c.case_number ILIKE $${paramCount}
      )`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }
    
    query += ` ORDER BY c.created_at DESC`;
    
    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
      paramCount++;
    }
    
    if (filters.offset) {
      query += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
      paramCount++;
    }
    
    const result = await pool.query(query, values);
    return result.rows;
  },

  // Récupérer un dossier par ID
  getCaseById: async (id: string): Promise<CaseWithDetails | null> => {
    const query = `
      SELECT 
        c.*,
        cu.first_name as client_first_name,
        cu.last_name as client_last_name,
        cu.email as client_email,
        cu.phone as client_phone,
        lu.first_name as lawyer_first_name,
        lu.last_name as lawyer_last_name,
        lu.email as lawyer_email,
        lu.phone as lawyer_phone
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users cu ON cl.user_id = cu.id
      LEFT JOIN lawyers l ON c.lawyer_id = l.id
      LEFT JOIN users lu ON l.user_id = lu.id
      WHERE c.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  },

  // Récupérer un dossier par numéro
  getCaseByCaseNumber: async (caseNumber: string): Promise<Case | null> => {
    const query = 'SELECT * FROM cases WHERE case_number = $1';
    const result = await pool.query(query, [caseNumber]);
    return result.rows[0] || null;
  },

  // Mettre à jour un dossier
  updateCase: async (id: string, data: UpdateCaseDTO): Promise<Case | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (data.title !== undefined) {
      fields.push(`title = $${paramCount}`);
      values.push(data.title);
      paramCount++;
    }
    
    if (data.description !== undefined) {
      fields.push(`description = $${paramCount}`);
      values.push(data.description);
      paramCount++;
    }
    
    if (data.case_type !== undefined) {
      fields.push(`case_type = $${paramCount}`);
      values.push(data.case_type);
      paramCount++;
    }
    
    if (data.status !== undefined) {
      fields.push(`status = $${paramCount}`);
      values.push(data.status);
      paramCount++;
    }
    
    if (data.priority !== undefined) {
      fields.push(`priority = $${paramCount}`);
      values.push(data.priority);
      paramCount++;
    }
    
    if (data.lawyer_id !== undefined) {
      fields.push(`lawyer_id = $${paramCount}`);
      values.push(data.lawyer_id); // Directement users.id
      paramCount++;
    }
    
    if (data.closing_date !== undefined) {
      fields.push(`closing_date = $${paramCount}`);
      values.push(data.closing_date);
      paramCount++;
    }
    
    if (data.court_name !== undefined) {
      fields.push(`court_name = $${paramCount}`);
      values.push(data.court_name);
      paramCount++;
    }
    
    if (data.judge_name !== undefined) {
      fields.push(`judge_name = $${paramCount}`);
      values.push(data.judge_name);
      paramCount++;
    }
    
    if (data.next_hearing_date !== undefined) {
      fields.push(`next_hearing_date = $${paramCount}`);
      values.push(data.next_hearing_date);
      paramCount++;
    }
    
    if (data.estimated_duration_months !== undefined) {
      fields.push(`estimated_duration_months = $${paramCount}`);
      values.push(data.estimated_duration_months);
      paramCount++;
    }
    
    if (fields.length === 0) {
      return null;
    }
    
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    const query = `
      UPDATE cases 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    values.push(id);
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  // Supprimer un dossier
  deleteCase: async (id: string): Promise<boolean> => {
    const query = 'DELETE FROM cases WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  },

  // Assigner un avocat à un dossier
  assignLawyer: async (caseId: string, lawyerId: string): Promise<Case | null> => {
    const query = `
      UPDATE cases 
      SET lawyer_id = $1, 
          status = CASE WHEN status = 'pending' THEN 'in_progress' ELSE status END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [lawyerId, caseId]); // lawyerId est déjà users.id
    return result.rows[0] || null;
  },

  // Récupérer les statistiques des dossiers
  getCaseStats: async (lawyerId?: string): Promise<CaseStats> => {
    let query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'on_hold') as on_hold,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        COUNT(*) FILTER (WHERE status = 'closed') as closed,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE status = 'archived') as archived,
        COUNT(*) FILTER (WHERE priority = 'low') as priority_low,
        COUNT(*) FILTER (WHERE priority = 'medium') as priority_medium,
        COUNT(*) FILTER (WHERE priority = 'high') as priority_high,
        COUNT(*) FILTER (WHERE priority = 'urgent') as priority_urgent
      FROM cases
    `;
    
    const values: any[] = [];
    if (lawyerId) {
      query += ` WHERE lawyer_id = $1`;
      values.push(lawyerId);
    }
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    // Récupérer les statistiques par type
    let typeQuery = 'SELECT case_type, COUNT(*) as count FROM cases';
    if (lawyerId) {
      typeQuery += ' WHERE lawyer_id = $1';
    }
    typeQuery += ' GROUP BY case_type';
    
    const typeResult = await pool.query(typeQuery, values);
    const byType: Record<string, number> = {};
    typeResult.rows.forEach((row: any) => {
      byType[row.case_type] = parseInt(row.count);
    });
    
    return {
      total: parseInt(row.total),
      pending: parseInt(row.pending),
      accepted: parseInt(row.accepted),
      in_progress: parseInt(row.in_progress),
      on_hold: parseInt(row.on_hold),
      resolved: parseInt(row.resolved),
      closed: parseInt(row.closed),
      rejected: parseInt(row.rejected),
      archived: parseInt(row.archived),
      by_priority: {
        low: parseInt(row.priority_low),
        medium: parseInt(row.priority_medium),
        high: parseInt(row.priority_high),
        urgent: parseInt(row.priority_urgent)
      },
      by_type: byType
    };
  },

  // Récupérer les dossiers d'un avocat
  getCasesByLawyer: async (lawyerId: string, filters: CaseFilters = {}): Promise<CaseWithDetails[]> => {
    return caseQueries.getAllCases({ ...filters, lawyer_id: lawyerId });
  },

  // Récupérer les dossiers d'un client
  getCasesByClient: async (clientId: string, filters: CaseFilters = {}): Promise<CaseWithDetails[]> => {
    return caseQueries.getAllCases({ ...filters, client_id: clientId });
  },

  // Récupérer les prochaines audiences
  getUpcomingHearings: async (lawyerId?: string): Promise<CaseWithDetails[]> => {
    let query = `
      SELECT 
        c.*,
        u.first_name as client_first_name,
        u.last_name as client_last_name,
        u.email as client_email,
        lu.first_name as lawyer_first_name,
        lu.last_name as lawyer_last_name,
        lu.email as lawyer_email
      FROM cases c
      LEFT JOIN users u ON c.client_id = u.id
      LEFT JOIN users lu ON c.lawyer_id = lu.id
      WHERE c.next_hearing_date IS NOT NULL 
        AND c.next_hearing_date >= CURRENT_TIMESTAMP
        AND c.status NOT IN ('closed', 'archived')
    `;
    
    const values: any[] = [];
    if (lawyerId) {
      query += ` AND c.lawyer_id = $1`;
      values.push(lawyerId);
    }
    
    query += ` ORDER BY c.next_hearing_date ASC`;
    
    const result = await pool.query(query, values);
    return result.rows;
  },

  // Fermer un dossier
  closeCase: async (id: string): Promise<Case | null> => {
    const query = `
      UPDATE cases 
      SET status = 'closed', 
          closing_date = CURRENT_DATE,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  },

  // Archiver un dossier
  archiveCase: async (id: string): Promise<Case | null> => {
    const query = `
      UPDATE cases 
      SET status = 'archived',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
};
