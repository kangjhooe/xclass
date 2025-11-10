import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GuestBookService } from './guest-book.service';
import { CreateGuestBookDto } from './dto/create-guest-book.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('guest-book')
@UseGuards(JwtAuthGuard)
export class GuestBookController {
  constructor(private readonly guestBookService: GuestBookService) {}

  @Post()
  create(
    @Body() createDto: CreateGuestBookDto,
    @TenantId() instansiId: number,
  ) {
    return this.guestBookService.create(createDto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.guestBookService.findAll({
      instansiId,
      startDate,
      endDate,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.guestBookService.findOne(+id, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.guestBookService.remove(+id, instansiId);
  }
}

