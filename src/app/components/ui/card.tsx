import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`bg-surface border border-outline-variant/30 rounded-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
};
