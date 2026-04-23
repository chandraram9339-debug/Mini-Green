interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="relative flex-shrink-0 focus:outline-none"
      style={{ width: 34, height: 20 }}
    >
      {/* Track */}
      <span
        className="absolute rounded-[10px] bg-tg-light transition-colors duration-200"
        style={{ width: 28, height: 14, left: 3, top: 3 }}
      />
      {/* Thumb */}
      <span
        className={`absolute rounded-[10px] transition-all duration-200 ${
          checked ? "bg-tg-green" : "bg-tg-line"
        }`}
        style={{
          width: 20,
          height: 20,
          left: checked ? 14 : 0,
          top: 0,
        }}
      />
    </button>
  );
}
