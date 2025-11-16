import { SetMetadata } from '@nestjs/common';

export const MODULE_ACCESS_KEY = 'moduleAccess';

export interface ModuleAccessOptions {
  moduleKey: string;
  permission?: 'view' | 'create' | 'update' | 'delete';
}

export const ModuleAccess = (moduleKey: string, permission: 'view' | 'create' | 'update' | 'delete' = 'view') =>
  SetMetadata(MODULE_ACCESS_KEY, { moduleKey, permission });

