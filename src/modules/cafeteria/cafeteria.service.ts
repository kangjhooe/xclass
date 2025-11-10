import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CafeteriaMenu } from './entities/cafeteria-menu.entity';
import { CafeteriaOrder } from './entities/cafeteria-order.entity';
import { CafeteriaOrderItem } from './entities/cafeteria-order-item.entity';
import { CafeteriaPayment } from './entities/cafeteria-payment.entity';
import { CreateCafeteriaMenuDto } from './dto/create-cafeteria-menu.dto';
import { UpdateCafeteriaMenuDto } from './dto/update-cafeteria-menu.dto';
import { CreateCafeteriaOrderDto } from './dto/create-cafeteria-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class CafeteriaService {
  constructor(
    @InjectRepository(CafeteriaMenu)
    private menuRepository: Repository<CafeteriaMenu>,
    @InjectRepository(CafeteriaOrder)
    private orderRepository: Repository<CafeteriaOrder>,
    @InjectRepository(CafeteriaOrderItem)
    private orderItemRepository: Repository<CafeteriaOrderItem>,
    @InjectRepository(CafeteriaPayment)
    private paymentRepository: Repository<CafeteriaPayment>,
  ) {}

  // ========== MENU ==========

  async createMenu(
    createDto: CreateCafeteriaMenuDto,
    instansiId: number,
  ) {
    const menu = this.menuRepository.create({
      ...createDto,
      instansiId,
    });
    return await this.menuRepository.save(menu);
  }

  async findAllMenus(filters: {
    instansiId: number;
    category?: string;
    isAvailable?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      instansiId,
      category,
      isAvailable,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.menuRepository
      .createQueryBuilder('menu')
      .where('menu.instansiId = :instansiId', { instansiId })
      .orderBy('menu.name', 'ASC');

    if (category) {
      queryBuilder.andWhere('menu.category = :category', { category });
    }

    if (isAvailable !== undefined) {
      queryBuilder.andWhere('menu.isAvailable = :isAvailable', {
        isAvailable,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(menu.name LIKE :search OR menu.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneMenu(id: number, instansiId: number) {
    const menu = await this.menuRepository.findOne({
      where: { id, instansiId },
    });

    if (!menu) {
      throw new NotFoundException(`Menu dengan ID ${id} tidak ditemukan`);
    }

    return menu;
  }

  async updateMenu(
    id: number,
    updateDto: UpdateCafeteriaMenuDto,
    instansiId: number,
  ) {
    const menu = await this.findOneMenu(id, instansiId);
    Object.assign(menu, updateDto);
    return await this.menuRepository.save(menu);
  }

  async removeMenu(id: number, instansiId: number) {
    const menu = await this.findOneMenu(id, instansiId);
    await this.menuRepository.remove(menu);
    return { message: 'Menu berhasil dihapus' };
  }

  // ========== ORDERS ==========

  async createOrder(
    createDto: CreateCafeteriaOrderDto,
    instansiId: number,
  ) {
    let totalAmount = 0;

    // Create order
    const order = this.orderRepository.create({
      instansiId,
      studentId: createDto.studentId,
      notes: createDto.notes,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    const saved = await this.orderRepository.save(order);

    // Create order items and calculate total
    for (const item of createDto.menuItems) {
      const menu = await this.findOneMenu(item.id, instansiId);

      if (!menu.isAvailable) {
        throw new BadRequestException(`Menu ${menu.name} tidak tersedia`);
      }

      if (menu.stock !== null && menu.stock < item.quantity) {
        throw new BadRequestException(
          `Stok ${menu.name} tidak mencukupi`,
        );
      }

      const subtotal = menu.price * item.quantity;
      totalAmount += subtotal;

      await this.orderItemRepository.save({
        orderId: saved.id,
        menuId: menu.id,
        quantity: item.quantity,
        price: menu.price,
        subtotal,
      });

      // Update stock
      if (menu.stock !== null) {
        menu.stock -= item.quantity;
        await this.menuRepository.save(menu);
      }
    }

    saved.totalAmount = totalAmount;
    return await this.orderRepository.save(saved);
  }

  async findAllOrders(filters: {
    instansiId: number;
    studentId?: number;
    status?: string;
    paymentStatus?: string;
    date?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      instansiId,
      studentId,
      status,
      paymentStatus,
      date,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.student', 'student')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.menu', 'menu')
      .where('order.instansiId = :instansiId', { instansiId })
      .orderBy('order.createdAt', 'DESC');

    if (studentId) {
      queryBuilder.andWhere('order.studentId = :studentId', { studentId });
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', {
        paymentStatus,
      });
    }

    if (date) {
      queryBuilder.andWhere('DATE(order.createdAt) = :date', { date });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneOrder(id: number, instansiId: number) {
    const order = await this.orderRepository.findOne({
      where: { id, instansiId },
      relations: ['student', 'orderItems', 'orderItems.menu', 'payments'],
    });

    if (!order) {
      throw new NotFoundException(`Pesanan dengan ID ${id} tidak ditemukan`);
    }

    return order;
  }

  async updateOrderStatus(
    id: number,
    updateStatusDto: UpdateOrderStatusDto,
    instansiId: number,
  ) {
    const order = await this.findOneOrder(id, instansiId);
    order.status = updateStatusDto.status;
    return await this.orderRepository.save(order);
  }

  async removeOrder(id: number, instansiId: number) {
    const order = await this.findOneOrder(id, instansiId);

    // Restore stock
    for (const item of order.orderItems) {
      const menu = await this.menuRepository.findOne({
        where: { id: item.menuId },
      });
      if (menu && menu.stock !== null) {
        menu.stock += item.quantity;
        await this.menuRepository.save(menu);
      }
    }

    await this.orderRepository.remove(order);
    return { message: 'Pesanan berhasil dihapus' };
  }

  // ========== PAYMENTS ==========

  async processPayment(
    orderId: number,
    paymentDto: ProcessPaymentDto,
    instansiId: number,
  ) {
    const order = await this.findOneOrder(orderId, instansiId);

    if (order.paymentStatus === 'paid') {
      throw new BadRequestException('Pesanan sudah dibayar');
    }

    if (paymentDto.paymentAmount < order.totalAmount) {
      throw new BadRequestException(
        'Jumlah pembayaran kurang dari total pesanan',
      );
    }

    const changeAmount = paymentDto.paymentAmount - order.totalAmount;

    const payment = this.paymentRepository.create({
      orderId: order.id,
      paymentMethod: paymentDto.paymentMethod,
      paymentAmount: paymentDto.paymentAmount,
      changeAmount,
      paymentReference: paymentDto.paymentReference,
      paymentStatus: 'completed',
      notes: paymentDto.notes,
    });

    await this.paymentRepository.save(payment);

    order.paymentStatus = 'paid';
    order.status = 'preparing';
    await this.orderRepository.save(order);

    return payment;
  }

  // ========== STATISTICS ==========

  async getStatistics(instansiId: number) {
    const totalMenuItems = await this.menuRepository.count({
      where: { instansiId },
    });

    const availableItems = await this.menuRepository.count({
      where: { instansiId, isAvailable: true },
    });

    const totalOrders = await this.orderRepository.count({
      where: { instansiId },
    });

    const todayOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.instansiId = :instansiId', { instansiId })
      .andWhere('DATE(order.createdAt) = :today', {
        today: new Date().toISOString().split('T')[0],
      })
      .getCount();

    return {
      menu: {
        total: totalMenuItems,
        available: availableItems,
      },
      orders: {
        total: totalOrders,
        today: todayOrders,
      },
    };
  }
}

