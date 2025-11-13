import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StudentTransferService } from './student-transfer.service';
import { CreateStudentTransferDto } from './dto/create-student-transfer.dto';
import { CreatePullRequestDto } from './dto/create-pull-request.dto';
import { UpdateStudentTransferDto } from './dto/update-student-transfer.dto';
import { ApproveTransferDto } from './dto/approve-transfer.dto';
import { RejectTransferDto } from './dto/reject-transfer.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUserId } from '../../common/decorators/tenant.decorator';

@Controller({ path: ['student-transfers', 'tenants/:tenant/student-transfers'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class StudentTransferController {
  constructor(private readonly studentTransferService: StudentTransferService) {}

  @Post()
  create(
    @Body() createTransferDto: CreateStudentTransferDto,
    @TenantId() instansiId: number,
  ) {
    return this.studentTransferService.create(createTransferDto, instansiId);
  }

  @Post('pull-request')
  createPullRequest(
    @Body() createPullDto: CreatePullRequestDto,
    @TenantId() instansiId: number,
  ) {
    return this.studentTransferService.createPullRequest(createPullDto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('studentId') studentId?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.studentTransferService.findAll({
      search,
      status,
      studentId: studentId ? Number(studentId) : undefined,
      page: Number(page),
      limit: Number(limit),
      instansiId,
    });
  }

  @Get('lookup')
  lookupStudent(
    @Query('sourceTenantNpsn') sourceTenantNpsn: string,
    @Query('studentNisn') studentNisn: string,
    @TenantId() instansiId: number,
  ) {
    return this.studentTransferService.lookupStudentByNpsnAndNisn(
      sourceTenantNpsn,
      studentNisn,
      instansiId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.studentTransferService.findOne(+id, instansiId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransferDto: UpdateStudentTransferDto,
    @TenantId() instansiId: number,
  ) {
    return this.studentTransferService.update(+id, updateTransferDto, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.studentTransferService.remove(+id, instansiId);
  }

  @Post(':id/approve')
  approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveTransferDto,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.studentTransferService.approve(+id, approveDto, instansiId, userId);
  }

  @Post(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectTransferDto,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.studentTransferService.reject(+id, rejectDto, instansiId, userId);
  }

  @Post(':id/complete')
  complete(
    @Param('id') id: string,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.studentTransferService.complete(+id, instansiId, userId);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.studentTransferService.cancel(+id, instansiId);
  }
}

