#!/usr/bin/env bash
# С сервера: проверить, куда Telegram шлёт апдейты и нет ли last_error.
#   TELEGRAM_BOT_TOKEN=... ./deploy/telegram-check-webhook.sh
set -euo pipefail
: "${TELEGRAM_BOT_TOKEN:?Set TELEGRAM_BOT_TOKEN (from backend .env / pm2)}"
curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo" | {
  if command -v python3 >/dev/null 2>&1; then python3 -m json.tool; else cat; fi
}
