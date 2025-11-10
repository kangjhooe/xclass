import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card, CardType, CardStatus } from './entities/card.entity';
import { CardTemplate, TemplateType } from './entities/card-template.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CreateCardTemplateDto } from './dto/create-card-template.dto';
import { UpdateCardTemplateDto } from './dto/update-card-template.dto';

@Injectable()
export class CardManagementService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(CardTemplate)
    private templateRepository: Repository<CardTemplate>,
  ) {}

  // Card CRUD
  async createCard(createCardDto: CreateCardDto, instansiId: number) {
    // Check if card number already exists
    const existing = await this.cardRepository.findOne({
      where: { cardNumber: createCardDto.cardNumber, instansiId },
    });

    if (existing) {
      throw new BadRequestException('Card number already exists');
    }

    // Validate type and related entity
    if (createCardDto.type === CardType.STUDENT && !createCardDto.studentId) {
      throw new BadRequestException('Student ID is required for student card');
    }

    if (createCardDto.type === CardType.TEACHER && !createCardDto.teacherId) {
      throw new BadRequestException('Teacher ID is required for teacher card');
    }

    const card = this.cardRepository.create({
      ...createCardDto,
      instansiId,
      status: createCardDto.status || CardStatus.ACTIVE,
      birthDate: createCardDto.birthDate ? new Date(createCardDto.birthDate) : null,
      validFrom: createCardDto.validFrom ? new Date(createCardDto.validFrom) : null,
      validUntil: createCardDto.validUntil ? new Date(createCardDto.validUntil) : null,
    });

    return await this.cardRepository.save(card);
  }

  async findAllCards(filters: {
    type?: string;
    status?: string;
    studentId?: number;
    teacherId?: number;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const { type, status, studentId, teacherId, page = 1, limit = 20, instansiId } = filters;

    const queryBuilder = this.cardRepository
      .createQueryBuilder('card')
      .where('card.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('card.student', 'student')
      .leftJoinAndSelect('card.teacher', 'teacher');

    if (type) {
      queryBuilder.andWhere('card.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('card.status = :status', { status });
    }

    if (studentId) {
      queryBuilder.andWhere('card.studentId = :studentId', { studentId });
    }

    if (teacherId) {
      queryBuilder.andWhere('card.teacherId = :teacherId', { teacherId });
    }

    queryBuilder.orderBy('card.createdAt', 'DESC');

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

  async findOneCard(id: number, instansiId: number) {
    const card = await this.cardRepository.findOne({
      where: { id, instansiId },
      relations: ['student', 'teacher'],
    });

    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    return card;
  }

  async updateCard(id: number, updateCardDto: UpdateCardDto, instansiId: number) {
    const card = await this.findOneCard(id, instansiId);

    Object.assign(card, {
      ...updateCardDto,
      birthDate: updateCardDto.birthDate ? new Date(updateCardDto.birthDate) : card.birthDate,
      validFrom: updateCardDto.validFrom ? new Date(updateCardDto.validFrom) : card.validFrom,
      validUntil: updateCardDto.validUntil ? new Date(updateCardDto.validUntil) : card.validUntil,
    });

    return await this.cardRepository.save(card);
  }

  async removeCard(id: number, instansiId: number) {
    const card = await this.findOneCard(id, instansiId);
    await this.cardRepository.remove(card);
    return { message: 'Card deleted successfully' };
  }

  // Template CRUD
  async createTemplate(createTemplateDto: CreateCardTemplateDto, instansiId: number) {
    // If this is set as default, unset other defaults of the same type
    if (createTemplateDto.isDefault) {
      await this.templateRepository.update(
        { type: createTemplateDto.type, instansiId, isDefault: true },
        { isDefault: false },
      );
    }

    const template = this.templateRepository.create({
      ...createTemplateDto,
      instansiId,
      isActive: true,
    });

    return await this.templateRepository.save(template);
  }

  async findAllTemplates(filters: {
    type?: string;
    instansiId: number;
  }) {
    const { type, instansiId } = filters;

    const queryBuilder = this.templateRepository
      .createQueryBuilder('template')
      .where('template.instansiId = :instansiId', { instansiId })
      .andWhere('template.isActive = :isActive', { isActive: true });

    if (type) {
      queryBuilder.andWhere('template.type = :type', { type });
    }

    queryBuilder.orderBy('template.isDefault', 'DESC').addOrderBy('template.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOneTemplate(id: number, instansiId: number) {
    const template = await this.templateRepository.findOne({
      where: { id, instansiId },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  async updateTemplate(id: number, updateTemplateDto: UpdateCardTemplateDto, instansiId: number) {
    const template = await this.findOneTemplate(id, instansiId);

    // If setting as default, unset other defaults
    if (updateTemplateDto.isDefault) {
      await this.templateRepository.update(
        { type: template.type, instansiId, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(template, updateTemplateDto);
    return await this.templateRepository.save(template);
  }

  async removeTemplate(id: number, instansiId: number) {
    const template = await this.findOneTemplate(id, instansiId);
    await this.templateRepository.remove(template);
    return { message: 'Template deleted successfully' };
  }
}

