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
import { HrService } from './hr.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { CreatePositionModuleDto } from './dto/create-position-module.dto';
import { UpdatePositionModuleDto } from './dto/update-position-module.dto';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';
import { CreateEmployeeAttendanceDto } from './dto/create-employee-attendance.dto';
import { UpdateEmployeeAttendanceDto } from './dto/update-employee-attendance.dto';
import { TenantId, CurrentUserId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('hr')
@UseGuards(JwtAuthGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // Employee endpoints
  @Post('employees')
  createEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.hrService.createEmployee(createEmployeeDto, instansiId, userId);
  }

  @Get('employees')
  findAllEmployees(@TenantId() instansiId: number, @Query() filters: any) {
    return this.hrService.findAllEmployees(instansiId, filters);
  }

  @Get('employees/:id')
  findOneEmployee(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.hrService.findOneEmployee(+id, instansiId);
  }

  @Patch('employees/:id')
  updateEmployee(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.hrService.updateEmployee(+id, updateEmployeeDto, instansiId, userId);
  }

  @Delete('employees/:id')
  removeEmployee(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.hrService.removeEmployee(+id, instansiId);
  }

  // Payroll endpoints
  @Post('payrolls')
  createPayroll(
    @Body() createPayrollDto: CreatePayrollDto,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.hrService.createPayroll(createPayrollDto, instansiId, userId);
  }

  @Get('payrolls')
  findAllPayrolls(@TenantId() instansiId: number, @Query() filters: any) {
    return this.hrService.findAllPayrolls(instansiId, filters);
  }

  @Get('payrolls/:id')
  findOnePayroll(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.hrService.findOnePayroll(+id, instansiId);
  }

  @Patch('payrolls/:id')
  updatePayroll(
    @Param('id') id: string,
    @Body() updatePayrollDto: UpdatePayrollDto,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.hrService.updatePayroll(+id, updatePayrollDto, instansiId, userId);
  }

  @Delete('payrolls/:id')
  removePayroll(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.hrService.removePayroll(+id, instansiId);
  }

  // Department endpoints
  @Post('departments')
  createDepartment(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @TenantId() instansiId: number,
  ) {
    return this.hrService.createDepartment(createDepartmentDto, instansiId);
  }

  @Get('departments')
  findAllDepartments(@TenantId() instansiId: number) {
    return this.hrService.findAllDepartments(instansiId);
  }

  @Get('departments/:id')
  findOneDepartment(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.hrService.findOneDepartment(+id, instansiId);
  }

  @Patch('departments/:id')
  updateDepartment(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @TenantId() instansiId: number,
  ) {
    return this.hrService.updateDepartment(+id, updateDepartmentDto, instansiId);
  }

  @Delete('departments/:id')
  removeDepartment(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.hrService.removeDepartment(+id, instansiId);
  }

  // Position endpoints
  @Post('positions')
  createPosition(
    @Body() createPositionDto: CreatePositionDto,
    @TenantId() instansiId: number,
  ) {
    return this.hrService.createPosition(createPositionDto, instansiId);
  }

  @Get('positions')
  findAllPositions(@TenantId() instansiId: number) {
    return this.hrService.findAllPositions(instansiId);
  }

  @Get('positions/:id')
  findOnePosition(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.hrService.findOnePosition(+id, instansiId);
  }

  @Patch('positions/:id')
  updatePosition(
    @Param('id') id: string,
    @Body() updatePositionDto: UpdatePositionDto,
    @TenantId() instansiId: number,
  ) {
    return this.hrService.updatePosition(+id, updatePositionDto, instansiId);
  }

  @Delete('positions/:id')
  removePosition(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.hrService.removePosition(+id, instansiId);
  }

  // Performance Review endpoints
  @Post('performance-reviews')
  createPerformanceReview(
    @Body() createReviewDto: CreatePerformanceReviewDto,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.hrService.createPerformanceReview(createReviewDto, instansiId, userId);
  }

  @Get('performance-reviews')
  findAllPerformanceReviews(@TenantId() instansiId: number, @Query() filters: any) {
    return this.hrService.findAllPerformanceReviews(instansiId, filters);
  }

  @Get('performance-reviews/:id')
  findOnePerformanceReview(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.hrService.findOnePerformanceReview(+id, instansiId);
  }

  @Patch('performance-reviews/:id')
  updatePerformanceReview(
    @Param('id') id: string,
    @Body() updateReviewDto: any,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.hrService.updatePerformanceReview(+id, updateReviewDto, instansiId, userId);
  }

  @Delete('performance-reviews/:id')
  removePerformanceReview(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.hrService.removePerformanceReview(+id, instansiId);
  }

  // Position Module endpoints (hanya untuk admin)
  @Post('positions/:positionId/modules')
  @UseGuards(RolesGuard)
  @Roles('admin_tenant', 'super_admin')
  createPositionModule(
    @Param('positionId') positionId: string,
    @Body() createDto: CreatePositionModuleDto,
    @TenantId() instansiId: number,
  ) {
    return this.hrService.createPositionModule(
      { ...createDto, positionId: +positionId },
      instansiId,
    );
  }

  @Get('positions/:positionId/modules')
  getModulesByPosition(
    @Param('positionId') positionId: string,
    @TenantId() instansiId: number,
  ) {
    return this.hrService.getModulesByPosition(+positionId, instansiId);
  }

  @Get('position-modules')
  findAllPositionModules(
    @Query('positionId') positionId?: string,
    @TenantId() instansiId?: number,
  ) {
    return this.hrService.findAllPositionModules(
      positionId ? +positionId : undefined,
      instansiId,
    );
  }

  @Get('position-modules/:id')
  findOnePositionModule(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.hrService.findOnePositionModule(+id, instansiId);
  }

  @Patch('position-modules/:id')
  @UseGuards(RolesGuard)
  @Roles('admin_tenant', 'super_admin')
  updatePositionModule(
    @Param('id') id: string,
    @Body() updateDto: UpdatePositionModuleDto,
    @TenantId() instansiId: number,
  ) {
    return this.hrService.updatePositionModule(+id, updateDto, instansiId);
  }

  @Delete('position-modules/:id')
  @UseGuards(RolesGuard)
  @Roles('admin_tenant', 'super_admin')
  removePositionModule(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.hrService.removePositionModule(+id, instansiId);
  }

  // Employee Attendance endpoints
  @Post('attendance')
  createEmployeeAttendance(
    @Body() createAttendanceDto: CreateEmployeeAttendanceDto,
    @TenantId() instansiId: number,
  ) {
    return this.hrService.createEmployeeAttendance(createAttendanceDto, instansiId);
  }

  @Get('attendance')
  findAllEmployeeAttendances(@TenantId() instansiId: number, @Query() filters: any) {
    return this.hrService.findAllEmployeeAttendances(instansiId, filters);
  }

  @Get('attendance/:id')
  findOneEmployeeAttendance(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.hrService.findOneEmployeeAttendance(+id, instansiId);
  }

  @Patch('attendance/:id')
  updateEmployeeAttendance(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateEmployeeAttendanceDto,
    @TenantId() instansiId: number,
  ) {
    return this.hrService.updateEmployeeAttendance(+id, updateAttendanceDto, instansiId);
  }

  @Delete('attendance/:id')
  removeEmployeeAttendance(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.hrService.removeEmployeeAttendance(+id, instansiId);
  }
}
