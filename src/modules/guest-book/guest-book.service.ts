import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuestBook } from './entities/guest-book.entity';
import { CreateGuestBookDto } from './dto/create-guest-book.dto';

@Injectable()
export class GuestBookService {
  constructor(
    @InjectRepository(GuestBook)
    private guestBookRepository: Repository<GuestBook>,
  ) {}

  async create(createDto: CreateGuestBookDto, instansiId: number) {
    const guestBook = this.guestBookRepository.create({
      ...createDto,
      instansiId,
      visitDate: new Date(createDto.visitDate),
    });

    return await this.guestBookRepository.save(guestBook);
  }

  async findAll(filters: {
    instansiId: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { instansiId, startDate, endDate, page = 1, limit = 20 } = filters;

    const queryBuilder = this.guestBookRepository
      .createQueryBuilder('guest')
      .where('guest.instansiId = :instansiId', { instansiId })
      .orderBy('guest.visitDate', 'DESC');

    if (startDate) {
      queryBuilder.andWhere('guest.visitDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('guest.visitDate <= :endDate', { endDate });
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

  async findOne(id: number, instansiId: number) {
    const guestBook = await this.guestBookRepository.findOne({
      where: { id, instansiId },
    });

    if (!guestBook) {
      throw new NotFoundException(
        `Buku tamu dengan ID ${id} tidak ditemukan`,
      );
    }

    return guestBook;
  }

  async remove(id: number, instansiId: number) {
    const guestBook = await this.findOne(id, instansiId);
    await this.guestBookRepository.remove(guestBook);
    return { message: 'Buku tamu berhasil dihapus' };
  }
}

