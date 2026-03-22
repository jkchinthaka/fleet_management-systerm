import React, { useMemo, useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

type Column<T> = {
  key: keyof T;
  header: string;
  render?: (value: unknown, row: T) => React.ReactNode;
};

type Props<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  isLoading?: boolean;
  isError?: boolean;
  actions?: (row: T) => React.ReactNode;
};

export const DataTable = <T extends Record<string, unknown>>({ columns, data, pageSize = 6, isLoading, isError, actions }: Props<T>) => {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let rows = data.filter((row) =>
      Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q))
    );

    if (sortKey) {
      rows = [...rows].sort((a, b) => String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? '')));
    }

    return rows;
  }, [data, query, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card>
      {isError && (
        <div className="mb-3 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          Failed to load data. Please refresh the page or re-login.
        </div>
      )}
      <div className="mb-4 flex items-center justify-between gap-3">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter records..." />
        <div className="text-xs text-[var(--muted)]">{isLoading ? 'Loading...' : `${filtered.length} records`}</div>
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="cursor-pointer px-3 py-3"
                  onClick={() => {
                    setSortKey(col.key);
                    setPage(1);
                  }}
                >
                  {col.header}
                </th>
              ))}
              {actions && <th className="px-3 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-slate-400">
                  No records found
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-3 py-3">
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '-')}
                    </td>
                  ))}
                  {actions && <td className="px-3 py-3">{actions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Prev
        </Button>
        <span className="text-xs text-[var(--muted)]">
          {page} / {totalPages}
        </span>
        <Button variant="secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          Next
        </Button>
      </div>
    </Card>
  );
};
