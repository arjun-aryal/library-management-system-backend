import { UserRole } from "../enums/user-role";

export interface JWTPayload {
  userId: number;
  name: string;
  role?: UserRole;
}

export interface UserInfo {
  userId: number;
  name: string;
  role?: UserRole;
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
