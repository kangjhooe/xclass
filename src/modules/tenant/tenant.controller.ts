import { Controller, Get, Put, Param, Body, UseGuards, UnauthorizedException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { Tenant } from './entities/tenant.entity';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  findAll() {
    return this.tenantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(+id);
  }

  @Get('npsn/:npsn')
  findByNpsn(@Param('npsn') npsn: string) {
    return this.tenantService.findByNpsn(npsn);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  update(
    @Param('id') id: string,
    @TenantId() tenantId: number,
    @Body() updateData: Partial<Tenant>,
  ) {
    // Ensure tenant can only update their own profile
    if (+id !== tenantId) {
      throw new UnauthorizedException('You can only update your own tenant profile');
    }
    return this.tenantService.update(+id, updateData);
  }
}
