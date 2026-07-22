import React, { useState } from 'react';

export const AccordionItem: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-outline-variant/30 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-right font-label-md text-on-surface"
      >
        <span>{title}</span>
        <span className="material-symbols-outlined">{isOpen ? 'expand_less' : 'expand_more'}</span>
      </button>
      {isOpen && <div className="mt-2 text-body-md text-on-surface-variant">{children}</div>}
    </div>
  );
};
