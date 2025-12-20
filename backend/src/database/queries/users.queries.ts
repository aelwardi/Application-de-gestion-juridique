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

  getAll: `
    SELECT * FROM users
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `,

  update: (fields: string[]): string => {
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
    return `
      UPDATE users
      SET ${setClause}
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
};
