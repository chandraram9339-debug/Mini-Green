import styles from "./StatTabs.module.css";

interface StatTabProps {
  title: string;
  totalLabel: string;
  totalAmount: string;
  countLabel: string;
  count: string;
  countUnit: string;
  active?: boolean;
  arrowUp?: boolean;
}

function StatTab({ title, totalLabel, totalAmount, countLabel, count, countUnit, active, arrowUp }: StatTabProps) {
  return (
    <div className={`${styles.tab} ${active ? styles.tabActive : styles.tabInactive}`}>
      <p className={styles.tabTitle}>{title}</p>

      <div className={styles.totalSection}>
        <span className={styles.totalLabel}>{totalLabel}</span>
        <div className={styles.amountRow}>
          <span className={styles.amount}>{totalAmount}</span>
          <span className={styles.currency}>USDT</span>
        </div>
      </div>

      <div className={styles.countSection}>
        <span className={styles.countLabel}>{countLabel}</span>
        <div className={styles.countRow}>
          <span className={styles.count}>{count}</span>
          <span className={styles.countUnit}>{countUnit}</span>
        </div>
      </div>

      <div className={`${styles.arrowBtn} ${arrowUp ? styles.arrowBtnActive : styles.arrowBtnInactive}`}>
        {arrowUp ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M7.5 13.3337V13.8337H8.5V13.3337H8H7.5ZM8 13.3337H8.5V2.66699H8H7.5L7.5 13.3337H8Z" fill="#131413"/>
            <path d="M4 6.66699L8 2.66699L12 6.66699" stroke="#131413" strokeLinecap="square" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8.5 2.66634V2.16634H7.5V2.66634H8H8.5ZM8 2.66634H7.5L7.5 13.333H8H8.5L8.5 2.66634H8Z" fill="#131413"/>
            <path d="M12 9.33301L8 13.333L4 9.33301" stroke="#131413" strokeLinecap="square" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </div>
  );
}

export default function StatTabs() {
  return (
    <div className={styles.tabsRow}>
      <StatTab
        title="Deposit"
        totalLabel="Total deposited amount:"
        totalAmount="725.22"
        countLabel="Number of deposits made:"
        count="28"
        countUnit="Times"
        active={false}
        arrowUp={false}
      />
      <StatTab
        title="Withdraw"
        totalLabel="Total withdraw amount"
        totalAmount="4250.98"
        countLabel="Number of deposits made:"
        count="534"
        countUnit="Times"
        active={true}
        arrowUp={true}
      />
      <StatTab
        title="Referral"
        totalLabel="Bonuses received from:"
        totalAmount="25.22"
        countLabel="Total number of invited users:"
        count="25"
        countUnit="People"
        active={false}
        arrowUp={false}
      />
    </div>
  );
}
