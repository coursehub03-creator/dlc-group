import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validators/forms";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const parsed = contactSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  await prisma.contactInquiry.create({ data });
  return NextResponse.json({ ok: true });
}
