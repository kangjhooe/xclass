import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
  Res,
  Req,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { StorageService } from './storage.service';
import { StorageQuotaService } from './storage-quota.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { StorageUpgradeType } from './entities/storage-upgrade.entity';

@Controller({ path: ['storage', 'tenants/:tenant/storage'] })
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly storageQuotaService: StorageQuotaService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('subfolder') subfolder?: string,
    @TenantId() instansiId?: number,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.storageService.uploadFile(file, subfolder, instansiId);
    return {
      success: true,
      data: result,
    };
  }

  // Storage Quota Endpoints - Must be before wildcard routes
  @Get('quota')
  async getStorageQuota(@TenantId() instansiId?: number) {
    if (!instansiId) {
      throw new BadRequestException('Tenant ID is required');
    }
    const quota = await this.storageQuotaService.getStorageQuota(instansiId);
    return {
      success: true,
      data: quota,
    };
  }

  @Get('quota/packages')
  async getUpgradePackages(@TenantId() instansiId?: number) {
    // Packages are the same for all tenants, so tenant ID is optional
    const packages = this.storageQuotaService.getUpgradePackages();
    return {
      success: true,
      data: packages,
    };
  }

  @Post('quota/upgrade')
  async createStorageUpgrade(
    @TenantId() instansiId?: number,
    @Body() body?: { upgradeType: StorageUpgradeType; additionalGB: number },
  ) {
    if (!instansiId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!body || !body.upgradeType || !body.additionalGB) {
      throw new BadRequestException('upgradeType and additionalGB are required');
    }

    const upgrade = await this.storageQuotaService.createStorageUpgrade(
      instansiId,
      body.upgradeType,
      body.additionalGB,
    );

    return {
      success: true,
      data: upgrade,
      message: 'Storage upgrade berhasil dibuat. Silakan lakukan pembayaran untuk mengaktifkan.',
    };
  }

  @Get('quota/upgrades')
  async getActiveUpgrades(@TenantId() instansiId?: number) {
    if (!instansiId) {
      throw new BadRequestException('Tenant ID is required');
    }
    const upgrades = await this.storageQuotaService.getActiveUpgrades(instansiId);
    return {
      success: true,
      data: upgrades,
    };
  }

  // File operations - Must be after specific routes
  @Get('*path')
  async getFile(@Param('path') path: string, @Req() req: Request, @Res() res: Response) {
    try {
      // Skip if path starts with 'quota' (already handled above)
      if (path && path.startsWith('quota')) {
        return res.status(404).send('Not found');
      }
      // Extract path from request (remove /api/storage prefix)
      const filePath = path || req.url.replace('/api/storage/', '');
      const file = await this.storageService.getFile(filePath);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(file);
    } catch (error) {
      res.status(404).send('File not found');
    }
  }

  @Delete('*path')
  async deleteFile(
    @Param('path') path: string,
    @Req() req: Request,
    @TenantId() instansiId?: number,
  ) {
    // Skip if path starts with 'quota' (quota endpoints don't use DELETE)
    if (path && path.startsWith('quota')) {
      throw new BadRequestException('Invalid path');
    }
    // Extract path from request (remove /api/storage prefix)
    const filePath = path || req.url.replace('/api/storage/', '');
    await this.storageService.deleteFile(filePath, instansiId);
    return {
      success: true,
      message: 'File deleted successfully',
    };
  }
}

