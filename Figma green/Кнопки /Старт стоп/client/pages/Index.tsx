import styles from "./index.module.css";

export default function Index() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button className={styles.btnStart} type="button">
          <svg
            className={styles.btnIcon}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 17.4C7.8 21 3 21 3 21C3 21 3 16.2 6.6 15"
              stroke="#40FF96"
              strokeWidth="1.6"
            />
            <path
              d="M21 3C21 3 17.851 3.266 16 4C14.553 4.573 13.133 5.735 11.9 7C9.633 9.326 8 12 8 12L12 16C12 16 14.674 14.367 17 12.1C18.265 10.867 19.427 9.447 20 8C20.733 6.149 21 3 21 3Z"
              stroke="#40FF96"
              strokeWidth="1.6"
            />
            <path
              d="M12 15.9996L13 20.9996H14L17 17.9996V12.0996"
              stroke="#40FF96"
              strokeWidth="1.6"
            />
            <path
              d="M8 12L3 11V10L6 7H11.9"
              stroke="#40FF96"
              strokeWidth="1.6"
            />
          </svg>
          Start
        </button>

        <button className={styles.btnStop} type="button">
          <svg
            className={styles.btnIcon}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_stop)">
              <path
                d="M5.5 5.5L18.5 18.5"
                stroke="#FF0000"
                strokeWidth="1.6"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
              <path
                d="M5.5 18.5L18.5 5.49999"
                stroke="#FF0000"
                strokeWidth="1.6"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_stop">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
          Stop
        </button>
      </div>
    </div>
  );
}
