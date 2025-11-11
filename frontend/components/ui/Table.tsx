import { cn } from '@/lib/utils/cn';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('min-w-full divide-y divide-gray-200', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }: TableProps) {
  return (
    <thead className={cn('bg-gray-50', className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }: TableProps) {
  return (
    <tbody className={cn('bg-white divide-y divide-gray-200', className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={cn('hover:bg-gray-50', className)}>
      {children}
    </tr>
  );
}

interface TableHeadProps extends TableProps {
  onClick?: () => void;
}

export function TableHead({ children, className, onClick }: TableHeadProps) {
  return (
    <th onClick={onClick} className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider', className)}>
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
    <td colSpan={colSpan} title={title} className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', className)}>
      {children}
    </td>
  );
}

