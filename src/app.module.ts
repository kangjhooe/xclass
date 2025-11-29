import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as fs from 'fs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { ClassesModule } from './modules/classes/classes.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { CurriculumModule } from './modules/curriculum/curriculum.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { GradesModule } from './modules/grades/grades.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { ExamsModule } from './modules/exams/exams.module';
import { LibraryModule } from './modules/library/library.module';
import { PpdbModule } from './modules/ppdb/ppdb.module';
import { FinanceModule } from './modules/finance/finance.module';
import { CorrespondenceModule } from './modules/correspondence/correspondence.module';
import { HrModule } from './modules/hr/hr.module';
import { CafeteriaModule } from './modules/cafeteria/cafeteria.module';
import { AcademicYearModule } from './modules/academic-year/academic-year.module';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { AlumniModule } from './modules/alumni/alumni.module';
import { ExtracurricularModule } from './modules/extracurricular/extracurricular.module';
import { EventsModule } from './modules/events/events.module';
import { GradeWeightModule } from './modules/grade-weight/grade-weight.module';
import { PromotionModule } from './modules/promotion/promotion.module';
import { CounselingModule } from './modules/counseling/counseling.module';
import { DisciplineModule } from './modules/discipline/discipline.module';
import { HealthModule } from './modules/health/health.module';
import { TransportationModule } from './modules/transportation/transportation.module';
import { FacilityModule } from './modules/facility/facility.module';
import { InfrastructureModule } from './modules/infrastructure/infrastructure.module';
import { GuestBookModule } from './modules/guest-book/guest-book.module';
import { GraduationModule } from './modules/graduation/graduation.module';
import { MessageModule } from './modules/message/message.module';
import { ELearningModule } from './modules/elearning/elearning.module';
import { StudentTransferModule } from './modules/student-transfer/student-transfer.module';
import { StudentRegistryModule } from './modules/student-registry/student-registry.module';
import { TeacherBranchModule } from './modules/teacher-branch/teacher-branch.module';
import { AcademicReportsModule } from './modules/academic-reports/academic-reports.module';
import { DataPokokModule } from './modules/data-pokok/data-pokok.module';
import { CardManagementModule } from './modules/card-management/card-management.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { StudentPortalModule } from './modules/student-portal/student-portal.module';
import { MobileApiModule } from './modules/mobile-api/mobile-api.module';
import { UsersModule } from './modules/users/users.module';
import { AdminModule } from './modules/admin/admin.module';
import { PublicPageModule } from './modules/public-page/public-page.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportGeneratorModule } from './modules/report-generator/report-generator.module';
import { IntegrationApiModule } from './modules/integration-api/integration-api.module';
import { SystemSettingsModule } from './modules/system-settings/system-settings.module';
import { BackupModule } from './modules/backup/backup.module';
import { TenantFeaturesModule } from './modules/tenant-features/tenant-features.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { StorageModule } from './modules/storage/storage.module';
import { ExportImportModule } from './modules/export-import/export-import.module';
import { NpsnChangeRequestModule } from './modules/npsn-change-request/npsn-change-request.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ReportBuilderModule } from './modules/report-builder/report-builder.module';
import { AuditTrailModule } from './modules/audit-trail/audit-trail.module';
import { TenantAccessModule } from './modules/tenant-access/tenant-access.module';
import { WilayahIndonesiaModule } from './modules/wilayah-indonesia/wilayah-indonesia.module';
import { SuperAdminAnnouncementModule } from './modules/super-admin-announcement/super-admin-announcement.module';
import { CacheModule } from './common/cache/cache.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

const resolvedNodeEnv = process.env.NODE_ENV?.trim() || 'development';
const envFileCandidates = [
  `.env.${resolvedNodeEnv}.local`,
  `.env.${resolvedNodeEnv}`,
  '.env.local',
  '.env',
];
const existingEnvFiles = envFileCandidates.filter((filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
});

@Module({
  imports: [
    CacheModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: existingEnvFiles.length > 0 ? existingEnvFiles : undefined,
      expandVariables: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: 60000, // 1 minute
            limit: configService.get<number>('THROTTLE_LIMIT') || 100, // 100 requests per minute
          },
          {
            name: 'medium',
            ttl: 600000, // 10 minutes
            limit: configService.get<number>('THROTTLE_LIMIT_MEDIUM') || 1000, // 1000 requests per 10 minutes
          },
          {
            name: 'long',
            ttl: 3600000, // 1 hour
            limit: configService.get<number>('THROTTLE_LIMIT_LONG') || 10000, // 10000 requests per hour
          },
        ],
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const port = configService.get<string>('DB_PORT');
        const host = configService.get<string>('DB_HOST') || '127.0.0.1';
        // Convert 'localhost' to '127.0.0.1' to avoid MariaDB connection issues
        const dbHost = host === 'localhost' ? '127.0.0.1' : host;
        
        const dbConfig = {
          type: 'mysql' as const,
          host: dbHost,
          port: port ? parseInt(port, 10) : 3306,
          username: configService.get<string>('DB_USERNAME') || 'root',
          password: configService.get<string>('DB_PASSWORD') || '',
          database: configService.get<string>('DB_DATABASE') || 'class',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get<string>('NODE_ENV') === 'development',
          logging: configService.get<string>('NODE_ENV') === 'development',
          retryAttempts: 5,
          retryDelay: 3000,
          connectTimeout: 10000,
          acquireTimeout: 10000,
          timeout: 10000,
        };

        // Log configuration in development
        if (configService.get<string>('NODE_ENV') === 'development') {
          console.log('📊 Database Configuration:');
          console.log(`   Host: ${dbConfig.host}`);
          console.log(`   Port: ${dbConfig.port}`);
          console.log(`   Database: ${dbConfig.database}`);
          console.log(`   User: ${dbConfig.username}`);
        }

        return dbConfig;
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AdminModule,
    PublicPageModule,
    StudentsModule,
    TeachersModule,
    ClassesModule,
    SubjectsModule,
    CurriculumModule,
    SchedulesModule,
    AttendanceModule,
    GradesModule,
    AuthModule,
    TenantModule,
    ExamsModule,
    LibraryModule,
    PpdbModule,
    FinanceModule,
    CorrespondenceModule,
    HrModule,
    CafeteriaModule,
    AcademicYearModule,
    AnnouncementModule,
    AlumniModule,
    ExtracurricularModule,
    EventsModule,
    GradeWeightModule,
    PromotionModule,
    CounselingModule,
    DisciplineModule,
    HealthModule,
    TransportationModule,
    FacilityModule,
    InfrastructureModule,
    GuestBookModule,
    GraduationModule,
    MessageModule,
    ELearningModule,
    StudentTransferModule,
    StudentRegistryModule,
    TeacherBranchModule,
    AcademicReportsModule,
    DataPokokModule,
    CardManagementModule,
    ActivityLogsModule,
    StudentPortalModule,
    MobileApiModule,
    NotificationsModule,
    ReportGeneratorModule,
    IntegrationApiModule,
    SystemSettingsModule,
    BackupModule,
    TenantFeaturesModule,
    SubscriptionModule,
    StorageModule,
    ExportImportModule,
    NpsnChangeRequestModule,
    AnalyticsModule,
    ReportBuilderModule,
    AuditTrailModule,
    TenantAccessModule,
    WilayahIndonesiaModule,
    SuperAdminAnnouncementModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TenantMiddleware,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*');
  }
}
