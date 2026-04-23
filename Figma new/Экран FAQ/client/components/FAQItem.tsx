import { useState } from "react";

interface FAQItemProps {
  question: string;
  answer?: React.ReactNode;
  defaultOpen?: boolean;
}

function ArrowDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.5 2.66683V2.16683H7.5V2.66683H8H8.5ZM8 2.66683H7.5L7.5 13.3335H8H8.5V2.66683H8Z" fill="white" />
      <path d="M12 9.3335L8 13.3335L4 9.3335" stroke="white" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.28544 11.4284V11.857H6.42829V11.4284H6.85686H7.28544ZM6.85686 11.4284H6.42829L6.42829 2.28557H6.85686H7.28544L7.28544 11.4284H6.85686Z" fill="white" />
      <path d="M10.2853 5.71415L6.85672 2.28557L3.42815 5.71415" stroke="white" strokeWidth="0.857143" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
  );
}

export function FAQItem({ question, answer, defaultOpen = false }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl bg-white w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-start gap-4 text-left py-3 px-[19px]"
      >
        <span className="flex-1 font-outfit font-medium text-[18px] leading-normal tracking-[0.18px] text-faq-navy">
          {question}
        </span>
        <div className="flex-shrink-0 mt-0.5">
          {isOpen ? (
            <div className="flex items-center justify-center rounded-[17px] bg-faq-green-light p-[5px]">
              <ArrowUpIcon />
            </div>
          ) : (
            <div
              className="flex items-center justify-center rounded-full bg-faq-blue p-1"
              style={{ transform: "rotate(-90deg)" }}
            >
              <ArrowDownIcon />
            </div>
          )}
        </div>
      </button>

      {isOpen && answer && (
        <div className="px-[19px] pb-4 font-outfit font-normal text-[16px] leading-normal text-faq-text-secondary">
          {answer}
        </div>
      )}
    </div>
  );
}
