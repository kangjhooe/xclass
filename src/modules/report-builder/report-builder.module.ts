import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportBuilderController } from './report-builder.controller';
import { ReportBuilderService } from './report-builder.service';
import { ReportBuilderTemplate } from './entities/report-builder-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReportBuilderTemplate])],
  controllers: [ReportBuilderController],
  providers: [ReportBuilderService],
  exports: [ReportBuilderService],
})
export class ReportBuilderModule {}

// Note: DataSource is injected automatically by NestJS TypeORM module

