import { UserRole } from "enums/user-role";
import { z } from "zod";

const IdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),

  sortBy: z
    .enum(["id", "name", "email", "role", "created_at", "updated_at"])
    .default("id"),

  order: z.enum(["asc", "desc"]).default("asc"),
});

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
  query: PaginationQuerySchema.extend({
    search: z.string().trim().optional(),
  }),
});

export const getUserByIdSchema = z.object({
  params: IdParamSchema,
});

export const deleteUserSchema = z.object({
  params: IdParamSchema,
});
