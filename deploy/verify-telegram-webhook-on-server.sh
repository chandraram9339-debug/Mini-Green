#!/usr/bin/env bash
# Запуск на сервере из корня репо: ~/miniapp
# Проверяет: getWebhookInfo + POST /hooks/telegram (секрет в заголовке, как у Telegram).
# Секрет в вывод НЕ печатается, только длина и HTTP-код.
set -euo pipefail
ROOT="${1:-$HOME/miniapp}"
ENV_FILE="${ROOT}/backend/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Нет $ENV_FILE" >&2
  exit 1
fi
# Берём значение TELEGRAM_WEBHOOK_SECRET (первая строка key=value)
SECRET_LINE=$(grep -E '^[[:space:]]*TELEGRAM_WEBHOOK_SECRET=' "$ENV_FILE" | head -1 || true)
if [[ -z "${SECRET_LINE}" ]]; then
  echo "В $ENV_FILE нет TELEGRAM_WEBHOOK_SECRET=" >&2
  exit 1
fi
WSECRET="${SECRET_LINE#*=}"
WSECRET="${WSECRET%$'\r'}"
WSECRET="${WSECRET#"${WSECRET%%[![:space:]]*}"}"
WSECRET="${WSECRET%"${WSECRET##*[![:space:]]}"}"
BOT_TOKEN=$(grep -E '^[[:space:]]*TELEGRAM_BOT_TOKEN=' "$ENV_FILE" | head -1)
BOT_TOKEN="${BOT_TOKEN#*=}"
BOT_TOKEN="${BOT_TOKEN%$'\r'}"
if [[ -z "$BOT_TOKEN" || "$BOT_TOKEN" == *"your"* ]]; then
  echo "TELEGRAM_BOT_TOKEN в $ENV_FILE пустой или плейсхолдер" >&2
  exit 1
fi
if [[ -z "$WSECRET" ]]; then
  echo "TELEGRAM_WEBHOOK_SECRET пустой" >&2
  exit 1
fi
echo "== getWebhookInfo =="
WH_JSON=$(curl -sS "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo")
echo "$WH_JSON" | {
  if command -v python3 >/dev/null 2>&1; then python3 -m json.tool; else cat; fi
}
HOOK_URL=$(
  echo "$WH_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); u=d.get('result',{}).get('url') or ''; print(u)" 2>/dev/null || true
)
if [[ -z "$HOOK_URL" ]]; then
  echo "В getWebhookInfo пустой url — сначала setWebhook" >&2
  exit 1
fi
echo
echo "== POST $HOOK_URL (ожидаем 200; 401 = секрет в .env не совпадает с setWebhook) =="
CODE=$(
  curl -sS -o /tmp/tg_hook_test.json -w '%{http_code}' -X POST "$HOOK_URL" \
    -H "Content-Type: application/json" \
    -H "X-Telegram-Bot-Api-Secret-Token: ${WSECRET}" \
    -d '{"update_id":0}'
)
echo "http_status=${CODE}"
echo "body:"
cat /tmp/tg_hook_test.json
echo
echo "== длина TELEGRAM_WEBHOOK_SECRET в .env: ${#WSECRET} =="
rm -f /tmp/tg_hook_test.json
