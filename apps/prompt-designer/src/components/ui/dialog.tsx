import React from 'react';
import { cn } from '@/lib/cn';
import { X } from '@/components/icons';

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open = false, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative z-50">
        {children}
      </div>
    </div>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative grid w-[90vw] max-w-[90vw] gap-4 border bg-background p-6 shadow-lg duration-200 sm:max-w-[800px] sm:p-8 sm:rounded-lg lg:max-w-[1200px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const DialogTitle: React.FC<DialogTitleProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h2>
  );
};