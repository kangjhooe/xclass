'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { AdvancedFilter } from '../ui/AdvancedFilter';
import { SkeletonTable } from '../ui/Skeleton';
import { cn } from '@/lib/utils/cn';
import { formatDateTime } from '@/lib/utils/date';

export interface AuditTrailEntry {
  id: number;
  userId: number;
  userName: string;
  entityType: string;
  entityId?: number;
  action: string;
  status: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
    dataType?: string;
  }[];
  beforeSnapshot?: Record<string, any>;
  afterSnapshot?: Record<string, any>;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
    duration?: number;
    errorMessage?: string;
  };
  description?: string;
  reason?: string;
  createdAt: string;
}

interface AuditTrailViewerProps {
  data: AuditTrailEntry[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  onExport?: () => void;
  onViewDetails?: (entry: AuditTrailEntry) => void;
  onRestore?: (entry: AuditTrailEntry) => void;
  showRestore?: boolean;
}

export function AuditTrailViewer({
  data,
  isLoading = false,
  onLoadMore,
  onExport,
  onViewDetails,
  onRestore,
  showRestore = false,
}: AuditTrailViewerProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'restore':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <SkeletonTable rows={10} columns={7} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audit Trail</CardTitle>
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                Export
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Waktu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Entity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Changes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      Tidak ada data audit trail
                    </td>
                  </tr>
                ) : (
                  data.map((entry) => (
                    <React.Fragment key={entry.id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {formatDateTime(entry.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {entry.userName || `User ${entry.userId}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          <div>
                            <div className="font-medium">{entry.entityType}</div>
                            {entry.entityId && (
                              <div className="text-xs text-gray-500">ID: {entry.entityId}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              getActionColor(entry.action)
                            )}
                          >
                            {entry.action}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('text-sm font-medium', getStatusColor(entry.status))}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {entry.changes && entry.changes.length > 0 ? (
                            <span className="text-blue-600 dark:text-blue-400">
                              {entry.changes.length} field{entry.changes.length > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleExpand(entry.id)}
                            >
                              {expandedRows.has(entry.id) ? 'Sembunyikan' : 'Detail'}
                            </Button>
                            {onViewDetails && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewDetails(entry)}
                              >
                                View
                              </Button>
                            )}
                            {showRestore && entry.action === 'update' && onRestore && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRestore(entry)}
                                className="text-purple-600 hover:text-purple-700"
                              >
                                Restore
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedRows.has(entry.id) && (
                        <tr>
                          <td colSpan={7} className="px-4 py-4 bg-gray-50 dark:bg-gray-900">
                            <div className="space-y-4">
                              {entry.description && (
                                <div>
                                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Description
                                  </div>
                                  <div className="text-sm text-gray-900 dark:text-gray-100">
                                    {entry.description}
                                  </div>
                                </div>
                              )}
                              {entry.changes && entry.changes.length > 0 && (
                                <div>
                                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                    Field Changes
                                  </div>
                                  <div className="space-y-2">
                                    {entry.changes.map((change, idx) => (
                                      <div
                                        key={idx}
                                        className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                                      >
                                        <div className="font-medium text-sm mb-2">{change.field}</div>
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                          <div>
                                            <div className="text-gray-500 dark:text-gray-400 mb-1">Old Value</div>
                                            <div className="text-red-600 dark:text-red-400 font-mono bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                              {JSON.stringify(change.oldValue, null, 2)}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-gray-500 dark:text-gray-400 mb-1">New Value</div>
                                            <div className="text-green-600 dark:text-green-400 font-mono bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                              {JSON.stringify(change.newValue, null, 2)}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {entry.metadata && (
                                <div>
                                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                    Metadata
                                  </div>
                                  <div className="text-xs space-y-1">
                                    {entry.metadata.ipAddress && (
                                      <div>
                                        <span className="text-gray-500">IP:</span>{' '}
                                        <span className="text-gray-900 dark:text-gray-100">
                                          {entry.metadata.ipAddress}
                                        </span>
                                      </div>
                                    )}
                                    {entry.metadata.endpoint && (
                                      <div>
                                        <span className="text-gray-500">Endpoint:</span>{' '}
                                        <span className="text-gray-900 dark:text-gray-100">
                                          {entry.metadata.method} {entry.metadata.endpoint}
                                        </span>
                                      </div>
                                    )}
                                    {entry.metadata.duration && (
                                      <div>
                                        <span className="text-gray-500">Duration:</span>{' '}
                                        <span className="text-gray-900 dark:text-gray-100">
                                          {entry.metadata.duration}ms
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {onLoadMore && (
        <div className="text-center">
          <Button variant="outline" onClick={onLoadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

