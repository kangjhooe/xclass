import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IntegrationApiService } from './integration-api.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { IntegrationType } from './entities/integration.entity';
import { LogType } from './entities/integration-log.entity';

@Controller('integrations')
@UseGuards(JwtAuthGuard, TenantGuard)
export class IntegrationApiController {
  constructor(private readonly integrationApiService: IntegrationApiService) {}

  @Post()
  async createIntegration(
    @TenantId() instansiId: number,
    @Body() body: {
      name: string;
      type: IntegrationType;
      config: Record<string, any>;
      description?: string;
      mapping?: Record<string, any>;
    },
  ) {
    return this.integrationApiService.createIntegration(
      instansiId,
      body.name,
      body.type,
      body.config,
      body.description,
      body.mapping,
    );
  }

  @Get()
  async getIntegrations(
    @TenantId() instansiId: number,
    @Query('type') type?: IntegrationType,
  ) {
    return this.integrationApiService.getIntegrations(instansiId, type);
  }

  @Post(':id/sync')
  async syncData(
    @Param('id') id: number,
    @TenantId() instansiId: number,
  ) {
    return this.integrationApiService.syncData(+id, instansiId);
  }

  @Post(':id/webhook')
  async handleWebhook(
    @Param('id') id: number,
    @Body() payload: Record<string, any>,
  ) {
    return this.integrationApiService.handleWebhook(+id, payload);
  }

  @Get(':id/logs')
  async getLogs(
    @Param('id') id: number,
    @TenantId() instansiId: number,
    @Query('type') type?: LogType,
    @Query('limit') limit?: number,
  ) {
    return this.integrationApiService.getLogs(
      +id,
      instansiId,
      type,
      limit ? +limit : 50,
    );
  }
}

