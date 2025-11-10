import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataPokokController } from './data-pokok.controller';
import { DataPokokService } from './data-pokok.service';
import { DataPokok } from './entities/data-pokok.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DataPokok])],
  controllers: [DataPokokController],
  providers: [DataPokokService],
  exports: [DataPokokService],
})
export class DataPokokModule {}

