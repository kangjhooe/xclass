import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CorrespondenceService } from './correspondence.service';
import { CreateIncomingLetterDto } from './dto/create-incoming-letter.dto';
import { UpdateIncomingLetterDto } from './dto/update-incoming-letter.dto';
import { CreateOutgoingLetterDto } from './dto/create-outgoing-letter.dto';
import { UpdateOutgoingLetterDto } from './dto/update-outgoing-letter.dto';
import { AddDispositionDto } from './dto/add-disposition.dto';
import {
  TenantId,
  CurrentUserId,
} from '../../common/decorators/tenant.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ModuleAccessGuard } from '../../common/guards/module-access.guard';
import { ModuleAccess } from '../../common/decorators/module-access.decorator';
import {
  LetterStatus,
  LetterPriority,
} from './entities/incoming-letter.entity';
import {
  OutgoingLetterStatus,
} from './entities/outgoing-letter.entity';
import { CreateLetterTemplateDto } from './dto/create-letter-template.dto';
import { UpdateLetterTemplateDto } from './dto/update-letter-template.dto';
import { UpdateLetterSequenceDto } from './dto/update-letter-sequence.dto';
import { GenerateLetterDto } from './dto/generate-letter.dto';
import { ArchiveSourceType } from './entities/correspondence-archive.entity';

@Controller({
  path: ['correspondence', 'tenants/:tenant/correspondence'],
})
@UseGuards(JwtAuthGuard, TenantGuard, ModuleAccessGuard)
export class CorrespondenceController {
  constructor(
    private readonly correspondenceService: CorrespondenceService,
  ) {}

  // ========== Archive Overview ==========
  @Get()
  @ModuleAccess('correspondence', 'view')
  listArchive(
    @TenantId() instansiId: number,
    @Query('type') type?: ArchiveSourceType,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.correspondenceService.listArchive({
      instansiId,
      type,
      status,
      category,
      search,
      startDate,
      endDate,
      page: +page,
      limit: +limit,
    });
  }

  // ========== Incoming Letters ==========
  @Post('incoming')
  @ModuleAccess('correspondence', 'create')
  createIncoming(
    @Body() createDto: CreateIncomingLetterDto,
    @TenantId() instansiId: number,
    @CurrentUserId() createdBy: number,
  ) {
    return this.correspondenceService.createIncoming(
      createDto,
      instansiId,
      createdBy,
    );
  }

