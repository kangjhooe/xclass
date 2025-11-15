import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BiometricDeviceService } from './services/biometric-device.service';
import { BiometricSyncService } from './services/biometric-sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { DeviceType, DeviceStatus } from './entities/biometric-device.entity';
import { BiometricType } from './entities/biometric-attendance.entity';

@Controller('attendance/biometric')
@UseGuards(JwtAuthGuard, TenantGuard)
export class BiometricController {
  constructor(
    private readonly deviceService: BiometricDeviceService,
    private readonly syncService: BiometricSyncService,
  ) {}

  // Device Management
  @Post('devices')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createDevice(
    @TenantId() instansiId: number,
    @Body() body: {
      name: string;
      deviceId: string;
      type: DeviceType;
      location?: string;
      config?: Record<string, any>;
      ipAddress?: string;
      port?: number;
      apiUrl?: string;
      apiKey?: string;
      description?: string;
    },
  ) {
    return this.deviceService.createDevice(instansiId, body);
  }

  @Get('devices')
  async getDevices(@TenantId() instansiId: number, @Query('isActive') isActive?: boolean) {
    return this.deviceService.getDevices(instansiId, isActive === true);
  }

  @Get('devices/:id')
  async getDevice(@TenantId() instansiId: number, @Param('id') id: number) {
    return this.deviceService.getDevice(instansiId, id);
  }

  @Put('devices/:id')
  async updateDevice(
    @TenantId() instansiId: number,
    @Param('id') id: number,
    @Body() body: Partial<any>,
  ) {
    return this.deviceService.updateDevice(instansiId, id, body);
  }

  @Delete('devices/:id')
  async deleteDevice(@TenantId() instansiId: number, @Param('id') id: number) {
    await this.deviceService.deleteDevice(instansiId, id);
    return { success: true };
  }

  // Enrollment
  @Post('devices/:deviceId/enroll')
  @UsePipes(new ValidationPipe({ transform: true }))
  async enrollStudent(
    @TenantId() instansiId: number,
    @Param('deviceId') deviceId: number,
    @Body() body: {
      studentId: number;
      biometricId: string;
      biometricData?: Record<string, any>;
    },
  ) {
    return this.deviceService.enrollStudent(
      instansiId,
      deviceId,
      body.studentId,
      body.biometricId,
      body.biometricData,
    );
  }

  @Get('devices/:deviceId/enrollments')
  async getEnrollments(@TenantId() instansiId: number, @Param('deviceId') deviceId: number) {
    return this.deviceService.getEnrollments(instansiId, deviceId);
  }

  @Delete('enrollments/:id')
  async deleteEnrollment(@TenantId() instansiId: number, @Param('id') id: number) {
    await this.deviceService.deleteEnrollment(instansiId, id);
    return { success: true };
  }

  // Sync
  @Post('devices/:deviceId/sync')
  @UsePipes(new ValidationPipe({ transform: true }))
  async syncAttendance(
    @TenantId() instansiId: number,
    @Param('deviceId') deviceId: number,
    @Body() body: {
      attendanceData: Array<{
        biometricId: string;
        timestamp: string | Date;
        type?: BiometricType;
        rawData?: Record<string, any>;
      }>;
    },
  ) {
    return this.syncService.syncAttendanceFromDevice(instansiId, deviceId, body.attendanceData);
  }

  @Get('devices/:deviceId/sync/pending')
  async getPendingSyncs(@TenantId() instansiId: number, @Param('deviceId') deviceId: number) {
    return this.syncService.getPendingSyncs(instansiId, deviceId);
  }

  @Get('devices/:deviceId/statistics')
  async getStatistics(
    @TenantId() instansiId: number,
    @Param('deviceId') deviceId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.syncService.getSyncStatistics(
      instansiId,
      deviceId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}

