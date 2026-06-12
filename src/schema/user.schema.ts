import { z } from "zod";
import { UserRole } from "enums/user-role";

import { IdParamSchema, createListQuerySchema } from "./common.schema";

const UserBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: z.email("Invalid email format").trim().toLowerCase(),

  role: z
    .enum([UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.AUTHOR])
    .default(UserRole.LIBRARIAN),

  is_active: z.coerce.boolean().default(true),
});

export const createUserSchema = z.object({
  body: UserBodySchema,
});

export const updateUserSchema = z.object({
  params: IdParamSchema,
  body: UserBodySchema.partial(),
});

export const getUsersSchema = z.object({
  query: createListQuerySchema([
    "id",
    "name",
    "email",
    "role",
    "created_at",
    "updated_at",
  ]),
});

export const getUserByIdSchema = z.object({
  params: IdParamSchema,
});

export const deleteUserSchema = z.object({
  params: IdParamSchema,
});
