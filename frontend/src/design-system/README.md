# Design system (Figma → репозиторий)

Офлайн-снимок токенов и переменных (без запуска npm) лежит в корне репозитория: **`figma-miniapp-design-system/`** (`import-for-miniapp.css`, фрагменты по нодам Ready/UI Kit). Обновление из локальной выгрузки vsix: `scripts/sync-figma-vsix-artifacts.sh`.

Источники правды — **два канонических фрейма в одном файле** Figma:

| Фрейм   | URL |
|--------|-----|
| Ready  | https://www.figma.com/design/BBrbpnfGElX0afHLm7ccxP/figma-ui-ux--Copy-?node-id=1-3643&m=dev |
| UI Kit | https://www.figma.com/design/BBrbpnfGElX0afHLm7ccxP/figma-ui-ux--Copy-?node-id=1-3075&m=dev |

`fileKey`: `BBrbpnfGElX0afHLm7ccxP` (см. `figma-sources.json`).

## Что лежит в `generated/`

После команды ниже появляются **только данные из API** (без ручных hex в репо):

- `figma-nodes.raw.json` — ответ `GET /v1/files/{file_key}/nodes?ids=1:3643,1:3075` (деревья Ready + UI Kit).
- `figma-variables.raw.json` — ответ `GET /v1/files/{file_key}/variables/local`, если эндпоинт доступен для вашего плана Figma.
- `figma-tokens.css` — `:root { … }` из **разрешённых** переменных (цвета, строки; float с учётом `scopes` из Figma — см. скрипт).

Пока скрипт не запускали, в репозитории остаётся заглушка `figma-tokens.css` с пометкой **`[NEED_INPUT]`** — значения из головы не подставляются.

## Команда

Из каталога `frontend/`:

```bash
export FIGMA_TOKEN="figd_..."
npm run figma:design-system
```

PNG-референсы экранов по-прежнему: `npm run figma:export` → `docs/figma-ready/` (см. корневой `docs/figma-ready/README.md`).

## React-компоненты

Автогенерации React из этих фреймов здесь нет: в репо сохраняются **JSON деревьев + CSS variables из Variables API**. Вёрстка приложения синхронизируется с макетом вручную / по PNG, опираясь на эти артефакты.
