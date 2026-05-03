# Admin panel — production на том же сервере

Полный порядок деплоя вместе с миниаппом и backend: **[`deploy/FULL_STACK_PRODUCTION.md`](FULL_STACK_PRODUCTION.md)**.

Админка — **отдельный** статический UI (субдомен), **отдельный** root на диске от миниаппа. API остаётся на бэкенде `127.0.0.1:4000`; `ADMIN_API_KEY` задаётся **только** в `backend/.env` на сервере, в nginx и в репозиторий не кладётся.

## 1. Каталоги на сервере

| Назначение        | Каталог                    |
|-------------------|----------------------------|
| Миниапп (статика) | `/var/www/miniapp-frontend` |
| Админ-панель      | `/var/www/miniapp-admin`   |

Создание (один раз):

```bash
sudo mkdir -p /var/www/miniapp-frontend /var/www/miniapp-admin
sudo chown -R "$USER":"$USER" /var/www/miniapp-frontend /var/www/miniapp-admin
```

*(Владелец подстройте под пользователя деплоя / www-data по вашей политике.)*

## 2. Сборка admin-panel

На машине с репозиторием (CI или сервер):

```bash
cd /path/to/miniapp
pnpm install
pnpm --filter admin-panel build
```

Артефакт: **`admin-panel/dist/`** (внутри — `index.html`, `assets/…`).

Для деплоя на субдомен **без** подпути используйте сборку с базой по умолчанию (`/`). Отдельный `VITE_ADMIN_BASE` нужен только если UI висит по пути вида `/admin-ui/` (см. `admin-panel/.env.example`).

## 3. Публикация статики админки

```bash
sudo rsync -a --delete ./admin-panel/dist/ /var/www/miniapp-admin/
```

Проверка:

```bash
ls -la /var/www/miniapp-admin/index.html
ls -la /var/www/miniapp-admin/assets/
```

## 4. Backend и переменные

- Бэкенд слушает **`127.0.0.1:4000`** (см. `PORT` в `backend/.env`; по умолчанию в `deploy/ecosystem.config.cjs` задано `4000`).
- В **`backend/.env`** на сервере обязательно:

```env
PORT=4000
ADMIN_API_KEY=<случайная_длинная_строка>
```

Сгенерировать ключ (пример):

```bash
openssl rand -hex 32
```

## 5. PM2

Сборка и запуск (из корня репозитория на сервере):

```bash
pnpm --filter miniapp-backend build
pm2 start deploy/ecosystem.config.cjs
pm2 save
```

Проверка процесса:

```bash
pm2 status
pm2 logs miniapp-backend --lines 50
```

Локально бэкенд должен отвечать:

```bash
curl -sS http://127.0.0.1:4000/health
```

## 6. Nginx (admin.domain.com)

Готовый шаблон: **`deploy/nginx-admin-domain.conf.example`**.

Сгенерировать конфиг с подстановкой домена (альтернатива ручному копированию):

```bash
./deploy/render-nginx-admin-conf.sh admin.domain.com admin.domain.com | sudo tee /etc/nginx/sites-available/miniapp-admin
sudo ln -sf /etc/nginx/sites-available/miniapp-admin /etc/nginx/sites-enabled/miniapp-admin
sudo nginx -t && sudo systemctl reload nginx
```

Вручную: скопируйте `deploy/nginx-admin-domain.conf.example`, замените `admin.domain.com` на ваш хост, поправьте пути к TLS, убедитесь что **`root`** указывает на **`/var/www/miniapp-admin`** (не на frontend).

Суть блоков:

- **`root /var/www/miniapp-admin`** — только админка.
- **`location /admin`** и **`location /health`** — прокси на **`http://127.0.0.1:4000`**.
- **`location /`** — SPA fallback (`try_files`), плюс отдельно **`/assets/`** для кеширования бандлов.

Сертификат (пример):

```bash
sudo certbot --nginx -d admin.domain.com
```

## 7. Перезапуск после изменений

| Что изменили | Команды |
|--------------|---------|
| Только статика админки | `rsync … /var/www/miniapp-admin/` (nginx перезапуск не обязателен) |
| Конфиг nginx | `sudo nginx -t && sudo systemctl reload nginx` |
| Код / env бэкенда | `pnpm --filter miniapp-backend build` затем `pm2 restart miniapp-backend` |

```bash
sudo nginx -t && sudo systemctl reload nginx
pm2 restart miniapp-backend
```

## 8. Проверка после деплоя

1. Откройте **`https://admin.domain.com`** — должна загрузиться страница входа админки.
2. Введите в форме **тот же** ключ, что **`ADMIN_API_KEY`** на сервере (хранится в sessionStorage в браузере, не в git).

Публичный health бэкенда:

```bash
curl -fsS https://admin.domain.com/health
```

Админ-эндпоинты (**нужен заголовок** `X-Admin-Key`):

```bash
export ADMIN_API_KEY='ваш_ключ_из_backend_.env'

curl -fsS -H "X-Admin-Key: $ADMIN_API_KEY" https://admin.domain.com/admin/health
curl -fsS -H "X-Admin-Key: $ADMIN_API_KEY" https://admin.domain.com/admin/stats
curl -fsS -H "X-Admin-Key: $ADMIN_API_KEY" "https://admin.domain.com/admin/deposits?limit=5&offset=0"
```

Ожидание: JSON без ошибки **401** / **503**. **503** по админ-роутам часто значит, что **`ADMIN_API_KEY`** не задан в окружении процесса pm2.

## 9. Чего не делать

- Не класть **`ADMIN_API_KEY`** в env фронта, nginx или репозиторий.
- Не использовать **один и тот же** `root` в nginx для миниаппа и админки.
- Не смешивать бандл админки с каталогом **`frontend/dist`**.
