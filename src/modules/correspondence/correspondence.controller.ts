import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CorrespondenceService } from './correspondence.service';
import { CreateIncomingLetterDto } from './dto/create-incoming-letter.dto';
import { UpdateIncomingLetterDto } from './dto/update-incoming-letter.dto';
import { CreateOutgoingLetterDto } from './dto/create-outgoing-letter.dto';
import { UpdateOutgoingLetterDto } from './dto/update-outgoing-letter.dto';
import { AddDispositionDto } from './dto/add-disposition.dto';
import { TenantId, CurrentUserId } from '../../common/decorators/tenant.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  LetterStatus,
  LetterPriority,
  LetterNature,
} from './entities/incoming-letter.entity';
import {
  OutgoingLetterStatus,
} from './entities/outgoing-letter.entity';

@Controller('correspondence')
@UseGuards(JwtAuthGuard)
export class CorrespondenceController {
  constructor(
    private readonly correspondenceService: CorrespondenceService,
  ) {}

  // ========== Incoming Letters ==========
  @Post('incoming')
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
  findOneIncoming(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.correspondenceService.findOneIncoming(+id, instansiId);
  }

  @Patch('incoming/:id')
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
  removeIncoming(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.correspondenceService.removeIncoming(+id, instansiId);
  }

  @Post('incoming/:id/disposition')
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
  findOneOutgoing(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.correspondenceService.findOneOutgoing(+id, instansiId);
  }

  @Patch('outgoing/:id')
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
  removeOutgoing(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.correspondenceService.removeOutgoing(+id, instansiId);
  }

  @Patch('outgoing/:id/status')
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
}
