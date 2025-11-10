'use client';

import { TableHead } from './Table';
import { cn } from '@/lib/utils/cn';

export type SortDirection = 'asc' | 'desc' | null;

interface SortableTableHeadProps {
  children: React.ReactNode;
  sortKey?: string;
  currentSort?: { key: string; direction: SortDirection };
  onSort?: (key: string) => void;
  className?: string;
}

export function SortableTableHead({
  children,
  sortKey,
  currentSort,
  onSort,
  className,
}: SortableTableHeadProps) {
  if (!sortKey || !onSort) {
    return <TableHead className={className}>{children}</TableHead>;
  }

  const isActive = currentSort?.key === sortKey;
  const direction = isActive ? currentSort?.direction : null;

  const handleClick = () => {
    onSort(sortKey);
  };

  return (
    <TableHead
      className={cn('cursor-pointer select-none hover:bg-gray-100', className)}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        <span>{children}</span>
        <span className="text-gray-400">
          {direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '⇅'}
        </span>
      </div>
    </TableHead>
  );
}

