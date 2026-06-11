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

export interface GetAllUsersParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  role?: string;
  sortBy?: keyof User;
  order?: "asc" | "desc";
}

export type UpdateUser = Partial<
  Pick<User, "name" | "email" | "role" | "is_active">
>;
