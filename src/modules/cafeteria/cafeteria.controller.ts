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
import { CafeteriaService } from './cafeteria.service';
import { CreateCafeteriaMenuDto } from './dto/create-cafeteria-menu.dto';
import { UpdateCafeteriaMenuDto } from './dto/update-cafeteria-menu.dto';
import { CreateCafeteriaOrderDto } from './dto/create-cafeteria-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { CreateCafeteriaOutletDto } from './dto/create-cafeteria-outlet.dto';
import { UpdateCafeteriaOutletDto } from './dto/update-cafeteria-outlet.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller({ path: ['cafeteria', 'tenants/:tenant/cafeteria'] })
@UseGuards(JwtAuthGuard, TenantGuard)
export class CafeteriaController {
  constructor(private readonly cafeteriaService: CafeteriaService) {}

  // ========== CANTEENS ==========

  @Post('canteens')
  createCanteen(
    @Body() createDto: CreateCafeteriaOutletDto,
    @TenantId() instansiId: number,
  ) {
    return this.cafeteriaService.createCanteen(createDto, instansiId);
  }

  @Get('canteens')
  findAllCanteens(@TenantId() instansiId: number) {
    return this.cafeteriaService.findAllCanteens(instansiId);
  }

  @Get('canteens/:id')
  findOneCanteen(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.cafeteriaService.findOneCanteen(+id, instansiId);
  }

  @Patch('canteens/:id')
  updateCanteen(
    @Param('id') id: string,
    @Body() updateDto: UpdateCafeteriaOutletDto,
    @TenantId() instansiId: number,
  ) {
    return this.cafeteriaService.updateCanteen(+id, updateDto, instansiId);
  }

  @Delete('canteens/:id')
  removeCanteen(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.cafeteriaService.removeCanteen(+id, instansiId);
  }

  // ========== MENU ==========

  @Post('menu')
  createMenu(
    @Body() createDto: CreateCafeteriaMenuDto,
    @TenantId() instansiId: number,
  ) {
    return this.cafeteriaService.createMenu(createDto, instansiId);
  }

  @Get('menu')
  findAllMenus(
    @TenantId() instansiId: number,
    @Query('canteenId') canteenId?: string,
    @Query('category') category?: string,
    @Query('isAvailable') isAvailable?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.cafeteriaService.findAllMenus({
      instansiId,
      canteenId: canteenId ? Number(canteenId) : undefined,
      category,
      isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined,
      search,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('menu/:id')
  findOneMenu(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.cafeteriaService.findOneMenu(+id, instansiId);
  }

  @Patch('menu/:id')
  updateMenu(
    @Param('id') id: string,
    @Body() updateDto: UpdateCafeteriaMenuDto,
    @TenantId() instansiId: number,
  ) {
    return this.cafeteriaService.updateMenu(+id, updateDto, instansiId);
  }

  @Delete('menu/:id')
  removeMenu(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.cafeteriaService.removeMenu(+id, instansiId);
  }

  // ========== ORDERS ==========

  @Post('orders')
  createOrder(
    @Body() createDto: CreateCafeteriaOrderDto,
    @TenantId() instansiId: number,
  ) {
    return this.cafeteriaService.createOrder(createDto, instansiId);
  }

  @Get('orders')
  findAllOrders(
    @TenantId() instansiId: number,
    @Query('canteenId') canteenId?: string,
    @Query('studentId') studentId?: number,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.cafeteriaService.findAllOrders({
      instansiId,
      canteenId: canteenId ? Number(canteenId) : undefined,
      studentId: studentId ? Number(studentId) : undefined,
      status,
      paymentStatus,
      date,
      startDate,
      endDate,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get('orders/:id')
  findOneOrder(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.cafeteriaService.findOneOrder(+id, instansiId);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @TenantId() instansiId: number,
  ) {
    return this.cafeteriaService.updateOrderStatus(
      +id,
      updateStatusDto,
      instansiId,
    );
  }

  @Delete('orders/:id')
  removeOrder(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.cafeteriaService.removeOrder(+id, instansiId);
  }

  // ========== PAYMENTS ==========

  @Post('orders/:id/payment')
  processPayment(
    @Param('id') id: string,
    @Body() paymentDto: ProcessPaymentDto,
    @TenantId() instansiId: number,
  ) {
    return this.cafeteriaService.processPayment(+id, paymentDto, instansiId);
  }

  // ========== STATISTICS ==========

  @Get('statistics')
  getStatistics(@TenantId() instansiId: number) {
    return this.cafeteriaService.getStatistics(instansiId);
  }
}

