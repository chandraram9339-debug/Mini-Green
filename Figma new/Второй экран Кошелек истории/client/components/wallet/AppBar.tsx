export default function AppBar() {
  return (
    <div className="w-full bg-wallet-bg px-4 pt-3 pb-2">
      <div className="flex items-center justify-between">
        {/* Back button */}
        <button className="p-1 -ml-1">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 12.8H20.8V11.2H20V12V12.8ZM20 12V11.2H4V12V12.8H20V12Z"
              fill="#55647B"
            />
            <path
              d="M10 18L4 12L10 6"
              stroke="#55647B"
              strokeWidth="1.6"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          {/* Notification bell with badge */}
          <div className="relative w-6 h-6">
            <svg
              width="18"
              height="19"
              viewBox="0 0 18 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-[3px] top-[3px]"
            >
              <path
                d="M2 15V7C2 5.14348 2.7375 3.36301 4.05025 2.05025C5.36301 0.737498 7.14348 0 9 0C10.8565 0 12.637 0.737498 13.9497 2.05025C15.2625 3.36301 16 5.14348 16 7V15"
                stroke="#55647B"
                strokeWidth="1.6"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
              <path
                d="M0 15H18"
                stroke="#55647B"
                strokeWidth="1.6"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
              <path
                d="M7 19H11"
                stroke="#55647B"
                strokeWidth="1.6"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
            </svg>
            {/* Badge */}
            <div className="absolute -top-0.5 right-0 w-[13px] h-[13px] bg-wallet-blue rounded-full flex items-center justify-center">
              <span className="text-white font-outfit font-medium leading-none text-[6px]">
                25
              </span>
            </div>
          </div>

          {/* Settings gear */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 5C5.89543 5 5 5.89543 5 7V8.17157C5 8.70201 4.78929 9.21071 4.41421 9.58579L3.41421 10.5858C2.63317 11.3668 2.63316 12.6332 3.41421 13.4142L4.41421 14.4142C4.78929 14.7893 5 15.298 5 15.8284V17C5 18.1046 5.89543 19 7 19H8.17157C8.70201 19 9.21071 19.2107 9.58579 19.5858L10.5858 20.5858C11.3668 21.3668 12.6332 21.3668 13.4142 20.5858L14.4142 19.5858C14.7893 19.2107 15.298 19 15.8284 19H17C18.1046 19 19 18.1046 19 17V15.8284C19 15.298 19.2107 14.7893 19.5858 14.4142L20.5858 13.4142C21.3668 12.6332 21.3668 11.3668 20.5858 10.5858L19.5858 9.58579C19.2107 9.21071 19 8.70201 19 8.17157V7C19 5.89543 18.1046 5 17 5H15.8284C15.298 5 14.7893 4.78929 14.4142 4.41421L13.4142 3.41421C12.6332 2.63317 11.3668 2.63316 10.5858 3.41421L9.58579 4.41421C9.21071 4.78929 8.70201 5 8.17157 5H7Z"
              stroke="#55647B"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
              stroke="#55647B"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-2 h-px bg-wallet-grey-line" />
    </div>
  );
}
