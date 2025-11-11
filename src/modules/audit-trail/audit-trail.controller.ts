import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditTrailService } from './audit-trail.service';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { AuditAction, AuditStatus } from './entities/audit-trail.entity';

@ApiTags('audit-trail')
@ApiBearerAuth()
@Controller({ path: ['audit-trail', 'tenants/:tenant/audit-trail'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class AuditTrailController {
  constructor(private readonly auditTrailService: AuditTrailService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit trails with filters' })
  @ApiResponse({ status: 200, description: 'List of audit trails' })
  async findAll(
    @TenantId() tenantId: number,
    @Query('userId') userId?: number,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: number,
    @Query('action') action?: AuditAction,
    @Query('status') status?: AuditStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.auditTrailService.findAll({
      tenantId,
      userId: userId ? Number(userId) : undefined,
      entityType,
      entityId: entityId ? Number(entityId) : undefined,
      action: action,
      status: status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      search,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get audit trail statistics' })
  @ApiResponse({ status: 200, description: 'Audit trail statistics' })
  async getStatistics(
    @TenantId() tenantId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditTrailService.getStatistics(
      tenantId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get audit history for a specific entity' })
  @ApiResponse({ status: 200, description: 'Entity audit history' })
  async getEntityHistory(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: number,
    @TenantId() tenantId: number,
    @Query('limit') limit?: number,
  ) {
    return this.auditTrailService.getEntityHistory(
      tenantId,
      entityType,
      +entityId,
      limit ? Number(limit) : 50,
    );
  }

  @Get('restore/:entityType/:entityId')
  @ApiOperation({ summary: 'Get restore data for an entity' })
  @ApiResponse({ status: 200, description: 'Restore data' })
  async getRestoreData(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: number,
    @TenantId() tenantId: number,
  ) {
    const data = await this.auditTrailService.getRestoreData(
      tenantId,
      entityType,
      +entityId,
    );
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit trail by ID' })
  @ApiResponse({ status: 200, description: 'Audit trail details' })
  async findOne(
    @Param('id') id: number,
    @TenantId() tenantId: number,
  ) {
    return this.auditTrailService.findOne(+id, tenantId);
  }

  @Post('export')
  @ApiOperation({ summary: 'Export audit trails' })
  @ApiResponse({ status: 200, description: 'Exported audit trails' })
  async export(
    @TenantId() tenantId: number,
    @Body() filters: {
      userId?: number;
      entityType?: string;
      entityId?: number;
      action?: AuditAction | AuditAction[];
      status?: AuditStatus;
      startDate?: string;
      endDate?: string;
    },
  ) {
    return this.auditTrailService.export({
      tenantId,
      ...filters,
      userId: filters.userId,
      entityType: filters.entityType,
      entityId: filters.entityId,
      action: filters.action,
      status: filters.status,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    });
  }
}

