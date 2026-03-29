import React from 'react';
import { cn } from '@/lib/cn';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <div
      className={cn("relative overflow-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
};