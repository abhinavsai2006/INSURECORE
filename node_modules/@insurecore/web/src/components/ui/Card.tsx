import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
