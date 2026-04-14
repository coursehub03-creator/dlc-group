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

export const patentRequestSchema = z.object({
  applicantName: z.string().min(2),
  country: z.string().min(2),
  inventionTitle: z.string().min(5),
  inventionSummary: z.string().min(20),
  industry: z.string().min(2),
  targetJurisdictions: z.string().min(2),
  notes: z.string().optional()
});

export const trademarkRequestSchema = z.object({
  applicantName: z.string().min(2),
  brandName: z.string().min(2),
  industry: z.string().min(2),
  jurisdictions: z.string().min(2),
  existingStatus: z.string().optional(),
  notes: z.string().optional()
});

export const landDisputeRequestSchema = z.object({
  clientName: z.string().min(2),
  country: z.string().min(2),
  propertyLocation: z.string().min(3),
  disputeType: z.string().min(3),
  description: z.string().min(20),
  opposingParty: z.string().optional(),
  urgency: z.string().min(2)
});

export const monitoringRequestSchema = z.object({
  companyName: z.string().min(2),
  country: z.string().min(2),
  industry: z.string().min(2),
  purpose: z.string().min(20),
  notes: z.string().optional()
});
