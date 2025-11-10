import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentGrade } from './entities/student-grade.entity';
import { CreateStudentGradeDto } from './dto/create-student-grade.dto';
import { UpdateStudentGradeDto } from './dto/update-student-grade.dto';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(StudentGrade)
    private gradesRepository: Repository<StudentGrade>,
  ) {}

  async create(createStudentGradeDto: CreateStudentGradeDto, instansiId: number) {
    const grade = this.gradesRepository.create({
      ...createStudentGradeDto,
      instansiId,
    });
    return await this.gradesRepository.save(grade);
  }

  async findAll(filters: {
    studentId?: number;
    subjectId?: number;
    instansiId: number;
  }) {
    const { studentId, subjectId, instansiId } = filters;
    const queryBuilder = this.gradesRepository
      .createQueryBuilder('grade')
      .where('grade.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('grade.student', 'student')
      .leftJoinAndSelect('grade.subject', 'subject')
      .leftJoinAndSelect('grade.teacher', 'teacher');

    if (studentId) {
      queryBuilder.andWhere('grade.studentId = :studentId', { studentId });
    }

    if (subjectId) {
      queryBuilder.andWhere('grade.subjectId = :subjectId', { subjectId });
    }

    queryBuilder.orderBy('grade.date', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOne(id: number, instansiId: number) {
    const grade = await this.gradesRepository.findOne({
      where: { id, instansiId },
      relations: ['student', 'subject', 'teacher'],
    });

    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }

    return grade;
  }

  async update(id: number, updateStudentGradeDto: UpdateStudentGradeDto, instansiId: number) {
    const grade = await this.findOne(id, instansiId);
    Object.assign(grade, updateStudentGradeDto);
    return await this.gradesRepository.save(grade);
  }

  async remove(id: number, instansiId: number) {
    const grade = await this.findOne(id, instansiId);
    await this.gradesRepository.remove(grade);
    return { message: 'Grade deleted successfully' };
  }
}
