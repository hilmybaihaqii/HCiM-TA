'use client';

import React from 'react';

interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function AdminTable<T>({ columns, data, isLoading, emptyMessage = "No records found." }: AdminTableProps<T>) {
  // Menyiapkan 5 baris kosong untuk efek skeleton
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="w-full overflow-hidden border border-foreground/5 rounded-3xl bg-surface-white/40 backdrop-blur-md shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-foreground/5 bg-foreground/2">
              {columns.map((col, i) => (
                <th key={i} className={`p-4 text-[10px] font-mono uppercase tracking-wider text-muted whitespace-nowrap ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5 text-sm">
            {isLoading ? (
              /* --- Skeleton Loading State --- */
              skeletonRows.map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`p-4 ${col.className || ''}`}>
                      <div className="h-4 bg-foreground/10 rounded animate-pulse w-3/4 max-w-200px" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              /* --- Empty State --- */
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-muted font-mono text-xs">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              /* --- Data State --- */
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-foreground/2 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`p-4 ${col.className || ''}`}>
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}