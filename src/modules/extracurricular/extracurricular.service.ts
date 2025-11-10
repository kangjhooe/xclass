import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Extracurricular, ExtracurricularStatus } from './entities/extracurricular.entity';
import {
  ExtracurricularParticipant,
  ParticipantStatus,
} from './entities/extracurricular-participant.entity';
import {
  ExtracurricularActivity,
  ActivityStatus,
} from './entities/extracurricular-activity.entity';
import { CreateExtracurricularDto } from './dto/create-extracurricular.dto';
import { UpdateExtracurricularDto } from './dto/update-extracurricular.dto';
import { CreateExtracurricularParticipantDto } from './dto/create-extracurricular-participant.dto';
import { CreateExtracurricularActivityDto } from './dto/create-extracurricular-activity.dto';

@Injectable()
export class ExtracurricularService {
  constructor(
    @InjectRepository(Extracurricular)
    private extracurricularsRepository: Repository<Extracurricular>,
    @InjectRepository(ExtracurricularParticipant)
    private participantsRepository: Repository<ExtracurricularParticipant>,
    @InjectRepository(ExtracurricularActivity)
    private activitiesRepository: Repository<ExtracurricularActivity>,
  ) {}

  // ========== Extracurriculars ==========
  async create(
    createDto: CreateExtracurricularDto,
    instansiId: number,
  ): Promise<Extracurricular> {
    const extracurricular = this.extracurricularsRepository.create({
      ...createDto,
      instansiId,
      status: createDto.status || ExtracurricularStatus.ACTIVE,
      currentParticipants: 0,
      startDate: createDto.startDate ? new Date(createDto.startDate) : null,
      endDate: createDto.endDate ? new Date(createDto.endDate) : null,
    });

    return await this.extracurricularsRepository.save(extracurricular);
  }

  async findAll(filters: {
    search?: string;
    category?: string;
    status?: ExtracurricularStatus;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      search,
      category,
      status,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.extracurricularsRepository
      .createQueryBuilder('extracurricular')
      .where('extracurricular.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('extracurricular.supervisor', 'supervisor')
      .leftJoinAndSelect('extracurricular.participants', 'participants');

    if (search) {
      queryBuilder.andWhere(
        '(extracurricular.name LIKE :search OR extracurricular.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      queryBuilder.andWhere('extracurricular.category = :category', { category });
    }

    if (status) {
      queryBuilder.andWhere('extracurricular.status = :status', { status });
    }

    queryBuilder.orderBy('extracurricular.name', 'ASC');

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
    const extracurricular = await this.extracurricularsRepository.findOne({
      where: { id, instansiId },
      relations: [
        'supervisor',
        'assistantSupervisor',
        'participants',
        'participants.student',
        'activities',
      ],
    });

    if (!extracurricular) {
      throw new NotFoundException(
        `Extracurricular with ID ${id} not found`,
      );
    }

    return extracurricular;
  }

  async update(
    id: number,
    updateDto: UpdateExtracurricularDto,
    instansiId: number,
  ) {
    const extracurricular = await this.findOne(id, instansiId);

    if (updateDto.startDate) {
      extracurricular.startDate = new Date(updateDto.startDate);
    }
    if (updateDto.endDate) {
      extracurricular.endDate = new Date(updateDto.endDate);
    }

    Object.assign(extracurricular, updateDto);
    return await this.extracurricularsRepository.save(extracurricular);
  }

  async remove(id: number, instansiId: number) {
    const extracurricular = await this.findOne(id, instansiId);
    await this.extracurricularsRepository.remove(extracurricular);
    return { message: 'Extracurricular deleted successfully' };
  }

  // ========== Participants ==========
  async addParticipant(
    createDto: CreateExtracurricularParticipantDto,
    instansiId: number,
  ) {
    const extracurricular = await this.findOne(
      createDto.extracurricularId,
      instansiId,
    );

    if (extracurricular.status !== ExtracurricularStatus.ACTIVE) {
      throw new BadRequestException('Extracurricular is not active');
    }

    if (
      extracurricular.maxParticipants &&
      extracurricular.currentParticipants >= extracurricular.maxParticipants
    ) {
      throw new BadRequestException('Maximum participants reached');
    }

    // Check if already a participant
    const existing = await this.participantsRepository.findOne({
      where: {
        extracurricularId: createDto.extracurricularId,
        studentId: createDto.studentId,
        instansiId,
        status: ParticipantStatus.ACTIVE,
      },
    });

    if (existing) {
      throw new BadRequestException('Student is already a participant');
    }

    const participant = this.participantsRepository.create({
      ...createDto,
      instansiId,
      joinedAt: createDto.joinedAt
        ? new Date(createDto.joinedAt)
        : new Date(),
      status: createDto.status || ParticipantStatus.ACTIVE,
    });

    const savedParticipant = await this.participantsRepository.save(participant);

    // Update current participants count
    extracurricular.currentParticipants += 1;
    await this.extracurricularsRepository.save(extracurricular);

    return savedParticipant;
  }

  async removeParticipant(
    participantId: number,
    instansiId: number,
    notes?: string,
  ) {
    const participant = await this.participantsRepository.findOne({
      where: { id: participantId, instansiId },
      relations: ['extracurricular'],
    });

    if (!participant) {
      throw new NotFoundException(
        `Participant with ID ${participantId} not found`,
      );
    }

    participant.status = ParticipantStatus.INACTIVE;
    participant.leftAt = new Date();
    if (notes) {
      participant.notes = notes;
    }

    await this.participantsRepository.save(participant);

    // Update current participants count
    const extracurricular = participant.extracurricular;
    extracurricular.currentParticipants = Math.max(
      0,
      extracurricular.currentParticipants - 1,
    );
    await this.extracurricularsRepository.save(extracurricular);

    return participant;
  }

  async getParticipants(extracurricularId: number, instansiId: number) {
    await this.findOne(extracurricularId, instansiId);

    return await this.participantsRepository.find({
      where: { extracurricularId, instansiId },
      relations: ['student'],
      order: { joinedAt: 'DESC' },
    });
  }

  // ========== Activities ==========
  async createActivity(
    createDto: CreateExtracurricularActivityDto,
    instansiId: number,
    createdBy?: number,
  ) {
    await this.findOne(createDto.extracurricularId, instansiId);

    const activity = this.activitiesRepository.create({
      ...createDto,
      instansiId,
      createdBy,
      activityDate: new Date(createDto.activityDate),
      startTime: createDto.startTime ? new Date(createDto.startTime) : null,
      endTime: createDto.endTime ? new Date(createDto.endTime) : null,
      status: createDto.status || ActivityStatus.SCHEDULED,
    });

    return await this.activitiesRepository.save(activity);
  }

  async getActivities(extracurricularId: number, instansiId: number) {
    await this.findOne(extracurricularId, instansiId);

    return await this.activitiesRepository.find({
      where: { extracurricularId, instansiId },
      order: { activityDate: 'DESC' },
    });
  }

  async getStatistics(instansiId: number) {
    const total = await this.extracurricularsRepository.count({
      where: { instansiId },
    });

    const active = await this.extracurricularsRepository.count({
      where: { instansiId, status: ExtracurricularStatus.ACTIVE },
    });

    const totalParticipants = await this.participantsRepository.count({
      where: { instansiId, status: ParticipantStatus.ACTIVE },
    });

    return {
      total,
      active,
      totalParticipants,
    };
  }
}
