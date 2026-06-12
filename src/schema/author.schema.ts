import { z } from "zod";

import { IdParamSchema, createListQuerySchema } from "./common.schema";

const AuthorBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: z.email("Invalid email format").trim().toLowerCase(),

  bio: z
    .string()
    .trim()
    .max(1000, "Bio must not exceed 1000 characters")
    .optional(),

  nationality: z
    .string()
    .trim()
    .min(2, "Nationality must be at least 2 characters")
    .max(100, "Nationality must not exceed 100 characters"),
});

export const createAuthorSchema = z.object({
  body: AuthorBodySchema,
});

export const updateAuthorSchema = z.object({
  params: IdParamSchema,
  body: AuthorBodySchema.partial(),
});

export const getAuthorsSchema = z.object({
  query: createListQuerySchema([
    "id",
    "name",
    "nationality",
    "created_at",
    "updated_at",
  ]),
});

export const getAuthorByIdSchema = z.object({
  params: IdParamSchema,
});

export const deleteAuthorSchema = z.object({
  params: IdParamSchema,
});
