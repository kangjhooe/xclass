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

  async create(createDto: CreateGuestBookDto, instansiId: number, userId?: number) {
    const checkInDate = createDto.check_in 
      ? new Date(createDto.check_in) 
      : createDto.visitDate 
        ? new Date(createDto.visitDate)
        : new Date();

    const guestBook = this.guestBookRepository.create({
      ...createDto,
      instansiId,
      check_in: checkInDate,
      status: 'checked_in' as const,
      visitDate: checkInDate, // Legacy field
      created_by: userId,
    });

    const saved = await this.guestBookRepository.save(guestBook);
    return this.mapToFrontendFormat(saved);
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
      .orderBy('COALESCE(guest.check_in, guest.visitDate)', 'DESC');

    if (startDate) {
      queryBuilder.andWhere(
        '(guest.check_in >= :startDate OR guest.visitDate >= :startDate)',
        { startDate }
      );
    }

    if (endDate) {
      queryBuilder.andWhere(
        '(guest.check_in <= :endDate OR guest.visitDate <= :endDate)',
        { endDate }
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: data.map(item => this.mapToFrontendFormat(item)),
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

    return this.mapToFrontendFormat(guestBook);
  }

  async checkout(id: number, instansiId: number) {
    const guestBook = await this.guestBookRepository.findOne({
      where: { id, instansiId },
    });

    if (!guestBook) {
      throw new NotFoundException(
        `Buku tamu dengan ID ${id} tidak ditemukan`,
      );
    }

    if (guestBook.status === 'checked_out') {
      throw new NotFoundException('Tamu sudah melakukan checkout');
    }

    guestBook.status = 'checked_out';
    guestBook.check_out = new Date();
    guestBook.leaveTime = new Date().toTimeString().split(' ')[0]; // Legacy field

    const saved = await this.guestBookRepository.save(guestBook);
    return this.mapToFrontendFormat(saved);
  }

  async remove(id: number, instansiId: number) {
    const guestBook = await this.guestBookRepository.findOne({
      where: { id, instansiId },
    });

    if (!guestBook) {
      throw new NotFoundException(
        `Buku tamu dengan ID ${id} tidak ditemukan`,
      );
    }

    await this.guestBookRepository.remove(guestBook);
    return { message: 'Buku tamu berhasil dihapus' };
  }

  private mapToFrontendFormat(guestBook: GuestBook) {
    return {
      id: guestBook.id,
      name: guestBook.name,
      identity_number: guestBook.identity_number || null,
      phone: guestBook.phone || null,
      email: guestBook.email || null,
      institution: guestBook.institution || null,
      purpose: guestBook.purpose || '',
      check_in: guestBook.check_in 
        ? guestBook.check_in.toISOString() 
        : guestBook.visitDate 
          ? guestBook.visitDate.toISOString()
          : null,
      check_out: guestBook.check_out ? guestBook.check_out.toISOString() : null,
      status: guestBook.status || (guestBook.check_out ? 'checked_out' : 'checked_in'),
      notes: guestBook.notes || null,
      photo_url: guestBook.photo_url || null,
      created_at: guestBook.createdAt ? guestBook.createdAt.toISOString() : null,
      created_by: guestBook.created_by || null,
      created_by_name: null, // Bisa ditambahkan jika ada relation ke users
    };
  }
}

