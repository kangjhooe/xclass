import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache:key';
export const CACHE_TTL = 'cache:ttl';
export const CACHE_INVALIDATE = 'cache:invalidate';

/**
 * Decorator to cache method result
 */
export const Cacheable = (key?: string, ttl?: number) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY, key || `${target.constructor.name}:${propertyKey}`)(target, propertyKey, descriptor);
    if (ttl) {
      SetMetadata(CACHE_TTL, ttl)(target, propertyKey, descriptor);
    }
  };
};

/**
 * Decorator to invalidate cache after method execution
 */
export const CacheInvalidate = (pattern: string) => {
  return SetMetadata(CACHE_INVALIDATE, pattern);
};

