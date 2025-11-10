import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentTransferController } from './student-transfer.controller';
import { StudentTransferService } from './student-transfer.service';
import { StudentTransfer } from './entities/student-transfer.entity';
import { Student } from '../students/entities/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentTransfer, Student])],
  controllers: [StudentTransferController],
  providers: [StudentTransferService],
  exports: [StudentTransferService],
})
export class StudentTransferModule {}

