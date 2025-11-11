/**
 * Centralized chunk names for better code splitting
 */

export const ChunkNames = {
  // Vendor chunks
  VENDOR_REACT: 'vendor-react',
  VENDOR_QUERY: 'vendor-query',
  VENDOR_CHARTS: 'vendor-charts',
  VENDOR_EDITOR: 'vendor-editor',
  
  // Feature chunks
  ANALYTICS: 'analytics',
  REPORT_BUILDER: 'report-builder',
  AUDIT_TRAIL: 'audit-trail',
  FILE_PREVIEW: 'file-preview',
  CALENDAR: 'calendar',
  
  // UI chunks
  UI_COMPONENTS: 'ui-components',
  UI_FORMS: 'ui-forms',
  UI_CHARTS: 'ui-charts',
  
  // Common chunks
  COMMON_UTILS: 'common-utils',
  COMMON_HOOKS: 'common-hooks',
  COMMON_API: 'common-api',
} as const;

/**
 * Get webpack magic comment for chunk name
 */
export function getChunkNameComment(chunkName: string): string {
  return `/* webpackChunkName: "${chunkName}" */`;
}

/**
 * Create dynamic import with chunk name
 */
export function createNamedChunkImport<T>(
  importFunc: () => Promise<{ default: T }>,
  chunkName: string
): () => Promise<{ default: T }> {
  // Webpack will use the chunk name from the comment
  // This is a helper to ensure consistent naming
  return importFunc;
}

