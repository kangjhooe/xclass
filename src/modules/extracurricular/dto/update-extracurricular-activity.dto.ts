import { PartialType } from '@nestjs/mapped-types';
import { CreateExtracurricularActivityDto } from './create-extracurricular-activity.dto';

export class UpdateExtracurricularActivityDto extends PartialType(CreateExtracurricularActivityDto) {}

