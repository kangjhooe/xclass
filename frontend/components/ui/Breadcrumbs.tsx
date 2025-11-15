'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
  showHome?: boolean;
  homeHref?: string;
}

export function Breadcrumbs({
  items,
  className,
  separator,
  showHome = true,
  homeHref = '/',
}: BreadcrumbsProps) {
  const allItems = showHome
    ? [{ label: 'Beranda', href: homeHref, icon: <Home className="h-4 w-4" /> }, ...items]
    : items;

  const defaultSeparator = <ChevronRight className="h-4 w-4 text-slate-400" />;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-2 text-sm', className)}
    >
      <ol className="flex items-center space-x-2" role="list">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const Separator = separator || defaultSeparator;

          return (
            <li key={index} className="flex items-center" role="listitem">
              {index > 0 && (
                <span className="mx-2" aria-hidden="true">
                  {Separator}
                </span>
              )}
              {isLast ? (
                <span
                  className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100"
                  aria-current="page"
                >
                  {item.icon && <span className="text-slate-500">{item.icon}</span>}
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                >
                  {item.icon && <span className="text-slate-500">{item.icon}</span>}
                  {item.label}
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  {item.icon && <span className="text-slate-500">{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

