/**
 * Копирование в буфер: в Telegram WebView / iOS `navigator.clipboard` часто падает
 * или требует права, а синхронный `execCommand('copy')` из жеста пользователя обычно срабатывает.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.readOnly = true;
    ta.setAttribute("aria-hidden", "true");
    ta.style.cssText =
      "position:fixed;top:0;left:0;width:1px;height:1px;margin:0;padding:0;border:none;outline:none;opacity:0;pointer-events:none;box-shadow:none;background:transparent;";
    document.body.appendChild(ta);
    ta.focus({ preventScroll: true });
    ta.select();
    ta.setSelectionRange(0, text.length);
    const legacyOk = document.execCommand("copy");
    ta.remove();
    if (legacyOk) return true;
  } catch {
    /* try Clipboard API */
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* noop */
  }
  return false;
}
