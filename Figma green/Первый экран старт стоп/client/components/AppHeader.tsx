export default function AppHeader() {
  return (
    <div className="relative h-[260px] overflow-hidden shrink-0">
      {/* Green rounded bottom background */}
      <div className="absolute inset-0 bg-brand-header rounded-b-[48px]" />

      {/* White glow — top left */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: -54,
          top: 7,
          width: 322,
          height: 150,
          background: "rgba(255,255,255,0.16)",
          filter: "blur(32.5px)",
        }}
      />

      {/* White glow — bottom right */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: 184,
          top: 247,
          width: 322,
          height: 150,
          background: "rgba(255,255,255,0.16)",
          filter: "blur(32.5px)",
        }}
      />

      {/* Status Bar */}
      <div className="absolute top-5 left-0 right-0 px-5 flex items-center justify-between">
        <span className="font-outfit font-semibold text-[14px] text-black">9:41</span>
        <div className="flex items-center gap-1">
          {/* Network Signal */}
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 4H13C13.5523 4 14 4.44772 14 5V11C14 11.5523 13.5523 12 13 12H12C11.4477 12 11 11.5523 11 11V5C11 4.44772 11.4477 4 12 4Z" fill="black" />
            <path fillRule="evenodd" clipRule="evenodd" d="M7.5 6H8.5C9.05228 6 9.5 6.44772 9.5 7V11C9.5 11.5523 9.05228 12 8.5 12H7.5C6.94772 12 6.5 11.5523 6.5 11V7C6.5 6.44772 6.94772 6 7.5 6Z" fill="black" />
            <path fillRule="evenodd" clipRule="evenodd" d="M3 7.5H4C4.55228 7.5 5 7.94772 5 8.5V11C5 11.5523 4.55228 12 4 12H3C2.44772 12 2 11.5523 2 11V8.5C2 7.94772 2.44772 7.5 3 7.5Z" fill="black" />
            <path fillRule="evenodd" clipRule="evenodd" d="M16.5 2H17.5C18.0523 2 18.5 2.44772 18.5 3V11C18.5 11.5523 18.0523 12 17.5 12H16.5C15.9477 12 15.5 11.5523 15.5 11V3C15.5 2.44772 15.9477 2 16.5 2Z" fill="black" fillOpacity="0.18" />
          </svg>
          {/* WiFi */}
          <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
            <path d="M8.13295 8.93945C8.77245 8.93945 9.39384 9.1075 9.94135 9.42792L10.1632 9.55775C10.3314 9.65617 10.3609 9.88652 10.2231 10.024L8.32897 11.9129C8.21263 12.0289 8.02401 12.0289 7.90767 11.9129L6.02576 10.0362C5.88847 9.89927 5.91709 9.67009 6.08385 9.57094L6.3032 9.44051C6.85574 9.11198 7.48501 8.93945 8.13295 8.93945Z" fill="black" />
            <path d="M8.13267 5.46973C9.7235 5.46973 11.2509 5.99747 12.4952 6.97479L12.6711 7.11291C12.8113 7.22303 12.8236 7.43052 12.6974 7.55636L11.5666 8.684C11.462 8.7883 11.2965 8.80028 11.1779 8.71214L11.0401 8.60969C10.1997 7.98511 9.18633 7.65008 8.13267 7.65008C7.07251 7.65008 6.05323 7.98928 5.21005 8.62103L5.07207 8.72441C4.95346 8.81327 4.78737 8.80157 4.68247 8.69696L3.5521 7.56974C3.42618 7.44417 3.43813 7.2372 3.57769 7.12687L3.75254 6.98864C4.99979 6.00261 6.53416 5.46973 8.13267 5.46973Z" fill="black" />
            <path d="M8.13272 2C10.6574 2 13.0717 2.89057 14.9828 4.52294L15.1459 4.66228C15.2777 4.77488 15.2855 4.97558 15.1627 5.09797L14.0356 6.22195C13.9264 6.33084 13.7519 6.33847 13.6336 6.23952L13.494 6.12283C11.9894 4.86472 10.1035 4.18035 8.13272 4.18035C6.15517 4.18035 4.26327 4.86943 2.75641 6.13541L2.6168 6.2527C2.4985 6.3521 2.32359 6.34466 2.2142 6.23557L1.08726 5.11176C0.964693 4.98954 0.972236 4.78918 1.10365 4.67646L1.26614 4.53708C3.17953 2.89589 5.60056 2 8.13272 2Z" fill="black" />
          </svg>
          {/* Battery */}
          <svg width="25" height="14" viewBox="0 0 25 14" fill="none">
            <path d="M24 5C24.5523 5 25 5.44772 25 6V8C25 8.55228 24.5523 9 24 9V5Z" fill="black" fillOpacity="0.6" />
            <path fillRule="evenodd" clipRule="evenodd" d="M3 1H20C21.6569 1 23 2.34315 23 4V10C23 11.6569 21.6569 13 20 13H3C1.34315 13 0 11.6569 0 10V4C0 2.34315 1.34315 1 3 1ZM3 2C1.89543 2 1 2.89543 1 4V10C1 11.1046 1.89543 12 3 12H20C21.1046 12 22 11.1046 22 10V4C22 2.89543 21.1046 2 20 2H3Z" fill="black" fillOpacity="0.6" />
            <rect x="2" y="3" width="19" height="8" rx="1" fill="black" />
          </svg>
        </div>
      </div>

      {/* App Bar — at top:64px */}
      <div className="absolute left-0 right-0 top-16 h-14 bg-brand-header flex items-center">
        {/* Back/Up arrow */}
        <div className="absolute left-4 top-3 rotate-90">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#0A0A0A" />
            <path d="M10 18L4 12L10 6" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Notification icon with badge */}
        <div className="absolute right-[57px] top-4 w-6 h-6">
          <svg width="18" height="19" viewBox="0 0 18 19" fill="none" className="absolute left-[3px] top-[3px]">
            <path d="M2 15V7C2 5.14348 2.7375 3.36301 4.05025 2.05025C5.36301 0.737498 7.14348 0 9 0C10.8565 0 12.637 0.737498 13.9497 2.05025C15.2625 3.36301 16 5.14348 16 7V15" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
            <path d="M0 15H18" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
            <path d="M7 19H11" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
          </svg>
          <div className="absolute -right-[2px] -top-[2px] w-[13px] h-[13px] bg-[#0A0A0A] rounded-full flex items-center justify-center">
            <span className="font-outfit font-medium text-[7px] text-brand-header leading-none">25</span>
          </div>
        </div>

        {/* Settings icon */}
        <div className="absolute right-[22px] top-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M7 5C5.89543 5 5 5.89543 5 7V8.17157C5 8.70201 4.78929 9.21071 4.41421 9.58579L3.41421 10.5858C2.63317 11.3668 2.63316 12.6332 3.41421 13.4142L4.41421 14.4142C4.78929 14.7893 5 15.298 5 15.8284V17C5 18.1046 5.89543 19 7 19H8.17157C8.70201 19 9.21071 19.2107 9.58579 19.5858L10.5858 20.5858C11.3668 21.3668 12.6332 21.3668 13.4142 20.5858L14.4142 19.5858C14.7893 19.2107 15.298 19 15.8284 19H17C18.1046 19 19 18.1046 19 17V15.8284C19 15.298 19.2107 14.7893 19.5858 14.4142L20.5858 13.4142C21.3668 12.6332 21.3668 11.3668 20.5858 10.5858L19.5858 9.58579C19.2107 9.21071 19 8.70201 19 8.17157V7C19 5.89543 18.1046 5 17 5H15.8284C15.298 5 14.7893 4.78929 14.4142 4.41421L13.4142 3.41421C12.6332 2.63317 11.3668 2.63316 10.5858 3.41421L9.58579 4.41421C9.21071 4.78929 8.70201 5 8.17157 5H7Z" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#0A0A0A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* "dep" logo — centered at top:68px */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[68px] w-12 h-12 bg-[#0A0A0A] rounded-full flex items-center justify-center z-10">
        <span
          className="text-[19px] text-[#38DF83] leading-none font-normal"
          style={{ fontFamily: "'Airstrip Four', 'Courier New', monospace" }}
        >
          dep
        </span>
      </div>

      {/* Total Balance — left side */}
      <div className="absolute left-5 top-[140px]">
        <p className="font-outfit font-medium text-[20px] tracking-[0.4px] text-black leading-none">
          Total Balance
        </p>
        <div className="flex items-end gap-[3px] mt-[10px]">
          <span className="font-outfit font-semibold text-[52px] leading-none text-black">
            725.62
          </span>
          <span className="font-outfit font-normal text-[12px] text-black mb-1 leading-none">
            USDT
          </span>
        </div>
      </div>

      {/* Top up button */}
      <div className="absolute right-5 top-[140px]">
        <button className="flex items-center gap-3 bg-brand-green rounded-[54px] h-10 pl-6 pr-8 min-w-[126px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 5V15" stroke="black" strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="round" />
            <path d="M5 10H15" stroke="black" strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="round" />
          </svg>
          <span className="font-outfit font-normal text-[12px] text-black">Top up</span>
        </button>
      </div>

      {/* Withdraw button */}
      <div className="absolute right-5 top-[190px]">
        <button className="flex items-center justify-center gap-1 bg-white/50 rounded-[54px] h-10 w-[126px] px-5">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 5V15" stroke="white" strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="round" />
            <path d="M6.25 8.75L10 5L13.75 8.75" stroke="white" strokeWidth="1.3" strokeLinecap="square" strokeLinejoin="round" />
          </svg>
          <span className="font-outfit font-normal text-[12px] text-white">Withdraw</span>
        </button>
      </div>
    </div>
  );
}
