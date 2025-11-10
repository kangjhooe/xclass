import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getApiInfo(@Res() res: Response) {
    // Route ini akan menjadi /api karena global prefix
    return res.json({
      message: 'CLASS API',
      version: '1.0.0',
      documentation: '/api/docs',
      availableModules: [
        'auth',
        'admin',
        'tenant',
        'students',
        'teachers',
        'classes',
        'subjects',
        'schedules',
        'attendance',
        'grades',
        'exams',
        'library',
        'finance',
        'hr',
        'cafeteria',
        'announcement',
        'alumni',
        'extracurricular',
        'events',
        'health',
        'transportation',
        'facility',
        'guest-book',
        'graduation',
        'message',
        'elearning',
        'student-transfer',
        'academic-reports',
        'data-pokok',
        'card-management',
        'activity-logs',
        'student-portal',
        'mobile-api',
        'notifications',
        'report-generator',
        'integration-api',
        'system-settings',
        'backup',
        'tenant-features',
        'subscription',
        'storage',
        'export-import',
      ],
    });
  }

  // Removed @All('*') catch-all route karena menangkap semua route termasuk yang valid
  // NestJS akan otomatis mengembalikan 404 untuk route yang tidak ditemukan
}

