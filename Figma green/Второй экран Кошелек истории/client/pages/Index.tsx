import WalletHeader from "@/components/wallet/WalletHeader";
import StatTabs from "@/components/wallet/StatTabs";
import TransactionItem from "@/components/wallet/TransactionItem";
import BottomNav from "@/components/wallet/BottomNav";
import styles from "./Index.module.css";

const transactions = [
  { amount: "+100.00", commission: "-10.00", date: "31.12.2024 00:00" },
  { amount: "+450.11", commission: "-10.00", date: "31.12.2024 00:00" },
  { amount: "+10.22",  commission: "-10.00", date: "31.12.2024 00:00" },
  { amount: "+70.00",  commission: "-10.00", date: "31.12.2024 00:00" },
  { amount: "+70.00",  commission: "-10.00", date: "31.12.2024 00:00" },
];

export default function Index() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <WalletHeader />

        <div className={styles.body}>
          <StatTabs />

          <div className={styles.transactionList}>
            {transactions.map((tx, i) => (
              <TransactionItem
                key={i}
                title="Replenishment"
                subtitle="Commission"
                address="UQBw8....SGTF"
                amount={tx.amount}
                commission={tx.commission}
                date={tx.date}
              />
            ))}
          </div>
        </div>

        <BottomNav />

        {/* Bottom glow effect */}
        <div className={styles.bottomGlow} />
        <div className={styles.bottomGlowSmall} />
      </div>
    </div>
  );
}
