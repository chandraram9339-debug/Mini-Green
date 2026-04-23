# Настройка окружения (.env) — Инструкция

## Расположение файлов

| Файл | Путь (локально) | Путь (на сервере) |
|---|---|---|
| **Backend .env** | `backend/.env` | `/root/miniapp/backend/.env` |
| **Frontend .env** | `frontend/.env` | не используется на сервере (значения вшиты в сборку) |

> ⚠️ Оба файла в `.gitignore` — они **никогда не попадают в git**. После каждого изменения на сервере нужен `pm2 restart miniapp-backend`.

---

## Backend `.env` — что обязательно настроить

### 🔴 1. Режим работы (КРИТИЧНО — без этого пользователи не могут войти)

```env
EXECUTION_MODE=telegram
AUTH_PROVIDER_MODE=telegram
```

> По умолчанию стоит `mock` — это режим разработки. На продакшене **обязательно** переключить на `telegram`.
> Проверить можно в Админке → Интеграции — там будет красный баннер если стоит mock.

---

### 🔴 2. Telegram Bot Token

```env
TELEGRAM_BOT_TOKEN=1234567890:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Как получить:**
1. Открой Telegram → @BotFather
2. Напиши `/newbot` (или `/mybots` если бот уже есть)
3. Следуй инструкциям, получи токен
4. Скопируй строку вида `цифры:буквы`

**Если скомпрометирован:** BotFather → `/mybots` → выбери бота → API Token → Revoke

---

### 🔴 3. Username бота (для реферальных ссылок)

```env
PUBLIC_TELEGRAM_BOT_USERNAME=НазваниеБота
```

> Без @ — просто `PalladiumBot`, не `@PalladiumBot`.
> Берётся из BotFather при создании бота. Используется для генерации ссылок вида `t.me/ИМЯ?start=ref123`.

---

### 🔴 4. JWT Secret (КРИТИЧНО — должен быть случайным)

```env
JWT_SECRET=сюда_вставить_сгенерированную_строку
```

**Как сгенерировать** (выполни на сервере):
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> Если утёк — все текущие сессии пользователей станут недействительными. Нужно будет перезапустить сервер — пользователи перелогинятся автоматически.

---

### 🔴 5. Ключ от Админки

```env
ADMIN_API_KEY=сюда_вставить_сгенерированный_ключ
```

**Как сгенерировать:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> Это пароль от `admin.palladium-ai.store`. Храни в безопасном месте.
> **Если скомпрометирован:** смени значение в `.env` и перезапусти сервер (`pm2 restart miniapp-backend`).

---

### 🔴 6. Приватные ключи кошельков TRON

```env
# Кошелёк для оплаты газа (TRX) — нужен для обработки депозитов
GAZ_BANK_PRIVATE_KEY=64_hex_символа_без_0x

# Кошелёк для выплат USDT пользователям
WITHDRAW_WALLET_PRIVATE_KEY=64_hex_символа_без_0x
```

**Как получить приватный ключ:**
- TronLink → Управление аккаунтом → Экспорт приватного ключа
- Или создать новый кошелёк через TronLink / TronScan

**Формат:** 64 hex-символа, например `a1b2c3d4...` (без `0x` в начале)

> ⚠️ Никому не передавай! Если утёк — немедленно переведи все средства на новый адрес и замени ключ.

---

### 🔴 7. HD Mnemonic (мастер-фраза для депозитных адресов)

```env
HD_WALLET_MNEMONIC=слово1 слово2 слово3 ... слово12
```

**Как сгенерировать** (12 слов BIP39):
```bash
node -e "
const { ethers } = require('/root/miniapp/node_modules/.pnpm/ethers@6.13.5/node_modules/ethers');
const wallet = ethers.Wallet.createRandom();
console.log(wallet.mnemonic.phrase);
"
```

> Или используй любой BIP39 генератор: https://iancoleman.io/bip39/ (выбрать TRON / 12 слов)
> **СДЕЛАЙ ОФЛАЙН БЭКАП!** Из этой фразы генерируются все депозитные адреса всех пользователей. Потеря фразы = потеря доступа к депозитам.

---

### 🔴 8. Пароль к торговой системе

```env
AL_TRADE_FEED_HTTP_PASSWORD=пароль_от_trading-algoritm.site
```

> Это пароль к внешнему торговому API. Берётся у поставщика торговой системы.

---

### ✅ Уже настроено — не трогать без необходимости

```env
TRON_API_KEY=e22ce88a-...        # API ключ TronGrid — работает
TRON_FULL_HOST=https://api.trongrid.io
USDT_TRC20_CONTRACT=TR7NHq...    # Mainnet USDT TRC20
LIVE_TRON=1
LIVE_TRON_SEND=1
JWT_ACCESS_TTL_SEC=31536000      # 365 дней
AL_TRADE_FEED_ENABLED=1
AL_TRADE_FEED_BASE_URL=https://trading-algoritm.site
```

---

## Как применить изменения на сервере

```bash
# Подключиться к серверу
ssh root@185.177.239.111

# Открыть .env в редакторе
nano /root/miniapp/backend/.env

# После изменений — перезапустить бэкенд
pm2 restart miniapp-backend

# Проверить что запустился
pm2 status
```

---

## Как проверить что всё настроено правильно

1. Открой **https://admin.palladium-ai.store**
2. Перейди в раздел **Интеграции**
3. Если всё OK — зелёный статус Telegram + Tron, нет красных баннеров
4. Если `AUTH_PROVIDER_MODE=mock` — будет красный баннер с инструкцией

---

## Frontend `.env` (только для локальной разработки)

Файл: `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:4000     # URL бэкенда локально
VITE_DEV_ALLOW_NO_TELEGRAM=true            # Разрешить открытие вне Telegram
VITE_DEV_BEARER_TOKEN=eyJ...               # JWT токен для тестов (генерируется при старте)
VITE_TELEGRAM_BOT_USERNAME=НазваниеБота   # Fallback для реф-ссылок
```

> На сервере frontend `.env` не нужен — все переменные вшиваются в JS-бандл при сборке (`npm run build`).
> Менять `VITE_TELEGRAM_BOT_USERNAME` не нужно — значение берётся из базы данных через Admin API.
