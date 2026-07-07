import { useState } from 'react';
import { Popover } from 'flowbite-react';
import { HiQuestionMarkCircle } from 'react-icons/hi';

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
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
        aria-label="Ayuda"
      >
        <HiQuestionMarkCircle className="w-4 h-4" />
      </button>
    </Popover>
  );
}
