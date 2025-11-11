import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TenantAccessService } from './tenant-access.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateAccessRequestDto } from './dto/create-access-request.dto';

@Controller('admin/tenant-access')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class AdminTenantAccessController {
  constructor(private readonly tenantAccessService: TenantAccessService) {}

  @Get('requests')
  getRequests(@Req() req: Request) {
    const user = req.user as any;
    return this.tenantAccessService.listSuperAdminRequests(user.userId || user.id);
  }

  @Get('grants')
  getGrants(@Req() req: Request) {
    const user = req.user as any;
    return this.tenantAccessService.getActiveGrants(user.userId || user.id);
  }

  @Post('requests')
  createRequest(@Req() req: Request, @Body() dto: CreateAccessRequestDto) {
    const user = req.user as any;
    return this.tenantAccessService.requestAccess(user.userId || user.id, dto);
  }

  @Post('requests/:id/cancel')
  cancelRequest(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = req.user as any;
    return this.tenantAccessService.cancelRequest(user.userId || user.id, id);
  }
}