  @Get('incoming')
  @ModuleAccess('correspondence', 'view')
  findAllIncoming(
    @TenantId() instansiId: number,
    @Query('search') search?: string,
    @Query('status') status?: LetterStatus,
    @Query('jenisSurat') jenisSurat?: string,
    @Query('prioritas') prioritas?: LetterPriority,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.correspondenceService.findAllIncoming({
      search,
      status,
      jenisSurat,
      prioritas,
      startDate,
      endDate,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Get('incoming/:id')
  @ModuleAccess('correspondence', 'view')
  findOneIncoming(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.correspondenceService.findOneIncoming(+id, instansiId);
  }

  @Patch('incoming/:id')
  @ModuleAccess('correspondence', 'update')
  updateIncoming(
    @Param('id') id: string,
    @Body() updateDto: UpdateIncomingLetterDto,
    @TenantId() instansiId: number,
    @CurrentUserId() updatedBy: number,
  ) {
    return this.correspondenceService.updateIncoming(
      +id,
      updateDto,
      instansiId,
      updatedBy,
    );
  }

  @Delete('incoming/:id')
  @ModuleAccess('correspondence', 'delete')
  removeIncoming(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.correspondenceService.removeIncoming(+id, instansiId);
  }

  @Post('incoming/:id/disposition')
  @ModuleAccess('correspondence', 'update')
  addDisposition(
    @Param('id') id: string,
    @Body() dispositionDto: AddDispositionDto,
    @TenantId() instansiId: number,
  ) {
    return this.correspondenceService.addDisposition(
      +id,
      dispositionDto,
      instansiId,
    );
  }

  @Patch('incoming/:id/status')
  @ModuleAccess('correspondence', 'update')
  updateIncomingStatus(
    @Param('id') id: string,
    @Body('status') status: LetterStatus,
    @TenantId() instansiId: number,
  ) {
    return this.correspondenceService.updateIncomingStatus(
      +id,
      status,
      instansiId,
    );
  }

  // ========== Outgoing Letters ==========
  @Post('outgoing')
  @ModuleAccess('correspondence', 'create')
  createOutgoing(
    @Body() createDto: CreateOutgoingLetterDto,
    @TenantId() instansiId: number,
    @CurrentUserId() createdBy: number,
  ) {
    return this.correspondenceService.createOutgoing(
      createDto,
      instansiId,
      createdBy,
    );
  }

  @Get('outgoing')
  @ModuleAccess('correspondence', 'view')
  findAllOutgoing(
    @TenantId() instansiId: number,
    @Query('search') search?: string,
    @Query('status') status?: OutgoingLetterStatus,
    @Query('jenisSurat') jenisSurat?: string,
    @Query('prioritas') prioritas?: LetterPriority,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.correspondenceService.findAllOutgoing({
      search,
      status,
      jenisSurat,
      prioritas,
      startDate,
      endDate,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Get('outgoing/:id')
  @ModuleAccess('correspondence', 'view')
  findOneOutgoing(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.correspondenceService.findOneOutgoing(+id, instansiId);
  }

  @Patch('outgoing/:id')
  @ModuleAccess('correspondence', 'update')
  updateOutgoing(
    @Param('id') id: string,
    @Body() updateDto: UpdateOutgoingLetterDto,
    @TenantId() instansiId: number,
    @CurrentUserId() updatedBy: number,
  ) {
    return this.correspondenceService.updateOutgoing(
      +id,
      updateDto,
      instansiId,
      updatedBy,
    );
  }

  @Delete('outgoing/:id')
  @ModuleAccess('correspondence', 'delete')
  removeOutgoing(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.correspondenceService.removeOutgoing(+id, instansiId);
  }

  @Patch('outgoing/:id/status')
  @ModuleAccess('correspondence', 'update')
  updateOutgoingStatus(
    @Param('id') id: string,
    @Body('status') status: OutgoingLetterStatus,
    @TenantId() instansiId: number,
  ) {
    return this.correspondenceService.updateOutgoingStatus(
      +id,
      status,
      instansiId,
    );
  }

  @Post('outgoing/:id/archive')
  archiveOutgoing(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.correspondenceService.archiveOutgoing(+id, instansiId);
  }

  // ========== Statistics ==========
  @Get('statistics')
  getStatistics(
    @TenantId() instansiId: number,
    @Query('year') year?: number,
  ) {
    return this.correspondenceService.getStatistics(
      instansiId,
      year ? +year : undefined,
    );
  }

  // ========== Templates ==========
  @Get('templates')
  listTemplates(@TenantId() instansiId: number) {
    return this.correspondenceService.listTemplates(instansiId);
  }

  @Post('templates')
  createTemplate(
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
    @Body() dto: CreateLetterTemplateDto,
  ) {
    return this.correspondenceService.createTemplate(instansiId, userId, dto);
  }

  @Get('templates/:id')
  getTemplate(
    @TenantId() instansiId: number,
    @Param('id') id: string,
  ) {
    return this.correspondenceService.getTemplate(instansiId, +id);
  }

  @Patch('templates/:id')
  updateTemplate(
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
    @Param('id') id: string,
    @Body() dto: UpdateLetterTemplateDto,
  ) {
    return this.correspondenceService.updateTemplate(
      instansiId,
      +id,
      userId,
      dto,
    );
  }

  @Delete('templates/:id')
  deleteTemplate(
    @TenantId() instansiId: number,
    @Param('id') id: string,
  ) {
    return this.correspondenceService.deleteTemplate(instansiId, +id);
  }

  // ========== Sequences ==========
  @Get('sequences')
  listSequences(@TenantId() instansiId: number) {
    return this.correspondenceService.listSequences(instansiId);
  }

  @Get('sequences/:code')
  getSequence(
    @TenantId() instansiId: number,
    @Param('code') code: string,
  ) {
    return this.correspondenceService.getSequence(instansiId, code);
  }

  @Patch('sequences/:code')
  updateSequence(
    @TenantId() instansiId: number,
    @Param('code') code: string,
    @Body() dto: UpdateLetterSequenceDto,
  ) {
    return this.correspondenceService.updateSequence(instansiId, code, dto);
  }

  // ========== Generated Letters ==========
  @Post('generate')
  generateLetter(
    @TenantId() instansiId: number,
    @CurrentUserId() userId: number,
    @Body() dto: GenerateLetterDto,
  ) {
    return this.correspondenceService.generateLetter(instansiId, userId, dto);
  }

  @Get('generated')
  listGenerated(@TenantId() instansiId: number) {
    return this.correspondenceService.listGeneratedLetters(instansiId);
  }

  @Get('generated/:id/download')
  async downloadGeneratedLetter(
    @Param('id') id: string,
    @TenantId() instansiId: number,
    @Res() res: Response,
  ) {
    return this.correspondenceService.downloadGeneratedLetter(
      +id,
      instansiId,
      res,
    );
  }

  @Get('archive/:id/download')
  async downloadArchiveLetter(
    @Param('id') id: string,
    @TenantId() instansiId: number,
    @Res() res: Response,
  ) {
    return this.correspondenceService.downloadArchiveLetter(
      +id,
      instansiId,
      res,
    );
  }
}
