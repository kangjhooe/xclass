import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicPageController } from './public-page.controller';
import { PublicPageAdminController } from './public-page-admin.controller';
import { PublicPageService } from './public-page.service';
import { News } from './entities/news.entity';
import { Gallery } from './entities/gallery.entity';
import { Menu } from './entities/menu.entity';
import { TenantProfile } from './entities/tenant-profile.entity';
import { ContactForm } from './entities/contact-form.entity';
import { PPDBForm } from './entities/ppdb-form.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { AcademicYear } from '../academic-year/entities/academic-year.entity';
import { PpdbRegistration } from '../ppdb/entities/ppdb-registration.entity';
import { PpdbInterviewSchedule } from '../ppdb/entities/ppdb-interview-schedule.entity';
import { Download } from './entities/download.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      News,
      Gallery,
      Menu,
      TenantProfile,
      ContactForm,
      PPDBForm,
      Student,
      Teacher,
      AcademicYear,
      PpdbRegistration,
      PpdbInterviewSchedule,
      Download,
    ]),
    StorageModule,
  ],
  controllers: [PublicPageController, PublicPageAdminController],
  providers: [PublicPageService],
  exports: [PublicPageService],
})
export class PublicPageModule {}

