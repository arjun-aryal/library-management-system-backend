import { z } from "zod";

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export const createListQuerySchema = <T extends [string, ...string[]]>(
  sortFields: T,
) =>
  PaginationQuerySchema.extend({
    search: z.string().trim().optional(),
    sortBy: z.enum(sortFields).default(sortFields[0]),
  });
