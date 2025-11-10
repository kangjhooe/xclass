import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorrespondenceController } from './correspondence.controller';
import { CorrespondenceService } from './correspondence.service';
import { IncomingLetter } from './entities/incoming-letter.entity';
import { OutgoingLetter } from './entities/outgoing-letter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IncomingLetter, OutgoingLetter])],
  controllers: [CorrespondenceController],
  providers: [CorrespondenceService],
  exports: [CorrespondenceService],
})
export class CorrespondenceModule {}
