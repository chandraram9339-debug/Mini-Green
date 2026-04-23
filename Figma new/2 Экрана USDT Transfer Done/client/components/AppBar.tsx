interface AppBarProps {
  title: string;
}

export default function AppBar({ title }: AppBarProps) {
  return (
    <div className="relative flex items-center justify-center w-full h-14 bg-app-bg flex-shrink-0">
      {/* Back button */}
      <button className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="#55647B"/>
          <path d="M10 18L4 12L10 6" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Title */}
      <span className="text-app-black font-medium text-[20px] tracking-[0.4px] font-outfit">
        {title}
      </span>

      {/* Close button */}
      <button className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip-appbar-close)">
            <path d="M5.5 5.5L18.5 18.5" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
            <path d="M5.5 18.5L18.5 5.49999" stroke="#55647B" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
          </g>
          <defs>
            <clipPath id="clip-appbar-close">
              <rect width="24" height="24" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </button>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-5 right-5 h-px bg-app-grey-line" />
    </div>
  );
}
