interface AppBarProps {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
}

export default function AppBar({ title, onBack, onClose }: AppBarProps) {
  return (
    <div className="flex items-center justify-between px-4 h-14 bg-app-bg">
      <button
        onClick={onBack}
        className="flex items-center justify-center w-8 h-8 rounded-full p-1"
        aria-label="Go back"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z" fill="white"/>
          <path d="M10 18L4 12L10 6" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
      </button>
      <h1 className="font-outfit font-medium text-xl text-white tracking-[0.4px]">{title}</h1>
      <button
        onClick={onClose}
        className="flex items-center justify-center w-8 h-8 rounded-full p-1"
        aria-label="Close"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.5 5.5L18.5 18.5" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
          <path d="M5.5 18.5L18.5 5.49999" stroke="white" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
