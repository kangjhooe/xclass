import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // Enable CORS
    app.enableCors({
      origin: true, // Allow all origins in development
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
    });
    
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // Route root sebelum global prefix
    app.getHttpAdapter().get('/', (req, res) => {
      res.json({
        message: 'CLASS - School Management System API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          api: '/api',
          docs: '/api/docs',
          auth: '/api/auth',
          admin: '/api/admin',
        },
        note: 'Ini adalah backend API. Untuk mengakses frontend, pastikan Next.js berjalan di port 3001 (http://localhost:3001)',
      });
    });

    app.setGlobalPrefix('api');

    // Swagger Setup
    const config = new DocumentBuilder()
      .setTitle('CLASS API')
      .setDescription('API Documentation untuk Sistem Manajemen Sekolah CLASS - School Management System')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('auth', 'Authentication endpoints')
      .addTag('admin', 'Admin endpoints (Super Admin only)')
      .addTag('tenant', 'Tenant endpoints')
      .addTag('students', 'Students management')
      .addTag('teachers', 'Teachers management')
      .addTag('classes', 'Classes management')
      .addTag('subjects', 'Subjects management')
      .addTag('schedules', 'Schedules management')
      .addTag('attendance', 'Attendance management')
      .addTag('grades', 'Grades management')
      .addTag('export-import', 'Export/Import data (Excel, CSV, PDF)')
      .addTag('storage', 'File storage and upload')
      .addTag('backup', 'Backup & Recovery')
      .addTag('system-settings', 'System settings management')
      .addTag('academic-reports', 'Academic reports and analytics')
      .addServer('http://localhost:3000', 'Development server')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(3000);
    console.log('Application is running on: http://localhost:3000');
    console.log('Swagger documentation available at: http://localhost:3000/api/docs');
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}
bootstrap();

