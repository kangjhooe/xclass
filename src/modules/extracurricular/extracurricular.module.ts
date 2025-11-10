import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExtracurricularController } from './extracurricular.controller';
import { ExtracurricularService } from './extracurricular.service';
import { Extracurricular } from './entities/extracurricular.entity';
import { ExtracurricularParticipant } from './entities/extracurricular-participant.entity';
import { ExtracurricularActivity } from './entities/extracurricular-activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Extracurricular,
      ExtracurricularParticipant,
      ExtracurricularActivity,
    ]),
  ],
  controllers: [ExtracurricularController],
  providers: [ExtracurricularService],
  exports: [ExtracurricularService],
})
export class ExtracurricularModule {}
