import { query } from "config/db";
import { PoolClient } from "pg";
import { RegisterInput, User } from "types/user.types";

export const userEmailExist = async (email: string): Promise<User | null> => {
  const result = await query<User>(
    `select id, name, email, password, role, is_active, created_at, updated_at
     from users
     where email = $1`,
    [email],
  );
  return result.rows[0] ?? null;
};

export const createUser = async (data: RegisterInput, client?: PoolClient) => {
  const result = await query(
    `insert into users 
     (name, email, password, role, created_at, updated_at)
     values ($1, $2, $3, $4, NOW(), NOW())
     returning id, name, email, role, created_at, updated_at`,
    [data.name, data.email, data.password, data.role],
    client,
  );
  console.log(result.rows[0]);
  return result.rows[0];
};
