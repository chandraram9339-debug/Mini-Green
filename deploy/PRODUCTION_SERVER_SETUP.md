
# Production Setup

Сводный сценарий «основной домен + admin поддомен + backend» без поломки текущего прода: **[`deploy/FULL_STACK_PRODUCTION.md`](FULL_STACK_PRODUCTION.md)**.

Этот проект нужно запускать на сервере так:

- `backend` работает как Node.js сервис через `pm2`
- `frontend` собирается в статику `frontend/dist`, публикуется в `/var/www/palladium-miniapp`
- `admin-panel` собирается в статику `admin-panel/dist`, публикуется в `/var/www/miniapp-admin`
- `nginx` отдаёт оба фронта и проксирует `/admin`, `/health` на `127.0.0.1:4000`
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

**Комиссии USDT TRC20 и текст FAQ:** описание политики по умолчанию в корне репозитория — [`FAQ.md`](../FAQ.md) (вверху файла и раздел *Money and fees*); русская копия — [`FAQ.ru.md`](../FAQ.ru.md). Числа в проде задаются через `app_config` / админку **Комиссии и лимиты** (см. также `ENV_SETUP.md` § *Комиссии*). Если в админке переопределён markdown FAQ (**Контент**), встроенный текст из репо может не совпадать — сверяйте с `FAQ.md` после деплоя.

## 1. Что НЕ нужно делать

Не нужно держать `frontend` на `npm run dev` в production.

`vite dev server` нужен только для локальной разработки. В production должен использоваться только:

- `npm run build`
- статика из `/var/www/palladium-miniapp` (после публикации из `frontend/dist`)
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
- `JWT_SECRET=...` — **обязательно** сгенерировать случайную строку (см. `ENV_SETUP.md`); значение из `backend/.env.example` (`dev-only-insecure-jwt-do-not-use-in-prod`) на production **нельзя** использовать.
- `CORS_ORIGINS=...` — через запятую разрешённые `Origin` для браузера (HTTPS-домен миниаппа, при необходимости `https://web.telegram.org`). Пустое значение в `AUTH_PROVIDER_MODE=telegram` оставляет открытый CORS и пишет предупреждение в лог при старте — для публичного прод лучше задать whitelist явно.
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
rsync -a --delete ~/miniapp/frontend/dist/ /var/www/palladium-miniapp/
pm2 restart miniapp-backend
nginx -t && systemctl reload nginx
```

Или одной командой через скрипт:

```bash
chmod +x ~/miniapp/deploy/update-server.sh
~/miniapp/deploy/update-server.sh
```

## 6. «Задеплоил, а в Mini App ничего не поменялось»

Команды в терминале вводи **по одной строке** (или с `&&` между короткими командами). Если склеить `systemctl reload nginx` и `cd ~/miniapp` в одну строку без пробела, получится бессмысленное имя сервиса и **nginx не перезагрузится**.

1. Убедись, что на сервере реально новый коммит: `cd ~/miniapp && git rev-parse HEAD` и сравни с GitHub.
2. Пересобери фронт и перезагрузи nginx: `bash deploy/update-server.sh` (теперь по умолчанию он публикует фронт в `/var/www/palladium-miniapp`).
3. Проверь, что `root` в nginx указывает на тот же каталог, куда публикуется сборка: `grep root /etc/nginx/sites-enabled/*`. Для текущей production-схемы это должен быть `/var/www/palladium-miniapp`. Если пути разошлись, пользователи будут видеть старую версию.
4. **Кэш WebView:** в шаблоне nginx для этого проекта у `index.html` выставлены заголовки без кэша. Если конфиг на сервере старый — добавь блок `location = /index.html` из `deploy/nginx-miniapp-same-origin.conf.example`, затем `nginx -t && systemctl reload nginx`.
5. Полностью закрой мини-апп в Telegram и открой снова (иногда кэш держится до перезапуска клиента).

## 7. Быстрая проверка

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

## 8. Server preflight

Перед финальным запуском удобно прогнать автоматическую проверку:

```bash
chmod +x ~/miniapp/deploy/server-preflight.sh
~/miniapp/deploy/server-preflight.sh
```

Скрипт проверяет:

- наличие `backend/.env`
- наличие `frontend/.env.production`
- собранные `backend/dist`, `frontend/dist` и `admin-panel/dist`
- публикацию фронта в `/var/www/palladium-miniapp`
- публикацию админки в `/var/www/miniapp-admin`
- ключевые env-переменные
- список сертификатов Let's Encrypt
- статус `pm2`
- наличие nginx-сайта для admin
- `curl http://127.0.0.1:4000/health`
- остались ли в `nginx` ссылки на `5173/5174/5180`

## 9. Что у тебя сломано сейчас

По текущей рабочей схеме backend живёт в `~/miniapp`, а nginx должен смотреть на `/var/www/palladium-miniapp`.

То есть исправление такое:

1. убрать proxy на `5173/5174`
2. публиковать `frontend/dist` в `/var/www/palladium-miniapp`
3. проксировать только API на `127.0.0.1:4000`
4. backend держать через `pm2`

После этого Telegram Mini App должен открываться нормально.

## 10. Деплой Admin Panel

Админ-панель — отдельный React/Vite SPA на субдомене `admin.ваш-домен.com`.

Полный чеклист (каталоги, nginx, PM2, curl): **[`deploy/ADMIN_PANEL_PRODUCTION.md`](ADMIN_PANEL_PRODUCTION.md)**. Готовый пример vhost: [`deploy/nginx-admin-domain.conf.example`](nginx-admin-domain.conf.example).

### Первый деплой

**1. Сертификат для субдомена:**

```bash
certbot --nginx -d admin.example.com
```

**2. Nginx-конфиг (генератор):**

```bash
chmod +x ~/miniapp/deploy/render-nginx-admin-conf.sh
~/miniapp/deploy/render-nginx-admin-conf.sh admin.example.com > /etc/nginx/sites-available/miniapp-admin
ln -sf /etc/nginx/sites-available/miniapp-admin /etc/nginx/sites-enabled/miniapp-admin
nginx -t
systemctl reload nginx
```

Если имя сертификата отличается от домена:

```bash
~/miniapp/deploy/render-nginx-admin-conf.sh admin.example.com cert-name.example.com > /etc/nginx/sites-available/miniapp-admin
```

**3. Собрать и опубликовать:**

```bash
cd ~/miniapp
pnpm --filter admin-panel build
mkdir -p /var/www/miniapp-admin
rsync -a --delete ~/miniapp/admin-panel/dist/ /var/www/miniapp-admin/
```

Или одной командой через `update-server.sh` (собирает всё и публикует):

```bash
~/miniapp/deploy/update-server.sh
```

### Последующие обновления

Обновление Admin Panel происходит автоматически вместе с `update-server.sh` — скрипт собирает workspace `admin-panel` и синхронизирует в `/var/www/miniapp-admin`.

### VITE_API_BASE (если нужно)

По умолчанию `admin-panel` делает запросы на тот же домен, что и сама страница (`admin.example.com/admin/...`). Это работает без `.env.production`.

Если API на другом домене — создайте файл перед сборкой:

```bash
echo "VITE_API_BASE=https://api.example.com" > ~/miniapp/admin-panel/.env.production
```

### Проверка

```bash
curl -I https://admin.example.com
curl -fsS https://admin.example.com/health
```
