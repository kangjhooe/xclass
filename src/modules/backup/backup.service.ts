import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Backup, BackupType, BackupStatus } from './entities/backup.entity';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private backupDir: string;

  constructor(
    @InjectRepository(Backup)
    private backupRepository: Repository<Backup>,
    private configService: ConfigService,
  ) {
    this.backupDir = path.join(
      process.cwd(),
      'storage',
      'app',
      'backups',
    );
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    type?: BackupType,
    status?: BackupStatus,
    tenantId?: number,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (tenantId) where.tenantId = tenantId;

    const [backups, total] = await this.backupRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: backups,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const backup = await this.backupRepository.findOne({ where: { id } });
    if (!backup) {
      throw new NotFoundException(`Backup with ID ${id} not found`);
    }
    return backup;
  }

  async createBackup(
    type: BackupType,
    name: string,
    tenantId?: number,
    description?: string,
  ) {
    const backup = this.backupRepository.create({
      name,
      type,
      status: BackupStatus.PENDING,
      tenantId,
      description,
    });
    const savedBackup = await this.backupRepository.save(backup);

    // Execute backup asynchronously
    this.executeBackup(savedBackup).catch((error) => {
      console.error('Backup execution error:', error);
    });

    return savedBackup;
  }

  private async executeBackup(backup: Backup) {
    try {
      backup.status = BackupStatus.IN_PROGRESS;
      await this.backupRepository.save(backup);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${backup.type}-${timestamp}.sql`;
      const filePath = path.join(this.backupDir, fileName);

      let command: string;

      if (backup.type === BackupType.DATABASE || backup.type === BackupType.FULL) {
        // Database backup using mysqldump
        const dbHost = this.configService.get<string>('DB_HOST') || 'localhost';
        const dbPort = this.configService.get<string>('DB_PORT') || '3306';
        const dbUser = this.configService.get<string>('DB_USERNAME') || 'root';
        const dbPassword = this.configService.get<string>('DB_PASSWORD') || '';
        const dbName = this.configService.get<string>('DB_DATABASE') || 'class';

        command = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} ${
          dbPassword ? `-p${dbPassword}` : ''
        } ${dbName} > "${filePath}"`;

        if (backup.tenantId) {
          // Backup specific tenant data only
          // This would require custom logic to export only tenant-specific tables
          // For now, we'll do a full backup
        }
      } else {
        throw new BadRequestException(`Backup type ${backup.type} not yet implemented`);
      }

      await execAsync(command);

      const stats = fs.statSync(filePath);
      backup.filePath = filePath;
      backup.fileSize = stats.size;
      backup.status = BackupStatus.COMPLETED;
      backup.metadata = {
        fileName,
        createdAt: new Date().toISOString(),
      };

      await this.backupRepository.save(backup);
    } catch (error) {
      backup.status = BackupStatus.FAILED;
      backup.errorMessage = error.message;
      await this.backupRepository.save(backup);
      throw error;
    }
  }

  async restoreBackup(id: number) {
    const backup = await this.findOne(id);
    if (backup.status !== BackupStatus.COMPLETED) {
      throw new BadRequestException('Can only restore completed backups');
    }

    if (!fs.existsSync(backup.filePath)) {
      throw new NotFoundException('Backup file not found');
    }

    try {
      const dbHost = this.configService.get<string>('DB_HOST') || 'localhost';
      const dbPort = this.configService.get<string>('DB_PORT') || '3306';
      const dbUser = this.configService.get<string>('DB_USERNAME') || 'root';
      const dbPassword = this.configService.get<string>('DB_PASSWORD') || '';
      const dbName = this.configService.get<string>('DB_DATABASE') || 'class';

      const command = `mysql -h ${dbHost} -P ${dbPort} -u ${dbUser} ${
        dbPassword ? `-p${dbPassword}` : ''
      } ${dbName} < "${backup.filePath}"`;

      await execAsync(command);

      return {
        success: true,
        message: 'Backup restored successfully',
        backupId: backup.id,
      };
    } catch (error) {
      throw new BadRequestException(`Restore failed: ${error.message}`);
    }
  }

  async deleteBackup(id: number) {
    const backup = await this.findOne(id);
    
    // Delete file if exists
    if (backup.filePath && fs.existsSync(backup.filePath)) {
      fs.unlinkSync(backup.filePath);
    }

    return this.backupRepository.remove(backup);
  }

  async downloadBackup(id: number) {
    const backup = await this.findOne(id);
    if (!backup.filePath || !fs.existsSync(backup.filePath)) {
      throw new NotFoundException('Backup file not found');
    }
    return backup.filePath;
  }
}

