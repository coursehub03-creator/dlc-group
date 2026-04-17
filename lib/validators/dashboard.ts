import { z } from "zod";

export const newRequestSchema = z.object({
  categoryId: z.string().min(1, "Please select a service category."),
  title: z.string().trim().min(5, "Title must be at least 5 characters.").max(120, "Title is too long."),
  message: z.string().trim().min(20, "Please add more details about your legal request.").max(4000, "Message is too long."),
  country: z.string().trim().max(80, "Country is too long.").optional()
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Full name is required.").max(120, "Name is too long."),
  phone: z.string().trim().max(40, "Phone number is too long.").optional(),
  country: z.string().trim().max(80, "Country is too long.").optional(),
  language: z.enum(["en", "ar"])
});

export const settingsUpdateSchema = z.object({
  language: z.enum(["en", "ar"]),
  timezone: z.string().trim().max(100, "Timezone is too long.").optional(),
  notificationsEnabled: z.boolean()
});

export const securityUpdateSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password is required."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Please confirm your password.")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

export const supportRequestSchema = z.object({
  subject: z.string().trim().min(5, "Subject is required.").max(120, "Subject is too long."),
  message: z.string().trim().min(20, "Please provide more details.").max(4000, "Message is too long.")
});
