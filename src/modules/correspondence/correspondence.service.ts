import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, FindOptionsWhere } from 'typeorm';
import { StorageService } from '../storage/storage.service';
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
import {
  CorrespondenceArchive,
  ArchiveSourceType,
} from './entities/correspondence-archive.entity';
import { LetterTemplate } from './entities/letter-template.entity';
import {
  LetterSequence,
  SequenceResetPeriod,
} from './entities/letter-sequence.entity';
import {
  GeneratedLetter,
  GeneratedLetterStatus,
} from './entities/generated-letter.entity';
import { CreateLetterTemplateDto } from './dto/create-letter-template.dto';
import { UpdateLetterTemplateDto } from './dto/update-letter-template.dto';
import { UpdateLetterSequenceDto } from './dto/update-letter-sequence.dto';
import { GenerateLetterDto } from './dto/generate-letter.dto';

interface ArchiveFilters {
  instansiId: number;
  type?: ArchiveSourceType;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  category?: string;
}

@Injectable()
export class CorrespondenceService {
  constructor(
    @InjectRepository(IncomingLetter)
    private readonly incomingLettersRepository: Repository<IncomingLetter>,
    @InjectRepository(OutgoingLetter)
    private readonly outgoingLettersRepository: Repository<OutgoingLetter>,
    @InjectRepository(LetterTemplate)
    private readonly letterTemplateRepository: Repository<LetterTemplate>,
    @InjectRepository(CorrespondenceArchive)
    private readonly archiveRepository: Repository<CorrespondenceArchive>,
    @InjectRepository(LetterSequence)
    private readonly sequenceRepository: Repository<LetterSequence>,
    @InjectRepository(GeneratedLetter)
    private readonly generatedLettersRepository: Repository<GeneratedLetter>,
    private readonly storageService: StorageService,
  ) {}

  // ========== Incoming Letters ==========
  async createIncoming(
    createDto: CreateIncomingLetterDto,
    instansiId: number,
    createdBy: number,
  ) {
    await this.ensureUniqueNomorSurat(
      this.incomingLettersRepository,
      createDto.nomorSurat,
      instansiId,
    );

    const letter = this.incomingLettersRepository.create({
      ...createDto,
      instansiId,
      createdBy,
      tanggalTerima: this.parseDate(createDto.tanggalTerima),
      status: createDto.status || LetterStatus.BARU,
      tanggalDisposisi: createDto.tanggalDisposisi
        ? this.parseDate(createDto.tanggalDisposisi)
        : null,
    });

    const saved = await this.incomingLettersRepository.save(letter);
    await this.syncIncomingArchive(saved);
    return saved;
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
        new Brackets((qb) => {
          qb.where('letter.nomorSurat LIKE :search', {
            search: `%${search}%`,
          })
            .orWhere('letter.pengirim LIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('letter.perihal LIKE :search', {
              search: `%${search}%`,
            });
        }),
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

    if (startDate) {
      queryBuilder.andWhere('letter.tanggalTerima >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('letter.tanggalTerima <= :endDate', { endDate });
    }

    queryBuilder
      .orderBy('letter.tanggalTerima', 'DESC')
      .addOrderBy('letter.createdAt', 'DESC');

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

    if (updateDto.nomorSurat && updateDto.nomorSurat !== letter.nomorSurat) {
      await this.ensureUniqueNomorSurat(
        this.incomingLettersRepository,
        updateDto.nomorSurat,
        instansiId,
      );
    }

    if (updateDto.tanggalTerima) {
      letter.tanggalTerima = this.parseDate(updateDto.tanggalTerima);
    }

    if (updateDto.tanggalDisposisi) {
      letter.tanggalDisposisi = this.parseDate(updateDto.tanggalDisposisi);
    }

    if (updatedBy) {
      letter.updatedBy = updatedBy;
    }

    Object.assign(letter, updateDto);
    const saved = await this.incomingLettersRepository.save(letter);
    await this.syncIncomingArchive(saved);
    return saved;
  }

