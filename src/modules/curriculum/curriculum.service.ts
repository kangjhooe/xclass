import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curriculum } from './entities/curriculum.entity';
import { Syllabus } from './entities/syllabus.entity';
import { LearningMaterial } from './entities/learning-material.entity';
import { Competency } from './entities/competency.entity';
import { CurriculumSchedule } from './entities/curriculum-schedule.entity';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import { CreateSyllabusDto } from './dto/create-syllabus.dto';
import { UpdateSyllabusDto } from './dto/update-syllabus.dto';
import { CreateLearningMaterialDto } from './dto/create-learning-material.dto';
import { UpdateLearningMaterialDto } from './dto/update-learning-material.dto';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';
import { CreateCurriculumScheduleDto } from './dto/create-curriculum-schedule.dto';
import { UpdateCurriculumScheduleDto } from './dto/update-curriculum-schedule.dto';

@Injectable()
export class CurriculumService {
  constructor(
    @InjectRepository(Curriculum)
    private curriculumRepository: Repository<Curriculum>,
    @InjectRepository(Syllabus)
    private syllabusRepository: Repository<Syllabus>,
    @InjectRepository(LearningMaterial)
    private learningMaterialRepository: Repository<LearningMaterial>,
    @InjectRepository(Competency)
    private competencyRepository: Repository<Competency>,
    @InjectRepository(CurriculumSchedule)
    private curriculumScheduleRepository: Repository<CurriculumSchedule>,
  ) {}

  // ========== Curriculum CRUD ==========
  async createCurriculum(createCurriculumDto: CreateCurriculumDto, instansiId: number) {
    const curriculum = this.curriculumRepository.create({
      ...createCurriculumDto,
      instansiId,
      isActive: createCurriculumDto.isActive ?? true,
    });
    return await this.curriculumRepository.save(curriculum);
  }

  async findAllCurricula(filters: {
    academicYearId?: number;
    level?: string;
    grade?: string;
    semester?: number;
    instansiId: number;
  }) {
    const { academicYearId, level, grade, semester, instansiId } = filters;
    const queryBuilder = this.curriculumRepository
      .createQueryBuilder('curriculum')
      .where('curriculum.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('curriculum.syllabi', 'syllabi');

    if (academicYearId) {
      queryBuilder.andWhere('curriculum.academicYearId = :academicYearId', { academicYearId });
    }

    if (level) {
      queryBuilder.andWhere('curriculum.level = :level', { level });
    }

    if (grade) {
      queryBuilder.andWhere('curriculum.grade = :grade', { grade });
    }

    if (semester) {
      queryBuilder.andWhere('curriculum.semester = :semester', { semester });
    }

    queryBuilder.orderBy('curriculum.name', 'ASC');

    return await queryBuilder.getMany();
  }

  async findOneCurriculum(id: number, instansiId: number) {
    const curriculum = await this.curriculumRepository.findOne({
      where: { id, instansiId },
      relations: ['syllabi', 'syllabi.subject', 'syllabi.learningMaterials', 'syllabi.competencies'],
    });

    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }

    return curriculum;
  }

  async updateCurriculum(id: number, updateCurriculumDto: UpdateCurriculumDto, instansiId: number) {
    const curriculum = await this.findOneCurriculum(id, instansiId);
    Object.assign(curriculum, updateCurriculumDto);
    return await this.curriculumRepository.save(curriculum);
  }

  async removeCurriculum(id: number, instansiId: number) {
    const curriculum = await this.findOneCurriculum(id, instansiId);
    await this.curriculumRepository.remove(curriculum);
    return { message: 'Curriculum deleted successfully' };
  }

  // ========== Syllabus CRUD ==========
  async createSyllabus(createSyllabusDto: CreateSyllabusDto, instansiId: number) {
    // Verify curriculum exists
    const curriculum = await this.findOneCurriculum(createSyllabusDto.curriculumId, instansiId);

    const syllabus = this.syllabusRepository.create({
      ...createSyllabusDto,
      instansiId,
      isActive: createSyllabusDto.isActive ?? true,
    });
    return await this.syllabusRepository.save(syllabus);
  }

