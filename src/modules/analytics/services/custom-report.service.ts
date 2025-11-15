import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomReport, ReportType, ReportFormat, ReportSchedule } from '../entities/custom-report.entity';
import { ReportExecution, ExecutionStatus } from '../entities/report-execution.entity';
import { AnalyticsService } from '../analytics.service';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CustomReportService {
  private readonly logger = new Logger(CustomReportService.name);

  constructor(
    @InjectRepository(CustomReport)
    private reportRepository: Repository<CustomReport>,
    @InjectRepository(ReportExecution)
    private executionRepository: Repository<ReportExecution>,
    private analyticsService: AnalyticsService,
  ) {}

  /**
   * Create a custom report
   */
  async createReport(
    instansiId: number,
    data: {
      name: string;
      description?: string;
      type: ReportType;
      config: any;
      format: ReportFormat;
      schedule?: ReportSchedule;
      scheduleTime?: string;
      scheduleDay?: number;
      emailRecipients?: string;
      createdBy: number;
    },
  ): Promise<CustomReport> {
    const report = this.reportRepository.create({
      instansiId,
      ...data,
      schedule: data.schedule || ReportSchedule.MANUAL,
    });

    return await this.reportRepository.save(report);
  }

  /**
   * Get all reports for a tenant
   */
  async getReports(instansiId: number, isActive?: boolean): Promise<CustomReport[]> {
    const query = this.reportRepository
      .createQueryBuilder('report')
      .where('report.instansiId = :instansiId', { instansiId });

    if (isActive !== undefined) {
      query.andWhere('report.isActive = :isActive', { isActive });
    }

    return await query.orderBy('report.createdAt', 'DESC').getMany();
  }

  /**
   * Get report by ID
   */
  async getReport(instansiId: number, id: number): Promise<CustomReport> {
    const report = await this.reportRepository.findOne({
      where: { id, instansiId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  /**
   * Update report
   */
  async updateReport(
    instansiId: number,
    id: number,
    data: Partial<CustomReport>,
  ): Promise<CustomReport> {
    const report = await this.getReport(instansiId, id);
    Object.assign(report, data);
    return await this.reportRepository.save(report);
  }

  /**
   * Delete report
   */
  async deleteReport(instansiId: number, id: number): Promise<void> {
    const report = await this.getReport(instansiId, id);
    await this.reportRepository.remove(report);
  }

  /**
   * Execute a report
   */
  async executeReport(
    instansiId: number,
    reportId: number,
    parameters?: Record<string, any>,
    executedBy?: number,
  ): Promise<ReportExecution> {
    const report = await this.getReport(instansiId, reportId);

    // Create execution record
    const execution = this.executionRepository.create({
      instansiId,
      reportId,
      status: ExecutionStatus.RUNNING,
      parameters: parameters || {},
      executedBy,
      startedAt: new Date(),
    });

    await this.executionRepository.save(execution);

    try {
      // Get data based on report type
      const data = await this.getReportData(instansiId, report, parameters);

      // Generate file based on format
      const filePath = await this.generateReportFile(report, data);

      // Update execution
      execution.status = ExecutionStatus.COMPLETED;
      execution.filePath = filePath;
      execution.completedAt = new Date();
      execution.recordCount = Array.isArray(data) ? data.length : 1;

      // Update report
      report.lastRunAt = new Date();
      report.lastRunResult = filePath;
      await this.reportRepository.save(report);

      await this.executionRepository.save(execution);

      return execution;
    } catch (error) {
      this.logger.error(`Failed to execute report: ${error.message}`, error);
      execution.status = ExecutionStatus.FAILED;
      execution.errorMessage = error.message;
      execution.completedAt = new Date();
      await this.executionRepository.save(execution);
      throw error;
    }
  }

  /**
   * Get report data based on type
   */
  private async getReportData(
    instansiId: number,
    report: CustomReport,
    parameters?: Record<string, any>,
  ): Promise<any> {
    const filters = {
      instansiId,
      ...report.config.filters,
      ...parameters,
    };

    switch (report.type) {
      case ReportType.STUDENTS:
        return await this.analyticsService.getStudentsAnalytics(filters);
      case ReportType.TEACHERS:
        return await this.analyticsService.getTeachersAnalytics(filters);
      case ReportType.ATTENDANCE:
        return await this.analyticsService.getAttendanceAnalytics(filters);
      case ReportType.GRADES:
        return await this.analyticsService.getGradesAnalytics(filters);
      default:
        throw new Error(`Unsupported report type: ${report.type}`);
    }
  }

  /**
   * Generate report file
   */
  private async generateReportFile(report: CustomReport, data: any): Promise<string> {
    const outputDir = path.join(process.cwd(), 'storage', 'reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `${report.name}_${Date.now()}.${report.format}`;
    const filePath = path.join(outputDir, fileName);

    switch (report.format) {
      case ReportFormat.EXCEL:
        await this.generateExcelReport(report, data, filePath);
        break;
      case ReportFormat.PDF:
        await this.generatePdfReport(report, data, filePath);
        break;
      case ReportFormat.CSV:
        await this.generateCsvReport(report, data, filePath);
        break;
      case ReportFormat.JSON:
        await this.generateJsonReport(report, data, filePath);
        break;
      default:
        throw new Error(`Unsupported format: ${report.format}`);
    }

    return filePath;
  }

  /**
   * Generate Excel report
   */
  private async generateExcelReport(report: CustomReport, data: any, filePath: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(report.name);

    // Add headers
    if (report.config.columns && Array.isArray(data)) {
      worksheet.columns = report.config.columns.map((col) => ({ header: col, key: col }));
      data.forEach((row) => {
        worksheet.addRow(row);
      });
    } else {
      // Simple data structure
      worksheet.addRow(['Data']);
      worksheet.addRow([JSON.stringify(data, null, 2)]);
    }

    await workbook.xlsx.writeFile(filePath);
  }

  /**
   * Generate PDF report
   */
  private async generatePdfReport(report: CustomReport, data: any, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      doc.fontSize(20).text(report.name, { align: 'center' });
      doc.moveDown();

      if (report.description) {
        doc.fontSize(12).text(report.description);
        doc.moveDown();
      }

      doc.fontSize(10).text(JSON.stringify(data, null, 2));

      doc.end();

      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

  /**
   * Generate CSV report
   */
  private async generateCsvReport(report: CustomReport, data: any, filePath: string): Promise<void> {
    let csv = '';

    if (report.config.columns && Array.isArray(data)) {
      // Headers
      csv += report.config.columns.join(',') + '\n';

      // Data rows
      data.forEach((row) => {
        csv += report.config.columns.map((col) => row[col] || '').join(',') + '\n';
      });
    } else {
      csv = JSON.stringify(data);
    }

    fs.writeFileSync(filePath, csv);
  }

  /**
   * Generate JSON report
   */
  private async generateJsonReport(report: CustomReport, data: any, filePath: string): Promise<void> {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(
    instansiId: number,
    reportId?: number,
  ): Promise<ReportExecution[]> {
    const query = this.executionRepository
      .createQueryBuilder('execution')
      .where('execution.instansiId = :instansiId', { instansiId });

    if (reportId) {
      query.andWhere('execution.reportId = :reportId', { reportId });
    }

    return await query
      .orderBy('execution.createdAt', 'DESC')
      .take(50)
      .getMany();
  }
}

