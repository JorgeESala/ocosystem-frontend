import { useState } from "react";
import { Popover } from "flowbite-react";
import { HiQuestionMarkCircle } from "react-icons/hi";

interface HelpTriggerProps {
  content: React.ReactNode;
}

export default function HelpTrigger({ content }: HelpTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      content={content}
      trigger="click"
      placement="top"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
        aria-label="Ayuda"
      >
        <HiQuestionMarkCircle className="h-4 w-4" />
      </button>
    </Popover>
  );
}
