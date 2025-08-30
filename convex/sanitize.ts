import sanitizeHtml from "sanitize-html";

export function sanitizeText(input: string, maxLength: number): string {
  const withoutZeroWidth = input.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "");
  const withoutHtml = sanitizeHtml(withoutZeroWidth, {
    allowedTags: [],
    allowedAttributes: {},
  });
  const normalized = withoutHtml.normalize("NFKC");
  const collapsedWhitespace = normalized.replace(/\s+/g, " ").trim();

  if (collapsedWhitespace.length === 0) {
    throw new Error("내용이 비어 있습니다.");
  }
  if (collapsedWhitespace.length > maxLength) {
    throw new Error(`최대 ${maxLength}자를 넘을 수 없습니다.`);
  }
  return collapsedWhitespace;
}
