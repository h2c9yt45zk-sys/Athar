import React from 'react';

export const Alert: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`p-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface ${className}`}>
      {children}
    </div>
  );
};
