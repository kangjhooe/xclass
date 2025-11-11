import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';
import { TenantAccessService } from './tenant-access.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId, CurrentUserId } from '../../common/decorators/tenant.decorator';
import { ApproveAccessRequestDto } from './dto/approve-access-request.dto';
import { RejectAccessRequestDto } from './dto/reject-access-request.dto';
import { RevokeAccessDto } from './dto/revoke-access.dto';

@Controller('tenants')
@UseGuards(JwtAuthGuard, TenantGuard)
export class TenantTenantAccessController {
  constructor(private readonly tenantAccessService: TenantAccessService) {}

  @Get('access-requests')
  getRequests(@TenantId() tenantId: number) {
    return this.tenantAccessService.listTenantRequests(tenantId);
  }

  @Post('access-requests/:id/approve')
  approveRequest(
    @CurrentUserId() adminId: number,
    @TenantId() tenantId: number,
    @Param('id', ParseIntPipe) requestId: number,
    @Body() dto: ApproveAccessRequestDto,
  ) {
    return this.tenantAccessService.approveRequest(adminId, tenantId, requestId, dto);
  }

  @Post('access-requests/:id/reject')
  rejectRequest(
    @CurrentUserId() adminId: number,
    @TenantId() tenantId: number,
    @Param('id', ParseIntPipe) requestId: number,
    @Body() dto: RejectAccessRequestDto,
  ) {
    return this.tenantAccessService.rejectRequest(adminId, tenantId, requestId, dto);
  }

  @Post('access-grants/:id/revoke')
  revokeGrant(
    @CurrentUserId() adminId: number,
    @TenantId() tenantId: number,
    @Param('id', ParseIntPipe) requestId: number,
    @Body() dto: RevokeAccessDto,
  ) {
    return this.tenantAccessService.revokeGrant(adminId, tenantId, requestId, dto);
  }
}

