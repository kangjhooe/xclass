import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CardManagementService } from './card-management.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CreateCardTemplateDto } from './dto/create-card-template.dto';
import { UpdateCardTemplateDto } from './dto/update-card-template.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('card-management')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CardManagementController {
  constructor(private readonly cardManagementService: CardManagementService) {}

  // Card endpoints
  @Post('cards')
  createCard(@Body() createCardDto: CreateCardDto, @TenantId() instansiId: number) {
    return this.cardManagementService.createCard(createCardDto, instansiId);
  }

  @Get('cards')
  findAllCards(
    @TenantId() instansiId: number,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('studentId') studentId?: number,
    @Query('teacherId') teacherId?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.cardManagementService.findAllCards({
      type,
      status,
      studentId: studentId ? Number(studentId) : undefined,
      teacherId: teacherId ? Number(teacherId) : undefined,
      page: Number(page),
      limit: Number(limit),
      instansiId,
    });
  }

  @Get('cards/:id')
  findOneCard(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.cardManagementService.findOneCard(+id, instansiId);
  }

  @Patch('cards/:id')
  updateCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
    @TenantId() instansiId: number,
  ) {
    return this.cardManagementService.updateCard(+id, updateCardDto, instansiId);
  }

  @Delete('cards/:id')
  removeCard(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.cardManagementService.removeCard(+id, instansiId);
  }

  // Template endpoints
  @Post('templates')
  createTemplate(
    @Body() createTemplateDto: CreateCardTemplateDto,
    @TenantId() instansiId: number,
  ) {
    return this.cardManagementService.createTemplate(createTemplateDto, instansiId);
  }

  @Get('templates')
  findAllTemplates(@TenantId() instansiId: number, @Query('type') type?: string) {
    return this.cardManagementService.findAllTemplates({ type, instansiId });
  }

  @Get('templates/:id')
  findOneTemplate(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.cardManagementService.findOneTemplate(+id, instansiId);
  }

  @Patch('templates/:id')
  updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateCardTemplateDto,
    @TenantId() instansiId: number,
  ) {
    return this.cardManagementService.updateTemplate(+id, updateTemplateDto, instansiId);
  }

  @Delete('templates/:id')
  removeTemplate(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.cardManagementService.removeTemplate(+id, instansiId);
  }
}

