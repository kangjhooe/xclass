import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BiometricAttendance, SyncStatus, BiometricType } from '../entities/biometric-attendance.entity';
import { BiometricDevice, DeviceStatus } from '../entities/biometric-device.entity';
import { BiometricEnrollment } from '../entities/biometric-enrollment.entity';
import { Attendance } from '../entities/attendance.entity';
import { Schedule } from '../../schedules/entities/schedule.entity';
import { format, parseISO } from 'date-fns';

@Injectable()
export class BiometricSyncService {
  private readonly logger = new Logger(BiometricSyncService.name);

  constructor(
    @InjectRepository(BiometricAttendance)
    private biometricAttendanceRepository: Repository<BiometricAttendance>,
    @InjectRepository(BiometricDevice)
    private deviceRepository: Repository<BiometricDevice>,
    @InjectRepository(BiometricEnrollment)
    private enrollmentRepository: Repository<BiometricEnrollment>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  /**
   * Sync attendance data from biometric device
   */
  async syncAttendanceFromDevice(
    instansiId: number,
    deviceId: number,
    attendanceData: Array<{
      biometricId: string;
      timestamp: string | Date;
      type?: BiometricType;
      rawData?: Record<string, any>;
    }>,
  ): Promise<{ synced: number; failed: number; errors: string[] }> {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId, instansiId },
    });

    if (!device) {
      throw new Error('Device not found');
    }

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const data of attendanceData) {
      try {
        // Find enrollment by biometricId
        const enrollment = await this.enrollmentRepository.findOne({
          where: {
            deviceId,
            biometricId: data.biometricId,
            instansiId,
            status: 'enrolled' as any,
          },
          relations: ['student'],
        });

        if (!enrollment) {
          errors.push(`Enrollment not found for biometricId: ${data.biometricId}`);
          failed++;
          continue;
        }

        // Parse timestamp
        const timestamp = typeof data.timestamp === 'string' ? parseISO(data.timestamp) : data.timestamp;
        const date = format(timestamp, 'yyyy-MM-dd');
        const time = format(timestamp, 'HH:mm:ss');

        // Check if already synced
        const existing = await this.biometricAttendanceRepository.findOne({
          where: {
            deviceId,
            studentId: enrollment.studentId,
            timestamp,
            instansiId,
          },
        });

        if (existing) {
          // Already synced, skip
          continue;
        }

        // Create biometric attendance record
        const biometricAttendance = this.biometricAttendanceRepository.create({
          instansiId,
          deviceId,
          studentId: enrollment.studentId,
          biometricId: data.biometricId,
          type: data.type || BiometricType.FINGERPRINT,
          timestamp,
          date: parseISO(date),
          time,
          rawData: data.rawData,
          syncStatus: SyncStatus.SYNCED,
          syncedAt: new Date(),
        });

        await this.biometricAttendanceRepository.save(biometricAttendance);

        // Try to create regular attendance record
        await this.createAttendanceFromBiometric(instansiId, enrollment.studentId, timestamp);

        synced++;
      } catch (error) {
        this.logger.error(`Failed to sync attendance: ${error.message}`, error);
        errors.push(`Failed to sync: ${error.message}`);
        failed++;
      }
    }

    // Update device sync status
    await this.deviceRepository.update(deviceId, {
      lastSyncAt: new Date(),
      status: failed === 0 ? DeviceStatus.ACTIVE : DeviceStatus.ERROR,
      lastError: failed > 0 ? errors.join('; ') : null,
    });

    return { synced, failed, errors };
  }

  /**
   * Create regular attendance from biometric data
   */
  private async createAttendanceFromBiometric(
    instansiId: number,
    studentId: number,
    timestamp: Date,
  ): Promise<void> {
    try {
      // Find schedule for the timestamp
      const dayOfWeek = timestamp.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const time = format(timestamp, 'HH:mm');

      // Find schedule that matches the day of week
      // Schedule entity uses: 0 = Sunday, 1 = Monday, etc.
      const schedule = await this.scheduleRepository.findOne({
        where: {
          instansiId,
          dayOfWeek: dayOfWeek,
        },
        order: { startTime: 'ASC' },
      });

      if (!schedule) {
        // No schedule found, skip creating attendance
        return;
      }

      // Check if attendance already exists
      const date = format(timestamp, 'yyyy-MM-dd');
      const existing = await this.attendanceRepository.findOne({
        where: {
          instansiId,
          studentId,
          scheduleId: schedule.id,
          date: parseISO(date),
        },
      });

      if (existing) {
        // Already exists, skip
        return;
      }

      // Determine status (present, late, etc.)
      let status = 'present';
      if (schedule.startTime) {
        const scheduleTime = format(parseISO(`2000-01-01T${schedule.startTime}`), 'HH:mm');
        if (time > scheduleTime) {
          // Check if late (more than 15 minutes)
          const scheduleMinutes = this.timeToMinutes(scheduleTime);
          const attendanceMinutes = this.timeToMinutes(time);
          if (attendanceMinutes - scheduleMinutes > 15) {
            status = 'late';
          }
        }
      }

      // Create attendance
      const attendance = this.attendanceRepository.create({
        instansiId,
        studentId,
        scheduleId: schedule.id,
        date: parseISO(date),
        status,
        teacherId: schedule.teacherId,
      });

      await this.attendanceRepository.save(attendance);
    } catch (error) {
      this.logger.error(`Failed to create attendance from biometric: ${error.message}`, error);
      // Don't throw, just log
    }
  }

  /**
   * Helper: Convert time string to minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Get pending syncs
   */
  async getPendingSyncs(instansiId: number, deviceId?: number): Promise<BiometricAttendance[]> {
    const query = this.biometricAttendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.instansiId = :instansiId', { instansiId })
      .andWhere('attendance.syncStatus = :status', { status: SyncStatus.PENDING });

    if (deviceId) {
      query.andWhere('attendance.deviceId = :deviceId', { deviceId });
    }

    return await query.orderBy('attendance.timestamp', 'DESC').getMany();
  }

  /**
   * Get sync statistics
   */
  async getSyncStatistics(instansiId: number, deviceId?: number, startDate?: Date, endDate?: Date) {
    const query = this.biometricAttendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.instansiId = :instansiId', { instansiId });

    if (deviceId) {
      query.andWhere('attendance.deviceId = :deviceId', { deviceId });
    }

    if (startDate) {
      query.andWhere('attendance.date >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('attendance.date <= :endDate', { endDate });
    }

    const all = await query.getMany();

    return {
      total: all.length,
      synced: all.filter((a) => a.syncStatus === SyncStatus.SYNCED).length,
      pending: all.filter((a) => a.syncStatus === SyncStatus.PENDING).length,
      failed: all.filter((a) => a.syncStatus === SyncStatus.FAILED).length,
      byType: all.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

