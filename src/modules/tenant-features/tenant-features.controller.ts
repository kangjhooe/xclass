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
import { TenantFeaturesService } from './tenant-features.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantFeature } from './entities/tenant-feature.entity';
import { TenantModule } from './entities/tenant-module.entity';

@Controller('admin/tenant-features')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class TenantFeaturesController {
  constructor(private readonly tenantFeaturesService: TenantFeaturesService) {}

  // Features endpoints
  @Get('tenants/:tenantId/features')
  getTenantFeatures(@Param('tenantId') tenantId: string) {
    return this.tenantFeaturesService.getTenantFeatures(+tenantId);
  }

  @Get('tenants/:tenantId/features/:featureKey')
  getTenantFeature(
    @Param('tenantId') tenantId: string,
    @Param('featureKey') featureKey: string,
  ) {
    return this.tenantFeaturesService.getTenantFeature(+tenantId, featureKey);
  }

  @Post('tenants/:tenantId/features')
  createTenantFeature(
    @Param('tenantId') tenantId: string,
    @Body() featureData: Partial<TenantFeature>,
  ) {
    return this.tenantFeaturesService.createTenantFeature(
      +tenantId,
      featureData,
    );
  }

  @Put('tenants/:tenantId/features/:featureKey')
  updateTenantFeature(
    @Param('tenantId') tenantId: string,
    @Param('featureKey') featureKey: string,
    @Body() updateData: Partial<TenantFeature>,
  ) {
    return this.tenantFeaturesService.updateTenantFeature(
      +tenantId,
      featureKey,
      updateData,
    );
  }

  @Post('tenants/:tenantId/features/:featureKey/toggle')
  toggleTenantFeature(
    @Param('tenantId') tenantId: string,
    @Param('featureKey') featureKey: string,
  ) {
    return this.tenantFeaturesService.toggleTenantFeature(+tenantId, featureKey);
  }

  @Post('tenants/:tenantId/features/bulk-enable')
  enableFeaturesForTenant(
    @Param('tenantId') tenantId: string,
    @Body() body: { featureKeys: string[] },
  ) {
    return this.tenantFeaturesService.enableFeaturesForTenant(
      +tenantId,
      body.featureKeys,
    );
  }

  @Delete('tenants/:tenantId/features/:featureKey')
  deleteTenantFeature(
    @Param('tenantId') tenantId: string,
    @Param('featureKey') featureKey: string,
  ) {
    return this.tenantFeaturesService.deleteTenantFeature(+tenantId, featureKey);
  }

  // Modules endpoints
  @Get('tenants/:tenantId/modules')
  getTenantModules(@Param('tenantId') tenantId: string) {
    return this.tenantFeaturesService.getTenantModules(+tenantId);
  }

  @Get('tenants/:tenantId/modules/:moduleKey')
  getTenantModule(
    @Param('tenantId') tenantId: string,
    @Param('moduleKey') moduleKey: string,
  ) {
    return this.tenantFeaturesService.getTenantModule(+tenantId, moduleKey);
  }

  @Post('tenants/:tenantId/modules')
  createTenantModule(
    @Param('tenantId') tenantId: string,
    @Body() moduleData: Partial<TenantModule>,
  ) {
    return this.tenantFeaturesService.createTenantModule(+tenantId, moduleData);
  }

  @Put('tenants/:tenantId/modules/:moduleKey')
  updateTenantModule(
    @Param('tenantId') tenantId: string,
    @Param('moduleKey') moduleKey: string,
    @Body() updateData: Partial<TenantModule>,
  ) {
    return this.tenantFeaturesService.updateTenantModule(
      +tenantId,
      moduleKey,
      updateData,
    );
  }

  @Post('tenants/:tenantId/modules/:moduleKey/toggle')
  toggleTenantModule(
    @Param('tenantId') tenantId: string,
    @Param('moduleKey') moduleKey: string,
  ) {
    return this.tenantFeaturesService.toggleTenantModule(+tenantId, moduleKey);
  }

  @Post('tenants/:tenantId/modules/bulk-enable')
  enableModulesForTenant(
    @Param('tenantId') tenantId: string,
    @Body() body: { moduleKeys: string[] },
  ) {
    return this.tenantFeaturesService.enableModulesForTenant(
      +tenantId,
      body.moduleKeys,
    );
  }

  @Delete('tenants/:tenantId/modules/:moduleKey')
  deleteTenantModule(
    @Param('tenantId') tenantId: string,
    @Param('moduleKey') moduleKey: string,
  ) {
    return this.tenantFeaturesService.deleteTenantModule(+tenantId, moduleKey);
  }
}

