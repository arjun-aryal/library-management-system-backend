import { query } from "config/db";
import { PoolClient } from "pg";
import { RegisterInput } from "types/auth.types";
import { PaginatedResponse } from "types/pagination.type";
import { GetAllUsersParams, UpdateUser, User } from "types/user.types";
import { buildPagination } from "utils/paginationHelper";

export const getUserRole = async (userId: number, client?: PoolClient) => {
  const result = await query(`SELECT role FROM users WHERE id = $1`, [userId]);
  return result.rows[0];
};
export const userEmailExist = async (emails: string): Promise<User | null> => {
  const result = await query<User>(
    `select id, name, email, password, role, is_active, created_at, updated_at
     from users
     where email = $1`,
    [emails],
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

export const getUserById = async (userId: number) => {
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

export const updateUserById = async (
  payload: UpdateUser,
  userId: number,
  client?: PoolClient,
) => {
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

  const result = await query(baseQuery, [...values, userId], client);
  return result.rows[0];
};

export const deleteUserById = async (userId: number, client?: PoolClient) => {
  const result = await query(
    `UPDATE users 
     SET is_active = false, updated_at = NOW()
     WHERE id = $1`,
    [userId],
    client,
  );

  return;
};

export const getUsersByEmails = async (
  emails: string[],
  client?: PoolClient,
): Promise<User[]> => {
  const result = await query<User>(
    `
    SELECT id, name, email, password, role, is_active, created_at, updated_at
    FROM users
    WHERE email = ANY($1)
    `,
    [emails],
  );

  return result.rows;
};

export const createBulkUsers = async (
  users: RegisterInput[],
  client?: PoolClient,
) => {
  if (!users.length) return [];

  const values: unknown[] = [];

  const placeholders = users.map((user, index) => {
    const offset = index * 4;

    values.push(user.name, user.email, user.password, user.role);

    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, NOW(), NOW())`;
  });

  const result = await query(
    `
    INSERT INTO users
      (name, email, password, role, created_at, updated_at)
    VALUES
      ${placeholders.join(",")}
    RETURNING
      id, name, email, role, created_at, updated_at
    `,
    values,
    client,
  );

  return result.rows;
};
