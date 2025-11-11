import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditTrailService } from './audit-trail.service';
import { AuditAction, AuditStatus } from './entities/audit-trail.entity';

@Injectable()
export class AuditTrailInterceptor implements NestInterceptor {
  constructor(private auditTrailService: AuditTrailService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, query, user } = request;

    // Skip if no user (public endpoints)
    if (!user) {
      return next.handle();
    }

    const startTime = Date.now();
    const tenantId = user.tenantId || user.instansiId;
    const userId = user.userId || user.id;

    return next.handle().pipe(
      tap({
        next: async (data) => {
          // Determine action from HTTP method
          let action: AuditAction;
          let entityType: string | undefined;
          let entityId: number | undefined;

          if (method === 'POST') {
            action = AuditAction.CREATE;
          } else if (method === 'PUT' || method === 'PATCH') {
            action = AuditAction.UPDATE;
          } else if (method === 'DELETE') {
            action = AuditAction.DELETE;
          } else {
            return; // Skip GET requests
          }

          // Extract entity type from URL
          const urlParts = url.split('/').filter(Boolean);
          const apiIndex = urlParts.indexOf('api');
          if (apiIndex >= 0 && apiIndex < urlParts.length - 1) {
            entityType = urlParts[apiIndex + 1];
            // Check if there's an ID
            if (apiIndex + 2 < urlParts.length && !isNaN(Number(urlParts[apiIndex + 2]))) {
              entityId = Number(urlParts[apiIndex + 2]);
            } else if (params?.id) {
              entityId = Number(params.id);
            }
          }

          if (!entityType) {
            return; // Skip if we can't determine entity type
          }

          const duration = Date.now() - startTime;

          // Create audit trail
          try {
            await this.auditTrailService.create({
              tenantId,
              userId,
              userName: user.name || user.email || `User ${userId}`,
              entityType: entityType.charAt(0).toUpperCase() + entityType.slice(1),
              entityId,
              action,
              status: AuditStatus.SUCCESS,
              metadata: {
                ipAddress: request.ip || request.connection?.remoteAddress,
                userAgent: request.headers['user-agent'],
                endpoint: url,
                method,
                duration,
                requestBody: method !== 'GET' ? body : undefined,
                queryParams: Object.keys(query).length > 0 ? query : undefined,
              },
            });
          } catch (error) {
            // Don't fail the request if audit trail fails
            console.error('Failed to create audit trail:', error);
          }
        },
        error: async (error) => {
          const duration = Date.now() - startTime;
          const urlParts = url.split('/').filter(Boolean);
          const apiIndex = urlParts.indexOf('api');
          const entityType = apiIndex >= 0 && apiIndex < urlParts.length - 1
            ? urlParts[apiIndex + 1]
            : undefined;

          if (entityType) {
            try {
              await this.auditTrailService.create({
                tenantId,
                userId,
                userName: user.name || user.email || `User ${userId}`,
                entityType: entityType.charAt(0).toUpperCase() + entityType.slice(1),
                action: method === 'POST' ? AuditAction.CREATE
                  : method === 'PUT' || method === 'PATCH' ? AuditAction.UPDATE
                  : method === 'DELETE' ? AuditAction.DELETE
                  : AuditAction.UPDATE,
                status: AuditStatus.FAILED,
                metadata: {
                  ipAddress: request.ip || request.connection?.remoteAddress,
                  userAgent: request.headers['user-agent'],
                  endpoint: url,
                  method,
                  duration,
                  errorMessage: error.message,
                },
              });
            } catch (auditError) {
              console.error('Failed to create audit trail for error:', auditError);
            }
          }
        },
      }),
    );
  }
}

