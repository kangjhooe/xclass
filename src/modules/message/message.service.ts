import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async create(
    createDto: CreateMessageDto,
    instansiId: number,
    senderId: number,
  ) {
    const message = this.messageRepository.create({
      ...createDto,
      instansiId,
      senderId,
    });

    return await this.messageRepository.save(message);
  }

  async findAll(filters: {
    instansiId: number;
    userId: number;
    type?: 'inbox' | 'sent' | 'archived';
    isRead?: boolean;
    page?: number;
    limit?: number;
  }) {
    const {
      instansiId,
      userId,
      type = 'inbox',
      isRead,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .where('message.instansiId = :instansiId', { instansiId })
      .orderBy('message.createdAt', 'DESC');

    if (type === 'inbox') {
      queryBuilder.andWhere('message.receiverId = :userId', { userId });
    } else if (type === 'sent') {
      queryBuilder.andWhere('message.senderId = :userId', { userId });
    } else if (type === 'archived') {
      queryBuilder.andWhere(
        '(message.receiverId = :userId OR message.senderId = :userId)',
        { userId },
      );
      queryBuilder.andWhere('message.isArchived = :isArchived', {
        isArchived: true,
      });
    }

    if (isRead !== undefined) {
      queryBuilder.andWhere('message.isRead = :isRead', { isRead });
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

  async findOne(id: number, instansiId: number, userId: number) {
    const message = await this.messageRepository.findOne({
      where: { id, instansiId },
      relations: ['parent', 'replies'],
    });

    if (!message) {
      throw new NotFoundException(`Pesan dengan ID ${id} tidak ditemukan`);
    }

    // Check access
    if (
      message.senderId !== userId &&
      message.receiverId !== userId
    ) {
      throw new NotFoundException('Anda tidak memiliki akses ke pesan ini');
    }

    // Mark as read if receiver
    if (message.receiverId === userId && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await this.messageRepository.save(message);
    }

    return message;
  }

  async markAsRead(id: number, instansiId: number, userId: number) {
    const message = await this.messageRepository.findOne({
      where: { id, instansiId, receiverId: userId },
    });

    if (!message) {
      throw new NotFoundException(`Pesan dengan ID ${id} tidak ditemukan`);
    }

    message.isRead = true;
    message.readAt = new Date();
    return await this.messageRepository.save(message);
  }

  async archive(id: number, instansiId: number, userId: number) {
    const message = await this.messageRepository.findOne({
      where: { id, instansiId },
    });

    if (!message) {
      throw new NotFoundException(`Pesan dengan ID ${id} tidak ditemukan`);
    }

    if (
      message.senderId !== userId &&
      message.receiverId !== userId
    ) {
      throw new NotFoundException('Anda tidak memiliki akses ke pesan ini');
    }

    message.isArchived = true;
    message.archivedAt = new Date();
    return await this.messageRepository.save(message);
  }

  async remove(id: number, instansiId: number, userId: number) {
    const message = await this.messageRepository.findOne({
      where: { id, instansiId },
    });

    if (!message) {
      throw new NotFoundException(`Pesan dengan ID ${id} tidak ditemukan`);
    }

    // Only sender or receiver can delete
    if (
      message.senderId !== userId &&
      message.receiverId !== userId
    ) {
      throw new NotFoundException('Anda tidak memiliki akses ke pesan ini');
    }

    await this.messageRepository.remove(message);
    return { message: 'Pesan berhasil dihapus' };
  }
}

