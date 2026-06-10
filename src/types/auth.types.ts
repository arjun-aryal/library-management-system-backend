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

