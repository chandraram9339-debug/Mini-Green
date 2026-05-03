/**
 * Иконки карточек истории сделок — векторы из Figma export
 * `Figma green/Третий экран торговли/client/components/TradeHistory.tsx`
 */
import styles from "./TradeCard.module.css";

/** Бейдж «открытие» — оранжевый круг, глиф chart/box */
export function IconOpeningGlyph() {
  return (
    <svg
      className={styles.svgGlyph16}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M3.40234 13.6668V3"
        stroke="#131413"
        strokeWidth="1.6"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path
        d="M3.40234 3H8.73576L9.36322 4.25492H13.4417V11.157H9.36322L8.73576 9.90207H3.40234"
        stroke="#131413"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Бейдж успеха — галочка */
export function IconPredictionOkGlyph() {
  return (
    <svg
      className={styles.svgGlyph16}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 7.5L7 10.5L13 4.5"
        stroke="#40FF96"
        strokeWidth="1.6"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Бейдж неуспеха — крест */
export function IconPredictionFailGlyph() {
  return (
    <svg
      className={styles.svgGlyph16}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M4.5 4.5L11.5 11.5"
        stroke="#FF0000"
        strokeWidth="1.6"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 11.5L11.5 4.49999"
        stroke="#FF0000"
        strokeWidth="1.6"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Цена вниз (красная диагональ) — как в SuccessfulTradeCard Figma */
export function IconPriceDown24() {
  return (
    <svg
      className={styles.svgGlyph24}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M5.43431 6.56569L4.86863 6L6 4.86863L6.56569 5.43431L6 6L5.43431 6.56569ZM6 6L6.56569 5.43431L18.5657 17.4343L18 18L17.4343 18.5657L5.43431 6.56569L6 6Z"
        fill="#FF0000"
      />
      <path
        d="M9 18H18V9"
        stroke="#FF0000"
        strokeWidth="1.6"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Цена вверх (зелёная диагональ) — как в UnsuccessfulTradeCard Figma */
export function IconPriceUp24() {
  return (
    <svg
      className={styles.svgGlyph24}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M5.43431 17.4343L4.86863 18L6 19.1314L6.56569 18.5657L6 18L5.43431 17.4343ZM6 18L6.56569 18.5657L18.5657 6.56569L18 6L17.4343 5.43431L5.43431 17.4343L6 18Z"
        fill="#40FF96"
      />
      <path
        d="M9 6H18V15"
        stroke="#40FF96"
        strokeWidth="1.6"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Линия тренда прибыли/убытка — одинаковая форма в обеих карточках Figma */
export function IconTrendLine24() {
  return (
    <svg
      className={styles.svgGlyph24}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M3 17L9 11L13 15L21 7"
        stroke="#40FF96"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M21 14V7H14"
        stroke="#40FF96"
        strokeWidth="1.6"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
}
