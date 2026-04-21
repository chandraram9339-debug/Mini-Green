# Production Setup

Этот проект нужно запускать на сервере так:

- `backend` работает как Node.js сервис через `pm2`
- `frontend` собирается в статику `frontend/dist`
- `nginx` отдаёт `frontend/dist`
- API-запросы miniapp nginx проксирует на `127.0.0.1:4000`
- реальные секреты лежат только в `backend/.env` на сервере

## Local vs Server

Нормальный режим работы такой:

- локально в Cursor вы редактируете `frontend` и `backend`
- локально мини-апп запускается в dev-режиме
- production-сервер живёт отдельно и использует свои `env`
- после локальных изменений вы делаете `git push`
- на сервере выполняется обновление и перезапуск production

Локальная разработка:

```bash
pnpm install
pnpm dev
```

Production-сервер:

- `backend/.env` — серверный
- `frontend/.env.production` — серверный
- `pm2` — только для backend
- `nginx` — только для отдачи статики и proxy к API

## 1. Что НЕ нужно делать

Не нужно держать `frontend` на `npm run dev` в production.

`vite dev server` нужен только для локальной разработки. В production должен использоваться только:

- `npm run build`
- статика из `frontend/dist`
- `nginx`

## 2. Какие файлы должны быть на сервере

### Backend secrets

На сервере должен существовать файл:

- `~/miniapp/backend/.env`

Его не коммитят в git.

Основа значений берётся из:

- `backend/.env.example`

Минимально критичные переменные:

- `PORT=4000`
- `JWT_SECRET=...`
- `ADMIN_API_KEY=...`
- `TELEGRAM_BOT_TOKEN=...` если используете реальный Telegram auth
- `TRON_API_KEY=...` если нужен live Tron
- `WITHDRAW_WALLET_PRIVATE_KEY=...` если нужен live withdraw
- `GAZ_BANK_PRIVATE_KEY=...` если нужен live gas send
- `DB_PATH=...` абсолютный путь к SQLite-файлу на сервере

### Frontend production env

Для production-сборки miniapp нужен файл:

- `~/miniapp/frontend/.env.production`
- стартовый шаблон: `frontend/.env.production.example`

Пример:

```env
VITE_API_BASE_URL=https://example.com
VITE_CHANNEL_URL=https://t.me/your_channel
VITE_CHAT_URL=https://t.me/your_chat
VITE_YOUTUBE_URL=https://youtube.com/@your_channel
VITE_SUPPORT_URL=https://t.me/your_support
VITE_REFERRAL_URL=https://t.me/your_bot
```

Важно: для этого проекта `VITE_API_BASE_URL` лучше оставить не пустым, иначе часть miniapp уйдёт в mock-режим.

## 3. PM2

Если `npm install -g pm2` на локальной машине падает с `EACCES`, это нормально: локально он не нужен.

Ставить и запускать `pm2` нужно на VPS:

```bash
ssh root@YOUR_SERVER_IP
cd ~/miniapp
npm install -g pm2
```

Или без глобальной установки:

```bash
cd ~/miniapp
npx pm2 start deploy/ecosystem.config.cjs
```

Запуск backend:

```bash
cd ~/miniapp
pnpm install
pnpm --filter miniapp-backend build
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 status
pm2 logs miniapp-backend --lines 100
```

## 4. Nginx

Готовый шаблон:

- `deploy/nginx-miniapp-same-origin.conf.example`
- генератор конфига под домен: `deploy/render-nginx-conf.sh`

На сервере можно либо копировать шаблон вручную, либо сгенерировать конфиг одной командой:

```bash
chmod +x ~/miniapp/deploy/render-nginx-conf.sh
~/miniapp/deploy/render-nginx-conf.sh miniapp.example.com > /etc/nginx/sites-available/miniapp
```

Если имя сертификата отличается от домена, передайте его вторым аргументом:

```bash
~/miniapp/deploy/render-nginx-conf.sh miniapp.example.com cert-name.example.com > /etc/nginx/sites-available/miniapp
```

Потом включить сайт:

```bash
ln -sf /etc/nginx/sites-available/miniapp /etc/nginx/sites-enabled/miniapp
nginx -t
systemctl restart nginx
systemctl status nginx --no-pager
```

Если раньше был конфиг с proxy на `5173/5174`, его нужно убрать, иначе снова будет конфликт dev/prod.

## 5. Правильный production deploy

Каждый новый релиз делается так:

```bash
ssh root@YOUR_SERVER_IP
cd ~/miniapp
git pull
pnpm install
pnpm --filter miniapp-backend build
pnpm --filter miniapp-frontend build
pm2 restart miniapp-backend
nginx -t && systemctl reload nginx
```

Или одной командой через скрипт:

```bash
chmod +x ~/miniapp/deploy/update-server.sh
~/miniapp/deploy/update-server.sh
```

## 6. Быстрая проверка

Проверить backend:

```bash
curl http://127.0.0.1:4000/health
```

Проверить фронт через nginx:

```bash
curl -I https://example.com
curl -I https://example.com/assets/
```

Проверить, что nginx больше не смотрит на vite:

```bash
grep -R "5173\\|5174" /etc/nginx/sites-enabled /etc/nginx/sites-available
```

Команда выше не должна показывать активный proxy на vite dev server.

## 7. Server preflight

Перед финальным запуском удобно прогнать автоматическую проверку:

```bash
chmod +x ~/miniapp/deploy/server-preflight.sh
~/miniapp/deploy/server-preflight.sh
```

Скрипт проверяет:

- наличие `backend/.env`
- наличие `frontend/.env.production`
- собранные `backend/dist` и `frontend/dist`
- ключевые env-переменные
- список сертификатов Let's Encrypt
- статус `pm2`
- `curl http://127.0.0.1:4000/health`
- остались ли в `nginx` ссылки на `5173/5174`

## 8. Что у тебя сломано сейчас

По текущим симптомам backend жив, `frontend/dist` уже собран, но `nginx` всё ещё смотрит на старый dev flow.

То есть исправление такое:

1. убрать proxy на `5173/5174`
2. отдавать `frontend/dist` как статику
3. проксировать только API на `127.0.0.1:4000`
4. backend держать через `pm2`

После этого Telegram Mini App должен открываться нормально.
