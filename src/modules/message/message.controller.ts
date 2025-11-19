import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Put,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { TenantId, CurrentUserId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StorageService } from '../storage/storage.service';

@Controller({ path: ['messages', 'tenants/:tenant/messages'] })
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('attachments', 10))
  async create(
    @Body() createDto: CreateMessageDto,
    @UploadedFiles() files?: Express.Multer.File[],
    @TenantId() instansiId?: number,
    @CurrentUserId() senderId?: number,
  ) {
    // Handle file uploads
    const attachments = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const uploadResult = await this.storageService.uploadFile(
            file,
            'messages',
            instansiId,
          );
          attachments.push({
            filename: uploadResult.filename,
            originalName: file.originalname,
            url: uploadResult.url,
            size: file.size,
            mimeType: file.mimetype,
          });
        } catch (error) {
          console.error(`Error uploading file ${file.originalname}:`, error);
          throw new BadRequestException(`Error uploading file ${file.originalname}: ${error.message}`);
        }
      }
    }

    // Merge attachments from DTO and uploaded files
    const allAttachments = [
      ...(createDto.attachments || []),
      ...attachments,
    ];

    return this.messageService.create(
      {
        ...createDto,
        attachments: allAttachments.length > 0 ? allAttachments : undefined,
      },
      instansiId!,
      senderId!,
      createDto.conversationId,
    );
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
    @Query('type') type?: 'inbox' | 'sent' | 'archived',
    @Query('isRead') isRead?: string,
    @Query('search') search?: string,
    @Query('priority') priority?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('senderId') senderId?: string,
    @Query('receiverId') receiverId?: string,
    @Query('conversationId') conversationId?: string,
    @Query('sortBy') sortBy?: 'date' | 'priority' | 'subject',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.messageService.findAll({
      instansiId,
      userId,
      type,
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      search,
      priority,
      startDate,
      endDate,
      senderId: senderId ? Number(senderId) : undefined,
      receiverId: receiverId ? Number(receiverId) : undefined,
      conversationId: conversationId ? Number(conversationId) : undefined,
      sortBy,
      sortOrder,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('inbox')
  getInbox(
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
    @Query('search') search?: string,
    @Query('priority') priority?: string,
    @Query('isRead') isRead?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('senderId') senderId?: string,
    @Query('sortBy') sortBy?: 'date' | 'priority' | 'subject',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.messageService.findAll({
      instansiId,
      userId,
      type: 'inbox',
      search,
      priority,
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      startDate,
      endDate,
      senderId: senderId ? Number(senderId) : undefined,
      sortBy,
      sortOrder,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('sent')
  getSent(
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
    @Query('search') search?: string,
    @Query('priority') priority?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('receiverId') receiverId?: string,
    @Query('sortBy') sortBy?: 'date' | 'priority' | 'subject',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.messageService.findAll({
      instansiId,
      userId,
      type: 'sent',
      search,
      priority,
      startDate,
      endDate,
      receiverId: receiverId ? Number(receiverId) : undefined,
      sortBy,
      sortOrder,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.messageService.findOne(+id, instansiId, userId);
  }

  @Put(':id/read')
  markAsRead(
    @Param('id') id: string,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.messageService.markAsRead(+id, instansiId, userId);
  }

  @Patch(':id/archive')
  archive(
    @Param('id') id: string,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.messageService.archive(+id, instansiId, userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.messageService.remove(+id, instansiId, userId);
  }

  @Get('unread/count')
  getUnreadCount(
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.messageService.getUnreadCount(instansiId, userId);
  }

  @Get('attachments/:filename')
  async downloadAttachment(
    @Param('filename') filename: string,
    @TenantId() instansiId: number,
    @Res() res: Response,
  ) {
    try {
      const filePath = `tenants/${instansiId}/messages/${filename}`;
      const fileBuffer = await this.storageService.getFile(filePath);
      
      // Determine content type from filename
      const ext = filename.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
      };
      
      res.setHeader('Content-Type', mimeTypes[ext || ''] || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.send(fileBuffer);
    } catch (error) {
      throw new BadRequestException('File not found');
    }
  }
}

