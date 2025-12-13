import React from 'react';

export default function Section({ title, children, className = '' }: { title?: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 font-medium">
          {title}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
