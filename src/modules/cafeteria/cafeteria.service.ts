import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
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
import { CafeteriaOutlet } from './entities/cafeteria-outlet.entity';
import { CreateCafeteriaOutletDto } from './dto/create-cafeteria-outlet.dto';
import { UpdateCafeteriaOutletDto } from './dto/update-cafeteria-outlet.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CafeteriaService {
  private readonly logger = new Logger(CafeteriaService.name);

  constructor(
    @InjectRepository(CafeteriaOutlet)
    private canteenRepository: Repository<CafeteriaOutlet>,
    @InjectRepository(CafeteriaMenu)
    private menuRepository: Repository<CafeteriaMenu>,
    @InjectRepository(CafeteriaOrder)
    private orderRepository: Repository<CafeteriaOrder>,
    @InjectRepository(CafeteriaOrderItem)
    private orderItemRepository: Repository<CafeteriaOrderItem>,
    @InjectRepository(CafeteriaPayment)
    private paymentRepository: Repository<CafeteriaPayment>,
    private notificationsService: NotificationsService,
  ) {}

  // ========== CANTEEN ==========

  async createCanteen(
    createDto: CreateCafeteriaOutletDto,
    instansiId: number,
  ) {
    const canteen = this.canteenRepository.create({
      ...createDto,
      instansiId,
    });
    return this.canteenRepository.save(canteen);
  }

  async findAllCanteens(instansiId: number) {
    return this.canteenRepository.find({
      where: { instansiId },
      order: { name: 'ASC' },
    });
  }

  async findOneCanteen(id: number, instansiId: number) {
    const canteen = await this.canteenRepository.findOne({
      where: { id, instansiId },
    });
    if (!canteen) {
      throw new NotFoundException(`Kantin dengan ID ${id} tidak ditemukan`);
    }
    return canteen;
  }

  async updateCanteen(
    id: number,
    updateDto: UpdateCafeteriaOutletDto,
    instansiId: number,
  ) {
    const canteen = await this.findOneCanteen(id, instansiId);
    Object.assign(canteen, updateDto);
    return this.canteenRepository.save(canteen);
  }

  async removeCanteen(id: number, instansiId: number) {
    const canteen = await this.findOneCanteen(id, instansiId);
    const dependentMenus = await this.menuRepository.count({
      where: { canteenId: canteen.id },
    });
    if (dependentMenus > 0) {
      throw new BadRequestException(
        'Kantin tidak dapat dihapus karena masih memiliki menu aktif',
      );
    }
    const dependentOrders = await this.orderRepository.count({
      where: { canteenId: canteen.id },
    });
    if (dependentOrders > 0) {
      throw new BadRequestException(
        'Kantin tidak dapat dihapus karena masih memiliki pesanan aktif',
      );
    }
    await this.canteenRepository.remove(canteen);
    return { message: 'Kantin berhasil dihapus' };
  }

  // ========== MENU ==========

  async createMenu(
    createDto: CreateCafeteriaMenuDto,
    instansiId: number,
  ) {
    await this.ensureCanteenOwnership(createDto.canteenId, instansiId);
    const menu = this.menuRepository.create({
      ...createDto,
      instansiId,
    });
    return await this.menuRepository.save(menu);
  }

  async findAllMenus(filters: {
    instansiId: number;
    canteenId?: number;
    category?: string;
    isAvailable?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      instansiId,
      canteenId,
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

    if (canteenId) {
      queryBuilder.andWhere('menu.canteenId = :canteenId', { canteenId });
    }

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
      relations: ['canteen'],
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
    if (
      updateDto.canteenId &&
      updateDto.canteenId !== menu.canteenId
    ) {
      await this.ensureCanteenOwnership(updateDto.canteenId, instansiId);
    }
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
    await this.ensureCanteenOwnership(createDto.canteenId, instansiId);
    let totalAmount = 0;

    // Create order
    const order = this.orderRepository.create({
      instansiId,
      studentId: createDto.studentId,
      canteenId: createDto.canteenId,
      notes: createDto.notes,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    const saved = await this.orderRepository.save(order);

    // Create order items and calculate total
    for (const item of createDto.menuItems) {
      const menu = await this.findOneMenu(item.id, instansiId);
      if (menu.canteenId !== createDto.canteenId) {
        throw new BadRequestException(
          `Menu ${menu.name} tidak tersedia pada kantin yang dipilih`,
        );
      }

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
    canteenId?: number;
    studentId?: number;
    status?: string;
    paymentStatus?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      instansiId,
      canteenId,
      studentId,
      status,
      paymentStatus,
      date,
      startDate,
      endDate,
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

    if (canteenId) {
      queryBuilder.andWhere('order.canteenId = :canteenId', { canteenId });
    }

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

    if (startDate) {
      queryBuilder.andWhere('DATE(order.createdAt) >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('DATE(order.createdAt) <= :endDate', { endDate });
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
      relations: [
        'student',
        'orderItems',
        'orderItems.menu',
        'payments',
        'canteen',
      ],
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
    const saved = await this.orderRepository.save(order);
    await this.notifyOrderStatusChange(saved);
    return saved;
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
    const savedOrder = await this.orderRepository.save(order);
    await this.notifyPaymentCompleted(savedOrder, payment);

    return payment;
  }

  // ========== STATISTICS ==========

  async getStatistics(instansiId: number) {
    const canteens = await this.canteenRepository.find({
      where: { instansiId },
    });

    const menuAgg = await this.menuRepository
      .createQueryBuilder('menu')
      .select('menu.canteenId', 'canteenId')
      .addSelect('COUNT(menu.id)', 'totalMenu')
      .addSelect(
        "SUM(CASE WHEN menu.isAvailable = true THEN 1 ELSE 0 END)",
        'availableMenu',
      )
      .where('menu.instansiId = :instansiId', { instansiId })
      .groupBy('menu.canteenId')
      .getRawMany();

    const orderAgg = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.canteenId', 'canteenId')
      .addSelect('COUNT(order.id)', 'totalOrders')
      .addSelect(
        "SUM(CASE WHEN DATE(order.createdAt) = :today THEN 1 ELSE 0 END)",
        'todayOrders',
      )
      .where('order.instansiId = :instansiId', { instansiId })
      .setParameter('today', new Date().toISOString().split('T')[0])
      .groupBy('order.canteenId')
      .getRawMany();

    return {
      totalCanteens: canteens.length,
      perCanteen: canteens.map((canteen) => {
        const menuStat = menuAgg.find(
          (stat) => Number(stat.canteenId) === canteen.id,
        );
        const orderStat = orderAgg.find(
          (stat) => Number(stat.canteenId) === canteen.id,
        );
        return {
          canteen,
          menu: {
            total: menuStat ? Number(menuStat.totalMenu) : 0,
            available: menuStat ? Number(menuStat.availableMenu) : 0,
          },
          orders: {
            total: orderStat ? Number(orderStat.totalOrders) : 0,
            today: orderStat ? Number(orderStat.todayOrders) : 0,
          },
        };
      }),
    };
  }

  private async ensureCanteenOwnership(
    canteenId: number,
    instansiId: number,
  ) {
    if (!canteenId) {
      throw new BadRequestException('Kantin harus dipilih');
    }
    const canteen = await this.canteenRepository.findOne({
      where: { id: canteenId, instansiId },
    });
    if (!canteen) {
      throw new NotFoundException('Kantin tidak ditemukan untuk instansi ini');
    }
    if (!canteen.isActive) {
      throw new BadRequestException('Kantin sedang tidak aktif');
    }
  }

  private async notifyOrderStatusChange(order: CafeteriaOrder) {
    if (!order.student) {
      return;
    }

    const recipient = order.student.email || order.student.parentEmail;

    if (!recipient) {
      return;
    }

    const subject = `Status Pesanan Kantin #${order.id}`;
    const content = `
      <p>Halo ${order.student.name},</p>
      <p>Status pesanan kantin Anda kini <strong>${order.status.toUpperCase()}</strong>.</p>
      <p>Total pesanan: Rp ${Number(order.totalAmount).toLocaleString('id-ID')}</p>
    `;

    try {
      await this.notificationsService.sendEmail(
        order.instansiId,
        order.studentId,
        recipient,
        subject,
        content,
      );
    } catch (error) {
      this.logger.warn(
        `Gagal mengirim notifikasi status pesanan #${order.id}: ${error.message}`,
      );
    }
  }

  private async notifyPaymentCompleted(
    order: CafeteriaOrder,
    payment: CafeteriaPayment,
  ) {
    if (!order.student) {
      return;
    }

    const recipient = order.student.email || order.student.parentEmail;

    if (!recipient) {
      return;
    }

    const subject = `Pembayaran Pesanan Kantin #${order.id}`;
    const content = `
      <p>Halo ${order.student.name},</p>
      <p>Pembayaran pesanan Anda sejumlah <strong>Rp ${Number(
        payment.paymentAmount,
      ).toLocaleString('id-ID')}</strong> telah diterima.</p>
      <p>Metode: ${payment.paymentMethod.toUpperCase()}</p>
      <p>Status pesanan saat ini: ${order.status.toUpperCase()}</p>
    `;

    try {
      await this.notificationsService.sendEmail(
        order.instansiId,
        order.studentId,
        recipient,
        subject,
        content,
      );
    } catch (error) {
      this.logger.warn(
        `Gagal mengirim notifikasi pembayaran pesanan #${order.id}: ${error.message}`,
      );
    }
  }
}

