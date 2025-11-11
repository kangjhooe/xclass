import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportBuilderService } from './report-builder.service';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ReportBuilderConfig } from './entities/report-builder-template.entity';

@ApiTags('report-builder')
@ApiBearerAuth()
@Controller({ path: ['report-builder', 'tenants/:tenant/report-builder'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class ReportBuilderController {
  constructor(private readonly reportBuilderService: ReportBuilderService) {}

  @Post('templates')
  @ApiOperation({ summary: 'Create a new report builder template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(
    @TenantId() instansiId: number,
    @Body() body: {
      name: string;
      description?: string;
      category: string;
      config: ReportBuilderConfig;
    },
  ) {
    return this.reportBuilderService.createTemplate(
      instansiId,
      body.name,
      body.description || '',
      body.category,
      body.config,
    );
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all report builder templates' })
  @ApiResponse({ status: 200, description: 'List of templates' })
  async getTemplates(
    @TenantId() instansiId: number,
    @Query('category') category?: string,
  ) {
    return this.reportBuilderService.getTemplates(instansiId, category);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get a report builder template by ID' })
  @ApiResponse({ status: 200, description: 'Template details' })
  async getTemplateById(
    @Param('id') id: number,
    @TenantId() instansiId: number,
  ) {
    return this.reportBuilderService.getTemplateById(+id, instansiId);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update a report builder template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  async updateTemplate(
    @Param('id') id: number,
    @TenantId() instansiId: number,
    @Body() body: Partial<{
      name: string;
      description: string;
      category: string;
      config: ReportBuilderConfig;
      isActive: boolean;
    }>,
  ) {
    return this.reportBuilderService.updateTemplate(+id, instansiId, body);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete a report builder template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  async deleteTemplate(
    @Param('id') id: number,
    @TenantId() instansiId: number,
  ) {
    await this.reportBuilderService.deleteTemplate(+id, instansiId);
    return { message: 'Template deleted successfully' };
  }

  @Post('generate/:templateId')
  @ApiOperation({ summary: 'Generate a report from a template' })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  async generateReport(
    @Param('templateId') templateId: number,
    @TenantId() instansiId: number,
    @Body() body: { parameters?: Record<string, any> },
  ) {
    return this.reportBuilderService.generateReport(
      +templateId,
      instansiId,
      body.parameters || {},
    );
  }

  @Post('preview')
  @ApiOperation({ summary: 'Preview a report configuration' })
  @ApiResponse({ status: 200, description: 'Report preview generated' })
  async previewReport(
    @TenantId() instansiId: number,
    @Body() body: {
      config: ReportBuilderConfig;
      parameters?: Record<string, any>;
    },
  ) {
    return this.reportBuilderService.previewReport(
      body.config,
      instansiId,
      body.parameters || {},
    );
  }
}

