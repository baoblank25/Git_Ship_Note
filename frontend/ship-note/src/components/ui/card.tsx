import * as React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = '', ...props }: CardProps) {
  return (
    <div
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    />
  );
}

export function CardTitle({ className = '', ...props }: CardProps) {
  return (
    <h3
      className={`text-slate-900 dark:text-slate-100 ${className}`}
      {...props}
    />
  );
}

export function CardDescription({ className = '', ...props }: CardProps) {
  return (
    <p
      className={`text-sm text-slate-500 dark:text-slate-400 ${className}`}
      {...props}
    />
  );
}

export function CardContent({ className = '', ...props }: CardProps) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props} />
  );
}
