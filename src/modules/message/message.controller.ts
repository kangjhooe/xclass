import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { TenantId, CurrentUserId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(
    @Body() createDto: CreateMessageDto,
    @TenantId() instansiId: number,
    @CurrentUserId() senderId: number,
  ) {
    return this.messageService.create(createDto, instansiId, senderId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
    @Query('type') type?: 'inbox' | 'sent' | 'archived',
    @Query('isRead') isRead?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.messageService.findAll({
      instansiId,
      userId,
      type,
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
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

  @Patch(':id/mark-read')
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
}

