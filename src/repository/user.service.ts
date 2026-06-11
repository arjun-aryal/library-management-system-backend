import { query } from "config/db";
import { PoolClient } from "pg";
import { RegisterInput } from "types/auth.types";
import { PaginatedResponse } from "types/pagination.type";
import { GetAllUsersParams, UpdateUser, User } from "types/user.types";
import { buildPagination } from "utils/paginationHelper";
export const getUserRole = async (userId: Number, client?: PoolClient) => {
  const result = await query(`SELECT role FROM users WHERE id = $1`, [userId]);
  return result.rows[0].role;
};
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
  return result.rows[0];
};

export const getAllUsers = async ({
  page,
  limit,
  search,
  sortBy = "id",
  order = "asc",
}: GetAllUsersParams): Promise<PaginatedResponse<Omit<User, "password">>> => {
  const whereParams: string[] = [];
  const conditions: string[] = [];

  if (search) {
    whereParams.push(`%${search}%`);

    conditions.push(`
      (
        name ILIKE $${whereParams.length}
        OR email ILIKE $${whereParams.length}
      )
    `);
  }
  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sortOrder = order?.toUpperCase() === "DESC" ? "DESC" : "ASC";
  const shouldPaginate = page !== undefined && limit !== undefined;

  const pageNumber = Number(page) || 1;
  const pageSize = Number(limit) || 10;

  const { clause, params } = buildPagination({
    page: pageNumber,
    limit: pageSize,
    startIndex: whereParams.length,
    paginate: shouldPaginate,
  });

  const baseQuery = `
    SELECT
      id,
      name,
      email,
      role,
      is_active,
      created_at,
      updated_at,
      COUNT(*) OVER() AS total_records
    FROM users
    ${where}
    ORDER BY ${sortBy} ${sortOrder}
    ${clause}
  `;

  const result = await query(baseQuery, [...whereParams, ...params]);

  const totalRecords =
    result.rows.length > 0 ? Number(result.rows[0].total_records) : 0;

  const data = result.rows.map(({ total_records, ...user }) => user);

  return {
    data,
    meta: {
      page: pageNumber,
      limit: pageSize,
      totalRecords,
      totalPages: Math.ceil(totalRecords / pageSize),
    },
  };
};

export const getUserById = async (userId: Number) => {
  const baseQuery = `
  select
    id,
    name,
    email,
    role,
    is_active,
    created_at,
    updated_at
  from users
  where id = $1
`;

  const result = await query(baseQuery, [userId]);
  return result.rows[0];
};

export const updateUserById = async (payload: UpdateUser, userId: number) => {
  const fields = Object.keys(payload);
  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }
  const clause = fields
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");

  const values = fields.map((key) => payload[key]);

  const baseQuery = `
    UPDATE users
    SET ${clause},updated_at = NOW()
    WHERE id = $${fields.length + 1}
    RETURNING id, name, email, role, is_active, created_at, updated_at
  `;

  const result = await query(baseQuery, [...values, userId]);
  return result.rows[0];
};

export const deleteUserById = async (userId: Number) => {
  const result = await query(`DELETE FROM users WHERE id = $1 RETURNING id`, [
    userId,
  ]);
};
