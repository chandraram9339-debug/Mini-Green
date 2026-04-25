/**
 * Парсинг FAQ в формате Admin → Контент:
 * - секции: строка «# Название» (один #), дальше пары «## Вопрос» + ответ;
 * - без «#» — плоский список «##» / ответ.
 * Совместимо с `backend/src/domain/faqMarkdown.ts` для блоков `##` …
 */

export type FaqQa = { id: string; q: string; a: string };

export type FaqSection = { heading: string; items: FaqQa[] };

function slugId(q: string, n: number) {
  const slug = q
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 48);
  return slug ? `faq_${slug}` : `faq_${n}`;
}

/** Список `##` вопрос / ответ (как `parseFaqMarkdown` в backend). */
function parseFaqItemsFlat(block: string): FaqQa[] {
  const md = block.trim();
  if (!md) return [];
  const parts = md.split(/\n(?=##\s)/);
  const out: FaqQa[] = [];
  let n = 0;
  for (const raw of parts) {
    const chunk = raw.trim();
    if (!chunk) continue;
    const hm = chunk.match(/^##\s+([^\n]+)\n*([\s\S]*)$/);
    if (!hm) continue;
    n += 1;
    const q = hm[1].trim();
    const a = (hm[2] ?? "").trim() || " ";
    out.push({ id: slugId(q, n), q, a });
  }
  return out;
}

export function parseFaqMarkdownSections(markdown: string): FaqSection[] {
  const t = markdown.replace(/\r\n/g, "\n").trim();
  if (!t) return [];

  if (!/^\s*#\s+[^#]/.test(t)) {
    const items = parseFaqItemsFlat(t);
    return items.length ? [{ heading: "FAQ", items }] : [];
  }

  const rawParts = t.split(/\n(?=#\s[^#])/).map((p) => p.trim()).filter(Boolean);
  const out: FaqSection[] = [];
  for (const part of rawParts) {
    if (!part.startsWith("# ")) {
      const items = parseFaqItemsFlat(part);
      if (items.length) out.push({ heading: "FAQ", items });
      continue;
    }
    const nl = part.indexOf("\n");
    const heading = (nl === -1 ? part.slice(2) : part.slice(2, nl)).trim();
    const rest = (nl === -1 ? "" : part.slice(nl + 1)).trim();
    const items = parseFaqItemsFlat(rest);
    if (items.length) out.push({ heading, items });
  }
  return out;
}
