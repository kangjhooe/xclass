import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  IncomingLetter,
  LetterStatus,
} from './entities/incoming-letter.entity';
import {
  OutgoingLetter,
  OutgoingLetterStatus,
} from './entities/outgoing-letter.entity';
import { CreateIncomingLetterDto } from './dto/create-incoming-letter.dto';
import { UpdateIncomingLetterDto } from './dto/update-incoming-letter.dto';
import { CreateOutgoingLetterDto } from './dto/create-outgoing-letter.dto';
import { UpdateOutgoingLetterDto } from './dto/update-outgoing-letter.dto';
import { AddDispositionDto } from './dto/add-disposition.dto';

@Injectable()
export class CorrespondenceService {
  constructor(
    @InjectRepository(IncomingLetter)
    private incomingLettersRepository: Repository<IncomingLetter>,
    @InjectRepository(OutgoingLetter)
    private outgoingLettersRepository: Repository<OutgoingLetter>,
  ) {}

  // ========== Incoming Letters ==========
  async createIncoming(
    createDto: CreateIncomingLetterDto,
    instansiId: number,
    createdBy: number,
  ) {
    // Check if nomor surat already exists
    const existing = await this.incomingLettersRepository.findOne({
      where: {
        nomorSurat: createDto.nomorSurat,
        instansiId,
      },
    });

    if (existing) {
      throw new BadRequestException('Nomor surat already exists');
    }

    const letter = this.incomingLettersRepository.create({
      ...createDto,
      instansiId,
      createdBy,
      tanggalTerima: new Date(createDto.tanggalTerima),
      status: createDto.status || LetterStatus.BARU,
      tanggalDisposisi: createDto.tanggalDisposisi
        ? new Date(createDto.tanggalDisposisi)
        : null,
    });

    return await this.incomingLettersRepository.save(letter);
  }

