import { inflateSync } from "node:zlib";

export const MAX_PDF_SIZE = 10 * 1024 * 1024;
export const MAX_EXTRACTED_TEXT = 120000;

type PdfExtractionResult = {
  text: string;
  warning?: string;
};

function decodePdfEscapes(value: string) {
  return value
    .replace(/\\([nrtbf()\\])/g, (_match, escaped: string) => {
      const map: Record<string, string> = { n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", "(": "(", ")": ")", "\\": "\\" };
      return map[escaped] ?? escaped;
    })
    .replace(/\\([0-7]{1,3})/g, (_match, octal: string) => String.fromCharCode(Number.parseInt(octal, 8)));
}

function decodeHexString(hex: string) {
  const normalized = hex.replace(/\s+/g, "");
  const bytes = normalized.match(/.{1,2}/g)?.map((pair) => Number.parseInt(pair.padEnd(2, "0"), 16)) ?? [];
  const buffer = Buffer.from(bytes.filter((byte) => Number.isFinite(byte)));
  if (buffer.length >= 2 && ((buffer[0] === 0xfe && buffer[1] === 0xff) || (buffer[0] === 0xff && buffer[1] === 0xfe))) {
    return buffer.subarray(2).toString("utf16le");
  }
  return buffer.toString("utf8");
}

function extractLiteralStrings(input: string) {
  const strings: string[] = [];
  let i = 0;
  while (i < input.length) {
    if (input[i] !== "(") {
      i += 1;
      continue;
    }
    let depth = 1;
    let value = "";
    i += 1;
    while (i < input.length && depth > 0) {
      const char = input[i];
      if (char === "\\") {
        value += char + (input[i + 1] ?? "");
        i += 2;
        continue;
      }
      if (char === "(") depth += 1;
      if (char === ")") depth -= 1;
      if (depth > 0) value += char;
      i += 1;
    }
    if (value.trim().length >= 2) strings.push(decodePdfEscapes(value));
  }
  return strings;
}

function extractTextCandidates(buffer: Buffer) {
  const latin = buffer.toString("latin1");
  const candidates: string[] = [];

  const streamRegex = /<<(?:.|\n|\r)*?>>\s*stream\r?\n?([\s\S]*?)\r?\n?endstream/g;
  for (const match of latin.matchAll(streamRegex)) {
    const objectHeader = match[0].slice(0, Math.max(0, match[0].indexOf("stream")));
    const rawStream = Buffer.from(match[1], "latin1");
    if (/\/FlateDecode\b/.test(objectHeader)) {
      try {
        candidates.push(inflateSync(rawStream).toString("latin1"));
      } catch {
        // Ignore this compressed object and continue with other streams.
      }
    } else {
      candidates.push(rawStream.toString("latin1"));
    }
  }

  candidates.push(latin);
  return candidates;
}

function normalizeExtractedText(parts: string[]) {
  return parts
    .join(" ")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_EXTRACTED_TEXT);
}

export function extractTextFromPdfBuffer(buffer: Buffer): PdfExtractionResult {
  const parts: string[] = [];

  for (const candidate of extractTextCandidates(buffer)) {
    const textOperatorBlocks = candidate.match(/(?:\((?:\\.|[^\\)]){2,}\)|<([0-9A-Fa-f\s]{4,})>)\s*(?:Tj|'|")/g) ?? [];
    for (const block of textOperatorBlocks) {
      const literal = block.match(/^\((.*)\)\s*(?:Tj|'|")$/s)?.[1];
      if (literal) parts.push(decodePdfEscapes(literal));
      const hex = block.match(/^<([0-9A-Fa-f\s]{4,})>\s*(?:Tj|'|")$/)?.[1];
      if (hex) parts.push(decodeHexString(hex));
    }

    const arrayTextBlocks = candidate.match(/\[(?:\s*(?:\((?:\\.|[^\\)])*\)|<[^>]+>|-?\d+(?:\.\d+)?))*\s*\]\s*TJ/g) ?? [];
    for (const block of arrayTextBlocks) {
      parts.push(...extractLiteralStrings(block));
      for (const hex of block.matchAll(/<([0-9A-Fa-f\s]{4,})>/g)) parts.push(decodeHexString(hex[1]));
    }
  }

  let text = normalizeExtractedText(parts.filter(Boolean));
  if (text.length > 0) return { text };

  const fallback = buffer
    .toString("utf8")
    .match(/[A-Za-z0-9\u0600-\u06FF][A-Za-z0-9\u0600-\u06FF\s,.;:()\-_/]{200,}/g);
  text = normalizeExtractedText(fallback ?? []);
  return { text, warning: text ? "Used fallback text extraction." : undefined };
}

export function validatePdfFile(file: File, locale: "ar" | "en") {
  const messages = {
    ar: {
      missing: "يرجى رفع ملف PDF.",
      type: "يُسمح برفع ملفات PDF فقط.",
      size: "حجم ملف PDF يجب ألا يتجاوز 10MB.",
    },
    en: {
      missing: "Please upload a PDF file.",
      type: "Only PDF files are supported.",
      size: "PDF size must be 10MB or less.",
    },
  }[locale];

  if (!(file instanceof File)) return messages.missing;
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return messages.type;
  if (file.size > MAX_PDF_SIZE) return messages.size;
  return null;
}