  async removeIncoming(id: number, instansiId: number) {
    const letter = await this.findOneIncoming(id, instansiId);
    await this.incomingLettersRepository.remove(letter);
    await this.removeArchive(ArchiveSourceType.INCOMING, id, instansiId);
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
        ? this.parseDate(dispositionDto.tanggal)
        : new Date(),
      createdAt: new Date(),
    });

    letter.disposisi = disposisi;
    letter.tanggalDisposisi = new Date();
    letter.penerimaDisposisi = dispositionDto.penerima;

    const saved = await this.incomingLettersRepository.save(letter);
    await this.syncIncomingArchive(saved);
    return saved;
  }

  async updateIncomingStatus(
    id: number,
    status: LetterStatus,
    instansiId: number,
  ) {
    const letter = await this.findOneIncoming(id, instansiId);
    letter.status = status;
    const saved = await this.incomingLettersRepository.save(letter);
    await this.syncIncomingArchive(saved);
    return saved;
  }

  // ========== Outgoing Letters ==========
  async createOutgoing(
    createDto: CreateOutgoingLetterDto,
    instansiId: number,
    createdBy: number,
  ) {
    await this.ensureUniqueNomorSurat(
      this.outgoingLettersRepository,
      createDto.nomorSurat,
      instansiId,
    );

    const letter = this.outgoingLettersRepository.create({
      ...createDto,
      instansiId,
      createdBy,
      tanggalSurat: this.parseDate(createDto.tanggalSurat),
      status: createDto.status || OutgoingLetterStatus.DRAFT,
      tanggalKirim: createDto.tanggalKirim
        ? this.parseDate(createDto.tanggalKirim)
        : null,
    });

    const saved = await this.outgoingLettersRepository.save(letter);
    await this.syncOutgoingArchive(saved);
    return saved;
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
        new Brackets((qb) => {
          qb.where('letter.nomorSurat LIKE :search', {
            search: `%${search}%`,
          })
            .orWhere('letter.tujuan LIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('letter.perihal LIKE :search', {
              search: `%${search}%`,
            });
        }),
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

    if (startDate) {
      queryBuilder.andWhere('letter.tanggalSurat >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('letter.tanggalSurat <= :endDate', { endDate });
    }

    queryBuilder
      .orderBy('letter.tanggalSurat', 'DESC')
      .addOrderBy('letter.createdAt', 'DESC');

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
      relations: ['template'],
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

    if (updateDto.nomorSurat && updateDto.nomorSurat !== letter.nomorSurat) {
      await this.ensureUniqueNomorSurat(
        this.outgoingLettersRepository,
        updateDto.nomorSurat,
        instansiId,
      );
    }

    if (updateDto.tanggalSurat) {
      letter.tanggalSurat = this.parseDate(updateDto.tanggalSurat);
    }

    if (updateDto.tanggalKirim) {
      letter.tanggalKirim = this.parseDate(updateDto.tanggalKirim);
    }

    if (updatedBy) {
      letter.updatedBy = updatedBy;
    }

    Object.assign(letter, updateDto);
    const saved = await this.outgoingLettersRepository.save(letter);
    await this.syncOutgoingArchive(saved);
    return saved;
  }

  async removeOutgoing(id: number, instansiId: number) {
    const letter = await this.findOneOutgoing(id, instansiId);
    await this.outgoingLettersRepository.remove(letter);
    await this.removeArchive(ArchiveSourceType.OUTGOING, id, instansiId);
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

    const saved = await this.outgoingLettersRepository.save(letter);
    await this.syncOutgoingArchive(saved);
    return saved;
  }

  async archiveOutgoing(id: number, instansiId: number) {
    return this.updateOutgoingStatus(
      id,
      OutgoingLetterStatus.ARSIP,
      instansiId,
    );
  }

  // ========== Archive ==========
  async listArchive(filters: ArchiveFilters) {
    const {
      instansiId,
      type,
      status,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
      category,
    } = filters;

    const queryBuilder = this.archiveRepository
      .createQueryBuilder('archive')
      .where('archive.instansiId = :instansiId', { instansiId });

    if (type) {
      queryBuilder.andWhere('archive.sourceType = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('archive.status = :status', { status });
    }

    if (category) {
      queryBuilder.andWhere('archive.category = :category', { category });
    }

    if (startDate) {
      queryBuilder.andWhere('archive.letterDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('archive.letterDate <= :endDate', { endDate });
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('archive.subject LIKE :search', {
            search: `%${search}%`,
          })
            .orWhere('archive.referenceNumber LIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('archive.fromName LIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('archive.toName LIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    queryBuilder
      .orderBy('archive.letterDate', 'DESC')
      .addOrderBy('archive.createdAt', 'DESC');

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

  // ========== Templates ==========
  async listTemplates(instansiId: number) {
    return this.letterTemplateRepository.find({
      where: { instansiId },
      order: { name: 'ASC' },
    });
  }

  async createTemplate(
    instansiId: number,
    createdBy: number,
    dto: CreateLetterTemplateDto,
  ) {
    const existing = await this.letterTemplateRepository.findOne({
      where: { instansiId, code: dto.code },
    });

    if (existing) {
      throw new BadRequestException(
        `Template dengan kode ${dto.code} sudah ada`,
      );
    }

    const template = this.letterTemplateRepository.create({
      ...dto,
      instansiId,
      createdBy,
      variables: dto.variables || [],
    });
    return this.letterTemplateRepository.save(template);
  }

  async updateTemplate(
    instansiId: number,
    templateId: number,
    updatedBy: number,
    dto: UpdateLetterTemplateDto,
  ) {
    const template = await this.letterTemplateRepository.findOne({
      where: { id: templateId, instansiId },
    });

    if (!template) {
      throw new NotFoundException('Template tidak ditemukan');
    }

    if (dto.code && dto.code !== template.code) {
      const duplicate = await this.letterTemplateRepository.findOne({
        where: { instansiId, code: dto.code },
      });
      if (duplicate) {
        throw new BadRequestException(
          `Template dengan kode ${dto.code} sudah ada`,
        );
      }
    }

    Object.assign(template, dto);
    template.updatedBy = updatedBy;
    return this.letterTemplateRepository.save(template);
  }

  async deleteTemplate(instansiId: number, templateId: number) {
    const template = await this.letterTemplateRepository.findOne({
      where: { id: templateId, instansiId },
      relations: ['generatedLetters'],
    });

    if (!template) {
      throw new NotFoundException('Template tidak ditemukan');
    }

    // Check if template is used in generated letters
    if (template.generatedLetters && template.generatedLetters.length > 0) {
      throw new BadRequestException(
        `Template tidak dapat dihapus karena sudah digunakan di ${template.generatedLetters.length} surat yang sudah dibuat`,
      );
    }

    await this.letterTemplateRepository.remove(template);
    return { message: 'Template berhasil dihapus' };
  }

  async getTemplate(instansiId: number, templateId: number) {
    const template = await this.letterTemplateRepository.findOne({
      where: { id: templateId, instansiId },
    });

    if (!template) {
      throw new NotFoundException('Template tidak ditemukan');
    }

    return template;
  }

  // ========== Sequences ==========
  async listSequences(instansiId: number) {
    return this.sequenceRepository.find({
      where: { instansiId },
      order: { name: 'ASC' },
    });
  }

  async getSequence(instansiId: number, code: string) {
    const sequence = await this.sequenceRepository.findOne({
      where: { instansiId, code },
    });

    if (!sequence) {
      throw new NotFoundException('Pengaturan penomoran tidak ditemukan');
    }

    return sequence;
  }

  async upsertSequence(
    instansiId: number,
    code: string,
    defaults: Partial<LetterSequence>,
  ) {
    let sequence = await this.sequenceRepository.findOne({
      where: { instansiId, code },
    });

    if (!sequence) {
      sequence = this.sequenceRepository.create({
        instansiId,
        code,
        name: defaults.name || code,
        pattern: defaults.pattern || '{{counter}}/{{month_roman}}/{{year}}',
        counter: defaults.counter ?? 0,
        padding: defaults.padding ?? 3,
        resetPeriod: defaults.resetPeriod || SequenceResetPeriod.YEARLY,
        description: defaults.description,
      });
    } else {
      Object.assign(sequence, defaults);
    }

    return this.sequenceRepository.save(sequence);
  }

  async updateSequence(
    instansiId: number,
    code: string,
    dto: UpdateLetterSequenceDto,
  ) {
    const sequence = await this.getSequence(instansiId, code);
    Object.assign(sequence, dto);
    return this.sequenceRepository.save(sequence);
  }

  // ========== Generated Letters ==========
  async generateLetter(
    instansiId: number,
    userId: number,
    dto: GenerateLetterDto,
  ) {
    const template = await this.letterTemplateRepository.findOne({
      where: { id: dto.templateId, instansiId },
    });

    if (!template) {
      throw new NotFoundException('Template tidak ditemukan');
    }

    const letterDate = dto.letterDate
      ? this.parseDate(dto.letterDate)
      : new Date();

    const sequence = await this.getOrCreateSequenceForTemplate(
      instansiId,
      template,
    );
    const referenceNumber = await this.consumeSequence(sequence, letterDate);

    const context = {
      ...dto.variables,
      nomor_surat: referenceNumber,
      reference_number: referenceNumber,
      subject: dto.subject,
      penerima: dto.recipient,
      tanggal_surat: this.formatHumanDate(letterDate),
      tanggal_surat_iso: letterDate.toISOString().split('T')[0],
    };

    const renderedHtml = this.renderTemplate(template.content, context);

    const generated = this.generatedLettersRepository.create({
      instansiId,
      templateId: template.id,
      referenceNumber,
      subject: dto.subject,
      variables: dto.variables,
      status: dto.status || GeneratedLetterStatus.FINAL,
      recipient: dto.recipient,
      letterDate,
      createdBy: userId,
      renderedHtml,
    });

    const saved = await this.generatedLettersRepository.save(generated);
    await this.syncGeneratedArchive(saved, template);
    return saved;
  }

  async listGeneratedLetters(instansiId: number) {
    return this.generatedLettersRepository.find({
      where: { instansiId },
      order: { createdAt: 'DESC' },
    });
  }

  async downloadGeneratedLetter(
    id: number,
    instansiId: number,
    res: Response,
  ) {
    const letter = await this.generatedLettersRepository.findOne({
      where: { id, instansiId },
      relations: ['template'],
    });

    if (!letter) {
      throw new NotFoundException('Surat tidak ditemukan');
    }

    if (!letter.renderedHtml) {
      throw new BadRequestException('Surat belum memiliki konten');
    }

    // Set headers untuk download HTML sebagai PDF
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="surat-${letter.referenceNumber || letter.id}.html"`,
    );

    // Return HTML dengan styling untuk print
    const htmlWithStyles = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${letter.subject}</title>
  <style>
    @media print {
      @page {
        margin: 2cm;
        size: A4;
      }
      body {
        font-family: 'Times New Roman', serif;
        font-size: 12pt;
        line-height: 1.6;
      }
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm;
    }
    h1, h2, h3 {
      margin-top: 1em;
      margin-bottom: 0.5em;
    }
    p {
      margin-bottom: 0.5em;
      text-align: justify;
    }
  </style>
</head>
<body>
  ${letter.renderedHtml}
</body>
</html>`;

    res.send(htmlWithStyles);
  }

  async downloadArchiveLetter(id: number, instansiId: number, res: Response) {
    const archive = await this.archiveRepository.findOne({
      where: { id, instansiId },
    });

    if (!archive) {
      throw new NotFoundException('Arsip surat tidak ditemukan');
    }

    // Jika ada filePath, serve file dari storage
    if (archive.filePath) {
      try {
        // Extract file path (remove /storage/ prefix if exists)
        let filePath = archive.filePath;
        if (filePath.startsWith('/storage/')) {
          filePath = filePath.replace('/storage/', '');
        }

        // Get file from storage
        const fileBuffer = await this.storageService.getFile(filePath);

        // Determine content type based on file extension
        const fileExtension = filePath.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';
        if (fileExtension === 'pdf') {
          contentType = 'application/pdf';
        } else if (fileExtension === 'doc' || fileExtension === 'docx') {
          contentType = 'application/msword';
        } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
          contentType = 'application/vnd.ms-excel';
        } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
          contentType = 'image/jpeg';
        } else if (fileExtension === 'png') {
          contentType = 'image/png';
        }

        // Set headers
        res.setHeader('Content-Type', contentType);
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${archive.referenceNumber || archive.id}.${fileExtension || 'pdf'}"`,
        );
        res.setHeader('Content-Length', fileBuffer.length.toString());

        // Send file
        res.send(fileBuffer);
        return;
      } catch (error) {
        throw new BadRequestException(`File tidak ditemukan: ${error.message}`);
      }
    }

    // Jika generated letter, gunakan renderedHtml
    if (archive.sourceType === ArchiveSourceType.GENERATED) {
      const generated = await this.generatedLettersRepository.findOne({
        where: { id: archive.sourceId, instansiId },
      });

      if (generated && generated.renderedHtml) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="surat-${archive.referenceNumber || archive.id}.html"`,
        );

        const htmlWithStyles = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${archive.subject}</title>
  <style>
    @media print {
      @page {
        margin: 2cm;
        size: A4;
      }
      body {
        font-family: 'Times New Roman', serif;
        font-size: 12pt;
        line-height: 1.6;
      }
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm;
    }
  </style>
</head>
<body>
  ${generated.renderedHtml}
</body>
</html>`;

        res.send(htmlWithStyles);
        return;
      }
    }

    throw new BadRequestException('File tidak tersedia untuk diunduh');
  }

  // ========== Statistics ==========
  async getStatistics(instansiId: number, year?: number) {
    const incomingQuery = this.incomingLettersRepository
      .createQueryBuilder('letter')
      .where('letter.instansiId = :instansiId', { instansiId });

    const outgoingQuery = this.outgoingLettersRepository
      .createQueryBuilder('letter')
      .where('letter.instansiId = :instansiId', { instansiId });

    const generatedQuery = this.generatedLettersRepository
      .createQueryBuilder('letter')
      .where('letter.instansiId = :instansiId', { instansiId });

    if (year) {
      incomingQuery.andWhere('YEAR(letter.tanggalTerima) = :year', { year });
      outgoingQuery.andWhere('YEAR(letter.tanggalSurat) = :year', { year });
      generatedQuery.andWhere('YEAR(letter.letterDate) = :year', { year });
    }

    const [totalIncoming, totalOutgoing, totalGenerated] = await Promise.all([
      incomingQuery.getCount(),
      outgoingQuery.getCount(),
      generatedQuery.getCount(),
    ]);

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

    const generatedByStatus = await this.generatedLettersRepository
      .createQueryBuilder('letter')
      .select('letter.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('letter.instansiId = :instansiId', { instansiId })
      .groupBy('letter.status')
      .getRawMany();

    return {
      totalIncoming,
      totalOutgoing,
      totalGenerated,
      incomingByStatus: this.reduceCountMap(incomingByStatus),
      outgoingByStatus: this.reduceCountMap(outgoingByStatus),
      generatedByStatus: this.reduceCountMap(generatedByStatus),
    };
  }

  // ========== Private Helpers ==========
  private async ensureUniqueNomorSurat<
    T extends { nomorSurat: string; instansiId: number },
  >(
    repository: Repository<T>,
    nomorSurat: string,
    instansiId: number,
  ) {
    if (!nomorSurat) {
      return;
    }

    const existing = await repository.findOne({
      where: {
        nomorSurat,
        instansiId,
      } as FindOptionsWhere<T>,
    });

    if (existing) {
      throw new BadRequestException(
        `Nomor surat ${nomorSurat} sudah digunakan`,
      );
    }
  }

  private async syncIncomingArchive(letter: IncomingLetter) {
    await this.upsertArchive({
      instansiId: letter.instansiId,
      sourceId: letter.id,
      sourceType: ArchiveSourceType.INCOMING,
      referenceNumber: letter.nomorSurat,
      subject: letter.perihal,
      category: letter.jenisSurat,
      fromName: letter.pengirim,
      toName: letter.penerimaDisposisi,
      letterDate: letter.tanggalTerima,
      status: letter.status,
      type: 'incoming',
      filePath: letter.filePath,
      metadata: {
        prioritas: letter.prioritas,
        sifatSurat: letter.sifatSurat,
        lampiran: letter.lampiran,
        catatan: letter.catatan,
      },
    });
  }

  private async syncOutgoingArchive(letter: OutgoingLetter) {
    await this.upsertArchive({
      instansiId: letter.instansiId,
      sourceId: letter.id,
      sourceType: ArchiveSourceType.OUTGOING,
      referenceNumber: letter.nomorSurat,
      subject: letter.perihal,
      category: letter.jenisSurat,
      fromName: letter.pengirim,
      toName: letter.tujuan,
      letterDate: letter.tanggalSurat,
      status: letter.status,
      type: 'outgoing',
      filePath: letter.filePath,
      metadata: {
        prioritas: letter.prioritas,
        sifatSurat: letter.sifatSurat,
        lampiran: letter.lampiran,
        isiSurat: letter.isiSurat,
        tindakLanjut: letter.tindakLanjut,
      },
    });
  }

  private async syncGeneratedArchive(
    letter: GeneratedLetter,
    template: LetterTemplate,
  ) {
    await this.upsertArchive({
      instansiId: letter.instansiId,
      sourceId: letter.id,
      sourceType: ArchiveSourceType.GENERATED,
      referenceNumber: letter.referenceNumber,
      subject: letter.subject,
      category: template.category || template.jenisSurat,
      fromName: null,
      toName: letter.recipient,
      letterDate: letter.letterDate,
      status: letter.status,
      type: 'generated',
      filePath: letter.filePath,
      metadata: {
        templateId: template.id,
        templateCode: template.code,
        variables: letter.variables,
        renderedHtml: letter.renderedHtml,
      },
    });
  }

  private async upsertArchive(payload: {
    instansiId: number;
    sourceType: ArchiveSourceType;
    sourceId: number;
    referenceNumber?: string;
    subject: string;
    category?: string;
    fromName?: string | null;
    toName?: string | null;
    letterDate?: Date | null;
    status?: string;
    type?: string;
    filePath?: string | null;
    metadata?: Record<string, any>;
  }) {
    let archive = await this.archiveRepository.findOne({
      where: {
        instansiId: payload.instansiId,
        sourceType: payload.sourceType,
        sourceId: payload.sourceId,
      },
    });

    if (!archive) {
      archive = this.archiveRepository.create({
        instansiId: payload.instansiId,
        sourceType: payload.sourceType,
        sourceId: payload.sourceId,
      });
    }

    Object.assign(archive, {
      referenceNumber: payload.referenceNumber,
      subject: payload.subject,
      category: payload.category,
      fromName: payload.fromName ?? null,
      toName: payload.toName ?? null,
      letterDate: payload.letterDate ?? null,
      status: payload.status,
      type: payload.type,
      filePath: payload.filePath ?? null,
      metadata: payload.metadata || {},
    });

    await this.archiveRepository.save(archive);
  }

  private async removeArchive(
    sourceType: ArchiveSourceType,
    sourceId: number,
    instansiId: number,
  ) {
    await this.archiveRepository.delete({
      sourceType,
      sourceId,
      instansiId,
    });
  }

  private async getOrCreateSequenceForTemplate(
    instansiId: number,
    template: LetterTemplate,
  ) {
    const defaults = {
      name: template.name,
      description: template.description,
      pattern:
        '{{counter}}/' +
        (template.code || 'SURAT') +
        '/{{month_roman}}/{{year}}',
    };

    return this.upsertSequence(instansiId, template.code, defaults);
  }

  private async consumeSequence(
    sequence: LetterSequence,
    date: Date,
  ): Promise<string> {
    const shouldReset = this.shouldResetSequence(sequence, date);
    if (shouldReset) {
      sequence.counter = 0;
      sequence.lastResetAt = date;
    }

    sequence.counter += 1;
    sequence.lastResetAt = date;
    await this.sequenceRepository.save(sequence);

    return this.formatSequencePattern(sequence, date);
  }

  private shouldResetSequence(sequence: LetterSequence, date: Date) {
    if (sequence.resetPeriod === SequenceResetPeriod.NONE) {
      return false;
    }

    if (!sequence.lastResetAt) {
      return false;
    }

    const last = new Date(sequence.lastResetAt);

    if (sequence.resetPeriod === SequenceResetPeriod.YEARLY) {
      return last.getFullYear() !== date.getFullYear();
    }

    if (sequence.resetPeriod === SequenceResetPeriod.MONTHLY) {
      return (
        last.getFullYear() !== date.getFullYear() ||
        last.getMonth() !== date.getMonth()
      );
    }

    return false;
  }

  private formatSequencePattern(sequence: LetterSequence, date: Date) {
    const counterPadded = sequence.counter
      .toString()
      .padStart(sequence.padding, '0');

    const replacements: Record<string, string> = {
      counter: counterPadded,
      counter_raw: sequence.counter.toString(),
      year: date.getFullYear().toString(),
      month: (date.getMonth() + 1).toString().padStart(2, '0'),
      month_name: this.getMonthName(date.getMonth()),
      month_roman: this.getRomanNumeral(date.getMonth() + 1),
      day: date.getDate().toString().padStart(2, '0'),
      template_code: sequence.code.toUpperCase(),
    };

    return sequence.pattern.replace(/{{\s*([\w_]+)\s*}}/g, (_, key) => {
      return replacements[key] ?? '';
    });
  }

  private renderTemplate(
    content: string,
    variables: Record<string, any>,
  ): string {
    if (!content) {
      return '';
    }

    let rendered = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(regex, value ?? '');
    });

    return rendered;
  }

  private getMonthName(monthIndex: number) {
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    return months[monthIndex] ?? '';
  }

  private getRomanNumeral(month: number) {
    const romans = [
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
      'X',
      'XI',
      'XII',
    ];
    return romans[month - 1] ?? '';
  }

  private parseDate(value: string | Date) {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return value;
    }

    return new Date(value);
  }

  private formatHumanDate(date: Date) {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  private reduceCountMap(items: Array<{ status: string; count: string }>) {
    return items.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = parseInt(item.count, 10);
      return acc;
    }, {});
  }
}

