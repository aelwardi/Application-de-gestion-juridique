export type UserRole = "admin" | "avocat" | "client" | "collaborateur";

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string | null;
  profile_picture_url?: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_login_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  email: string;
  password_hash: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_picture_url?: string;
}

export interface UpdateUserInput {
  email?: string;
  password_hash?: string;
  role?: UserRole;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_picture_url?: string;
  is_active?: boolean;
  is_verified?: boolean;
  last_login_at?: Date;
}
