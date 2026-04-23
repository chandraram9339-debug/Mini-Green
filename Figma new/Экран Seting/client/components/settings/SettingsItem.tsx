import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface SettingsItemProps {
  icon?: ReactNode;
  label: string;
  rightLabel?: string;
  rightContent?: ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  className?: string;
}

export function SettingsItem({
  icon,
  label,
  rightLabel,
  rightContent,
  onClick,
  showChevron = false,
  className = "",
}: SettingsItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-xl bg-tg-white px-3 py-3 text-left transition-opacity active:opacity-70 ${className}`}
    >
      {icon && (
        <span className="flex-shrink-0 text-tg-grey">{icon}</span>
      )}
      <span className="flex-1 text-[18px] font-medium leading-normal tracking-[0.18px] text-tg-black">
        {label}
      </span>
      {rightLabel && (
        <span className="text-[16px] font-normal leading-normal text-tg-grey">
          {rightLabel}
        </span>
      )}
      {rightContent}
      {showChevron && (
        <ChevronRight className="flex-shrink-0 text-tg-grey" size={18} />
      )}
    </button>
  );
}