  async findAllIncoming(filters: {
    search?: string;
    status?: LetterStatus;
    jenisSurat?: string;
    prioritas?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      search,
      status,
      jenisSurat,
      prioritas,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.incomingLettersRepository
      .createQueryBuilder('letter')
      .where('letter.instansiId = :instansiId', { instansiId });

    if (search) {
      queryBuilder.andWhere(
        '(letter.nomorSurat LIKE :search OR letter.pengirim LIKE :search OR letter.perihal LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('letter.status = :status', { status });
    }

    if (jenisSurat) {
      queryBuilder.andWhere('letter.jenisSurat = :jenisSurat', { jenisSurat });
    }

    if (prioritas) {
      queryBuilder.andWhere('letter.prioritas = :prioritas', { prioritas });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('letter.tanggalTerima BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    queryBuilder.orderBy('letter.tanggalTerima', 'DESC');

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

  async findOneIncoming(id: number, instansiId: number) {
    const letter = await this.incomingLettersRepository.findOne({
      where: { id, instansiId },
    });

    if (!letter) {
      throw new NotFoundException(
        `Incoming letter with ID ${id} not found`,
      );
    }

    return letter;
  }

  async updateIncoming(
    id: number,
    updateDto: UpdateIncomingLetterDto,
    instansiId: number,
    updatedBy?: number,
  ) {
    const letter = await this.findOneIncoming(id, instansiId);

    if (updateDto.tanggalTerima) {
      letter.tanggalTerima = new Date(updateDto.tanggalTerima);
    }

    if (updateDto.tanggalDisposisi) {
      letter.tanggalDisposisi = new Date(updateDto.tanggalDisposisi);
    }

    if (updatedBy) {
      letter.updatedBy = updatedBy;
    }

    Object.assign(letter, updateDto);
    return await this.incomingLettersRepository.save(letter);
  }

  async removeIncoming(id: number, instansiId: number) {
    const letter = await this.findOneIncoming(id, instansiId);
    await this.incomingLettersRepository.remove(letter);
    return { message: 'Incoming letter deleted successfully' };
  }

  async addDisposition(
    id: number,
    dispositionDto: AddDispositionDto,
    instansiId: number,
  ) {
    const letter = await this.findOneIncoming(id, instansiId);

    const disposisi = letter.disposisi || [];
    disposisi.push({
      penerima: dispositionDto.penerima,
      catatan: dispositionDto.catatan,
      tanggal: dispositionDto.tanggal
        ? new Date(dispositionDto.tanggal)
        : new Date(),
      createdAt: new Date(),
    });

    letter.disposisi = disposisi;
    letter.tanggalDisposisi = new Date();
    letter.penerimaDisposisi = dispositionDto.penerima;

    return await this.incomingLettersRepository.save(letter);
  }

  async updateIncomingStatus(
    id: number,
    status: LetterStatus,
    instansiId: number,
  ) {
    const letter = await this.findOneIncoming(id, instansiId);
    letter.status = status;
    return await this.incomingLettersRepository.save(letter);
  }

  // ========== Outgoing Letters ==========
  async createOutgoing(
    createDto: CreateOutgoingLetterDto,
    instansiId: number,
    createdBy: number,
  ) {
    // Check if nomor surat already exists
    const existing = await this.outgoingLettersRepository.findOne({
      where: {
        nomorSurat: createDto.nomorSurat,
        instansiId,
      },
    });

    if (existing) {
      throw new BadRequestException('Nomor surat already exists');
    }

    const letter = this.outgoingLettersRepository.create({
      ...createDto,
      instansiId,
      createdBy,
      tanggalSurat: new Date(createDto.tanggalSurat),
      status: createDto.status || OutgoingLetterStatus.DRAFT,
      tanggalKirim: createDto.tanggalKirim
        ? new Date(createDto.tanggalKirim)
        : null,
    });

    return await this.outgoingLettersRepository.save(letter);
  }

  async findAllOutgoing(filters: {
    search?: string;
    status?: OutgoingLetterStatus;
    jenisSurat?: string;
    prioritas?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      search,
      status,
      jenisSurat,
      prioritas,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.outgoingLettersRepository
      .createQueryBuilder('letter')
      .where('letter.instansiId = :instansiId', { instansiId });

    if (search) {
      queryBuilder.andWhere(
        '(letter.nomorSurat LIKE :search OR letter.tujuan LIKE :search OR letter.perihal LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('letter.status = :status', { status });
    }

    if (jenisSurat) {
      queryBuilder.andWhere('letter.jenisSurat = :jenisSurat', { jenisSurat });
    }

    if (prioritas) {
      queryBuilder.andWhere('letter.prioritas = :prioritas', { prioritas });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('letter.tanggalSurat BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    queryBuilder.orderBy('letter.tanggalSurat', 'DESC');

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

  async findOneOutgoing(id: number, instansiId: number) {
    const letter = await this.outgoingLettersRepository.findOne({
      where: { id, instansiId },
    });

    if (!letter) {
      throw new NotFoundException(
        `Outgoing letter with ID ${id} not found`,
      );
    }

    return letter;
  }

  async updateOutgoing(
    id: number,
    updateDto: UpdateOutgoingLetterDto,
    instansiId: number,
    updatedBy?: number,
  ) {
    const letter = await this.findOneOutgoing(id, instansiId);

    if (updateDto.tanggalSurat) {
      letter.tanggalSurat = new Date(updateDto.tanggalSurat);
    }

    if (updateDto.tanggalKirim) {
      letter.tanggalKirim = new Date(updateDto.tanggalKirim);
    }

    if (updatedBy) {
      letter.updatedBy = updatedBy;
    }

    Object.assign(letter, updateDto);
    return await this.outgoingLettersRepository.save(letter);
  }

  async removeOutgoing(id: number, instansiId: number) {
    const letter = await this.findOneOutgoing(id, instansiId);
    await this.outgoingLettersRepository.remove(letter);
    return { message: 'Outgoing letter deleted successfully' };
  }

  async updateOutgoingStatus(
    id: number,
    status: OutgoingLetterStatus,
    instansiId: number,
  ) {
    const letter = await this.findOneOutgoing(id, instansiId);
    letter.status = status;

    if (status === OutgoingLetterStatus.TERKIRIM && !letter.tanggalKirim) {
      letter.tanggalKirim = new Date();
    }

    return await this.outgoingLettersRepository.save(letter);
  }

  async archiveOutgoing(id: number, instansiId: number) {
    return await this.updateOutgoingStatus(
      id,
      OutgoingLetterStatus.ARSIP,
      instansiId,
    );
  }

  // ========== Statistics ==========
  async getStatistics(instansiId: number, year?: number) {
    const incomingQuery = this.incomingLettersRepository
      .createQueryBuilder('letter')
      .where('letter.instansiId = :instansiId', { instansiId });

    const outgoingQuery = this.outgoingLettersRepository
      .createQueryBuilder('letter')
      .where('letter.instansiId = :instansiId', { instansiId });

    if (year) {
      incomingQuery.andWhere('YEAR(letter.tanggalTerima) = :year', { year });
      outgoingQuery.andWhere('YEAR(letter.tanggalSurat) = :year', { year });
    }

    const totalIncoming = await incomingQuery.getCount();
    const totalOutgoing = await outgoingQuery.getCount();

    const incomingByStatus = await this.incomingLettersRepository
      .createQueryBuilder('letter')
      .select('letter.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('letter.instansiId = :instansiId', { instansiId })
      .groupBy('letter.status')
      .getRawMany();

    const outgoingByStatus = await this.outgoingLettersRepository
      .createQueryBuilder('letter')
      .select('letter.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('letter.instansiId = :instansiId', { instansiId })
      .groupBy('letter.status')
      .getRawMany();

    return {
      totalIncoming,
      totalOutgoing,
      incomingByStatus: incomingByStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      outgoingByStatus: outgoingByStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }
}
