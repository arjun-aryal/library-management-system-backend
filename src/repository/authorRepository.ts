import { query, withTransaction } from "config/db";
import { PoolClient } from "pg";
import {
  Author,
  CreateAuthorInput,
  GetAllAuthorParams,
  UpdateAuthor,
} from "types/author.types";
import { PaginatedResponse } from "types/pagination.type";
import { buildPagination } from "utils/paginationHelper";

export const getAllAuthor = async ({
  page,
  limit,
  search,
  sortBy = "id",
  order = "asc",
}: GetAllAuthorParams): Promise<PaginatedResponse<Author>> => {
  const whereParams: string[] = [];
  const conditions: string[] = [];

  if (search) {
    whereParams.push(`%${search}%`);

    conditions.push(`
        (
            u.name ILIKE $${whereParams.length}
            OR a.nationality ILIKE $${whereParams.length}
        )
    `);
  }
  const where = conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";

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
        a.id,
        a.user_id,
        u.name,
        a.bio,
        a.nationality,
        a.created_at,
        a.updated_at,
        COUNT(*) OVER() AS total_records
    FROM authors a
    JOIN users u ON a.user_id = u.id
    WHERE a.is_active = true
    ${where}
    ORDER BY ${sortBy} ${sortOrder}
    ${clause}
  `;

  const result = await query(baseQuery, [...whereParams, ...params]);

  const totalRecords =
    result.rows.length > 0 ? Number(result.rows[0].total_records) : 0;

  const data = result.rows.map(({ total_records, ...author }) => author);

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

export const getAuthorById = async (authorId: Number, client?: PoolClient) => {
  const baseQuery = `
    SELECT
      a.id,
      a.user_id,
      u.name,
      u.email,
      a.bio,
      a.nationality,
      a.is_active,
      a.created_at,
      a.updated_at
    FROM authors a
    JOIN users u
      ON a.user_id = u.id
    WHERE a.id = $1  AND a.is_active = true
  `;

  const result = await query(baseQuery, [authorId], client);
  return result.rows[0];
};

export const createAuthor = async (
  data: CreateAuthorInput,
  client?: PoolClient,
) => {
  const result = await query(
    `INSERT INTO authors
     (user_id, bio, nationality, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING id, user_id, bio, nationality, created_at, updated_at`,
    [data.user_id, data.bio, data.nationality],
    client,
  );

  return result.rows[0];
};

export const updateAuthorById = async (
  payload: UpdateAuthor,
  authorId: number,
  client?: PoolClient,
) => {
  const fields = Object.keys(payload) as (keyof UpdateAuthor)[];

  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }

  const clause = fields
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");

  const values = fields.map((key) => payload[key]);

  const baseQuery = `
    UPDATE authors
    SET ${clause}, updated_at = NOW()
    WHERE id = $${fields.length + 1}
    RETURNING id, user_id, bio, nationality, created_at, updated_at
  `;

  const result = await query(baseQuery, [...values, authorId], client);

  return result.rows[0];
};

export const deleteAuthorById = async (
  authorId: number,
  client?: PoolClient,
) => {
  const result = await query(
    `UPDATE authors 
     SET is_active = false, updated_at = NOW()
     WHERE id = $1
     RETURNING id, user_id`,
    [authorId],
    client,
  );

  return result.rows[0];
};

export const createBulkAuthors = async (
  authors: CreateAuthorInput[],
  client?: PoolClient,
) => {
  if (!authors.length) return [];

  const values: unknown[] = [];

  const placeholders = authors.map((author, index) => {
    const offset = index * 3;

    values.push(author.user_id, author.bio, author.nationality);

    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, NOW(), NOW())`;
  });

  const result = await query(
    `
    INSERT INTO authors
      (user_id, bio, nationality, created_at, updated_at)
    VALUES
      ${placeholders.join(",")}
    RETURNING
      id, user_id, bio, nationality, created_at, updated_at
    `,
    values,
    client,
  );

  return result.rows;
};
