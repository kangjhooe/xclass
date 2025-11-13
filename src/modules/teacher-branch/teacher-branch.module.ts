import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherBranchController } from './teacher-branch.controller';
import { TeacherBranchService } from './teacher-branch.service';
import { TeacherBranchRequest } from './entities/teacher-branch-request.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { QuestionBank } from '../exams/entities/question-bank.entity';
import { Question } from '../exams/entities/question.entity';
import { Stimulus } from '../exams/entities/stimulus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TeacherBranchRequest,
      Teacher,
      Tenant,
      QuestionBank,
      Question,
      Stimulus,
    ]),
  ],
  controllers: [TeacherBranchController],
  providers: [TeacherBranchService],
  exports: [TeacherBranchService],
})
export class TeacherBranchModule {}

