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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

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

  @Get('*')
  async getFile(@Req() req: Request, @Res() res: Response) {
    try {
      // Extract path from request (remove /api/storage prefix)
      const filePath = req.params['0'] || req.url.replace('/api/storage/', '');
      const file = await this.storageService.getFile(filePath);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(file);
    } catch (error) {
      res.status(404).send('File not found');
    }
  }

  @Delete('*')
  async deleteFile(@Req() req: Request) {
    // Extract path from request (remove /api/storage prefix)
    const filePath = req.params['0'] || req.url.replace('/api/storage/', '');
    await this.storageService.deleteFile(filePath);
    return {
      success: true,
      message: 'File deleted successfully',
    };
  }
}

