import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_PDF_SIZE = 10 * 1024 * 1024;

function extractTextFromPdfBuffer(buffer: Buffer): string {
  const asLatin1 = buffer.toString("latin1");
  const contentBlocks = asLatin1.match(/\(([^\)]{2,})\)\s*Tj/g) ?? [];

  const extracted = contentBlocks
    .map((block) => block.replace(/\)\s*Tj$/, "").replace(/^\(/, ""))
    .map((text) => text.replace(/\\([nrtbf()\\])/g, "$1"))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (extracted.length > 0) return extracted;

  const fallback = asLatin1.match(/[A-Za-z0-9\u0600-\u06FF][A-Za-z0-9\u0600-\u06FF\s,.;:()\-_/]{200,}/g)?.join(" ")?.trim() ?? "";
  return fallback;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please upload a PDF file." }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
    }

    if (file.size > MAX_PDF_SIZE) {
      return NextResponse.json({ error: "PDF is too large. Maximum file size is 10MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = extractTextFromPdfBuffer(buffer);

    if (!text) {
      return NextResponse.json({ error: "Could not extract text from this PDF. Please paste contract text manually." }, { status: 422 });
    }

    return NextResponse.json({ text: text.slice(0, 120000) });
  } catch (error) {
    console.error("[ai-pdf] failed", error);
    return NextResponse.json({ error: "PDF processing failed. Please paste contract text manually." }, { status: 500 });
  }
}
