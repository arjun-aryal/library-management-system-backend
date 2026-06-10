import { UserRole } from "enums/user-role";
import { z } from "zod";

export const registrationSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).trim().toLowerCase(),
      email: z.email().trim().toLowerCase(),
      password: z.string().min(6),
      confirm_password: z.string().min(6),
      role: z
        .enum([UserRole.SUPER_ADMIN, UserRole.LIBRARIAN, UserRole.AUTHOR])
        .default(UserRole.SUPER_ADMIN),
      is_active: z.boolean().default(true),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: "Passwords do not match",
      path: ["confirm_password"],
    }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(1),
  }),
});
