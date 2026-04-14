import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  country: z.string().optional(),
  serviceType: z.string().optional(),
  message: z.string().min(10),
  consent: z.boolean().refine((v) => v)
});
