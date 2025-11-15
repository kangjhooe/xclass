import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WilayahIndonesiaController } from './wilayah-indonesia.controller';
import { WilayahIndonesiaService } from './wilayah-indonesia.service';
import { Province } from './entities/province.entity';
import { Regency } from './entities/regency.entity';
import { District } from './entities/district.entity';
import { Village } from './entities/village.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Province, Regency, District, Village]),
  ],
  controllers: [WilayahIndonesiaController],
  providers: [WilayahIndonesiaService],
  exports: [WilayahIndonesiaService],
})
export class WilayahIndonesiaModule {}

