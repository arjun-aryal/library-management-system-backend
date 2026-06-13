import { query } from "config/db";
import { PoolClient } from "pg";
import {
  Book,
  CreateBookInput,
  GetAllBookParams,
  UpdateBookInput,
} from "types/book.types";
import { PaginatedResponse } from "types/pagination.type";
import { buildPagination } from "utils/paginationHelper";

export const getAllBooksforAuthor = async ({
  author_id,
  page,
  limit,
  search,
  sortBy = "id",
  order = "asc",
}: GetAllBookParams): Promise<PaginatedResponse<Book>> => {
  const whereParams: string[] = [];
  const conditions: string[] = [];

  whereParams.push(author_id.toString());
  conditions.push(`b.author_id = $${whereParams.length}`);

  if (search) {
    whereParams.push(`%${search}%`);

    conditions.push(`
        (
            b.title ILIKE $${whereParams.length}
            OR b.isbn ILIKE $${whereParams.length}
        )
    `);
  }
  const where = conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";
  const sortColumn = `b.${sortBy || "id"}`;
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
    b.id,
    b.title,
    b.isbn,
    b.published_year,
    b.author_id,
    b.created_at,
    b.updated_at,
    COUNT(*) OVER() AS total_records
  FROM books b
  JOIN authors a
    ON b.author_id = a.id
  WHERE b.is_active = true
    AND a.is_active = true
    ${where}
  ORDER BY ${sortColumn} ${sortOrder}
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
export const getBookforAuthorById = async (
  authorId: number,
  bookId: number,
  client?: PoolClient,
) => {
  const baseQuery = `
    SELECT
      b.id,
      b.author_id,
      b.title,
      b.isbn,
      b.published_year,
      b.is_active,
      b.created_at,
      b.updated_at
    FROM books b
    JOIN authors a
      ON b.author_id = a.id
    WHERE b.id = $1
      AND b.author_id = $2
      AND b.is_active = true
      AND a.is_active = true
  `;

  const result = await query(baseQuery, [bookId, authorId], client);

  return result.rows[0];
};

export const createBook = async (
  data: CreateBookInput,
  client?: PoolClient,
) => {
  const result = await query(
    `INSERT INTO books
     (author_id, title, isbn, published_year, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING
       id,
       author_id,
       title,
       isbn,
       published_year,
       created_at,
       updated_at`,
    [data.author_id, data.title, data.isbn, data.published_year],
    client,
  );

  return result.rows[0];
};

export const updateBookById = async (
  payload: UpdateBookInput,
  bookId: number,
  client?: PoolClient,
) => {
  const fields = Object.keys(payload);

  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }

  const clause = fields
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");

  const values = fields.map((key) => payload[key as keyof UpdateBookInput]);

  const baseQuery = `
    UPDATE books
    SET ${clause}, updated_at = NOW()
    WHERE id = $${fields.length + 1}
    RETURNING
      id,
      author_id,
      title,
      isbn,
      published_year,
      is_active,
      created_at,
      updated_at
  `;

  const result = await query(baseQuery, [...values, bookId], client);

  return result.rows[0];
};

export const deleteBookById = async (bookId: number, client?: PoolClient) => {
  const baseQuery = `
    UPDATE books
    SET
      is_active = false,
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      author_id,
      title,
      isbn,
      published_year,
      is_active,
      created_at,
      updated_at
  `;

  const result = await query(baseQuery, [bookId], client);

  return result.rows[0];
};
