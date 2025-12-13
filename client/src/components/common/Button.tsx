import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger';
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { label?: string; variant?: Variant };

export default function Button({ label, children, className = '', variant = 'primary', ...rest }: Props) {
  const base = 'px-3 py-2 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900';
  const styles: Record<Variant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400 dark:bg-red-500 dark:hover:bg-red-600',
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {label ?? children}
    </button>
  );
}
