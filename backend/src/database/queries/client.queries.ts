export const clientQueries = {
  create: `
    INSERT INTO clients (
      user_id, address, city, postal_code, 
      emergency_contact_name, emergency_contact_phone, notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,

  getById: `
    SELECT * FROM clients WHERE id = $1
  `,

  getByUserId: `
    SELECT * FROM clients WHERE user_id = $1
  `,

  getWithUserInfo: `
    SELECT 
      c.*,
      u.email,
      u.first_name,
      u.last_name,
      u.phone,
      u.profile_picture_url,
      u.is_active,
      u.is_verified,
      u.last_login_at
    FROM clients c
    INNER JOIN users u ON c.user_id = u.id
    WHERE c.id = $1
  `,

  getByUserIdWithInfo: `
    SELECT 
      c.*,
      u.email,
      u.first_name,
      u.last_name,
      u.phone,
      u.profile_picture_url,
      u.is_active,
      u.is_verified,
      u.last_login_at
    FROM clients c
    INNER JOIN users u ON c.user_id = u.id
    WHERE c.user_id = $1
  `,

  getAll: `
    SELECT 
      c.*,
      u.email,
      u.first_name,
      u.last_name,
      u.phone,
      u.profile_picture_url,
      u.is_active,
      u.is_verified
    FROM clients c
    INNER JOIN users u ON c.user_id = u.id
    ORDER BY c.created_at DESC
    LIMIT $1 OFFSET $2
  `,

  search: (filters: string[]) => {
    let query = `
      SELECT 
        c.*,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.profile_picture_url,
        u.is_active,
        u.is_verified
      FROM clients c
      INNER JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;

    let paramCount = 1;
    if (filters.includes('name')) {
      query += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
      paramCount++;
    }
    if (filters.includes('email')) {
      query += ` AND u.email ILIKE $${paramCount}`;
      paramCount++;
    }
    if (filters.includes('city')) {
      query += ` AND c.city ILIKE $${paramCount}`;
      paramCount++;
    }
    if (filters.includes('has_active_cases')) {
      query += ` AND c.active_cases > 0`;
    }
    if (filters.includes('is_active')) {
      query += ` AND u.is_active = $${paramCount}`;
      paramCount++;
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    return query;
  },

  getClientsByLawyer: `
    SELECT DISTINCT
      c.*,
      u.email,
      u.first_name,
      u.last_name,
      u.phone,
      u.profile_picture_url,
      u.is_active
    FROM clients c
    INNER JOIN users u ON c.user_id = u.id
    INNER JOIN cases cs ON cs.client_id = c.user_id
    WHERE cs.lawyer_id = $1
    ORDER BY c.created_at DESC
    LIMIT $2 OFFSET $3
  `,

  update: (fields: string[]) => {
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    return `
      UPDATE clients
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;
  },

  updateByUserId: (fields: string[]) => {
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    return `
      UPDATE clients
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${fields.length + 1}
      RETURNING *
    `;
  },

  delete: `
    DELETE FROM clients WHERE id = $1 RETURNING *
  `,

  deleteByUserId: `
    DELETE FROM clients WHERE user_id = $1 RETURNING *
  `,

  count: `
    SELECT COUNT(*) FROM clients
  `,

  countSearch: (filters: string[]) => {
    let query = `
      SELECT COUNT(*)
      FROM clients c
      INNER JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;

    let paramCount = 1;
    if (filters.includes('name')) {
      query += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
      paramCount++;
    }
    if (filters.includes('email')) {
      query += ` AND u.email ILIKE $${paramCount}`;
      paramCount++;
    }
    if (filters.includes('city')) {
      query += ` AND c.city ILIKE $${paramCount}`;
      paramCount++;
    }
    if (filters.includes('has_active_cases')) {
      query += ` AND c.active_cases > 0`;
    }
    if (filters.includes('is_active')) {
      query += ` AND u.is_active = $${paramCount}`;
      paramCount++;
    }

    return query;
  },

  getStats: `
    SELECT 
      c.total_cases,
      c.active_cases,
      COALESCE(
        (SELECT COUNT(*) FROM cases WHERE client_id = $1 AND status = 'pending'), 0
      ) as pending_cases,
      COALESCE(
        (SELECT COUNT(*) FROM cases WHERE client_id = $1 AND status IN ('resolved', 'closed')), 0
      ) as completed_cases,
      COALESCE(
        (SELECT COUNT(*) FROM appointments WHERE client_id = $1 AND start_time > NOW() AND status = 'scheduled'), 0
      ) as upcoming_appointments,
      COALESCE(
        (SELECT COUNT(*) FROM case_documents cd 
         INNER JOIN cases cs ON cd.case_id = cs.id 
         WHERE cs.client_id = $1), 0
      ) as total_documents
    FROM clients c
    WHERE c.user_id = $1
  `,

  getCases: `
    SELECT 
      cs.*,
      u.first_name as lawyer_first_name,
      u.last_name as lawyer_last_name,
      u.email as lawyer_email
    FROM cases cs
    LEFT JOIN users u ON cs.lawyer_id = u.id
    WHERE cs.client_id = $1
    ORDER BY cs.created_at DESC
    LIMIT $2 OFFSET $3
  `,

  getAppointments: `
    SELECT 
      a.*,
      u.first_name as lawyer_first_name,
      u.last_name as lawyer_last_name,
      cs.title as case_title,
      cs.case_number
    FROM appointments a
    LEFT JOIN users u ON a.lawyer_id = u.id
    LEFT JOIN cases cs ON a.case_id = cs.id
    WHERE a.client_id = $1
    ORDER BY a.start_time DESC
    LIMIT $2 OFFSET $3
  `,

  getDocuments: `
    SELECT 
      cd.*,
      cs.title as case_title,
      cs.case_number,
      u.first_name as uploaded_by_first_name,
      u.last_name as uploaded_by_last_name
    FROM case_documents cd
    INNER JOIN cases cs ON cd.case_id = cs.id
    LEFT JOIN users u ON cd.uploaded_by = u.id
    WHERE cs.client_id = $1
    ORDER BY cd.created_at DESC
    LIMIT $2 OFFSET $3
  `,
};