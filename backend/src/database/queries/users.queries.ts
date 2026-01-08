export const userQueries = {
  create: `
    INSERT INTO users 
    (email, password_hash, role, first_name, last_name, phone, profile_picture_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,

  getById: `
    SELECT * FROM users WHERE id = $1
  `,

  getByEmail: `
    SELECT * FROM users WHERE email = $1
  `,

  getByRole: `
    SELECT * FROM users 
    WHERE role = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `,

  getAll: `
    SELECT * FROM users
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `,

  update: (fields: string[]): string => {
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
    return `
      UPDATE users
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;
  },

  delete: `
    DELETE FROM users WHERE id = $1 RETURNING id
  `,

  count: `
    SELECT COUNT(*) as count FROM users
  `,

  countByRole: `
    SELECT COUNT(*) as count FROM users WHERE role = $1
  `,

  updateLastLogin: `
    UPDATE users 
    SET last_login_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `,

  setActive: `
    UPDATE users 
    SET is_active = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `,

  setVerified: `
    UPDATE users 
    SET is_verified = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `,

  createLawyer: `
    INSERT INTO users (
      email, password_hash, role, first_name, last_name, phone,
      bar_number, specialties, experience_years, office_address, 
      office_city, office_postal_code, latitude, longitude,
      hourly_rate, description, languages, availability_status,
      verified_by_admin, profile_picture_url
    )
    VALUES ($1, $2, 'avocat', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    RETURNING *
  `,

  getAllLawyers: `
    SELECT * FROM users 
    WHERE role = 'avocat'
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `,

  searchLawyers: (filters: string[]): string => {
    let query = `
      SELECT * FROM users 
      WHERE role = 'avocat'
    `;

    let paramCount = 1;

    if (filters.includes('verified')) {
      query += ` AND verified_by_admin = $${paramCount}`;
      paramCount++;
    }

    if (filters.includes('city')) {
      query += ` AND office_city ILIKE $${paramCount}`;
      paramCount++;
    }

    if (filters.includes('specialty')) {
      query += ` AND $${paramCount} = ANY(specialties)`;
      paramCount++;
    }

    if (filters.includes('min_rating')) {
      query += ` AND rating >= $${paramCount}`;
      paramCount++;
    }

    if (filters.includes('availability')) {
      query += ` AND availability_status = $${paramCount}`;
      paramCount++;
    }

    if (filters.includes('name')) {
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
      paramCount++;
    }

    query += ` ORDER BY rating DESC, total_reviews DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    return query;
  },

  searchLawyersNearby: `
    SELECT *, 
      (6371 * acos(
        cos(radians($1)) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians($2)) + 
        sin(radians($1)) * sin(radians(latitude))
      )) AS distance
    FROM users
    WHERE role = 'avocat' 
      AND latitude IS NOT NULL 
      AND longitude IS NOT NULL
      AND verified_by_admin = true
    HAVING distance < $3
    ORDER BY distance ASC
    LIMIT $4 OFFSET $5
  `,

  updateLawyerProfile: (fields: string[]): string => {
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
    return `
      UPDATE users
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${fields.length + 1} AND role = 'avocat'
      RETURNING *
    `;
  },

  verifyLawyer: `
    UPDATE users
    SET verified_by_admin = TRUE, 
        verified_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND role = 'avocat'
    RETURNING *
  `,

  unverifyLawyer: `
    UPDATE users
    SET verified_by_admin = FALSE, 
        verified_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND role = 'avocat'
    RETURNING *
  `,

  updateLawyerRating: `
    UPDATE users
    SET rating = $1, 
        total_reviews = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3 AND role = 'avocat'
    RETURNING *
  `,

  updateLawyerStats: `
    UPDATE users
    SET total_cases = $1, 
        active_cases = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3 AND role = 'avocat'
    RETURNING *
  `,

  updateAvailabilityStatus: `
    UPDATE users
    SET availability_status = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND role = 'avocat'
    RETURNING *
  `,

  getLawyerStats: `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN verified_by_admin = TRUE THEN 1 END) as verified,
      COUNT(CASE WHEN verified_by_admin = FALSE THEN 1 END) as pending_verification,
      COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active,
      AVG(rating) as average_rating,
      SUM(total_cases) as total_cases,
      SUM(active_cases) as active_cases
    FROM users
    WHERE role = 'avocat'
  `,

  createClient: `
    INSERT INTO users (
      email, password_hash, role, first_name, last_name, phone,
      address, city, postal_code, emergency_contact_name, 
      emergency_contact_phone, notes, profile_picture_url
    )
    VALUES ($1, $2, 'client', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `,

  getAllClients: `
    SELECT * FROM users 
    WHERE role = 'client'
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `,

  searchClients: (filters: string[]): string => {
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

  updateClientProfile: (fields: string[]): string => {
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
    return `
      UPDATE users
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${fields.length + 1} AND role = 'client'
      RETURNING *
    `;
  },

  updateClientStats: `
    UPDATE users
    SET total_cases = $1, 
        active_cases = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3 AND role = 'client'
    RETURNING *
  `,

  getClientStats: `
    SELECT 
      u.total_cases,
      u.active_cases,
      COUNT(CASE WHEN c.status = 'pending' THEN 1 END) as pending_cases,
      COUNT(CASE WHEN c.status IN ('closed', 'archived') THEN 1 END) as completed_cases,
      (SELECT COUNT(*) FROM appointments 
       WHERE client_id = $1 AND start_date > NOW() AND status IN ('pending', 'confirmed')) as upcoming_appointments,
      (SELECT COUNT(*) FROM documents 
       WHERE uploaded_by = $1) as total_documents
    FROM users u
    LEFT JOIN cases c ON c.client_id = u.id
    WHERE u.id = $1 AND u.role = 'client'
    GROUP BY u.id, u.total_cases, u.active_cases
  `,

  getUserStats: `
    SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins,
      COUNT(CASE WHEN role = 'avocat' THEN 1 END) as total_lawyers,
      COUNT(CASE WHEN role = 'client' THEN 1 END) as total_clients,
      COUNT(CASE WHEN role = 'collaborateur' THEN 1 END) as total_collaborators,
      COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_users,
      COUNT(CASE WHEN is_verified = TRUE THEN 1 END) as verified_users,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_last_month
    FROM users
  `,

  getRecentUsers: `
    SELECT * FROM users 
    ORDER BY created_at DESC 
    LIMIT $1
  `,
};