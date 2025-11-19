import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { TenantId, CurrentUserId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller({ path: ['conversations', 'tenants/:tenant/conversations'] })
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  create(
    @Body() createDto: { name: string; memberIds: number[]; description?: string },
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.conversationService.create(
      createDto.name,
      instansiId,
      userId,
      createDto.memberIds,
      createDto.description,
    );
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.conversationService.findAll(instansiId, userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.conversationService.findOne(+id, instansiId, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: { name?: string; description?: string },
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.conversationService.update(+id, instansiId, userId, updateDto);
  }

  @Post(':id/members')
  addMembers(
    @Param('id') id: string,
    @Body() body: { memberIds: number[] },
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.conversationService.addMembers(+id, instansiId, userId, body.memberIds);
  }

  @Delete(':id/members/:memberUserId')
  removeMember(
    @Param('id') id: string,
    @Param('memberUserId') memberUserId: string,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.conversationService.removeMember(+id, instansiId, userId, +memberUserId);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.conversationService.delete(+id, instansiId, userId);
  }
}

