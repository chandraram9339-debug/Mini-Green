# Figma Ready — референсы экранов (PNG @2x)

Сюда попадают **стабильные PNG 2×** из Figma REST API (`GET /v1/images/{file_key}`), чтобы сверять вёрстку **по файлам в репозитории**, а не «на глаз».

## Как обновить картинки

Из каталога `frontend/`:

```bash
export FIGMA_TOKEN="figd_..."   # Personal access token в настройках Figma
npm run figma:export
```

Скрипт: `frontend/scripts/figma-export-frames.mjs`.

Переменные / деревья Ready+UI Kit (JSON + `figma-tokens.css` из API): `npm run figma:design-system` — см. `frontend/src/design-system/README.md`.  
Переменные окружения (опционально): `FIGMA_FILE_KEY`, `FIGMA_FORMAT`, `FIGMA_SCALE`, `FIGMA_OUT_DIR` (по умолчанию вывод — **этот каталог**).

## Канонические ссылки Figma (вместе с PNG — единственная база для сверки)

- **Ready (секция экранов):**  
  https://www.figma.com/design/BBrbpnfGElX0afHLm7ccxP/figma-ui-ux--Copy-?node-id=1-3643&m=dev  
- **UI Kit:**  
  https://www.figma.com/design/BBrbpnfGElX0afHLm7ccxP/figma-ui-ux--Copy-?node-id=1-3075&m=dev  

Детальный фрейм Home при необходимости: `node-id=1-3644` (внутри Ready).

## Имена файлов

Базовые имена задаются в `DEFAULT_FRAMES` скрипта (например `home.png`, `balance-deposit.png`, …).

## Правило для агентов / разработки

Вёрстка и сравнение с макетом — **по PNG в этом каталогу + двум каноническим ссылкам выше**.  
Если нужного кадра нет, токена нет, или неясно какой фрейм эталон — **не угадывать**, пометить **`[NEED_INPUT]`** и запросить экспорт / node-id / скрин.