  async findAllSyllabi(filters: {
    curriculumId?: number;
    subjectId?: number;
    instansiId: number;
  }) {
    const { curriculumId, subjectId, instansiId } = filters;
    const queryBuilder = this.syllabusRepository
      .createQueryBuilder('syllabus')
      .where('syllabus.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('syllabus.curriculum', 'curriculum')
      .leftJoinAndSelect('syllabus.subject', 'subject')
      .leftJoinAndSelect('syllabus.learningMaterials', 'learningMaterials')
      .leftJoinAndSelect('syllabus.competencies', 'competencies');

    if (curriculumId) {
      queryBuilder.andWhere('syllabus.curriculumId = :curriculumId', { curriculumId });
    }

    if (subjectId) {
      queryBuilder.andWhere('syllabus.subjectId = :subjectId', { subjectId });
    }

    queryBuilder.orderBy('syllabus.title', 'ASC');

    return await queryBuilder.getMany();
  }

  async findOneSyllabus(id: number, instansiId: number) {
    const syllabus = await this.syllabusRepository.findOne({
      where: { id, instansiId },
      relations: [
        'curriculum',
        'subject',
        'learningMaterials',
        'competencies',
      ],
    });

    if (!syllabus) {
      throw new NotFoundException(`Syllabus with ID ${id} not found`);
    }

    return syllabus;
  }

  async updateSyllabus(id: number, updateSyllabusDto: UpdateSyllabusDto, instansiId: number) {
    const syllabus = await this.findOneSyllabus(id, instansiId);
    Object.assign(syllabus, updateSyllabusDto);
    return await this.syllabusRepository.save(syllabus);
  }

  async removeSyllabus(id: number, instansiId: number) {
    const syllabus = await this.findOneSyllabus(id, instansiId);
    await this.syllabusRepository.remove(syllabus);
    return { message: 'Syllabus deleted successfully' };
  }

  // ========== Learning Material CRUD ==========
  async createLearningMaterial(createLearningMaterialDto: CreateLearningMaterialDto, instansiId: number) {
    // Verify syllabus exists
    const syllabus = await this.findOneSyllabus(createLearningMaterialDto.syllabusId, instansiId);

    const learningMaterial = this.learningMaterialRepository.create({
      ...createLearningMaterialDto,
      instansiId,
      isActive: createLearningMaterialDto.isActive ?? true,
    });
    return await this.learningMaterialRepository.save(learningMaterial);
  }

  async findAllLearningMaterials(filters: {
    syllabusId?: number;
    type?: string;
    instansiId: number;
  }) {
    const { syllabusId, type, instansiId } = filters;
    const queryBuilder = this.learningMaterialRepository
      .createQueryBuilder('material')
      .where('material.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('material.syllabus', 'syllabus');

    if (syllabusId) {
      queryBuilder.andWhere('material.syllabusId = :syllabusId', { syllabusId });
    }

    if (type) {
      queryBuilder.andWhere('material.type = :type', { type });
    }

    queryBuilder.orderBy('material.order', 'ASC').addOrderBy('material.meetingNumber', 'ASC');

    return await queryBuilder.getMany();
  }

  async findOneLearningMaterial(id: number, instansiId: number) {
    const learningMaterial = await this.learningMaterialRepository.findOne({
      where: { id, instansiId },
      relations: ['syllabus', 'syllabus.curriculum', 'syllabus.subject'],
    });

    if (!learningMaterial) {
      throw new NotFoundException(`Learning Material with ID ${id} not found`);
    }

    return learningMaterial;
  }

  async updateLearningMaterial(
    id: number,
    updateLearningMaterialDto: UpdateLearningMaterialDto,
    instansiId: number,
  ) {
    const learningMaterial = await this.findOneLearningMaterial(id, instansiId);
    Object.assign(learningMaterial, updateLearningMaterialDto);
    return await this.learningMaterialRepository.save(learningMaterial);
  }

  async removeLearningMaterial(id: number, instansiId: number) {
    const learningMaterial = await this.findOneLearningMaterial(id, instansiId);
    await this.learningMaterialRepository.remove(learningMaterial);
    return { message: 'Learning Material deleted successfully' };
  }

  // ========== Competency CRUD ==========
  async createCompetency(createCompetencyDto: CreateCompetencyDto, instansiId: number) {
    // Verify syllabus exists
    const syllabus = await this.findOneSyllabus(createCompetencyDto.syllabusId, instansiId);

    const competency = this.competencyRepository.create({
      ...createCompetencyDto,
      instansiId,
      isActive: createCompetencyDto.isActive ?? true,
    });
    return await this.competencyRepository.save(competency);
  }

  async findAllCompetencies(filters: {
    syllabusId?: number;
    type?: string;
    instansiId: number;
  }) {
    const { syllabusId, type, instansiId } = filters;
    const queryBuilder = this.competencyRepository
      .createQueryBuilder('competency')
      .where('competency.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('competency.syllabus', 'syllabus');

    if (syllabusId) {
      queryBuilder.andWhere('competency.syllabusId = :syllabusId', { syllabusId });
    }

    if (type) {
      queryBuilder.andWhere('competency.type = :type', { type });
    }

    queryBuilder.orderBy('competency.order', 'ASC').addOrderBy('competency.code', 'ASC');

    return await queryBuilder.getMany();
  }

  async findOneCompetency(id: number, instansiId: number) {
    const competency = await this.competencyRepository.findOne({
      where: { id, instansiId },
      relations: ['syllabus'],
    });

    if (!competency) {
      throw new NotFoundException(`Competency with ID ${id} not found`);
    }

    return competency;
  }

  async updateCompetency(id: number, updateCompetencyDto: UpdateCompetencyDto, instansiId: number) {
    const competency = await this.findOneCompetency(id, instansiId);
    Object.assign(competency, updateCompetencyDto);
    return await this.competencyRepository.save(competency);
  }

  async removeCompetency(id: number, instansiId: number) {
    const competency = await this.findOneCompetency(id, instansiId);
    await this.competencyRepository.remove(competency);
    return { message: 'Competency deleted successfully' };
  }

  // ========== Curriculum Schedule CRUD ==========
  async createCurriculumSchedule(
    createCurriculumScheduleDto: CreateCurriculumScheduleDto,
    instansiId: number,
  ) {
    // Verify curriculum and syllabus exist
    await this.findOneCurriculum(createCurriculumScheduleDto.curriculumId, instansiId);
    await this.findOneSyllabus(createCurriculumScheduleDto.syllabusId, instansiId);

    const schedule = this.curriculumScheduleRepository.create({
      ...createCurriculumScheduleDto,
      scheduleDate: new Date(createCurriculumScheduleDto.scheduleDate),
      instansiId,
      isActive: createCurriculumScheduleDto.isActive ?? true,
      isCompleted: createCurriculumScheduleDto.isCompleted ?? false,
    });
    return await this.curriculumScheduleRepository.save(schedule);
  }

  async findAllCurriculumSchedules(filters: {
    curriculumId?: number;
    syllabusId?: number;
    classId?: number;
    subjectId?: number;
    teacherId?: number;
    startDate?: string;
    endDate?: string;
    instansiId: number;
  }) {
    const {
      curriculumId,
      syllabusId,
      classId,
      subjectId,
      teacherId,
      startDate,
      endDate,
      instansiId,
    } = filters;
    const queryBuilder = this.curriculumScheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('schedule.curriculum', 'curriculum')
      .leftJoinAndSelect('schedule.syllabus', 'syllabus')
      .leftJoinAndSelect('schedule.learningMaterial', 'learningMaterial')
      .leftJoinAndSelect('schedule.classRoom', 'classRoom')
      .leftJoinAndSelect('schedule.subject', 'subject')
      .leftJoinAndSelect('schedule.teacher', 'teacher');

    if (curriculumId) {
      queryBuilder.andWhere('schedule.curriculumId = :curriculumId', { curriculumId });
    }

    if (syllabusId) {
      queryBuilder.andWhere('schedule.syllabusId = :syllabusId', { syllabusId });
    }

    if (classId) {
      queryBuilder.andWhere('schedule.classId = :classId', { classId });
    }

    if (subjectId) {
      queryBuilder.andWhere('schedule.subjectId = :subjectId', { subjectId });
    }

    if (teacherId) {
      queryBuilder.andWhere('schedule.teacherId = :teacherId', { teacherId });
    }

    if (startDate) {
      queryBuilder.andWhere('schedule.scheduleDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('schedule.scheduleDate <= :endDate', { endDate });
    }

    queryBuilder
      .orderBy('schedule.scheduleDate', 'ASC')
      .addOrderBy('schedule.startTime', 'ASC');

    return await queryBuilder.getMany();
  }

  async findOneCurriculumSchedule(id: number, instansiId: number) {
    const schedule = await this.curriculumScheduleRepository.findOne({
      where: { id, instansiId },
      relations: [
        'curriculum',
        'syllabus',
        'learningMaterial',
        'classRoom',
        'subject',
        'teacher',
      ],
    });

    if (!schedule) {
      throw new NotFoundException(`Curriculum Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async updateCurriculumSchedule(
    id: number,
    updateCurriculumScheduleDto: UpdateCurriculumScheduleDto,
    instansiId: number,
  ) {
    const schedule = await this.findOneCurriculumSchedule(id, instansiId);
    
    const updateData: any = { ...updateCurriculumScheduleDto };
    
    if (updateData.scheduleDate) {
      updateData.scheduleDate = new Date(updateData.scheduleDate);
    }

    if (updateData.isCompleted && !schedule.isCompleted) {
      updateData.completedAt = new Date();
    }

    Object.assign(schedule, updateData);
    return await this.curriculumScheduleRepository.save(schedule);
  }

  async removeCurriculumSchedule(id: number, instansiId: number) {
    const schedule = await this.findOneCurriculumSchedule(id, instansiId);
    await this.curriculumScheduleRepository.remove(schedule);
    return { message: 'Curriculum Schedule deleted successfully' };
  }
}

