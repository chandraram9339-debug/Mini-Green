import React, { useState } from 'react';
import styles from './ActionsHistory.module.css';

// ─── Types ─────────────────────────────────────────────────

type TabId = 'deposit' | 'withdraw' | 'referral';

interface TabDef {
  id: TabId;
  title: string;
  totalLabel: string;
  totalAmount: string;
  currency: string;
  countLabel: string;
  count: string;
  countUnit: string;
}

interface TransactionItem {
  title: string;
  subtitle: string;
  address: string;
  amount: string;
  commission: string;
  date: string;
}

interface ReferralItem {
  username: string;
  amount: string;
}

// ─── SVG Icons ─────────────────────────────────────────────

const ArrowUpIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 13.3332V13.8332H8.5V13.3332H8H7.5ZM8 13.3332H8.5V2.6665H8H7.5L7.5 13.3332H8Z" fill="#131413" />
    <path d="M4 6.6665L8 2.6665L12 6.6665" stroke="#131413" strokeLinecap="square" strokeLinejoin="round" />
  </svg>
);

const ArrowDownIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 2.66683V2.16683H7.5V2.66683H8H8.5ZM8 2.66683H7.5L7.5 13.3335H8H8.5L8.5 2.66683H8Z" fill="#131413" />
    <path d="M12 9.3335L8 13.3335L4 9.3335" stroke="#131413" strokeLinecap="square" strokeLinejoin="round" />
  </svg>
);

const PlusIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 8L12 8" stroke="#131413" strokeLinecap="square" strokeLinejoin="round" />
    <path d="M8 12L8 4" stroke="#131413" strokeLinecap="square" strokeLinejoin="round" />
  </svg>
);

const MinusIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 8H12" stroke="#131413" strokeLinecap="square" strokeLinejoin="round" />
  </svg>
);

const ReferralLinkIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.99967 10.6663C9.47243 10.6663 10.6663 9.47243 10.6663 7.99967C10.6663 6.52692 9.47243 5.33301 7.99967 5.33301C6.52692 5.33301 5.33301 6.52692 5.33301 7.99967C5.33301 9.47243 6.52692 10.6663 7.99967 10.6663Z"
      stroke="#131413" strokeWidth="1.06667" strokeLinecap="round" strokeLinejoin="round"
    />
    <path
      d="M10.6667 5.99982V7.99982C10.6667 9.47315 11.4133 10.6665 12.3333 10.6665C13.2533 10.6665 14 9.47315 14 7.99982C13.9998 6.69525 13.5743 5.4263 12.7882 4.38522C12.002 3.34415 10.8979 2.58766 9.64323 2.23038C8.38854 1.8731 7.05159 1.93448 5.83491 2.40523C4.61824 2.87599 3.58814 3.73046 2.90068 4.83919C2.21322 5.94793 1.90585 7.25052 2.02514 8.54963C2.14444 9.84873 2.68389 11.0736 3.56177 12.0386C4.43966 13.0036 5.60814 13.6561 6.8902 13.8974C8.17226 14.1387 9.49803 13.9556 10.6667 13.3758"
      stroke="#131413" strokeWidth="1.06667" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

// ─── Static Data ────────────────────────────────────────────

const TABS: TabDef[] = [
  {
    id: 'deposit',
    title: 'Deposit',
    totalLabel: 'Total deposited amount:',
    totalAmount: '725.22',
    currency: 'USDT',
    countLabel: 'Number of deposits made:',
    count: '28',
    countUnit: 'Times',
  },
  {
    id: 'withdraw',
    title: 'Withdraw',
    totalLabel: 'Total withdraw amount',
    totalAmount: '4250.98',
    currency: 'USDT',
    countLabel: 'Number of deposits made:',
    count: '534',
    countUnit: 'Times',
  },
  {
    id: 'referral',
    title: 'Refferal',
    totalLabel: 'Bonuses received from:',
    totalAmount: '25.22',
    currency: 'USDT',
    countLabel: 'Total number of invited users:',
    count: '25',
    countUnit: 'People',
  },
];

const DEPOSIT_ITEMS: TransactionItem[] = [
  { title: 'Replenishment', subtitle: 'Commission', address: 'UQBw8....SGTF', amount: '+100.00', commission: '-10.00', date: '31.12.2024 00:00' },
  { title: 'Replenishment', subtitle: 'Commission', address: 'UQBw8....SGTF', amount: '+450.11', commission: '-10.00', date: '31.12.2024 00:00' },
  { title: 'Replenishment', subtitle: 'Commission', address: 'UQBw8....SGTF', amount: '+10.22', commission: '-10.00', date: '31.12.2024 00:00' },
  { title: 'Replenishment', subtitle: 'Commission', address: 'UQBw8....SGTF', amount: '+70.00', commission: '-10.00', date: '31.12.2024 00:00' },
  { title: 'Replenishment', subtitle: 'Commission', address: 'UQBw8....SGTF', amount: '+70.00', commission: '-10.00', date: '31.12.2024 00:00' },
];

