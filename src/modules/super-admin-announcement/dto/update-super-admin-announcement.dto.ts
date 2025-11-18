import { PartialType } from '@nestjs/mapped-types';
import { CreateSuperAdminAnnouncementDto } from './create-super-admin-announcement.dto';

export class UpdateSuperAdminAnnouncementDto extends PartialType(
  CreateSuperAdminAnnouncementDto,
) {}

