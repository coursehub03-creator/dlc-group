import { NextRequest, NextResponse } from "next/server";
import { getCurrentAIUserId } from "@/lib/ai/user";
import { extractTextFromPdfBuffer, validatePdfFile } from "@/lib/ai/pdf";
import { LEGAL_MODES, type LegalMode } from "@/lib/ai/chat";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

function localizedError(locale: "ar" | "en") {
  return locale === "ar"
    ? "تعذر استخراج النص من ملف PDF. يمكنك لصق نص العقد يدوياً داخل المحادثة."
    : "Could not extract text from this PDF. You can paste the contract text manually in the chat.";
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const locale = form.get("locale") === "ar" ? "ar" : "en";
    const requestedMode = String(form.get("mode") ?? "general_legal_consultation");
    const mode: LegalMode = LEGAL_MODES.includes(requestedMode as LegalMode) ? (requestedMode as LegalMode) : "contract_analysis";
    const jurisdiction = String(form.get("jurisdiction") ?? "").trim() || null;
    const providedConversationId = String(form.get("conversationId") ?? "").trim() || null;

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: locale === "ar" ? "يرجى رفع ملف PDF." : "Please upload a PDF file." }, { status: 400 });
    }

    const validationError = validatePdfFile(file, locale);
    if (validationError) return NextResponse.json({ success: false, error: validationError }, { status: 400 });

    const userId = await getCurrentAIUserId();
    const conversation = providedConversationId
      ? await prisma.aIConversation.findFirst({ where: { id: providedConversationId, userId } })
      : await prisma.aIConversation.create({
          data: {
            userId,
            title: file.name.slice(0, 80),
            category: mode,
            mode,
            jurisdiction,
          },
        });

    if (!conversation) {
      return NextResponse.json({ success: false, error: locale === "ar" ? "المحادثة غير موجودة." : "Conversation not found." }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { text } = extractTextFromPdfBuffer(buffer);
    if (!text) return NextResponse.json({ success: false, error: localizedError(locale) }, { status: 422 });

    const savedFile = await prisma.aIFile.create({
      data: {
        conversationId: conversation.id,
        userId,
        filename: file.name,
        mimeType: file.type || "application/pdf",
        size: file.size,
        extractedText: text,
      },
    });

    return NextResponse.json({
      success: true,
      fileId: savedFile.id,
      conversationId: conversation.id,
      filename: savedFile.filename,
      extractedTextPreview: text.slice(0, 1200),
    });
  } catch (error) {
    console.error("[ai-files] failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: "PDF processing failed. Please paste the contract text manually." }, { status: 500 });
  }
}
