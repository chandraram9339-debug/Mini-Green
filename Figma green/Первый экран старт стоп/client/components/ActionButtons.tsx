// Start / Stop row
function StartBtn() {
  return (
    <button
      className="flex items-center justify-center gap-2 rounded-[54px] h-[52px] flex-1"
      style={{ background: "rgba(64, 255, 150, 0.15)" }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 17.4C7.8 21 3 21 3 21C3 21 3 16.2 6.6 15" stroke="#40FF96" strokeWidth="1.6" />
        <path d="M21 3C21 3 17.851 3.266 16 4C14.553 4.573 13.133 5.735 11.9 7C9.633 9.326 8 12 8 12L12 16C12 16 14.674 14.367 17 12.1C18.265 10.867 19.427 9.447 20 8C20.733 6.149 21 3 21 3Z" stroke="#40FF96" strokeWidth="1.6" />
        <path d="M12 15.9996L13 20.9996H14L17 17.9996V12.0996" stroke="#40FF96" strokeWidth="1.6" />
        <path d="M8 12L3 11V10L6 7H11.9" stroke="#40FF96" strokeWidth="1.6" />
      </svg>
      <span className="font-outfit font-normal text-[16px] text-brand-green">Start</span>
    </button>
  );
}

function StopBtn() {
  return (
    <button
      className="flex items-center justify-center gap-2 rounded-[54px] h-[52px] flex-1"
      style={{ background: "rgba(255, 0, 0, 0.15)" }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M5.5 5.5L18.5 18.5" stroke="#FF0000" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
        <path d="M5.5 18.5L18.5 5.49999" stroke="#FF0000" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" />
      </svg>
      <span className="font-outfit font-normal text-[16px] text-[#FF0000]">Stop</span>
    </button>
  );
}

function ChannelBtn() {
  return (
    <button className="flex items-center justify-center gap-2 bg-brand-card rounded-[54px] h-[52px] flex-1">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill="white" fillOpacity="0.5" />
        <path d="M8 11H8.01" stroke="white" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 11H12.01" stroke="white" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 11H16.01" stroke="white" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-outfit font-normal text-[16px] text-white/50">Channel</span>
    </button>
  );
}

function ChatBtn() {
  return (
    <button className="flex items-center justify-center gap-2 bg-brand-card rounded-[54px] h-[52px] flex-1">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M21 4H21.8V3.2H21V4ZM3 4V3.2H2.2V4H3ZM3 21H2.2C2.2 21.3236 2.39491 21.6153 2.69385 21.7391C2.99279 21.8629 3.33689 21.7945 3.56569 21.5657L3 21ZM6 18V17.2H5.66863L5.43431 17.4343L6 18ZM21 18V18.8H21.8V18H21ZM21 4V3.2H3V4V4.8H21V4ZM3 4H2.2V21H3H3.8V4H3ZM3 21L3.56569 21.5657L6.56569 18.5657L6 18L5.43431 17.4343L2.43431 20.4343L3 21ZM6 18V18.8H21V18V17.2H6V18ZM21 18H21.8V4H21H20.2V18H21Z" fill="white" />
        <path d="M8 11H8.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 11H12.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 11H16.01" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-outfit font-normal text-[16px] text-white">Chat</span>
    </button>
  );
}

export default function ActionButtons() {
  return (
    <div className="mt-6 flex flex-col gap-[14px]">
      {/* Row 1: Start | Stop */}
      <div className="flex gap-[14px]">
        <StartBtn />
        <StopBtn />
      </div>
      {/* Row 2: Channel | Chat */}
      <div className="flex gap-[14px]">
        <ChannelBtn />
        <ChatBtn />
      </div>
    </div>
  );
}
