import { PartialType } from '@nestjs/mapped-types';
import { CreateCurriculumScheduleDto } from './create-curriculum-schedule.dto';

export class UpdateCurriculumScheduleDto extends PartialType(CreateCurriculumScheduleDto) {}

