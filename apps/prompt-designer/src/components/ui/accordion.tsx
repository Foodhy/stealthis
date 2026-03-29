import React, { createContext, useContext, useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { ChevronDown } from '@/components/icons';

interface AccordionContextValue {
  openItems: string[];
  toggleItem: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | undefined>(undefined);

// New context for individual items
interface AccordionItemContextValue {
  value: string;
}
const AccordionItemContext = createContext<AccordionItemContextValue | undefined>(undefined);

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: any) => void;
  children: React.ReactNode;
}

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({
  type = 'single',
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
  ...props
}) => {
  // Normalize default value to array
  const initialValue = Array.isArray(defaultValue) ? defaultValue : (defaultValue ? [defaultValue] : []);

  const [internalValue, setInternalValue] = useState<string[]>(initialValue);

  const isControlled = controlledValue !== undefined;
  const openItems = isControlled
    ? (Array.isArray(controlledValue) ? controlledValue : (controlledValue ? [controlledValue] : []))
    : internalValue;

  const toggleItem = (itemValue: string) => {
    let newItems: string[];

    if (type === 'single') {
      newItems = openItems.includes(itemValue) ? [] : [itemValue];
    } else {
      newItems = openItems.includes(itemValue)
        ? openItems.filter(item => item !== itemValue)
        : [...openItems, itemValue];
    }

    if (!isControlled) {
      setInternalValue(newItems);
    }

    if (onValueChange) {
      onValueChange(type === 'single' ? (newItems[0] || '') : newItems);
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn("", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

export const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  children,
  className,
  ...props
}) => {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={cn("border-b", className)} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
};

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  children,
  className,
  ...props
}) => {
  const context = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);

  if (!itemContext) throw new Error("AccordionTrigger must be used within AccordionItem");

  const { value } = itemContext;
  const isOpen = context?.openItems.includes(value) || false;

  return (
    <button
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline text-left w-full",
        className
      )}
      onClick={() => context?.toggleItem(value)}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn("h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
};

export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  className,
  ...props
}) => {
  const context = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);

  if (!itemContext) throw new Error("AccordionContent must be used within AccordionItem");

  const { value } = itemContext;
  const isOpen = context?.openItems.includes(value) || false;

  if (!isOpen) return null;

  return (
    <div
      className={cn("overflow-hidden text-sm transition-all", className)}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
};