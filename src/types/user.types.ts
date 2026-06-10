import { UserRole } from "../enums/user-role";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  is_active?: boolean;
}
