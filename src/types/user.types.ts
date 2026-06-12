import { UserRole } from "../enums/user-role";
import { ListQuery } from "./pagination.type";

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

export interface GetAllUsersParams extends ListQuery<User> {
  role?: string;
}

export type UpdateUser = Partial<
  Pick<User, "name" | "email" | "role" | "is_active">
>;


