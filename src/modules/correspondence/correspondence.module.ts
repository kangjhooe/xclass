import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorrespondenceController } from './correspondence.controller';
import { CorrespondenceService } from './correspondence.service';
import { IncomingLetter } from './entities/incoming-letter.entity';
import { OutgoingLetter } from './entities/outgoing-letter.entity';
import { LetterTemplate } from './entities/letter-template.entity';
import { CorrespondenceArchive } from './entities/correspondence-archive.entity';
import { LetterSequence } from './entities/letter-sequence.entity';
import { GeneratedLetter } from './entities/generated-letter.entity';
import { ModuleAccessModule } from '../../common/module-access.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IncomingLetter,
      OutgoingLetter,
      LetterTemplate,
      CorrespondenceArchive,
      LetterSequence,
      GeneratedLetter,
    ]),
    ModuleAccessModule,
  ],
  controllers: [CorrespondenceController],
  providers: [CorrespondenceService],
  exports: [CorrespondenceService],
})
export class CorrespondenceModule {}
