import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Land } from './entities/land.entity';
import { Building } from './entities/building.entity';
import { Room } from './entities/room.entity';
import { LandsService } from './lands.service';
import { BuildingsService } from './buildings.service';
import { RoomsService } from './rooms.service';
import { LandsController } from './lands.controller';
import { BuildingsController } from './buildings.controller';
import { RoomsController } from './rooms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Land, Building, Room])],
  controllers: [LandsController, BuildingsController, RoomsController],
  providers: [LandsService, BuildingsService, RoomsService],
})
export class InfrastructureModule {}


