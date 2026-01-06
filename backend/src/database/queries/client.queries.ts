export const clientQueries = {
  create: `
    INSERT INTO users (
      email, password_hash, role, first_name, last_name, phone,
      address, city, postal_code, 
      emergency_contact_name, emergency_contact_phone, 
      notes, profile_picture_url
    )
    VALUES ($1, $2, 'client', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `,

  getById: `
    SELECT * FROM users 
    WHERE id = $1 AND role = 'client'
  `,

  getByEmail: `
    SELECT * FROM users 
    WHERE email = $1 AND role = 'client'
  `,

  getAll: `
    SELECT * FROM users
    WHERE role = 'client'
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `,

  search: (filters: string[]) => {
    let query = `
      SELECT * FROM users
      WHERE role = 'client'
    `;

    let paramCount = 1;

    if (filters.includes('name')) {
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
      paramCount++;
    }

    if (filters.includes('email')) {
      query += ` AND email ILIKE $${paramCount}`;
      paramCount++;
    }

    if (filters.includes('city')) {
      query += ` AND city ILIKE $${paramCount}`;
      paramCount++;
    }

    if (filters.includes('has_active_cases')) {
      query += ` AND active_cases > 0`;
    }

    if (filters.includes('is_active')) {
      query += ` AND is_active = $${paramCount}`;
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    return query;
  },

  getClientsByLawyer: `
    SELECT DISTINCT u.*
    FROM users u
    INNER JOIN cases c ON c.client_id = u.id
    WHERE u.role = 'client' AND c.lawyer_id = $1
    ORDER BY u.created_at DESC
    LIMIT $2 OFFSET $3
  `,

  update: (fields: string[]) => {
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    return `
      UPDATE users
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${fields.length + 1} AND role = 'client'
      RETURNING *
    `;
  },

  updateStats: `
    UPDATE users
    SET total_cases = $1, 
        active_cases = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3 AND role = 'client'
    RETURNING *
  `,

  delete: `
    DELETE FROM users 
    WHERE id = $1 AND role = 'client'
    RETURNING *
  `,

  count: `
    SELECT COUNT(*) FROM users WHERE role = 'client'
  `,

  countSearch: (filters: string[]) => {
    let query = `
      SELECT COUNT(*)
      FROM users
      WHERE role = 'client'
    `;

    let paramCount = 1;

    if (filters.includes('name')) {
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
      paramCount++;
    }

    if (filters.includes('email')) {
      query += ` AND email ILIKE $${paramCount}`;
      paramCount++;
    }

    if (filters.includes('city')) {
      query += ` AND city ILIKE $${paramCount}`;
      paramCount++;
    }

    if (filters.includes('has_active_cases')) {
      query += ` AND active_cases > 0`;
    }

    if (filters.includes('is_active')) {
      query += ` AND is_active = $${paramCount}`;
      paramCount++;
    }

    return query;
  },

  getStats: `
    SELECT 
      u.total_cases,
      u.active_cases,
      COUNT(CASE WHEN c.status = 'pending' THEN 1 END) as pending_cases,
      COUNT(CASE WHEN c.status IN ('resolved', 'closed') THEN 1 END) as completed_cases,
      (SELECT COUNT(*) FROM appointments 
       WHERE client_id = $1 AND start_time > NOW() AND status = 'scheduled') as upcoming_appointments,
      (SELECT COUNT(*) FROM documents 
       WHERE uploaded_by = $1) as total_documents
    FROM users u
    LEFT JOIN cases c ON c.client_id = u.id
    WHERE u.id = $1 AND u.role = 'client'
    GROUP BY u.id, u.total_cases, u.active_cases
  `,

  getDetailedStats: `
    SELECT 
      u.*,
      COUNT(DISTINCT c.id) as total_cases_count,
      COUNT(DISTINCT CASE WHEN c.status IN ('pending', 'in_progress') THEN c.id END) as active_cases_count,
      COUNT(DISTINCT CASE WHEN c.status = 'closed' THEN c.id END) as closed_cases_count,
      COUNT(DISTINCT a.id) as total_appointments,
      COUNT(DISTINCT CASE WHEN a.status = 'scheduled' AND a.start_time > NOW() THEN a.id END) as upcoming_appointments,
      COUNT(DISTINCT d.id) as total_documents,
      COUNT(DISTINCT l.id) as lawyers_worked_with
    FROM users u
    LEFT JOIN cases c ON c.client_id = u.id
    LEFT JOIN appointments a ON a.client_id = u.id
    LEFT JOIN documents d ON d.uploaded_by = u.id
    LEFT JOIN users l ON c.lawyer_id = l.id AND l.role = 'avocat'
    WHERE u.id = $1 AND u.role = 'client'
    GROUP BY u.id
  `,

  getWithCases: `
    SELECT 
      u.*,
      json_agg(
        json_build_object(
          'id', c.id,
          'title', c.title,
          'status', c.status,
          'created_at', c.created_at
        )
      ) FILTER (WHERE c.id IS NOT NULL) as cases
    FROM users u
    LEFT JOIN cases c ON c.client_id = u.id
    WHERE u.id = $1 AND u.role = 'client'
    GROUP BY u.id
  `,

  getWithAppointments: `
    SELECT 
      u.*,
      json_agg(
        json_build_object(
          'id', a.id,
          'title', a.title,
          'start_time', a.start_time,
          'status', a.status
        )
      ) FILTER (WHERE a.id IS NOT NULL) as appointments
    FROM users u
    LEFT JOIN appointments a ON a.client_id = u.id
    WHERE u.id = $1 AND u.role = 'client'
    GROUP BY u.id
  `,

  updateNotes: `
    UPDATE users
    SET notes = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND role = 'client'
    RETURNING *
  `,
};