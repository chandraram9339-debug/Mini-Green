import styles from "./TransactionItem.module.css";

interface TransactionItemProps {
  title: string;
  subtitle: string;
  address: string;
  amount: string;
  commission: string;
  date: string;
}

export default function TransactionItem({
  title,
  subtitle,
  address,
  amount,
  commission,
  date,
}: TransactionItemProps) {
  return (
    <div className={styles.item}>
      <div className={styles.iconWrap}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 8H12" stroke="#131413" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className={styles.titles}>
        <span className={styles.title}>{title}</span>
        <span className={styles.subtitle}>{subtitle}</span>
        <span className={styles.address}>{address}</span>
      </div>

      <div className={styles.details}>
        <div className={styles.amountRow}>
          <span className={styles.amount}>{amount}</span>
          <span className={styles.currency}>USDT</span>
        </div>
        <div className={styles.commissionRow}>
          <span className={styles.commission}>{commission}</span>
          <span className={styles.currency}>USDT</span>
        </div>
        <span className={styles.date}>{date}</span>
      </div>
    </div>
  );
}
