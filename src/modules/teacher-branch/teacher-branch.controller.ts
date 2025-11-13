import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TeacherBranchService } from './teacher-branch.service';
import { CreateTeacherBranchRequestDto } from './dto/create-teacher-branch-request.dto';
import { RequestTeacherBranchDto } from './dto/request-teacher-branch.dto';
import { ApproveBranchRequestDto } from './dto/approve-branch-request.dto';
import { RejectBranchRequestDto } from './dto/reject-branch-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId, CurrentUserId } from '../../common/decorators/tenant.decorator';
import { BranchRequestStatus } from './entities/teacher-branch-request.entity';

@ApiTags('teacher-branch')
@ApiBearerAuth()
@Controller({ path: ['teacher-branch', 'tenants/:tenant/teacher-branch'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class TeacherBranchController {
  constructor(private readonly teacherBranchService: TeacherBranchService) {}

  @Post()
  @ApiOperation({ summary: 'Create branch request dari tenant induk (push)' })
  create(
    @Body() createDto: CreateTeacherBranchRequestDto,
    @TenantId() instansiId: number,
  ) {
    return this.teacherBranchService.create(createDto, instansiId);
  }

  @Post('request')
  @ApiOperation({ summary: 'Request branch dari tenant cabang (pull)' })
  requestBranch(
    @Body() requestDto: RequestTeacherBranchDto,
    @TenantId() instansiId: number,
  ) {
    return this.teacherBranchService.requestBranch(requestDto, instansiId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all branch requests' })
  findAll(
    @TenantId() instansiId: number,
    @Query('status') status?: BranchRequestStatus,
    @Query('type') type?: 'incoming' | 'outgoing',
  ) {
    return this.teacherBranchService.findAll(instansiId, { status, type });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch request by ID' })
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.teacherBranchService.findOne(+id, instansiId);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve branch request' })
  approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveBranchRequestDto,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.teacherBranchService.approve(+id, approveDto, instansiId, userId);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject branch request' })
  reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectBranchRequestDto,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.teacherBranchService.reject(+id, rejectDto, instansiId, userId);
  }
}

