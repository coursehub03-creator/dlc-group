import { NextRequest, NextResponse } from "next/server";
import {
  landDisputeRequestSchema,
  monitoringRequestSchema,
  patentRequestSchema,
  trademarkRequestSchema
} from "@/lib/validators/forms";
import { prisma } from "@/lib/db/prisma";

type RequestPayload = Record<string, string> & { requestType?: string };

async function parsePayload(req: NextRequest): Promise<RequestPayload> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await req.json()) as RequestPayload;
  }

  const formData = await req.formData();
  return Object.fromEntries(formData.entries()) as RequestPayload;
}

export async function POST(req: NextRequest) {
  const payload = await parsePayload(req);

  switch (payload.requestType) {
    case "patent": {
      const parsed = patentRequestSchema.safeParse(payload);
      if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      const created = await prisma.patentRequest.create({ data: parsed.data });
      return NextResponse.json({ ok: true, id: created.id, requestType: "patent" });
    }
    case "trademark": {
      const parsed = trademarkRequestSchema.safeParse(payload);
      if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      const created = await prisma.trademarkRequest.create({ data: parsed.data });
      return NextResponse.json({ ok: true, id: created.id, requestType: "trademark" });
    }
    case "land-dispute": {
      const parsed = landDisputeRequestSchema.safeParse(payload);
      if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      const created = await prisma.landDisputeRequest.create({ data: parsed.data });
      return NextResponse.json({ ok: true, id: created.id, requestType: "land-dispute" });
    }
    case "monitoring": {
      const parsed = monitoringRequestSchema.safeParse(payload);
      if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      const created = await prisma.monitoringRequest.create({ data: parsed.data });
      return NextResponse.json({ ok: true, id: created.id, requestType: "monitoring" });
    }
    default:
      return NextResponse.json(
        { error: "Invalid requestType. Use one of: patent, trademark, land-dispute, monitoring." },
        { status: 400 }
      );
  }
}
