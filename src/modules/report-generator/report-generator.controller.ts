import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReportGeneratorService } from './report-generator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ReportFormat } from './entities/report-template.entity';
import { ScheduleFrequency, ScheduleStatus } from './entities/scheduled-report.entity';

@Controller('report-generator')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ReportGeneratorController {
  constructor(private readonly reportGeneratorService: ReportGeneratorService) {}

  @Post('generate/:templateId')
  async generateReport(
    @Param('templateId') templateId: number,
    @TenantId() instansiId: number,
    @Body() body: {
      parameters: Record<string, any>;
      format?: ReportFormat;
    },
  ) {
    return this.reportGeneratorService.generateReport(
      +templateId,
      instansiId,
      body.parameters,
      body.format || ReportFormat.PDF,
    );
  }

  @Post('templates')
  async createTemplate(
    @TenantId() instansiId: number,
    @Body() body: {
      name: string;
      description: string;
      category: string;
      query: string;
      format: ReportFormat;
      parameters?: Record<string, any>;
      template?: string;
    },
  ) {
    return this.reportGeneratorService.createTemplate(
      instansiId,
      body.name,
      body.description,
      body.category,
      body.query,
      body.format,
      body.parameters,
      body.template,
    );
  }

  @Get('templates')
  async getTemplates(
    @TenantId() instansiId: number,
    @Query('category') category?: string,
  ) {
    return this.reportGeneratorService.getTemplates(instansiId, category);
  }

  @Post('scheduled')
  async createScheduledReport(
    @TenantId() instansiId: number,
    @Body() body: {
      templateId: number;
      name: string;
      frequency: ScheduleFrequency;
      scheduleConfig: Record<string, any>;
      parameters: Record<string, any>;
      recipients: string[];
    },
  ) {
    return this.reportGeneratorService.createScheduledReport(
      instansiId,
      body.templateId,
      body.name,
      body.frequency,
      body.scheduleConfig,
      body.parameters,
      body.recipients,
    );
  }

  @Get('scheduled')
  async getScheduledReports(
    @TenantId() instansiId: number,
    @Query('status') status?: ScheduleStatus,
  ) {
    return this.reportGeneratorService.getScheduledReports(instansiId, status);
  }

  @Post('scheduled/:id/run')
  async runScheduledReport(
    @Param('id') id: number,
    @TenantId() instansiId: number,
  ) {
    return this.reportGeneratorService.runScheduledReport(+id, instansiId);
  }
}

