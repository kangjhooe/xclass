import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { UpdateSubjectStatusDto } from './dto/update-subject-status.dto';
import { CurriculumType } from '../curriculum/entities/curriculum.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private subjectsRepository: Repository<Subject>,
  ) {}

  async create(createSubjectDto: CreateSubjectDto, instansiId: number) {
    const subject = this.subjectsRepository.create({
      ...createSubjectDto,
      instansiId,
      isActive: createSubjectDto.isActive ?? true,
      isMandatory: createSubjectDto.isMandatory ?? true,
      isElective: createSubjectDto.isElective ?? false,
      minimumPassingScore: createSubjectDto.minimumPassingScore ?? 75,
    });
    
    if (subject.isElective && subject.isMandatory) {
      subject.isMandatory = false;
    }

    return await this.subjectsRepository.save(subject);
  }

  async findAll(filters: {
    search?: string;
    level?: string;
    grade?: string;
    curriculumType?: CurriculumType;
    isActive?: boolean;
    isMandatory?: boolean;
    isElective?: boolean;
    teacherId?: number;
    instansiId: number;
  }) {
    const { search, level, grade, curriculumType, isActive, isMandatory, isElective, teacherId, instansiId } = filters;
    const queryBuilder = this.subjectsRepository
      .createQueryBuilder('subject')
      .leftJoinAndSelect('subject.teachers', 'teacher')
      .leftJoinAndSelect('subject.syllabi', 'syllabus')
      .where('subject.instansiId = :instansiId', { instansiId });

    if (search) {
      queryBuilder.andWhere(
        '(subject.name LIKE :search OR subject.code LIKE :search OR subject.category LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (level) {
      queryBuilder.andWhere('subject.level = :level', { level });
    }

    if (grade) {
      queryBuilder.andWhere('subject.grade = :grade', { grade });
    }

    if (curriculumType) {
      queryBuilder.andWhere('subject.curriculumType = :curriculumType', { curriculumType });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('subject.isActive = :isActive', { isActive });
    }

    if (isMandatory !== undefined) {
      queryBuilder.andWhere('subject.isMandatory = :isMandatory', { isMandatory });
    }

    if (isElective !== undefined) {
      queryBuilder.andWhere('subject.isElective = :isElective', { isElective });
    }

    if (teacherId) {
      queryBuilder.andWhere('teacher.id = :teacherId', { teacherId });
    }

    queryBuilder
      .orderBy('subject.order', 'ASC')
      .addOrderBy('subject.name', 'ASC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
    };
  }

  async findOne(id: number, instansiId: number) {
    const subject = await this.subjectsRepository.findOne({
      where: { id, instansiId },
      relations: [
        'teachers',
        'syllabi',
        'schedules',
        'schedules.classRoom',
        'schedules.teacher',
      ],
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return subject;
  }

  async update(id: number, updateSubjectDto: UpdateSubjectDto, instansiId: number) {
    const subject = await this.findOne(id, instansiId);
    Object.assign(subject, updateSubjectDto);
    return await this.subjectsRepository.save(subject);
  }

  async remove(id: number, instansiId: number) {
    const subject = await this.findOne(id, instansiId);
    await this.subjectsRepository.remove(subject);
    return { message: 'Subject deleted successfully' };
  }

  async updateStatus(id: number, updateSubjectStatusDto: UpdateSubjectStatusDto, instansiId: number) {
    const subject = await this.findOne(id, instansiId);

    if (updateSubjectStatusDto.isActive !== undefined) {
      subject.isActive = updateSubjectStatusDto.isActive;
    }

    if (updateSubjectStatusDto.isMandatory !== undefined) {
      subject.isMandatory = updateSubjectStatusDto.isMandatory;

      if (updateSubjectStatusDto.isMandatory) {
        subject.isElective = false;
      }
    }

    if (updateSubjectStatusDto.isElective !== undefined) {
      subject.isElective = updateSubjectStatusDto.isElective;

      if (updateSubjectStatusDto.isElective) {
        subject.isMandatory = false;
      }
    }

    return await this.subjectsRepository.save(subject);
  }

  async getOverview(instansiId: number) {
    const [totalSubjects, activeSubjects, mandatorySubjects, electiveSubjects] = await Promise.all([
      this.subjectsRepository.count({ where: { instansiId } }),
      this.subjectsRepository.count({ where: { instansiId, isActive: true } }),
      this.subjectsRepository.count({ where: { instansiId, isMandatory: true } }),
      this.subjectsRepository.count({ where: { instansiId, isElective: true } }),
    ]);

    const distributionByLevel = await this.subjectsRepository
      .createQueryBuilder('subject')
      .select('subject.level', 'level')
      .addSelect('COUNT(subject.id)', 'total')
      .where('subject.instansiId = :instansiId', { instansiId })
      .groupBy('subject.level')
      .orderBy('subject.level', 'ASC')
      .getRawMany();

    const distributionByCurriculum = await this.subjectsRepository
      .createQueryBuilder('subject')
      .select('subject.curriculumType', 'curriculumType')
      .addSelect('COUNT(subject.id)', 'total')
      .where('subject.instansiId = :instansiId', { instansiId })
      .andWhere('subject.curriculumType IS NOT NULL')
      .groupBy('subject.curriculumType')
      .orderBy('total', 'DESC')
      .getRawMany();

    const topSubjectsBySyllabi = await this.subjectsRepository
      .createQueryBuilder('subject')
      .leftJoin('subject.syllabi', 'syllabus')
      .select('subject.id', 'id')
      .addSelect('subject.name', 'name')
      .addSelect('COUNT(syllabus.id)', 'syllabusCount')
      .where('subject.instansiId = :instansiId', { instansiId })
      .groupBy('subject.id')
      .orderBy('syllabusCount', 'DESC')
      .addOrderBy('subject.name', 'ASC')
      .limit(5)
      .getRawMany();

    return {
      totalSubjects,
      activeSubjects,
      inactiveSubjects: totalSubjects - activeSubjects,
      mandatorySubjects,
      electiveSubjects,
      distribution: {
        byLevel: distributionByLevel,
        byCurriculum: distributionByCurriculum,
      },
      highlights: {
        topSubjectsBySyllabi,
      },
    };
  }

  async getSubjectDashboard(id: number, instansiId: number) {
    const subject = await this.findOne(id, instansiId);

    const totalSyllabi = subject.syllabi?.length ?? 0;
    const totalTeachers = subject.teachers?.length ?? 0;
    const totalSchedules = subject.schedules?.length ?? 0;
    const activeSchedules = subject.schedules?.filter((schedule) => schedule.isActive)?.length ?? 0;

    const teachingDays = Array.from(
      new Set(subject.schedules?.map((schedule) => schedule.dayOfWeek).filter((day) => day !== undefined)),
    ) as number[];

    const classes = Array.from(
      new Set(
        subject.schedules
          ?.map((schedule) => schedule.classRoom?.name)
          .filter((className): className is string => !!className),
      ),
    );

    return {
      subject,
      metrics: {
        totalSyllabi,
        totalTeachers,
        totalSchedules,
        activeSchedules,
        teachingDays,
        classes,
      },
    };
  }
}
