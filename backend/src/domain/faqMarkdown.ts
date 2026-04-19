/**
 * Parses FAQ stored as Markdown in admin `content_faq_markdown`.
 * Each entry must start with a `## Heading` line; following text is the answer.
 */
export function parseFaqMarkdown(markdown: string): { id: string; q: string; a: string }[] {
  const md = markdown.trim();
  if (!md) return [];
  const sections = md.split(/\n(?=##\s)/);
  const out: { id: string; q: string; a: string }[] = [];
  let n = 0;
  for (const raw of sections) {
    const chunk = raw.trim();
    if (!chunk) continue;
    const hm = chunk.match(/^##\s+([^\n]+)\n*([\s\S]*)$/);
    if (!hm) continue;
    n += 1;
    const q = hm[1].trim();
    const a = (hm[2] ?? "").trim();
    const slug = q
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 48);
    out.push({ id: slug ? `faq_${slug}` : `faq_${n}`, q, a: a || " " });
  }
  return out;
}
