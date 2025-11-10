import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationApiController } from './integration-api.controller';
import { IntegrationApiService } from './integration-api.service';
import { Integration } from './entities/integration.entity';
import { IntegrationLog } from './entities/integration-log.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { DataPokok } from '../data-pokok/entities/data-pokok.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Integration,
      IntegrationLog,
      Student,
      Teacher,
      DataPokok,
    ]),
  ],
  controllers: [IntegrationApiController],
  providers: [IntegrationApiService],
  exports: [IntegrationApiService],
})
export class IntegrationApiModule {}

