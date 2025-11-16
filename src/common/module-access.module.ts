import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleAccessService } from './services/module-access.service';
import { ModuleAccessGuard } from './guards/module-access.guard';
import { PositionModule } from '../modules/hr/entities/position-module.entity';
import { Teacher } from '../modules/teachers/entities/teacher.entity';
import { User } from '../modules/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PositionModule, Teacher, User]),
  ],
  providers: [ModuleAccessService, ModuleAccessGuard],
  exports: [ModuleAccessService, ModuleAccessGuard],
})
export class ModuleAccessModule {}

