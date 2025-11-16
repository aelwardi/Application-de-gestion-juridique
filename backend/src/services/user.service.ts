import { pool } from "../config/database.config";
import { User, CreateUserInput, UpdateUserInput } from "../types/users.types";
import { userQueries } from "../database/queries/users.queries";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export class UserService {
  async createUser(data: CreateUserInput): Promise<User> {
    const { email, password_hash, role, first_name, last_name, phone, profile_picture_url } = data;

    const hashedPassword = await bcrypt.hash(password_hash, SALT_ROUNDS);

    const result = await pool.query(userQueries.create, [
      email,
      hashedPassword,
      role,
      first_name,
      last_name,
      phone || null,
      profile_picture_url || null,
    ]);

    return result.rows[0] as User;
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await pool.query(userQueries.getById, [id]);
    return result.rows[0] || null;
  }

  async getAllUsers(limit = 50, offset = 0): Promise<{ users: User[]; total: number }> {
    const result = await pool.query(userQueries.getAll, [limit, offset]);
    const countResult = await pool.query(userQueries.count);
    return {
      users: result.rows as User[],
      total: parseInt(countResult.rows[0].count),
    };
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<User | null> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    if (fields.length === 0) return await this.getUserById(id);

    const query = userQueries.update(fields);
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await pool.query(userQueries.delete, [id]);
    return result.rows.length > 0;
  }
}
