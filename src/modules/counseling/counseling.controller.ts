import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CounselingService } from './counseling.service';
import { CreateCounselingSessionDto } from './dto/create-counseling-session.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('counseling')
@UseGuards(JwtAuthGuard)
export class CounselingController {
  constructor(private readonly counselingService: CounselingService) {}

  @Post('sessions')
  create(
    @Body() createDto: CreateCounselingSessionDto,
    @TenantId() instansiId: number,
  ) {
    return this.counselingService.create(createDto, instansiId);
  }

  @Get('sessions')
  findAll(
    @TenantId() instansiId: number,
    @Query('studentId') studentId?: number,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.counselingService.findAll({
      instansiId,
      studentId: studentId ? Number(studentId) : undefined,
      status,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('sessions/:id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.counselingService.findOne(+id, instansiId);
  }

  @Patch('sessions/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @TenantId() instansiId: number,
  ) {
    return this.counselingService.updateStatus(+id, status, instansiId);
  }

  @Delete('sessions/:id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.counselingService.remove(+id, instansiId);
  }
}

