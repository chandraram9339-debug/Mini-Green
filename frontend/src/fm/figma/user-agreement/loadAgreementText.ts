/** ТЗ экран 11 — текст из админки: при наличии URL подгружаем по сети. */
export async function loadAgreementTextFromUrl(url: string): Promise<string> {
  const res = await fetch(url, { credentials: "omit" });
  if (!res.ok) throw new Error(String(res.status));
  return res.text();
}
