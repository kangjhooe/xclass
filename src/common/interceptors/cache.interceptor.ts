import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../cache/cache.service';
import { CACHE_KEY, CACHE_TTL, CACHE_INVALIDATE } from '../decorators/cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private cacheService: CacheService,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const controller = context.getClass();

    // Check if method is cacheable
    const cacheKey = this.reflector.getAllAndOverride<string>(CACHE_KEY, [
      handler,
      controller,
    ]);

    const cacheTtl = this.reflector.getAllAndOverride<number>(CACHE_TTL, [
      handler,
      controller,
    ]);

    const invalidatePattern = this.reflector.getAllAndOverride<string>(CACHE_INVALIDATE, [
      handler,
      controller,
    ]);

    // If method should invalidate cache
    if (invalidatePattern) {
      return next.handle().pipe(
        tap(async () => {
          await this.cacheService.invalidatePattern(invalidatePattern);
        }),
      );
    }

    // If method is cacheable
    if (cacheKey) {
      // Generate cache key with request params
      const key = this.generateCacheKey(cacheKey, request);

      // Try to get from cache
      const cached = await this.cacheService.get(key);
      if (cached !== undefined) {
        return of(cached);
      }

      // Execute method and cache result
      return next.handle().pipe(
        tap(async (data) => {
          await this.cacheService.set(key, data, cacheTtl);
        }),
      );
    }

    // No caching
    return next.handle();
  }

  private generateCacheKey(baseKey: string, request: any): string {
    const params = request.params || {};
    const query = request.query || {};
    const user = request.user;

    const parts: string[] = [baseKey];

    // Add tenant ID if available
    if (user?.tenantId || user?.instansiId) {
      parts.push(`tenant:${user.tenantId || user.instansiId}`);
    }

    // Add params
    if (Object.keys(params).length > 0) {
      parts.push(`params:${JSON.stringify(params)}`);
    }

    // Add query params (only for GET requests)
    if (request.method === 'GET' && Object.keys(query).length > 0) {
      parts.push(`query:${JSON.stringify(query)}`);
    }

    return parts.join(':');
  }
}