const WITHDRAW_ITEMS: TransactionItem[] = [
  { title: 'Replenishment', subtitle: 'Commission', address: 'UQBw8....SGTF', amount: '+100.00', commission: '-10.00', date: '31.12.2024 00:00' },
  { title: 'Replenishment', subtitle: 'Commission', address: 'UQBw8....SGTF', amount: '+450.11', commission: '-10.00', date: '31.12.2024 00:00' },
  { title: 'Replenishment', subtitle: 'Commission', address: 'UQBw8....SGTF', amount: '+10.22', commission: '-10.00', date: '31.12.2024 00:00' },
  { title: 'Replenishment', subtitle: 'Commission', address: 'UQBw8....SGTF', amount: '+70.00', commission: '-10.00', date: '31.12.2024 00:00' },
  { title: 'Replenishment', subtitle: 'Commission', address: 'UQBw8....SGTF', amount: '+70.00', commission: '-10.00', date: '31.12.2024 00:00' },
];

const REFERRAL_ITEMS: ReferralItem[] = [
  { username: '@Anna_', amount: '+5.22' },
  { username: '@Maksim_254', amount: '+20.22' },
  { username: '@AlexV', amount: '+5.00' },
  { username: '@bingo765', amount: '+700.00' },
  { username: '@Max', amount: '+11.10' },
];

// ─── Component ──────────────────────────────────────────────

const ActionsHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('deposit');

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.heading}>Actions History</h1>

        {/* ── Tabs ── */}
        <div className={styles.tabsScroll}>
          <div className={styles.tabsRow}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`${styles.tab} ${isActive ? styles.tabActive : styles.tabInactive}`}
                  onClick={() => setActiveTab(tab.id)}
                  aria-pressed={isActive}
                >
                  <span
                    className={`${styles.tabName} ${isActive ? styles.tabNameActive : styles.tabNameInactive}`}
                  >
                    {tab.title}
                  </span>

                  <div className={styles.tabTotalSection}>
                    <span className={styles.tabLabel}>{tab.totalLabel}</span>
                    <div className={styles.tabAmountRow}>
                      <span className={styles.tabAmountValue}>{tab.totalAmount}</span>
                      <span className={styles.tabCurrency}>{tab.currency}</span>
                    </div>
                  </div>

                  <div className={styles.tabBottomRow}>
                    <div className={styles.tabCountSection}>
                      <span className={styles.tabLabel}>{tab.countLabel}</span>
                      <div className={styles.tabCountRow}>
                        <span className={styles.tabCountNum}>{tab.count}</span>
                        <span className={styles.tabCountUnit}>{tab.countUnit}</span>
                      </div>
                    </div>
                    <div className={isActive ? styles.tabBtnActive : styles.tabBtnInactive}>
                      {isActive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── List ── */}
        <div className={styles.list}>

          {/* Deposit items */}
          {activeTab === 'deposit' && DEPOSIT_ITEMS.map((item, i) => (
            <div key={i} className={styles.listItem}>
              <div className={styles.itemIconWrap}>
                <div className={`${styles.itemIcon} ${styles.itemIconDeposit}`}>
                  <PlusIcon />
                </div>
              </div>

              <div className={styles.itemTitles}>
                <span className={styles.itemTitle}>{item.title}</span>
                <span className={styles.itemSubtitle}>{item.subtitle}</span>
                <span className={styles.itemAddress}>{item.address}</span>
              </div>

              <div className={styles.itemDetails}>
                <div className={styles.itemAmountRow}>
                  <span className={styles.itemAmountMain}>{item.amount}</span>
                  <span className={styles.itemAmountCurrency}>USDT</span>
                </div>
                <div className={styles.itemAmountRow}>
                  <span className={styles.itemAmountCommission}>{item.commission}</span>
                  <span className={styles.itemAmountCurrency}>USDT</span>
                </div>
                <span className={styles.itemDate}>{item.date}</span>
              </div>
            </div>
          ))}

          {/* Withdraw items */}
          {activeTab === 'withdraw' && WITHDRAW_ITEMS.map((item, i) => (
            <div key={i} className={styles.listItem}>
              <div className={styles.itemIconWrap}>
                <div className={`${styles.itemIcon} ${styles.itemIconWithdraw}`}>
                  <MinusIcon />
                </div>
              </div>

              <div className={styles.itemTitles}>
                <span className={styles.itemTitle}>{item.title}</span>
                <span className={styles.itemSubtitle}>{item.subtitle}</span>
                <span className={styles.itemAddress}>{item.address}</span>
              </div>

              <div className={styles.itemDetails}>
                <div className={styles.itemAmountRow}>
                  <span className={styles.itemAmountMain}>{item.amount}</span>
                  <span className={styles.itemAmountCurrency}>USDT</span>
                </div>
                <div className={styles.itemAmountRow}>
                  <span className={styles.itemAmountCommission}>{item.commission}</span>
                  <span className={styles.itemAmountCurrency}>USDT</span>
                </div>
                <span className={styles.itemDate}>{item.date}</span>
              </div>
            </div>
          ))}

          {/* Referral items */}
          {activeTab === 'referral' && REFERRAL_ITEMS.map((item, i) => (
            <div key={i} className={`${styles.listItem} ${styles.listItemReferral}`}>
              <div className={styles.itemIconWrap}>
                <div className={`${styles.itemIcon} ${styles.itemIconReferral}`}>
                  <ReferralLinkIcon />
                </div>
              </div>
              <span className={styles.referralName}>{item.username}</span>
              <div className={styles.referralAmountRow}>
                <span className={styles.itemAmountMain}>{item.amount}</span>
                <span className={styles.itemAmountCurrency}>USDT</span>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default ActionsHistory;
