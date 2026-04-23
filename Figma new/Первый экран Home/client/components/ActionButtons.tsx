export default function ActionButtons() {
  return (
    <div className="w-full px-4 pt-3 pb-4 flex gap-3 font-outfit">
      {/* Social Media button */}
      <button className="flex-1 flex items-center justify-center gap-2 bg-brand-green-light rounded-full py-3.5 hover:opacity-90 transition-opacity">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          <path
            d="M12 8H3V14H12L18 19V4L12 8Z"
            stroke="#192B48"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 8V14"
            stroke="#192B48"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 14V20H10V14"
            stroke="#192B48"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 14C18.394 14 18.7841 13.9224 19.1481 13.7716C19.512 13.6209 19.8427 13.3999 20.1213 13.1213C20.3999 12.8427 20.6209 12.512 20.7716 12.1481C20.9224 11.7841 21 11.394 21 11C21 10.606 20.9224 10.2159 20.7716 9.85195C20.6209 9.48797 20.3999 9.15726 20.1213 8.87868C19.8427 8.6001 19.512 8.37913 19.1481 8.22836C18.7841 8.0776 18.394 8 18 8"
            stroke="#192B48"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-brand-black text-base font-normal">
          Social Media
        </span>
      </button>

      {/* Support button */}
      <button className="flex-1 flex items-center justify-center gap-2 bg-brand-green rounded-full py-3.5 hover:opacity-90 transition-opacity">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          <path
            d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z"
            fill="#192B48"
          />
          <path
            d="M8 11H8.01"
            stroke="#192B48"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 11H12.01"
            stroke="#192B48"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 11H16.01"
            stroke="#192B48"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-brand-black text-base font-normal">Support</span>
      </button>
    </div>
  );
}
