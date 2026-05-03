import styles from "./Home.module.css";

export default function Index() {
  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        {/* ===== HEADER (Green section) ===== */}
        <header className={styles.header}>
          <div className={styles.headerBlurLeft} aria-hidden="true" />
          <div className={styles.headerBlurRight} aria-hidden="true" />

          {/* Status Bar */}
          <div className={styles.statusBar}>
            <div className={styles.statusTime}>9:41</div>
            <div className={styles.statusIcons}>
              {/* Network Signal */}
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 4H13C13.5523 4 14 4.44772 14 5V11C14 11.5523 13.5523 12 13 12H12C11.4477 12 11 11.5523 11 11V5C11 4.44772 11.4477 4 12 4Z" fill="black"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M7.5 6H8.5C9.05228 6 9.5 6.44772 9.5 7V11C9.5 11.5523 9.05228 12 8.5 12H7.5C6.94772 12 6.5 11.5523 6.5 11V7C6.5 6.44772 6.94772 6 7.5 6Z" fill="black"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M3 7.5H4C4.55228 7.5 5 7.94772 5 8.5V11C5 11.5523 4.55228 12 4 12H3C2.44772 12 2 11.5523 2 11V8.5C2 7.94772 2.44772 7.5 3 7.5Z" fill="black"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M16.5 2H17.5C18.0523 2 18.5 2.44772 18.5 3V11C18.5 11.5523 18.0523 12 17.5 12H16.5C15.9477 12 15.5 11.5523 15.5 11V3C15.5 2.44772 15.9477 2 16.5 2Z" fill="black" fillOpacity="0.18"/>
              </svg>
              {/* WiFi */}
              <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden="true">
                <path d="M8.13295 8.93945C8.77245 8.93945 9.39384 9.1075 9.94135 9.42792L10.1632 9.55775C10.3314 9.65617 10.3609 9.88652 10.2231 10.024L8.32897 11.9129C8.21263 12.0289 8.02401 12.0289 7.90767 11.9129L6.02576 10.0362C5.88847 9.89927 5.91709 9.67009 6.08385 9.57094L6.3032 9.44051C6.85574 9.11198 7.48501 8.93945 8.13295 8.93945Z" fill="black"/>
                <path d="M8.13267 5.46973C9.7235 5.46973 11.2509 5.99747 12.4952 6.97479L12.6711 7.11291C12.8113 7.22303 12.8236 7.43052 12.6974 7.55636L11.5666 8.684C11.462 8.7883 11.2965 8.80028 11.1779 8.71214L11.0401 8.60969C10.1997 7.98511 9.18633 7.65008 8.13267 7.65008C7.07251 7.65008 6.05323 7.98928 5.21005 8.62103L5.07207 8.72441C4.95346 8.81327 4.78737 8.80157 4.68247 8.69696L3.5521 7.56974C3.42618 7.44417 3.43813 7.2372 3.57769 7.12687L3.75254 6.98864C4.99979 6.00261 6.53416 5.46973 8.13267 5.46973Z" fill="black"/>
                <path d="M8.13272 2C10.6574 2 13.0717 2.89057 14.9828 4.52294L15.1459 4.66228C15.2777 4.77488 15.2855 4.97558 15.1627 5.09797L14.0356 6.22195C13.9264 6.33084 13.7519 6.33847 13.6336 6.23952L13.494 6.12283C11.9894 4.86472 10.1035 4.18035 8.13272 4.18035C6.15517 4.18035 4.26327 4.86943 2.75641 6.13541L2.6168 6.2527C2.4985 6.3521 2.32359 6.34466 2.2142 6.23557L1.08726 5.11176C0.964693 4.98954 0.972236 4.78918 1.10365 4.67646L1.26614 4.53708C3.17953 2.89589 5.60056 2 8.13272 2Z" fill="black"/>
              </svg>
              {/* Battery */}
              <svg width="25" height="14" viewBox="0 0 25 14" fill="none" aria-hidden="true">
                <path d="M24 5C24.5523 5 25 5.44772 25 6V8C25 8.55228 24.5523 9 24 9V5Z" fill="black" fillOpacity="0.6"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M3 1H20C21.6569 1 23 2.34315 23 4V10C23 11.6569 21.6569 13 20 13H3C1.34315 13 0 11.6569 0 10V4C0 2.34315 1.34315 1 3 1ZM3 2C1.89543 2 1 2.89543 1 4V10C1 11.1046 1.89543 12 3 12H20C21.1046 12 22 11.1046 22 10V4C22 2.89543 21.1046 2 20 2H3Z" fill="black" fillOpacity="0.6"/>
                <rect x="2" y="3" width="19" height="8" rx="1" fill="black"/>
              </svg>
            </div>
          </div>

          {/* App Bar */}
          <div className={styles.appBar}>
            <button className={styles.backBtn} aria-label="Back">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#0A0A0A"/>
                <path d="M10 18L4 12L10 6" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className={styles.logo}>
              <span>dep</span>
            </div>

            <div className={styles.appBarActions}>
              <button className={styles.notifBtn} aria-label="Notifications">
                <div className={styles.notifIcon}>
                  <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
                    <path d="M2 15V7C2 5.14348 2.7375 3.36301 4.05025 2.05025C5.36301 0.737498 7.14348 0 9 0C10.8565 0 12.637 0.737498 13.9497 2.05025C15.2625 3.36301 16 5.14348 16 7V15" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
                    <path d="M0 15H18" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
                    <path d="M7 19H11" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
                  </svg>
                  <span className={styles.notifBadge}>25</span>
                </div>
              </button>
              <button className={styles.settingsBtn} aria-label="Settings">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M7 5C5.89543 5 5 5.89543 5 7V8.17157C5 8.70201 4.78929 9.21071 4.41421 9.58579L3.41421 10.5858C2.63317 11.3668 2.63316 12.6332 3.41421 13.4142L4.41421 14.4142C4.78929 14.7893 5 15.298 5 15.8284V17C5 18.1046 5.89543 19 7 19H8.17157C8.70201 19 9.21071 19.2107 9.58579 19.5858L10.5858 20.5858C11.3668 21.3668 12.6332 21.3668 13.4142 20.5858L14.4142 19.5858C14.7893 19.2107 15.298 19 15.8284 19H17C18.1046 19 19 18.1046 19 17V15.8284C19 15.298 19.2107 14.7893 19.5858 14.4142L20.5858 13.4142C21.3668 12.6332 21.3668 11.3668 20.5858 10.5858L19.5858 9.58579C19.2107 9.21071 19 8.70201 19 8.17157V7C19 5.89543 18.1046 5 17 5H15.8284C15.298 5 14.7893 4.78929 14.4142 4.41421L13.4142 3.41421C12.6332 2.63317 11.3668 2.63316 10.5858 3.41421L9.58579 4.41421C9.21071 4.78929 8.70201 5 8.17157 5H7Z" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Balance + Action Buttons */}
          <div className={styles.balanceSection}>
            <div className={styles.balanceLeft}>
              <div className={styles.balanceLabel}>Total Balance</div>
              <div className={styles.balanceAmount}>
                <span className={styles.balanceValue}>725.62</span>
                <span className={styles.balanceCurrency}>USDT</span>
              </div>
              <div className={styles.referrals}>
                <div className={styles.referralAmount}>
                  <span className={styles.referralValue}>425.22</span>
                  <span className={styles.referralCurrency}>USDT</span>
                </div>
                <div className={styles.referralLabel}>Received by referrals</div>
              </div>
            </div>

            <div className={styles.balanceActions}>
              <button className={styles.btnTopUp}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M10 5V15" stroke="black" strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="round"/>
                  <path d="M5 10H15" stroke="black" strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="round"/>
                </svg>
                <span>Top up</span>
              </button>
              <button className={styles.btnWithdraw}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M10 15V5" stroke="white" strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="round"/>
                  <path d="M6.25 8.75L10 5L13.75 8.75" stroke="white" strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="round"/>
                </svg>
                <span>Withdraw</span>
              </button>
            </div>
          </div>

          {/* Details Green Button */}
          <button className={styles.btnDetailsGreen}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 8H3V20H21V8Z" stroke="#191919" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 8V4H17V8" stroke="#191919" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 14H17" stroke="#191919" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Details</span>
          </button>
        </header>

        {/* ===== BODY (Dark section) ===== */}
        <main className={styles.body}>
          {/* Chart */}
          <div className={styles.chartSection}>
            <div className={styles.chartWrapper}>
              <div className={styles.scaleLabels}>
                <span>4.00%</span>
                <span>3.00%</span>
                <span>2.00%</span>
                <span>1.00%</span>
                <span>0.00%</span>
                <span className={styles.scaleFaded}>-1.00%</span>
                <span>-2.00%</span>
              </div>
              <div className={styles.chartGraph}>
                <svg
                  viewBox="0 0 325 122"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.chartSvg}
                  aria-label="Performance chart"
                >
                  <path
                    d="M3.19408 51.3435L0 42.4209V122H325V10.8609H301.843L293.858 2.74937L288.268 18.1612L280.283 23.0281V16.5389L276.29 19.7835L273.894 7.61626L271.499 10.8609L269.103 5.99397L265.111 13.2943L261.916 9.23856L255.528 14.9166L253.931 13.2943L249.939 19.7835L246.744 14.9166L243.55 23.0281L241.953 18.1612L238.759 23.0281L234.767 16.5389L232.371 23.0281H222.789L214.803 16.5389L212.408 19.7835L210.012 16.5389L206.02 21.4058L203.624 18.1612L202.027 19.7835L198.034 16.5389L195.639 18.9724L192.644 5.99397L189.251 8.42741L187.554 0L184.459 56.2104L181.538 27.5555L178.071 54.5881L174.877 50.0286V54.5881V60.2662L170.884 61.8885L170.086 70L166.892 60.2662L165.295 57.0216L162.899 59.455V54.5881H159.705L158.108 60.2662H154.115L151.72 63.5108L150.123 59.455L147.727 63.5108L144.533 54.5881L140.541 57.0216L138.145 51.3435L136.548 57.0216L134.152 51.3435L132.555 63.5108L129.361 57.0216L126.966 68.3777L124.57 63.5108L121.376 60.2662L117.383 59.455L110.995 52.1547L111.794 60.2662L107.801 59.455L104.607 65.1331L95.0246 67.5665L89.4349 59.455L85.4422 68.3777L83.8452 57.8327L82.2482 66.7554L79.0541 51.3435L74.2629 59.455L68.6732 44.0432L65.4791 52.9658L63.0835 45.6655L56.6953 51.3435L53.5012 47.2878L50.3071 49.7212L47.9115 45.6655L42.3218 51.3435L35.1351 45.6655L29.5455 54.5881L26.3513 48.0989L21.5602 54.5881L19.1646 47.2878L15.9705 51.3435L13.5749 44.0432L11.9779 49.7212L9.5823 52.9658L3.19408 51.3435Z"
                    fill="url(#chartGradient)"
                  />
                  <path
                    d="M0 42.4209L3.19408 51.3435L9.58231 52.9658L11.9779 49.7212L13.5749 44.0432L15.9705 51.3435L19.1646 47.2878L21.5602 54.5881L26.3513 48.0989L29.5455 54.5881L35.1351 45.6655L42.3218 51.3435L47.9115 45.6655L50.3071 49.7212L53.5012 47.2878L56.6953 51.3435L63.0835 45.6655L65.4791 52.9658L68.6732 44.0432L74.2629 59.455L79.0541 51.3435L82.2482 66.7554L83.8452 57.8327L85.4422 68.3777L89.4349 59.455L95.0246 67.5665L104.607 65.1331L107.801 59.455L111.794 60.2662L110.995 52.1547L117.383 59.455L121.376 60.2662L124.57 63.5108L126.966 68.3777L129.361 57.0216L132.555 63.5108L134.152 51.3435L136.548 57.0216L138.145 51.3435L140.541 57.0216L144.533 54.5881L147.727 63.5108L150.123 59.455L151.72 63.5108L154.115 60.2662H158.108L159.705 54.5881H162.899V59.455L165.295 57.0216L166.892 60.2662L170.086 70L170.884 61.8885L174.877 60.2662V54.5881V50.0286L178.071 54.5881L181.538 27.5555L184.459 56.2104L187.554 0L189.251 8.42741L192.644 5.99397L195.639 18.9724L198.034 16.5389L202.027 19.7835L203.624 18.1612L206.02 21.4058L210.012 16.5389L212.408 19.7835L214.803 16.5389L222.789 23.0281H232.371L234.767 16.5389L238.759 23.0281L241.953 18.1612L243.55 23.0281L246.744 14.9166L249.939 19.7835L253.931 13.2943L255.528 14.9166L261.916 9.23856L265.111 13.2943L269.103 5.99397L271.499 10.8609L273.894 7.61626L276.29 19.7835L280.283 16.5389V23.0281L288.268 18.1612L293.858 2.74937L301.843 10.8609H325"
                    stroke="#40FF96"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient id="chartGradient" x1="162.5" y1="0" x2="162.5" y2="122" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#24F180" stopOpacity="0.35"/>
                      <stop offset="1" stopColor="white" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Bot Status + Price */}
          <div className={styles.statusPriceSection}>
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>Bot status</span>
              <div className={styles.statusActive}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <circle cx="5" cy="5" r="5" fill="white"/>
                </svg>
                <span className={styles.statusText}>Active</span>
              </div>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Actual price</span>
              <div className={styles.priceAmount}>
                <span className={styles.priceValue}>69 425.22</span>
                <span className={styles.priceCurrency}>USDT/BTC</span>
              </div>
            </div>
          </div>

          {/* Details Dark Button */}
          <button className={styles.btnDetailsDark}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 4V20H20" stroke="white" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              <path d="M9 13L13 9L16 12L20 8" stroke="white" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            </svg>
            <span>Details</span>
          </button>

          {/* Social Media + Support */}
          <div className={styles.secondaryButtons}>
            <button className={styles.btnSocial}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <g opacity="0.5">
                  <path d="M12 8H3V14H12L18 19V4L12 8Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 8V14" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 14V20H10V14" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 14C18.394 14 18.7841 13.9224 19.1481 13.7716C19.512 13.6209 19.8427 13.3999 20.1213 13.1213C20.3999 12.8427 20.6209 12.512 20.7716 12.1481C20.9224 11.7841 21 11.394 21 11C21 10.606 20.9224 10.2159 20.7716 9.85195C20.6209 9.48797 20.3999 9.15726 20.1213 8.87868C19.8427 8.6001 19.512 8.37913 19.1481 8.22836C18.7841 8.0776 18.394 8 18 8" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
              </svg>
              <span>Social Media</span>
            </button>
            <button className={styles.btnSupport}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill="white" fillOpacity="0.5"/>
                <path d="M8 11H8.01" stroke="white" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11H12.01" stroke="white" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 11H16.01" stroke="white" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Support</span>
            </button>
          </div>
        </main>

        {/* ===== TAB BAR ===== */}
        <div className={styles.tabBarWrapper}>
          <div className={styles.tabGlowOuter} aria-hidden="true" />
          <div className={styles.tabGlowInner} aria-hidden="true" />
          <nav className={styles.tabBar}>
            <button className={styles.tabItemActive} aria-label="Home" aria-current="page">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 20H4V10L12 4L20 10V20Z" stroke="#191919" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14V20" stroke="#191919" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className={styles.tabItem} aria-label="Wallet">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 8H3V20H21V8Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 8V4H17V8" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 14H17" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className={styles.tabItem} aria-label="Bot performance">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 4V20H20" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
                <path d="M9 13L13 9L16 12L20 8" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className={styles.tabItem} aria-label="Support">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill="white"/>
                <path d="M8 11H8.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11H12.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 11H16.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
