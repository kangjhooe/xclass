import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly uploadPath: string;
  private readonly maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes: string[] = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  constructor(private configService: ConfigService) {
    this.uploadPath = this.configService.get<string>('UPLOAD_PATH') || './storage/app/public';
    this.ensureDirectoryExists(this.uploadPath);
  }

  private ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    subfolder?: string,
    instansiId?: number,
  ): Promise<{ filename: string; path: string; url: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Validate MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${randomUUID()}${fileExtension}`;

    // Determine upload path
    let uploadDir = this.uploadPath;
    if (instansiId) {
      uploadDir = path.join(uploadDir, 'tenants', instansiId.toString());
    }
    if (subfolder) {
      uploadDir = path.join(uploadDir, subfolder);
    }
    this.ensureDirectoryExists(uploadDir);

    const filePath = path.join(uploadDir, uniqueFilename);

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    // Generate URL
    const url = `/storage/${instansiId ? `tenants/${instansiId}/` : ''}${subfolder ? `${subfolder}/` : ''}${uniqueFilename}`;

    return {
      filename: uniqueFilename,
      path: filePath,
      url,
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadPath, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  async getFile(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.uploadPath, filePath);
    if (!fs.existsSync(fullPath)) {
      throw new BadRequestException('File not found');
    }
    return fs.readFileSync(fullPath);
  }
}

