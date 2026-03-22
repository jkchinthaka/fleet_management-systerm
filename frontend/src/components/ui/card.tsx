import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export const Card = ({ children, className }: CardProps) => {
  return <div className={cn('rounded-xl bg-[var(--card)] p-5 shadow-soft', className)}>{children}</div>;
};
