import { Module } from '@nestjs/common';
import { ExportImportService } from './export-import.service';

@Module({
  providers: [ExportImportService],
  exports: [ExportImportService],
})
export class ExportImportModule {}

