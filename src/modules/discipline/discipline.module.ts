import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisciplineController } from './discipline.controller';
import { DisciplineService } from './discipline.service';
import { DisciplinaryAction } from './entities/disciplinary-action.entity';
import { StudentsModule } from '../students/students.module';
import { TeachersModule } from '../teachers/teachers.module';
import { ModuleAccessModule } from '../../common/module-access.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DisciplinaryAction]),
    StudentsModule,
    TeachersModule,
    ModuleAccessModule,
  ],
  controllers: [DisciplineController],
  providers: [DisciplineService],
  exports: [DisciplineService],
})
export class DisciplineModule {}

