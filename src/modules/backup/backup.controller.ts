import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { BackupType } from './entities/backup.entity';

@Controller('admin/backups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: BackupType,
    @Query('status') status?: string,
    @Query('tenantId') tenantId?: number,
  ) {
    return this.backupService.findAll(
      page ? +page : 1,
      limit ? +limit : 20,
      type,
      status as any,
      tenantId ? +tenantId : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.backupService.findOne(+id);
  }

  @Post()
  createBackup(
    @Body()
    body: {
      type: BackupType;
      name: string;
      tenantId?: number;
      description?: string;
    },
  ) {
    return this.backupService.createBackup(
      body.type,
      body.name,
      body.tenantId,
      body.description,
    );
  }

  @Post(':id/restore')
  restoreBackup(@Param('id') id: string) {
    return this.backupService.restoreBackup(+id);
  }

  @Get(':id/download')
  async downloadBackup(@Param('id') id: string, @Res() res: Response) {
    const filePath = await this.backupService.downloadBackup(+id);
    const fileName = path.basename(filePath);
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Delete(':id')
  deleteBackup(@Param('id') id: string) {
    return this.backupService.deleteBackup(+id);
  }
}

