export type LegalKnowledgeSnippet = {
  id: string;
  title: string;
  content: string;
  source?: string;
};

/**
 * Retrieval hook for future legal knowledge integrations.
 * Currently returns an empty result until a retrieval source is connected.
 */
export async function retrieveRelevantLegalKnowledge(_input: {
  message: string;
  category: string;
  locale: "ar" | "en";
}): Promise<LegalKnowledgeSnippet[]> {
  return [];
}

export function formatKnowledgeContext(snippets: LegalKnowledgeSnippet[]): string {
  if (!snippets.length) return "No external legal knowledge snippets were retrieved.";

  return snippets
    .map((snippet, index) => {
      const source = snippet.source ? ` (source: ${snippet.source})` : "";
      return `${index + 1}. ${snippet.title}${source}\n${snippet.content}`;
    })
    .join("\n\n");
}
