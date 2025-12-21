export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    profile_picture_url?: string;
  };
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}