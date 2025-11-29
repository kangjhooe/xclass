import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { parseFrontendUrls, normalizeOrigin } from './common/utils/frontend-url.util';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
    const frontendConfig = parseFrontendUrls(configService.get<string>('FRONTEND_URL'));
    const { primaryUrl: frontendUrl, origins: frontendOrigins } = frontendConfig;
    
    // Security headers dengan helmet
    app.use(helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", ...frontendOrigins],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      } : false, // Disable CSP in development untuk kemudahan development
      crossOriginEmbedderPolicy: false, // Disable untuk compatibility
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resources
    }));
    
    // Enable CORS dengan konfigurasi yang lebih ketat
    const devOrigins = Array.from(new Set([
      'http://localhost:3001',
      'http://localhost:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3000',
      ...frontendOrigins,
    ]));
    const allowedOrigins = nodeEnv === 'production' 
      ? frontendOrigins // Only allow configured frontend origins in production
      : devOrigins; // Allow specific origins in development

    const allowedOriginSet = new Set(
      allowedOrigins
        .map((origin) => normalizeOrigin(origin))
        .filter((origin): origin is string => Boolean(origin)),
    );
    
    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
          return callback(null, true);
        }
        
        if (nodeEnv === 'development') {
          // In development, allow all localhost origins
          if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            return callback(null, true);
          }
        }
        
        // Check if origin is in allowed list
        const normalizedOrigin = normalizeOrigin(origin);
        if (normalizedOrigin && allowedOriginSet.has(normalizedOrigin)) {
          return callback(null, true);
        }
        
        // Reject origin
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-tenant-id',
        'x-tenant-npsn',
        'x-requested-with',
        'accept',
        'origin',
        'access-control-request-method',
        'access-control-request-headers',
      ],
      exposedHeaders: ['Content-Range', 'X-Content-Range'],
      maxAge: 86400, // 24 hours
      preflightContinue: false,
      optionsSuccessStatus: 204,
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
      .addTag('counseling', 'Counseling sessions management')
      .addTag('export-import', 'Export/Import data (Excel, CSV, PDF)')
      .addTag('storage', 'File storage and upload')
      .addTag('backup', 'Backup & Recovery')
      .addTag('system-settings', 'System settings management')
      .addTag('academic-reports', 'Academic reports and analytics')
      .addServer('http://localhost:3000', 'Development server')
      .addServer(configService.get<string>('API_URL') || 'http://localhost:3000', 'Production server')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = configService.get<number>('PORT') || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
    console.log(`Environment: ${nodeEnv}`);
  } catch (error) {
    console.error('\n❌❌❌ Error starting application!\n');
    console.error('Error:', error.message);
    
    if (error.message && error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Database Connection Error:');
      console.error('   1. Make sure XAMPP MySQL service is running');
      console.error('   2. Open XAMPP Control Panel');
      console.error('   3. Click "Start" on MySQL service');
      console.error('   4. Run: node test-db-connection.js to test connection\n');
    } else if (error.message && error.message.includes('ER_ACCESS_DENIED')) {
      console.error('\n💡 Database Authentication Error:');
      console.error('   1. Check DB_USERNAME and DB_PASSWORD in .env file');
      console.error('   2. Default XAMPP: username=root, password=(empty)');
      console.error('   3. Run: node test-db-connection.js to test connection\n');
    } else if (error.message && error.message.includes('ER_BAD_DB_ERROR')) {
      console.error('\n💡 Database Not Found Error:');
      console.error('   1. Database does not exist');
      console.error('   2. Run: node create-xclass-database.js to create database\n');
    } else {
      console.error('\n💡 Check:');
      console.error('   1. .env file exists and is configured correctly');
      console.error('   2. Database is running');
      console.error('   3. Run: node test-db-connection.js to test connection');
      console.error('\nFull error:', error);
    }
    
    process.exit(1);
  }
}
bootstrap();

