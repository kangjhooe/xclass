import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardManagementController } from './card-management.controller';
import { CardManagementService } from './card-management.service';
import { Card } from './entities/card.entity';
import { CardTemplate } from './entities/card-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card, CardTemplate])],
  controllers: [CardManagementController],
  providers: [CardManagementService],
  exports: [CardManagementService],
})
export class CardManagementModule {}

