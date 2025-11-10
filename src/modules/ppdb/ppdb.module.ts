import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PpdbController } from './ppdb.controller';
import { PpdbService } from './ppdb.service';
import { PpdbRegistration } from './entities/ppdb-registration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PpdbRegistration])],
  controllers: [PpdbController],
  providers: [PpdbService],
  exports: [PpdbService],
})
export class PpdbModule {}

