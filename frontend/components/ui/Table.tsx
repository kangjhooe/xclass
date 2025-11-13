import { cn } from '@/lib/utils/cn';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('min-w-full divide-y divide-border', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }: TableProps) {
  return (
    <thead className={cn('bg-muted/50', className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }: TableProps) {
  return (
    <tbody className={cn('bg-background divide-y divide-border', className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={cn('hover:bg-muted/50 transition-colors', className)}>
      {children}
    </tr>
  );
}

interface TableHeadProps extends TableProps {
  onClick?: () => void;
}

export function TableHead({ children, className, onClick }: TableHeadProps) {
  return (
    <th onClick={onClick} className={cn('px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider', className)}>
      {children}
    </th>
  );
}

interface TableCellProps extends TableProps {
  colSpan?: number;
  title?: string;
}

export function TableCell({ children, className, colSpan, title }: TableCellProps) {
  return (
    <td colSpan={colSpan} title={title} className={cn('px-6 py-4 whitespace-nowrap text-sm text-foreground', className)}>
      {children}
    </td>
  );
}

