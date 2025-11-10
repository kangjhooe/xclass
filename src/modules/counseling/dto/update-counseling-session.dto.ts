import { PartialType } from '@nestjs/mapped-types';
import { CreateCounselingSessionDto } from './create-counseling-session.dto';

export class UpdateCounselingSessionDto extends PartialType(CreateCounselingSessionDto) {}

