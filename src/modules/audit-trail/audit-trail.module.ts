import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditTrailController } from './audit-trail.controller';
import { AuditTrailService } from './audit-trail.service';
import { AuditTrail } from './entities/audit-trail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditTrail])],
  controllers: [AuditTrailController],
  providers: [AuditTrailService],
  exports: [AuditTrailService],
})
export class AuditTrailModule {}

