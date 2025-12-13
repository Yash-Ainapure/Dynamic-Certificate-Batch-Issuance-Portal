import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { label?: string };
export default function Button({ label, children, className = '', ...rest }: Props) {
  return (
    <button className={`px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 ${className}`} {...rest}>
      {label ?? children}
    </button>
  );
}
