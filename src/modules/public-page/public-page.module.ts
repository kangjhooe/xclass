import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicPageController } from './public-page.controller';
import { PublicPageService } from './public-page.service';
import { News } from './entities/news.entity';
import { Gallery } from './entities/gallery.entity';
import { Menu } from './entities/menu.entity';
import { TenantProfile } from './entities/tenant-profile.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { AcademicYear } from '../academic-year/entities/academic-year.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      News,
      Gallery,
      Menu,
      TenantProfile,
      Student,
      Teacher,
      AcademicYear,
    ]),
  ],
  controllers: [PublicPageController],
  providers: [PublicPageService],
  exports: [PublicPageService],
})
export class PublicPageModule {}

