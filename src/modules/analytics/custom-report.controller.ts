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
  UsePipes,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { CustomReportService } from './services/custom-report.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ReportType, ReportFormat, ReportSchedule } from './entities/custom-report.entity';

@Controller('analytics/custom-reports')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CustomReportController {
  constructor(private readonly reportService: CustomReportService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createReport(
    @Request() req,
    @TenantId() instansiId: number,
    @Body() body: {
      name: string;
      description?: string;
      type: ReportType;
      config: any;
      format: ReportFormat;
      schedule?: ReportSchedule;
      scheduleTime?: string;
      scheduleDay?: number;
      emailRecipients?: string;
    },
  ) {
    return this.reportService.createReport(instansiId, {
      ...body,
      createdBy: req.user.userId,
    });
  }

  @Get()
  async getReports(
    @TenantId() instansiId: number,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.reportService.getReports(instansiId, isActive === true);
  }

  @Get(':id')
  async getReport(@TenantId() instansiId: number, @Param('id') id: number) {
    return this.reportService.getReport(instansiId, id);
  }

  @Put(':id')
  async updateReport(
    @TenantId() instansiId: number,
    @Param('id') id: number,
    @Body() body: Partial<any>,
  ) {
    return this.reportService.updateReport(instansiId, id, body);
  }

  @Delete(':id')
  async deleteReport(@TenantId() instansiId: number, @Param('id') id: number) {
    await this.reportService.deleteReport(instansiId, id);
    return { success: true };
  }

  @Post(':id/execute')
  @UsePipes(new ValidationPipe({ transform: true }))
  async executeReport(
    @Request() req,
    @TenantId() instansiId: number,
    @Param('id') id: number,
    @Body() body?: { parameters?: Record<string, any> },
  ) {
    return this.reportService.executeReport(
      instansiId,
      id,
      body?.parameters,
      req.user.userId,
    );
  }

  @Get(':id/executions')
  async getExecutionHistory(
    @TenantId() instansiId: number,
    @Param('id') id: number,
  ) {
    return this.reportService.getExecutionHistory(instansiId, id);
  }
}

