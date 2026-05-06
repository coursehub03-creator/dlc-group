import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdfBuffer, validatePdfFile } from "@/lib/ai/pdf";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const locale = form.get("locale") === "ar" ? "ar" : "en";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: locale === "ar" ? "يرجى رفع ملف PDF." : "Please upload a PDF file." }, { status: 400 });
    }

    const validationError = validatePdfFile(file, locale);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const { text } = extractTextFromPdfBuffer(Buffer.from(await file.arrayBuffer()));
    if (!text) {
      return NextResponse.json(
        { error: locale === "ar" ? "تعذر استخراج النص من ملف PDF. يرجى لصق نص العقد يدوياً." : "Could not extract text from this PDF. Please paste contract text manually." },
        { status: 422 },
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("[ai-files] failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "PDF processing failed. Please paste contract text manually." }, { status: 500 });
  }
}
