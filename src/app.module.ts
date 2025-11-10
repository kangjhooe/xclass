import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { ClassesModule } from './modules/classes/classes.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
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
import { EventModule } from './modules/event/event.module';
import { GradeWeightModule } from './modules/grade-weight/grade-weight.module';
import { PromotionModule } from './modules/promotion/promotion.module';
import { CounselingModule } from './modules/counseling/counseling.module';
import { DisciplineModule } from './modules/discipline/discipline.module';
import { HealthModule } from './modules/health/health.module';
import { TransportationModule } from './modules/transportation/transportation.module';
import { FacilityModule } from './modules/facility/facility.module';
import { GuestBookModule } from './modules/guest-book/guest-book.module';
import { GraduationModule } from './modules/graduation/graduation.module';
import { MessageModule } from './modules/message/message.module';
import { ELearningModule } from './modules/elearning/elearning.module';
import { StudentTransferModule } from './modules/student-transfer/student-transfer.module';
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
import { TenantMiddleware } from './common/middleware/tenant.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const port = configService.get<string>('DB_PORT');
        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST') || 'localhost',
          port: port ? parseInt(port, 10) : 3306,
          username: configService.get<string>('DB_USERNAME') || 'root',
          password: configService.get<string>('DB_PASSWORD') || '',
          database: configService.get<string>('DB_DATABASE') || 'class',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false, // Disabled to prevent schema sync errors
          logging: configService.get<string>('NODE_ENV') === 'development',
          retryAttempts: 3,
          retryDelay: 3000,
        };
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
    EventModule,
    GradeWeightModule,
    PromotionModule,
    CounselingModule,
    DisciplineModule,
    HealthModule,
    TransportationModule,
    FacilityModule,
    GuestBookModule,
    GraduationModule,
    MessageModule,
    ELearningModule,
    StudentTransferModule,
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
  ],
  controllers: [AppController],
  providers: [AppService, TenantMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*');
  }
}
