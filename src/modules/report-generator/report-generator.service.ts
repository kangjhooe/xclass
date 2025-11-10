import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReportTemplate, ReportFormat } from './entities/report-template.entity';
import { ScheduledReport, ScheduleFrequency, ScheduleStatus } from './entities/scheduled-report.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReportGeneratorService {
  constructor(
    @InjectRepository(ReportTemplate)
    private templateRepository: Repository<ReportTemplate>,
    @InjectRepository(ScheduledReport)
    private scheduledReportRepository: Repository<ScheduledReport>,
    private dataSource: DataSource,
    private notificationsService: NotificationsService,
  ) {}

  async generateReport(
    templateId: number,
    instansiId: number,
    parameters: Record<string, any>,
    format: ReportFormat = ReportFormat.PDF,
  ) {
    const template = await this.templateRepository.findOne({
      where: { id: templateId, instansiId, isActive: true },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    try {
      // Replace parameters in query
      let query = template.query;
      const queryParams: any[] = [];

      // Replace parameter placeholders (e.g., :instansiId, :startDate, etc.)
      if (parameters) {
        // Add instansiId to parameters if not present
        if (!parameters.instansiId) {
          parameters.instansiId = instansiId;
        }

        // Replace named parameters in SQL query
        Object.keys(parameters).forEach((key) => {
          const value = parameters[key];
          // Replace :parameterName with ? for prepared statement
          const regex = new RegExp(`:${key}\\b`, 'g');
          query = query.replace(regex, '?');
          queryParams.push(value);
        });
      } else {
        // Always include instansiId
        query = query.replace(/:instansiId\b/g, '?');
        queryParams.push(instansiId);
      }

      // Execute query
      const rawData = await this.dataSource.query(query, queryParams);

      // Process data if template has custom template
      let processedData = rawData;
      if (template.template) {
        // If template is provided, it might be a handlebars-like template
        // For now, just return raw data
        processedData = rawData;
      }

      // Format data based on report format
      const reportData = this.formatReportData(processedData, format, template);

      return {
        success: true,
        templateId,
        templateName: template.name,
        format,
        data: reportData,
        rowCount: rawData.length,
        generatedAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  private formatReportData(
    data: any[],
    format: ReportFormat,
    template: ReportTemplate,
  ): any {
    switch (format) {
      case ReportFormat.CSV:
        // Convert to CSV format
        if (data.length === 0) return '';
        const headers = Object.keys(data[0]);
        const csvRows = [
          headers.join(','),
          ...data.map((row) =>
            headers.map((header) => {
              const value = row[header];
              return typeof value === 'string' && value.includes(',')
                ? `"${value}"`
                : value;
            }).join(','),
          ),
        ];
        return csvRows.join('\n');
      case ReportFormat.PDF:
      case ReportFormat.EXCEL:
        // For PDF and Excel, return structured data
        // Actual PDF/Excel generation would require additional libraries (e.g., pdfkit, exceljs)
        return {
          headers: data.length > 0 ? Object.keys(data[0]) : [],
          rows: data,
        };
      default:
        return data;
    }
  }

  async createTemplate(
    instansiId: number,
    name: string,
    description: string,
    category: string,
    query: string,
    format: ReportFormat,
    parameters?: Record<string, any>,
    template?: string,
  ) {
    const reportTemplate = this.templateRepository.create({
      instansiId,
      name,
      description,
      category,
      query,
      format,
      parameters,
      template,
    });

    return await this.templateRepository.save(reportTemplate);
  }

  async getTemplates(instansiId: number, category?: string) {
    const query = this.templateRepository
      .createQueryBuilder('template')
      .where('template.instansiId = :instansiId', { instansiId })
      .andWhere('template.isActive = :isActive', { isActive: true });

    if (category) {
      query.andWhere('template.category = :category', { category });
    }

    return await query.orderBy('template.createdAt', 'DESC').getMany();
  }

  async createScheduledReport(
    instansiId: number,
    templateId: number,
    name: string,
    frequency: ScheduleFrequency,
    scheduleConfig: Record<string, any>,
    parameters: Record<string, any>,
    recipients: string[],
  ) {
    const scheduledReport = this.scheduledReportRepository.create({
      instansiId,
      templateId,
      name,
      frequency,
      scheduleConfig,
      parameters,
      recipients,
      status: ScheduleStatus.ACTIVE,
      nextRunAt: this.calculateNextRun(frequency, scheduleConfig),
    });

    return await this.scheduledReportRepository.save(scheduledReport);
  }

  async getScheduledReports(instansiId: number, status?: ScheduleStatus) {
    const query = this.scheduledReportRepository
      .createQueryBuilder('scheduled')
      .where('scheduled.instansiId = :instansiId', { instansiId });

    if (status) {
      query.andWhere('scheduled.status = :status', { status });
    }

    return await query
      .leftJoinAndSelect('scheduled.template', 'template')
      .orderBy('scheduled.createdAt', 'DESC')
      .getMany();
  }

  async runScheduledReport(id: number, instansiId: number) {
    const scheduled = await this.scheduledReportRepository.findOne({
      where: { id, instansiId },
      relations: ['template'],
    });

    if (!scheduled) {
      throw new Error('Scheduled report not found');
    }

    // Generate report
    const report = await this.generateReport(
      scheduled.templateId,
      instansiId,
      scheduled.parameters,
      scheduled.template.format,
    );

    // Update last run and next run
    scheduled.lastRunAt = new Date();
    scheduled.nextRunAt = this.calculateNextRun(
      scheduled.frequency,
      scheduled.scheduleConfig,
    );
    await this.scheduledReportRepository.save(scheduled);

    // Send report to recipients via email
    if (scheduled.recipients && scheduled.recipients.length > 0) {
      try {
        const reportSubject = `Laporan: ${scheduled.template.name} - ${new Date().toLocaleDateString('id-ID')}`;
        const reportContent = this.formatReportEmailContent(report, scheduled.template);

        // Send email to all recipients
        for (const recipient of scheduled.recipients) {
          try {
            await this.notificationsService.sendEmail(
              instansiId,
              0, // System user
              recipient,
              reportSubject,
              reportContent,
            );
          } catch (emailError) {
            console.error(`Failed to send report email to ${recipient}:`, emailError.message);
            // Continue to next recipient even if one fails
          }
        }
      } catch (error) {
        console.error('Failed to send report emails:', error.message);
        // Don't throw error, just log it - report generation was successful
      }
    }

    return report;
  }

  private calculateNextRun(
    frequency: ScheduleFrequency,
    config: Record<string, any>,
  ): Date {
    const now = new Date();
    const next = new Date(now);

    switch (frequency) {
      case ScheduleFrequency.DAILY:
        next.setDate(next.getDate() + 1);
        break;
      case ScheduleFrequency.WEEKLY:
        next.setDate(next.getDate() + 7);
        break;
      case ScheduleFrequency.MONTHLY:
        next.setMonth(next.getMonth() + 1);
        break;
      case ScheduleFrequency.YEARLY:
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return next;
  }

  private formatReportEmailContent(report: any, template: ReportTemplate): string {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    let content = `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
  <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">Laporan: ${template.name}</h2>
  <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p style="margin: 5px 0;"><strong>Deskripsi:</strong> ${template.description}</p>
    <p style="margin: 5px 0;"><strong>Format:</strong> ${template.format.toUpperCase()}</p>
    <p style="margin: 5px 0;"><strong>Jumlah Data:</strong> ${report.rowCount} baris</p>
    <p style="margin: 5px 0;"><strong>Dibuat pada:</strong> ${formatDate(report.generatedAt)}</p>
  </div>
`;

    if (template.format === 'csv') {
      content += `
  <h3 style="color: #555; margin-top: 20px;">Data (CSV Format):</h3>
  <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; border: 1px solid #ddd; font-size: 12px;">${this.escapeHtml(report.data)}</pre>
`;
    } else if (template.format === 'pdf' || template.format === 'excel') {
      const rowCount = report.data?.rows?.length || 0;
      content += `
  <h3 style="color: #555; margin-top: 20px;">Data:</h3>
  <p>Laporan dalam format <strong>${template.format.toUpperCase()}</strong> telah dibuat.</p>
  <p>Total: <strong>${rowCount}</strong> baris data.</p>
  <p style="color: #666; font-style: italic;">Untuk melihat detail lengkap, silakan buka laporan di sistem.</p>
`;
    } else {
      // JSON format
      const jsonData = typeof report.data === 'string' ? report.data : JSON.stringify(report.data, null, 2);
      content += `
  <h3 style="color: #555; margin-top: 20px;">Data (JSON Format):</h3>
  <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; border: 1px solid #ddd; font-size: 12px;">${this.escapeHtml(jsonData)}</pre>
`;
    }

    content += `
  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  <p style="color: #666; font-size: 12px; text-align: center;">
    Laporan ini dibuat secara otomatis oleh sistem. Jangan membalas email ini.
  </p>
</div>
`;

    return content;
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

