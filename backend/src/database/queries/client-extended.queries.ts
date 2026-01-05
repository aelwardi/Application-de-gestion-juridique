export const clientRequestQueries = {
  create: `
    INSERT INTO client_requests (
      client_id, lawyer_id, request_type, title, description,
      case_category, urgency, budget_min, budget_max, preferred_date
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `,

  getById: `SELECT * FROM client_requests WHERE id = $1`,

  getByClientId: `
    SELECT cr.*, 
           u.first_name as lawyer_first_name,
           u.last_name as lawyer_last_name,
           u.email as lawyer_email
    FROM client_requests cr
    LEFT JOIN users u ON cr.lawyer_id = u.id
    WHERE cr.client_id = $1
    ORDER BY cr.created_at DESC
    LIMIT $2 OFFSET $3
  `,

  getByLawyerId: `
    SELECT cr.*,
           uc.first_name as client_first_name,
           uc.last_name as client_last_name,
           uc.email as client_email
    FROM client_requests cr
    INNER JOIN users uc ON cr.client_id = uc.id
    WHERE cr.lawyer_id = $1
    ORDER BY cr.created_at DESC
    LIMIT $2 OFFSET $3
  `,

  update: (fields: string[]) => {
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    return `
      UPDATE client_requests
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;
  },

  delete: `DELETE FROM client_requests WHERE id = $1 RETURNING *`,

  countByClient: `SELECT COUNT(*) FROM client_requests WHERE client_id = $1`,
  countByLawyer: `SELECT COUNT(*) FROM client_requests WHERE lawyer_id = $1 AND status = 'pending'`,
};

export const clientNoteQueries = {
  create: `
    INSERT INTO client_notes (
      client_id, created_by, note_type, title, content, is_private, remind_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,

  getById: `SELECT * FROM client_notes WHERE id = $1`,

  getByClientId: `
    SELECT cn.*,
           u.first_name as author_first_name,
           u.last_name as author_last_name
    FROM client_notes cn
    INNER JOIN users u ON cn.created_by = u.id
    WHERE cn.client_id = $1
    ORDER BY cn.created_at DESC
    LIMIT $2 OFFSET $3
  `,

  getReminders: `
    SELECT cn.*,
           u.first_name as client_first_name,
           u.last_name as client_last_name
    FROM client_notes cn
    INNER JOIN users u ON cn.client_id = u.id
    WHERE cn.created_by = $1
      AND cn.remind_at IS NOT NULL
      AND cn.remind_at <= $2
      AND cn.reminder_sent = FALSE
    ORDER BY cn.remind_at ASC
  `,

  update: (fields: string[]) => {
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    return `
      UPDATE client_notes
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;
  },

  delete: `DELETE FROM client_notes WHERE id = $1 RETURNING *`,

  countByClient: `SELECT COUNT(*) FROM client_notes WHERE client_id = $1`,
};

export const clientPaymentQueries = {
  create: `
    INSERT INTO client_payments (
      client_id, case_id, amount, payment_type, payment_method,
      status, due_date, paid_date, invoice_number, description, notes, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `,

  getById: `
    SELECT cp.*,
           c.title as case_title,
           c.case_number
    FROM client_payments cp
    LEFT JOIN cases c ON cp.case_id = c.id
    WHERE cp.id = $1
  `,

  getByClientId: `
    SELECT cp.*,
           c.title as case_title,
           c.case_number
    FROM client_payments cp
    LEFT JOIN cases c ON cp.case_id = c.id
    WHERE cp.client_id = $1
    ORDER BY cp.created_at DESC
    LIMIT $2 OFFSET $3
  `,

  getFinancialSummary: `
    SELECT 
      COALESCE(SUM(amount), 0) as total_billed,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_paid,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as total_pending,
      COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END), 0) as total_overdue
    FROM client_payments
    WHERE client_id = $1
  `,

  getOverduePayments: `
    SELECT cp.*,
           u.first_name as client_first_name,
           u.last_name as client_last_name,
           u.email as client_email
    FROM client_payments cp
    INNER JOIN users u ON cp.client_id = u.id
    WHERE cp.status IN ('pending', 'partial')
      AND cp.due_date < CURRENT_DATE
      AND cp.created_by = $1
    ORDER BY cp.due_date ASC
  `,

  update: (fields: string[]) => {
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    return `
      UPDATE client_payments
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;
  },

  delete: `DELETE FROM client_payments WHERE id = $1 RETURNING *`,

  countByClient: `SELECT COUNT(*) FROM client_payments WHERE client_id = $1`,
};

export const clientCommunicationQueries = {
  create: `
    INSERT INTO client_communications (
      client_id, case_id, communication_type, direction, subject,
      summary, duration_minutes, outcome, follow_up_required, follow_up_date, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `,

  getById: `
    SELECT cc.*,
           c.title as case_title,
           c.case_number,
           u.first_name as created_by_first_name,
           u.last_name as created_by_last_name
    FROM client_communications cc
    LEFT JOIN cases c ON cc.case_id = c.id
    LEFT JOIN users u ON cc.created_by = u.id
    WHERE cc.id = $1
  `,

  getByClientId: `
    SELECT cc.*,
           c.title as case_title,
           c.case_number,
           u.first_name as created_by_first_name,
           u.last_name as created_by_last_name
    FROM client_communications cc
    LEFT JOIN cases c ON cc.case_id = c.id
    LEFT JOIN users u ON cc.created_by = u.id
    WHERE cc.client_id = $1
    ORDER BY cc.created_at DESC
    LIMIT $2 OFFSET $3
  `,

  getActivitySummary: `
    SELECT 
      COUNT(*) as total_communications,
      MAX(created_at) as last_contact_date,
      SUM(CASE WHEN follow_up_required = TRUE AND follow_up_date >= CURRENT_DATE THEN 1 ELSE 0 END) as pending_follow_ups,
      SUM(CASE WHEN communication_type = 'email' THEN 1 ELSE 0 END) as email_count,
      SUM(CASE WHEN communication_type = 'phone' THEN 1 ELSE 0 END) as phone_count,
      SUM(CASE WHEN communication_type = 'meeting' THEN 1 ELSE 0 END) as meeting_count,
      SUM(CASE WHEN communication_type = 'sms' THEN 1 ELSE 0 END) as sms_count,
      SUM(CASE WHEN communication_type = 'video_call' THEN 1 ELSE 0 END) as video_call_count,
      SUM(CASE WHEN communication_type = 'other' THEN 1 ELSE 0 END) as other_count
    FROM client_communications
    WHERE client_id = $1
  `,

  getPendingFollowUps: `
    SELECT cc.*,
           u.first_name as client_first_name,
           u.last_name as client_last_name,
           c.title as case_title
    FROM client_communications cc
    INNER JOIN users u ON cc.client_id = u.id
    LEFT JOIN cases c ON cc.case_id = c.id
    WHERE cc.created_by = $1
      AND cc.follow_up_required = TRUE
      AND cc.follow_up_date <= $2
    ORDER BY cc.follow_up_date ASC
  `,

  delete: `DELETE FROM client_communications WHERE id = $1 RETURNING *`,

  countByClient: `SELECT COUNT(*) FROM client_communications WHERE client_id = $1`,
};