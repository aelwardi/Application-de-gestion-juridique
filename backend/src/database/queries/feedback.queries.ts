import { pool } from '../../config/database.config';

export interface Feedback {
  id: string;
  user_id: string;
  rating: number;
  category?: string;
  comment?: string;
  suggestions?: string;
  user_email?: string;
  user_role?: string;
  status: 'pending' | 'reviewed' | 'replied' | 'archived';
  admin_response?: string;
  admin_id?: string;
  responded_at?: Date;
  created_at: Date;
  updated_at: Date;
  user_first_name?: string;
  user_last_name?: string;
  admin_first_name?: string;
  admin_last_name?: string;
}

export interface CreateFeedbackInput {
  user_id: string;
  rating: number;
  category?: string;
  comment?: string;
  suggestions?: string;
  user_email?: string;
  user_role?: string;
}

export async function createFeedback(data: CreateFeedbackInput): Promise<Feedback> {
  const query = `
    INSERT INTO feedback (user_id, rating, category, comment, suggestions, user_email, user_role)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const values = [
    data.user_id,
    data.rating,
    data.category || null,
    data.comment || null,
    data.suggestions || null,
    data.user_email || null,
    data.user_role || null
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getAllFeedback(
  page: number = 1,
  limit: number = 20,
  status?: string,
  rating?: number,
  category?: string,
  userRole?: string
): Promise<{ data: Feedback[]; total: number }> {
  let query = `
    SELECT 
      f.*,
      u.first_name as user_first_name,
      u.last_name as user_last_name,
      u.email as user_email,
      a.first_name as admin_first_name,
      a.last_name as admin_last_name
    FROM feedback f
    LEFT JOIN users u ON f.user_id = u.id
    LEFT JOIN users a ON f.admin_id = a.id
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramCount = 1;

  if (status) {
    query += ` AND f.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  if (rating) {
    query += ` AND f.rating = $${paramCount}`;
    params.push(rating);
    paramCount++;
  }

  if (category) {
    query += ` AND f.category = $${paramCount}`;
    params.push(category);
    paramCount++;
  }

  if (userRole) {
    query += ` AND f.user_role = $${paramCount}`;
    params.push(userRole);
    paramCount++;
  }

  query += ` ORDER BY f.created_at DESC`;

  const countQuery = query.replace(
    /SELECT[\s\S]*?FROM/,
    'SELECT COUNT(*) as total FROM'
  ).replace(/ORDER BY.*$/, '');

  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].total);

  query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, (page - 1) * limit);

  const result = await pool.query(query, params);

  return {
    data: result.rows,
    total
  };
}

export async function getFeedbackById(id: string): Promise<Feedback | null> {
  const query = `
    SELECT 
      f.*,
      u.first_name as user_first_name,
      u.last_name as user_last_name,
      u.email as user_email,
      a.first_name as admin_first_name,
      a.last_name as admin_last_name
    FROM feedback f
    LEFT JOIN users u ON f.user_id = u.id
    LEFT JOIN users a ON f.admin_id = a.id
    WHERE f.id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

export async function getUserFeedback(userId: string): Promise<Feedback[]> {
  const query = `
    SELECT 
      f.*,
      a.first_name as admin_first_name,
      a.last_name as admin_last_name
    FROM feedback f
    LEFT JOIN users a ON f.admin_id = a.id
    WHERE f.user_id = $1
    ORDER BY f.created_at DESC
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
}

export async function updateFeedbackStatus(
  id: string,
  status: string
): Promise<Feedback> {
  const query = `
    UPDATE feedback
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;

  const result = await pool.query(query, [status, id]);
  return result.rows[0];
}

export async function replyToFeedback(
  id: string,
  adminId: string,
  response: string
): Promise<Feedback> {
  const query = `
    UPDATE feedback
    SET 
      admin_response = $1,
      admin_id = $2,
      status = 'replied',
      responded_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
  `;

  const result = await pool.query(query, [response, adminId, id]);
  const feedback = result.rows[0];

  try {
    await pool.query(`
      INSERT INTO notifications (user_id, type, title, message, link, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      feedback.user_id,
      'feedback_response',
      'Réponse à votre avis',
      'L\'administrateur a répondu à votre avis',
      '/profile'
    ]);
  } catch (notifError) {
    console.error('Erreur création notification (trigger devrait le faire):', notifError);
  }

  return feedback;
}

export async function getFeedbackStats(): Promise<{
  total: number;
  pending: number;
  replied: number;
  average_rating: number;
  by_category: { category: string; count: number }[];
  by_rating: { rating: number; count: number }[];
  by_role: { role: string; count: number }[];
}> {
  const statsQuery = `
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'replied' THEN 1 END) as replied,
      COALESCE(AVG(rating), 0) as average_rating
    FROM feedback
  `;

  const byCategoryQuery = `
    SELECT category, COUNT(*) as count
    FROM feedback
    WHERE category IS NOT NULL
    GROUP BY category
    ORDER BY count DESC
  `;

  const byRatingQuery = `
    SELECT rating, COUNT(*) as count
    FROM feedback
    GROUP BY rating
    ORDER BY rating DESC
  `;

  const byRoleQuery = `
    SELECT user_role as role, COUNT(*) as count
    FROM feedback
    WHERE user_role IS NOT NULL
    GROUP BY user_role
    ORDER BY count DESC
  `;

  const [statsResult, categoryResult, ratingResult, roleResult] = await Promise.all([
    pool.query(statsQuery),
    pool.query(byCategoryQuery),
    pool.query(byRatingQuery),
    pool.query(byRoleQuery)
  ]);

  return {
    total: parseInt(statsResult.rows[0].total),
    pending: parseInt(statsResult.rows[0].pending),
    replied: parseInt(statsResult.rows[0].replied),
    average_rating: parseFloat(statsResult.rows[0].average_rating),
    by_category: categoryResult.rows,
    by_rating: ratingResult.rows,
    by_role: roleResult.rows
  };
}