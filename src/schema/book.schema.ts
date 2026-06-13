import { z } from "zod";

import {
  AuthorIdParamSchema,
  IdParamSchema,
  createListQuerySchema,
} from "./common.schema";

const BookBodySchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(255, "Title must not exceed 255 characters"),

  isbn: z
    .string()
    .trim()
    .min(10, "ISBN must be at least 10 characters")
    .max(20, "ISBN must not exceed 20 characters"),

  published_year: z.coerce
    .number()
    .int("Published year must be an integer")
    .min(1900, "Published year is invalid")
    .max(
      new Date().getFullYear(),
      `Published year cannot be greater than ${new Date().getFullYear()}`,
    ),
});

export const createBookSchema = z.object({
  params: AuthorIdParamSchema,
  body: BookBodySchema,
});

export const updateBookSchema = z.object({
  params: AuthorIdParamSchema.and(IdParamSchema),
  body: BookBodySchema.partial(),
});

export const getBooksSchema = z.object({
  query: createListQuerySchema([
    "id",
    "title",
    "isbn",
    "published_year",
    "created_at",
    "updated_at",
  ]),
});

export const getBookByIdSchema = z.object({
  params: IdParamSchema,
});

export const deleteBookSchema = z.object({
  params: IdParamSchema,
});
