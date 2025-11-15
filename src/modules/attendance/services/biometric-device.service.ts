import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BiometricDevice, DeviceType, DeviceStatus } from '../entities/biometric-device.entity';
import { BiometricEnrollment, EnrollmentStatus } from '../entities/biometric-enrollment.entity';
import { Student } from '../../students/entities/student.entity';

@Injectable()
export class BiometricDeviceService {
  private readonly logger = new Logger(BiometricDeviceService.name);

  constructor(
    @InjectRepository(BiometricDevice)
    private deviceRepository: Repository<BiometricDevice>,
    @InjectRepository(BiometricEnrollment)
    private enrollmentRepository: Repository<BiometricEnrollment>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  /**
   * Create or register a new biometric device
   */
  async createDevice(
    instansiId: number,
    data: {
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
  ): Promise<BiometricDevice> {
    // Check if device with same deviceId already exists
    const existing = await this.deviceRepository.findOne({
      where: { deviceId: data.deviceId, instansiId },
    });

    if (existing) {
      throw new Error(`Device with ID ${data.deviceId} already exists`);
    }

    const device = this.deviceRepository.create({
      instansiId,
      ...data,
      status: DeviceStatus.ACTIVE,
    });

    return await this.deviceRepository.save(device);
  }

  /**
   * Get all devices for a tenant
   */
  async getDevices(instansiId: number, isActive?: boolean): Promise<BiometricDevice[]> {
    const query = this.deviceRepository
      .createQueryBuilder('device')
      .where('device.instansiId = :instansiId', { instansiId });

    if (isActive !== undefined) {
      query.andWhere('device.isActive = :isActive', { isActive });
    }

    return await query.orderBy('device.createdAt', 'DESC').getMany();
  }

  /**
   * Get device by ID
   */
  async getDevice(instansiId: number, id: number): Promise<BiometricDevice> {
    const device = await this.deviceRepository.findOne({
      where: { id, instansiId },
      relations: ['attendances'],
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return device;
  }

  /**
   * Update device
   */
  async updateDevice(
    instansiId: number,
    id: number,
    data: Partial<BiometricDevice>,
  ): Promise<BiometricDevice> {
    const device = await this.getDevice(instansiId, id);
    Object.assign(device, data);
    return await this.deviceRepository.save(device);
  }

  /**
   * Delete device
   */
  async deleteDevice(instansiId: number, id: number): Promise<void> {
    const device = await this.getDevice(instansiId, id);
    await this.deviceRepository.remove(device);
  }

  /**
   * Enroll student biometric data to device
   */
  async enrollStudent(
    instansiId: number,
    deviceId: number,
    studentId: number,
    biometricId: string,
    biometricData?: Record<string, any>,
  ): Promise<BiometricEnrollment> {
    // Verify device exists
    const device = await this.getDevice(instansiId, deviceId);

    // Verify student exists
    const student = await this.studentRepository.findOne({
      where: { id: studentId, instansiId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if already enrolled
    const existing = await this.enrollmentRepository.findOne({
      where: { deviceId, studentId, instansiId, status: EnrollmentStatus.ENROLLED },
    });

    if (existing) {
      // Update existing enrollment
      existing.biometricId = biometricId;
      existing.biometricData = biometricData;
      existing.status = EnrollmentStatus.ENROLLED;
      existing.enrolledAt = new Date();
      return await this.enrollmentRepository.save(existing);
    }

    // Create new enrollment
    const enrollment = this.enrollmentRepository.create({
      instansiId,
      deviceId,
      studentId,
      biometricId,
      biometricData,
      status: EnrollmentStatus.ENROLLED,
      enrolledAt: new Date(),
    });

    return await this.enrollmentRepository.save(enrollment);
  }

  /**
   * Get enrollments for a device
   */
  async getEnrollments(instansiId: number, deviceId: number): Promise<BiometricEnrollment[]> {
    return await this.enrollmentRepository.find({
      where: { instansiId, deviceId, status: EnrollmentStatus.ENROLLED },
      relations: ['student'],
      order: { enrolledAt: 'DESC' },
    });
  }

  /**
   * Delete enrollment (remove from device)
   */
  async deleteEnrollment(instansiId: number, enrollmentId: number): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId, instansiId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    enrollment.status = EnrollmentStatus.DELETED;
    enrollment.deletedAt = new Date();
    await this.enrollmentRepository.save(enrollment);
  }

  /**
   * Update device sync status
   */
  async updateSyncStatus(deviceId: number, success: boolean, error?: string): Promise<void> {
    const device = await this.deviceRepository.findOne({ where: { id: deviceId } });
    if (!device) return;

    if (success) {
      device.lastSyncAt = new Date();
      device.lastError = null;
      device.status = DeviceStatus.ACTIVE;
    } else {
      device.lastError = error || 'Sync failed';
      device.status = DeviceStatus.ERROR;
    }

    await this.deviceRepository.save(device);
  }
}

