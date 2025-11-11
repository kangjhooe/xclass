import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration, IntegrationType, IntegrationStatus } from './entities/integration.entity';
import { IntegrationLog, LogType } from './entities/integration-log.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { DataPokok } from '../data-pokok/entities/data-pokok.entity';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class IntegrationApiService {
  private httpClient: AxiosInstance;

  constructor(
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
    @InjectRepository(IntegrationLog)
    private logRepository: Repository<IntegrationLog>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(DataPokok)
    private dataPokokRepository: Repository<DataPokok>,
  ) {
    this.httpClient = axios.create({
      timeout: 30000, // 30 seconds
    });
  }

  async createIntegration(
    instansiId: number,
    name: string,
    type: IntegrationType,
    config: Record<string, any>,
    description?: string,
    mapping?: Record<string, any>,
  ) {
    const integration = this.integrationRepository.create({
      instansiId,
      name,
      type,
      config,
      description,
      mapping,
      status: IntegrationStatus.INACTIVE,
    });

    return await this.integrationRepository.save(integration);
  }

  async getIntegrations(instansiId: number, type?: IntegrationType) {
    const query = this.integrationRepository
      .createQueryBuilder('integration')
      .where('integration.instansiId = :instansiId', { instansiId });

    if (type) {
      query.andWhere('integration.type = :type', { type });
    }

    return await query.orderBy('integration.createdAt', 'DESC').getMany();
  }

  async syncData(integrationId: number, instansiId: number) {
    const integration = await this.integrationRepository.findOne({
      where: { id: integrationId, instansiId },
    });

    if (!integration) {
      throw new Error('Integration not found');
    }

    if (integration.status !== IntegrationStatus.ACTIVE) {
      throw new Error('Integration is not active');
    }

    try {
      let result: any;

      switch (integration.type) {
        case IntegrationType.DAPODIK:
          result = await this.syncDapodik(integration);
          break;
        case IntegrationType.SIMPATIKA:
          result = await this.syncSimpatika(integration);
          break;
        default:
          throw new Error('Unknown integration type');
      }

      // Log success
      await this.logRepository.save({
        integrationId,
        type: LogType.SYNC,
        message: 'Sync completed successfully',
        data: result,
        isSuccess: true,
      });

      // Update last sync
      integration.lastSyncAt = new Date();
      await this.integrationRepository.save(integration);

      return { success: true, data: result };
    } catch (error) {
      // Log error
      await this.logRepository.save({
        integrationId,
        type: LogType.ERROR,
        message: error.message,
        isSuccess: false,
      });

      integration.lastError = error.message;
      integration.status = IntegrationStatus.ERROR;
      await this.integrationRepository.save(integration);

      throw error;
    }
  }

  async handleWebhook(
    integrationId: number,
    payload: Record<string, any>,
  ) {
    const integration = await this.integrationRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new Error('Integration not found');
    }

    if (integration.status !== IntegrationStatus.ACTIVE) {
      throw new Error('Integration is not active');
    }

    try {
      // Log webhook
      await this.logRepository.save({
        integrationId,
        type: LogType.WEBHOOK,
        message: 'Webhook received',
        data: payload,
        isSuccess: true,
      });

      // Process webhook based on integration type
      let result: any = { processed: false };

      switch (integration.type) {
        case IntegrationType.DAPODIK:
          result = await this.processDapodikWebhook(integration, payload);
          break;
        case IntegrationType.SIMPATIKA:
          result = await this.processSimpatikaWebhook(integration, payload);
          break;
        case IntegrationType.CUSTOM:
          result = await this.processCustomWebhook(integration, payload);
          break;
        default:
          throw new Error(`Unknown integration type: ${integration.type}`);
      }

      // Log success
      await this.logRepository.save({
        integrationId,
        type: LogType.WEBHOOK,
        message: 'Webhook processed successfully',
        data: result,
        isSuccess: true,
      });

      return { success: true, message: 'Webhook processed', data: result };
    } catch (error) {
      // Log error
      await this.logRepository.save({
        integrationId,
        type: LogType.ERROR,
        message: `Webhook processing failed: ${error.message}`,
        data: { payload, error: error.message },
        isSuccess: false,
      });

      throw error;
    }
  }

  private async processDapodikWebhook(
    integration: Integration,
    payload: Record<string, any>,
  ) {
    const { event, data } = payload;
    const { instansiId, mapping } = integration;
    const result = { event, synced: 0, failed: 0 };

    try {
      switch (event) {
        case 'student.updated':
        case 'student.created':
          if (data) {
            try {
              await this.syncStudentFromDapodik(data, instansiId, mapping);
              result.synced = 1;
            } catch (error) {
              result.failed = 1;
              console.error('Error syncing student from webhook:', error.message);
            }
          }
          break;

        case 'teacher.updated':
        case 'teacher.created':
          if (data) {
            try {
              await this.syncTeacherFromDapodik(data, instansiId, mapping);
              result.synced = 1;
            } catch (error) {
              result.failed = 1;
              console.error('Error syncing teacher from webhook:', error.message);
            }
          }
          break;

        case 'sekolah.updated':
          if (data) {
            try {
              await this.syncDataPokokFromDapodik(data, instansiId, mapping);
              result.synced = 1;
            } catch (error) {
              result.failed = 1;
              console.error('Error syncing data pokok from webhook:', error.message);
            }
          }
          break;

        default:
          console.log(`Unhandled Dapodik webhook event: ${event}`);
      }

      return result;
    } catch (error) {
      throw new Error(`Dapodik webhook processing failed: ${error.message}`);
    }
  }

  private async processSimpatikaWebhook(
    integration: Integration,
    payload: Record<string, any>,
  ) {
    const { event, data } = payload;
    const { instansiId, mapping } = integration;
    const result = { event, synced: 0, failed: 0 };

    try {
      switch (event) {
        case 'student.updated':
        case 'student.created':
          if (data) {
            try {
              await this.syncStudentFromSimpatika(data, instansiId, mapping);
              result.synced = 1;
            } catch (error) {
              result.failed = 1;
              console.error('Error syncing student from webhook:', error.message);
            }
          }
          break;

        case 'teacher.updated':
        case 'teacher.created':
          if (data) {
            try {
              await this.syncTeacherFromSimpatika(data, instansiId, mapping);
              result.synced = 1;
            } catch (error) {
              result.failed = 1;
              console.error('Error syncing teacher from webhook:', error.message);
            }
          }
          break;

        case 'sekolah.updated':
          if (data) {
            try {
              await this.syncDataPokokFromSimpatika(data, instansiId, mapping);
              result.synced = 1;
            } catch (error) {
              result.failed = 1;
              console.error('Error syncing data pokok from webhook:', error.message);
            }
          }
          break;

        default:
          console.log(`Unhandled Simpatika webhook event: ${event}`);
      }

      return result;
    } catch (error) {
      throw new Error(`Simpatika webhook processing failed: ${error.message}`);
    }
  }

  private async processCustomWebhook(
    integration: Integration,
    payload: Record<string, any>,
  ) {
    // For custom integrations, webhook processing depends on config
    const { config } = integration;
    const webhookHandler = config?.webhookHandler;

    if (webhookHandler && typeof webhookHandler === 'function') {
      return await webhookHandler(payload, integration);
    }

    // Default: just log the webhook
    return {
      processed: true,
      message: 'Custom webhook received (no handler configured)',
      payload,
    };
  }

  async getLogs(
    integrationId: number,
    instansiId: number,
    type?: LogType,
    limit: number = 50,
  ) {
    const query = this.logRepository
      .createQueryBuilder('log')
      .where('log.integrationId = :integrationId', { integrationId })
      .leftJoin('log.integration', 'integration')
      .andWhere('integration.instansiId = :instansiId', { instansiId });

    if (type) {
      query.andWhere('log.type = :type', { type });
    }

    return await query
      .orderBy('log.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  private async syncDapodik(integration: Integration) {
    const { config, mapping, instansiId } = integration;
    const result = {
      students: { synced: 0, failed: 0 },
      teachers: { synced: 0, failed: 0 },
      dataPokok: { synced: 0, failed: 0 },
    };

    try {
      // Validate config
      if (!config.apiUrl || !config.apiKey) {
        throw new Error('Dapodik API URL and API Key are required in config');
      }

      // Sync Data Pokok (Sekolah)
      if (config.syncDataPokok !== false) {
        try {
          const sekolahData = await this.fetchDapodikData(
            config.apiUrl,
            config.apiKey,
            'sekolah',
            config.npsn,
          );
          if (sekolahData) {
            await this.syncDataPokokFromDapodik(sekolahData, instansiId, mapping);
            result.dataPokok.synced = 1;
          }
        } catch (error) {
          result.dataPokok.failed = 1;
          console.error('Error syncing Data Pokok from Dapodik:', error.message);
        }
      }

      // Sync Students
      if (config.syncStudents !== false) {
        try {
          const studentsData = await this.fetchDapodikData(
            config.apiUrl,
            config.apiKey,
            'siswa',
            config.npsn,
          );
          if (studentsData && Array.isArray(studentsData)) {
            for (const studentData of studentsData) {
              try {
                await this.syncStudentFromDapodik(studentData, instansiId, mapping);
                result.students.synced++;
              } catch (error) {
                result.students.failed++;
                console.error('Error syncing student:', error.message);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching students from Dapodik:', error.message);
        }
      }

      // Sync Teachers
      if (config.syncTeachers !== false) {
        try {
          const teachersData = await this.fetchDapodikData(
            config.apiUrl,
            config.apiKey,
            'guru',
            config.npsn,
          );
          if (teachersData && Array.isArray(teachersData)) {
            for (const teacherData of teachersData) {
              try {
                await this.syncTeacherFromDapodik(teacherData, instansiId, mapping);
                result.teachers.synced++;
              } catch (error) {
                result.teachers.failed++;
                console.error('Error syncing teacher:', error.message);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching teachers from Dapodik:', error.message);
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Dapodik sync failed: ${error.message}`);
    }
  }

  private async syncSimpatika(integration: Integration) {
    const { config, mapping, instansiId } = integration;
    const result = {
      students: { synced: 0, failed: 0 },
      teachers: { synced: 0, failed: 0 },
      dataPokok: { synced: 0, failed: 0 },
    };

    try {
      // Validate config
      if (!config.apiUrl || !config.apiKey) {
        throw new Error('Simpatika API URL and API Key are required in config');
      }

      // Sync Data Pokok (Sekolah)
      if (config.syncDataPokok !== false) {
        try {
          const sekolahData = await this.fetchSimpatikaData(
            config.apiUrl,
            config.apiKey,
            'sekolah',
          );
          if (sekolahData) {
            await this.syncDataPokokFromSimpatika(sekolahData, instansiId, mapping);
            result.dataPokok.synced = 1;
          }
        } catch (error) {
          result.dataPokok.failed = 1;
          console.error('Error syncing Data Pokok from Simpatika:', error.message);
        }
      }

      // Sync Students
      if (config.syncStudents !== false) {
        try {
          const studentsData = await this.fetchSimpatikaData(
            config.apiUrl,
            config.apiKey,
            'siswa',
          );
          if (studentsData && Array.isArray(studentsData)) {
            for (const studentData of studentsData) {
              try {
                await this.syncStudentFromSimpatika(studentData, instansiId, mapping);
                result.students.synced++;
              } catch (error) {
                result.students.failed++;
                console.error('Error syncing student:', error.message);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching students from Simpatika:', error.message);
        }
      }

      // Sync Teachers
      if (config.syncTeachers !== false) {
        try {
          const teachersData = await this.fetchSimpatikaData(
            config.apiUrl,
            config.apiKey,
            'guru',
          );
          if (teachersData && Array.isArray(teachersData)) {
            for (const teacherData of teachersData) {
              try {
                await this.syncTeacherFromSimpatika(teacherData, instansiId, mapping);
                result.teachers.synced++;
              } catch (error) {
                result.teachers.failed++;
                console.error('Error syncing teacher:', error.message);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching teachers from Simpatika:', error.message);
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Simpatika sync failed: ${error.message}`);
    }
  }

  // Helper methods for Dapodik
  private async fetchDapodikData(
    apiUrl: string,
    apiKey: string,
    endpoint: string,
    npsn?: string,
  ): Promise<any> {
    try {
      const url = `${apiUrl}/${endpoint}${npsn ? `?npsn=${npsn}` : ''}`;
      const response = await this.httpClient.get(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`Dapodik API error: ${error.response.status} - ${error.response.statusText}`);
      }
      throw new Error(`Failed to fetch data from Dapodik: ${error.message}`);
    }
  }

  private async syncDataPokokFromDapodik(
    data: any,
    instansiId: number,
    mapping?: Record<string, any>,
  ) {
    const fieldMapping = mapping?.dataPokok || {};
    const existing = await this.dataPokokRepository.findOne({
      where: { instansiId },
    });

    const dataPokokData: Partial<DataPokok> = {
      instansiId,
      npsn: this.mapField(data, 'npsn', fieldMapping.npsn),
      name: this.mapField(data, 'nama_sekolah', fieldMapping.name) || this.mapField(data, 'nama', fieldMapping.name),
      type: this.mapField(data, 'jenjang', fieldMapping.type),
      jenjang: this.mapField(data, 'jenjang', fieldMapping.jenjang),
      address: this.mapField(data, 'alamat', fieldMapping.address),
      village: this.mapField(data, 'desa_kelurahan', fieldMapping.village),
      subDistrict: this.mapField(data, 'kecamatan', fieldMapping.subDistrict),
      district: this.mapField(data, 'kabupaten_kota', fieldMapping.district),
      city: this.mapField(data, 'kabupaten_kota', fieldMapping.city),
      province: this.mapField(data, 'provinsi', fieldMapping.province),
      postalCode: this.mapField(data, 'kode_pos', fieldMapping.postalCode),
      phone: this.mapField(data, 'telepon', fieldMapping.phone),
      email: this.mapField(data, 'email', fieldMapping.email),
      website: this.mapField(data, 'website', fieldMapping.website),
      principalName: this.mapField(data, 'nama_kepala_sekolah', fieldMapping.principalName),
      principalNip: this.mapField(data, 'nip_kepala_sekolah', fieldMapping.principalNip),
    };

    if (existing) {
      Object.assign(existing, dataPokokData);
      await this.dataPokokRepository.save(existing);
    } else {
      await this.dataPokokRepository.save(this.dataPokokRepository.create(dataPokokData));
    }
  }

  private async syncStudentFromDapodik(
    data: any,
    instansiId: number,
    mapping?: Record<string, any>,
  ) {
    const fieldMapping = mapping?.student || {};
    const nisn = this.mapField(data, 'nisn', fieldMapping.nisn);

    if (!nisn) {
      throw new Error('NISN is required for student sync');
    }

    const student = await this.studentRepository.findOne({
      where: { instansiId, nisn },
    });

    const studentData: Partial<Student> = {
      instansiId,
      nisn,
      name: this.mapField(data, 'nama', fieldMapping.name),
      email: this.mapField(data, 'email', fieldMapping.email),
      phone: this.mapField(data, 'telepon', fieldMapping.phone),
      address: this.mapField(data, 'alamat', fieldMapping.address),
      birthDate: this.parseDate(this.mapField(data, 'tanggal_lahir', fieldMapping.birthDate)),
      birthPlace: this.mapField(data, 'tempat_lahir', fieldMapping.birthPlace),
      gender: this.mapField(data, 'jenis_kelamin', fieldMapping.gender),
      religion: this.mapField(data, 'agama', fieldMapping.religion),
      nik: this.mapField(data, 'nik', fieldMapping.nik),
      studentNumber: this.mapField(data, 'nis', fieldMapping.studentNumber),
      parentName: this.mapField(data, 'nama_ayah', fieldMapping.parentName),
      parentPhone: this.mapField(data, 'telepon_ayah', fieldMapping.parentPhone),
      isActive: true,
    };

    if (student) {
      Object.assign(student, studentData);
      await this.studentRepository.save(student);
    } else {
      await this.studentRepository.save(this.studentRepository.create(studentData));
    }
  }

  private async syncTeacherFromDapodik(
    data: any,
    instansiId: number,
    mapping?: Record<string, any>,
  ) {
    const fieldMapping = mapping?.teacher || {};
    const nik = this.mapField(data, 'nik', fieldMapping.nik) || this.mapField(data, 'nuptk', fieldMapping.nuptk);

    if (!nik) {
      throw new Error('NIK or NUPTK is required for teacher sync');
    }

    const teacher = await this.teacherRepository.findOne({
      where: { instansiId, nik },
    });

    const teacherData: Partial<Teacher> = {
      instansiId,
      nik,
      nip: this.mapField(data, 'nip', fieldMapping.nip),
      nuptk: this.mapField(data, 'nuptk', fieldMapping.nuptk),
      name: this.mapField(data, 'nama', fieldMapping.name),
      email: this.mapField(data, 'email', fieldMapping.email),
      phone: this.mapField(data, 'telepon', fieldMapping.phone),
      address: this.mapField(data, 'alamat', fieldMapping.address),
      birthDate: this.parseDate(this.mapField(data, 'tanggal_lahir', fieldMapping.birthDate)),
      birthPlace: this.mapField(data, 'tempat_lahir', fieldMapping.birthPlace),
      gender: this.mapField(data, 'jenis_kelamin', fieldMapping.gender),
      education: this.mapField(data, 'pendidikan', fieldMapping.education),
      specialization: this.mapField(data, 'bidang_studi', fieldMapping.specialization),
      employeeNumber: this.mapField(data, 'no_pegawai', fieldMapping.employeeNumber),
      isActive: true,
    };

    if (teacher) {
      Object.assign(teacher, teacherData);
      await this.teacherRepository.save(teacher);
    } else {
      await this.teacherRepository.save(this.teacherRepository.create(teacherData));
    }
  }

  // Helper methods for Simpatika
  private async fetchSimpatikaData(
    apiUrl: string,
    apiKey: string,
    endpoint: string,
  ): Promise<any> {
    try {
      const url = `${apiUrl}/api/${endpoint}`;
      const response = await this.httpClient.get(url, {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`Simpatika API error: ${error.response.status} - ${error.response.statusText}`);
      }
      throw new Error(`Failed to fetch data from Simpatika: ${error.message}`);
    }
  }

  private async syncDataPokokFromSimpatika(
    data: any,
    instansiId: number,
    mapping?: Record<string, any>,
  ) {
    const fieldMapping = mapping?.dataPokok || {};
    const existing = await this.dataPokokRepository.findOne({
      where: { instansiId },
    });

    const dataPokokData: Partial<DataPokok> = {
      instansiId,
      npsn: this.mapField(data, 'npsn', fieldMapping.npsn),
      name: this.mapField(data, 'nama_sekolah', fieldMapping.name) || this.mapField(data, 'nama', fieldMapping.name),
      type: this.mapField(data, 'jenjang', fieldMapping.type),
      jenjang: this.mapField(data, 'jenjang', fieldMapping.jenjang),
      address: this.mapField(data, 'alamat', fieldMapping.address),
      phone: this.mapField(data, 'telepon', fieldMapping.phone),
      email: this.mapField(data, 'email', fieldMapping.email),
      principalName: this.mapField(data, 'kepala_sekolah', fieldMapping.principalName),
    };

    if (existing) {
      Object.assign(existing, dataPokokData);
      await this.dataPokokRepository.save(existing);
    } else {
      await this.dataPokokRepository.save(this.dataPokokRepository.create(dataPokokData));
    }
  }

  private async syncStudentFromSimpatika(
    data: any,
    instansiId: number,
    mapping?: Record<string, any>,
  ) {
    const fieldMapping = mapping?.student || {};
    const nisn = this.mapField(data, 'nisn', fieldMapping.nisn);

    if (!nisn) {
      throw new Error('NISN is required for student sync');
    }

    const student = await this.studentRepository.findOne({
      where: { instansiId, nisn },
    });

    const studentData: Partial<Student> = {
      instansiId,
      nisn,
      name: this.mapField(data, 'nama', fieldMapping.name),
      email: this.mapField(data, 'email', fieldMapping.email),
      phone: this.mapField(data, 'telepon', fieldMapping.phone),
      birthDate: this.parseDate(this.mapField(data, 'tanggal_lahir', fieldMapping.birthDate)),
      birthPlace: this.mapField(data, 'tempat_lahir', fieldMapping.birthPlace),
      gender: this.mapField(data, 'jenis_kelamin', fieldMapping.gender),
      nik: this.mapField(data, 'nik', fieldMapping.nik),
      studentNumber: this.mapField(data, 'nis', fieldMapping.studentNumber),
      isActive: true,
    };

    if (student) {
      Object.assign(student, studentData);
      await this.studentRepository.save(student);
    } else {
      await this.studentRepository.save(this.studentRepository.create(studentData));
    }
  }

  private async syncTeacherFromSimpatika(
    data: any,
    instansiId: number,
    mapping?: Record<string, any>,
  ) {
    const fieldMapping = mapping?.teacher || {};
    const nik = this.mapField(data, 'nik', fieldMapping.nik) || this.mapField(data, 'nuptk', fieldMapping.nuptk);

    if (!nik) {
      throw new Error('NIK or NUPTK is required for teacher sync');
    }

    const teacher = await this.teacherRepository.findOne({
      where: { instansiId, nik },
    });

    const teacherData: Partial<Teacher> = {
      instansiId,
      nik,
      nip: this.mapField(data, 'nip', fieldMapping.nip),
      nuptk: this.mapField(data, 'nuptk', fieldMapping.nuptk),
      name: this.mapField(data, 'nama', fieldMapping.name),
      email: this.mapField(data, 'email', fieldMapping.email),
      phone: this.mapField(data, 'telepon', fieldMapping.phone),
      birthDate: this.parseDate(this.mapField(data, 'tanggal_lahir', fieldMapping.birthDate)),
      birthPlace: this.mapField(data, 'tempat_lahir', fieldMapping.birthPlace),
      gender: this.mapField(data, 'jenis_kelamin', fieldMapping.gender),
      isActive: true,
    };

    if (teacher) {
      Object.assign(teacher, teacherData);
      await this.teacherRepository.save(teacher);
    } else {
      await this.teacherRepository.save(this.teacherRepository.create(teacherData));
    }
  }

  // Utility methods
  private mapField(data: any, defaultField: string, customField?: string): any {
    if (customField && data[customField] !== undefined) {
      return data[customField];
    }
    return data[defaultField];
  }

  private parseDate(dateString: any): Date | null {
    if (!dateString) return null;
    if (dateString instanceof Date) return dateString;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }
}

