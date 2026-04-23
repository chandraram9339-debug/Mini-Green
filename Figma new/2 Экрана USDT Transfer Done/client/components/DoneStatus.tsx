export default function DoneStatus() {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Green checkmark circle */}
      <div className="flex items-center justify-center w-[52px] h-[52px] rounded-full bg-app-green">
        <svg width="34" height="34" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.334 24.9165L23.834 31.4165L36.834 18.4165" stroke="white" strokeWidth="3.46667" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
      </div>
      {/* Done label */}
      <span className="text-app-grey-dark text-[20px] font-medium font-outfit">
        Done!
      </span>
    </div>
  );
}
