# Полный деплой: Mini App + backend + admin-panel (один сервер, текущий домен)

Цель: выкатить **frontend**, **backend** и **admin-panel** без простоя лишней поломки. Админка остаётся **отдельным** SPA на **`admin.domain.com`**, миниапп — на **основном домене**, API — один процесс на **`127.0.0.1:4000`**.

## Архитектура (кратко)

| Компонент | Где в проде |
|-----------|----------------|
| Mini App (React) | Статика → например `/var/www/miniapp-frontend`, nginx `server_name` = основной домен |
| Backend | `pm2` → `miniapp-backend`, порт **4000** |
| Admin panel | Статика → `/var/www/miniapp-admin`, nginx `server_name` = **поддомен** admin |
| Admin API | Запросы с браузера на тот же хост что и админка: **`/admin/*`** → прокси на **4000**, ключ **`X-Admin-Key`** (из `ADMIN_API_KEY` в `backend/.env`, не в git) |

**Не смешивать:** каталоги `/var/www/miniapp-frontend` и `/var/www/miniapp-admin` разные; у основного сайта и у admin — **разные** `server { ... }` (разные `server_name`).

---

## Перед первым выкатом (один раз)

### 1. Клон и ветка на сервере

```bash
cd ~
git clone https://github.com/YOUR_ORG/Mini-Green.git miniapp
cd miniapp
git checkout main   # или ваша prod-ветка
```

`PROJECT_ROOT` дальше = путь к репо на сервере (часто `~/miniapp`).

### 2. Директории под статику

```bash
sudo mkdir -p /var/www/miniapp-frontend /var/www/miniapp-admin
sudo chown -R "$USER":"$USER" /var/www/miniapp-frontend /var/www/miniapp-admin
```

### 3. Секреты backend (файл не в git)

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Минимум для прода (имена см. `backend/.env.example` и `ENV_SETUP.md`):

- `PORT=4000`
- `JWT_SECRET=` — свой случайный, не из примера
- `ADMIN_API_KEY=` — свой случайный (`openssl rand -hex 32`)
- `CORS_ORIGINS=` — через запятую: **`https://ваш-основной-домен`**, при необходимости **`https://web.telegram.org`**
- БД, Telegram, Tron и т.д. по вашей схеме

### 4. Frontend production env

```bash
cp frontend/.env.production.example frontend/.env.production
nano frontend/.env.production
```

`VITE_API_BASE_URL` должен указывать на **публичный URL API** (часто тот же домен, что и миниапп, если nginx проксирует `/api` или общий origin — как у вас настроено в nginx).

### 5. Nginx: два server-блока

1. **Основной домен** (миниапп): `root` → `/var/www/miniapp-frontend`; прокси на `:4000` для API-путей (как в вашем текущем конфиге — часто не только `/admin`, см. `deploy/nginx-miniapp-same-origin.conf.example`).
2. **admin.domain.com**: `root` → `/var/www/miniapp-admin`; прокси **`/admin`** и **`/health`** на `http://127.0.0.1:4000` — шаблон: **`deploy/nginx-admin-domain.conf.example`**.

После правок:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 6. TLS

```bash
sudo certbot --nginx -d your-main-domain.com -d admin.your-main-domain.com
```

### 7. PM2 (первый старт)

```bash
cd ~/miniapp
pnpm install
pnpm --filter miniapp-backend build
pm2 start deploy/ecosystem.config.cjs
pm2 save
```

Проверка:

```bash
curl -sS http://127.0.0.1:4000/health
```

---

## Обновление без поломки текущего продакшена

Скрипт **`deploy/update-server.sh`** по умолчанию публикует фронт в **`/var/www/palladium-miniapp`**. У вас каталог **`/var/www/miniapp-frontend`** — задайте переменные окружения:

```bash
cd ~/miniapp
export PROJECT_ROOT="$HOME/miniapp"
export FRONTEND_PUBLISH_DIR=/var/www/miniapp-frontend
export ADMIN_PUBLISH_DIR=/var/www/miniapp-admin
./deploy/update-server.sh
```

Что делает скрипт: `git pull`, сборка backend + frontend + admin-panel, `rsync` в указанные каталоги, **`pm2 restart miniapp-backend`**, проверка `nginx`, **`reload nginx`**.

### Перед `git pull` (страховка)

```bash
cd ~/miniapp
git status
git stash push -m "pre-deploy $(date +%F)"   # если есть локальные правки
```

Бэкап статики (опционально):

```bash
sudo tar -czf ~/backup-miniapp-static-$(date +%Y%m%d).tar.gz \
  /var/www/miniapp-frontend /var/www/miniapp-admin
```

### После деплоя — проверки

```bash
curl -fsS https://ВАШ-ОСНОВНОЙ-ДОМЕН/health
curl -fsS https://admin.ВАШ-ДОМЕН/health
curl -fsS -H "X-Admin-Key: $ADMIN_API_KEY" https://admin.ВАШ-ДОМЕН/admin/health
```

В Telegram Mini App — открыть миниапп, один счётчик запросов к API.

Админка: открыть `https://admin...`, ввести ключ из **`ADMIN_API_KEY`**.

### Если что-то пошло не так

1. Логи бэкенда: `pm2 logs miniapp-backend --lines 100`
2. Откат кода: `git checkout PREVIOUS_COMMIT && ./deploy/update-server.sh` (с теми же `FRONTEND_PUBLISH_DIR` / `ADMIN_PUBLISH_DIR`)
3. Откат статики: распаковать `backup-miniapp-static-*.tar.gz` в `/var/www/...`

---

## Чеклист «ничего не сломать»

- [ ] Не менять **`ADMIN_API_KEY`** без синхронизации с теми, кто заходит в админку.
- [ ] После смены домена обновить **`CORS_ORIGINS`** и **`frontend/.env.production`** (если меняется URL API).
- [ ] Основной nginx не должен отдавать админский `index.html` с того же `root`, что и миниапп — **разные vhost’ы**.
- [ ] Не класть **`ADMIN_API_KEY`** в репозиторий и не дублировать в nginx.

---

## Ссылки в репозитории

- Детали окружения и PM2: **`deploy/PRODUCTION_SERVER_SETUP.md`**
- Только админка: **`deploy/ADMIN_PANEL_PRODUCTION.md`**
- Пример nginx админ-поддомена: **`deploy/nginx-admin-domain.conf.example`**
- Пример nginx основного домена (прокси API): **`deploy/nginx-miniapp-same-origin.conf.example`** (подставьте свой `root`, например `/var/www/miniapp-frontend`)
