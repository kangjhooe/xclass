import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Tenant } from '../tenant/entities/tenant.entity';
import { User } from '../users/entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/recent-tenants')
  getRecentTenants(@Query('limit') limit?: number) {
    return this.adminService.getRecentTenants(limit ? +limit : 5);
  }

  @Get('dashboard/recent-admin-users')
  getRecentAdminUsers(@Query('limit') limit?: number) {
    return this.adminService.getRecentAdminUsers(limit ? +limit : 5);
  }

  @Get('tenants')
  getAllTenants(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getAllTenants(
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Get('tenants/:id')
  getTenantById(@Param('id') id: string) {
    return this.adminService.getTenantById(+id);
  }

  @Post('tenants')
  createTenant(@Body() tenantData: Partial<Tenant>) {
    return this.adminService.createTenant(tenantData);
  }

  @Put('tenants/:id')
  updateTenant(@Param('id') id: string, @Body() tenantData: Partial<Tenant>) {
    return this.adminService.updateTenant(+id, tenantData);
  }

  @Post('tenants/:id/activate')
  activateTenant(@Param('id') id: string) {
    return this.adminService.activateTenant(+id);
  }

  @Post('tenants/:id/deactivate')
  deactivateTenant(@Param('id') id: string) {
    return this.adminService.deactivateTenant(+id);
  }

  @Delete('tenants/:id')
  deleteTenant(@Param('id') id: string) {
    return this.adminService.deleteTenant(+id);
  }

  @Get('users')
  getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
  ) {
    return this.adminService.getAllUsers(
      page ? +page : 1,
      limit ? +limit : 20,
      role,
    );
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(+id);
  }

  @Post('users')
  createSuperAdminUser(@Body() userData: { name: string; email: string; password: string; phone?: string }) {
    return this.adminService.createSuperAdminUser(userData);
  }

  @Put('users/:id')
  updateSuperAdminUser(
    @Param('id') id: string,
    @Body() userData: Partial<{ name: string; email: string; password: string; phone: string; isActive: boolean }>,
  ) {
    return this.adminService.updateSuperAdminUser(+id, userData);
  }

  @Delete('users/:id')
  deleteSuperAdminUser(@Param('id') id: string) {
    return this.adminService.deleteSuperAdminUser(+id);
  }

  @Post('users/:id/activate')
  activateUser(@Param('id') id: string) {
    return this.adminService.activateUser(+id);
  }

  @Post('users/:id/deactivate')
  deactivateUser(@Param('id') id: string) {
    return this.adminService.deactivateUser(+id);
  }
}

