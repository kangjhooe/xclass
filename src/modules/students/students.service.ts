import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  async create(createStudentDto: CreateStudentDto, instansiId: number) {
    const student = this.studentsRepository.create({
      ...createStudentDto,
      instansiId,
      isActive: createStudentDto.isActive ?? true,
    });
    return await this.studentsRepository.save(student);
  }

  async findAll(filters: {
    search?: string;
    classId?: number;
    status?: string;
    gender?: string;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const { search, classId, status, gender, page = 1, limit = 20, instansiId } = filters;
    
    const queryBuilder = this.studentsRepository
      .createQueryBuilder('student')
      .where('student.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('student.classRoom', 'classRoom');

    if (search) {
      queryBuilder.andWhere(
        '(student.name LIKE :search OR student.studentNumber LIKE :search OR student.nisn LIKE :search OR student.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (classId) {
      queryBuilder.andWhere('student.classId = :classId', { classId });
    }

    if (status === 'active') {
      queryBuilder.andWhere('student.isActive = :isActive', { isActive: true });
    } else if (status === 'inactive') {
      queryBuilder.andWhere('student.isActive = :isActive', { isActive: false });
    }

    if (gender) {
      queryBuilder.andWhere('student.gender = :gender', { gender });
    }

    queryBuilder.orderBy('student.name', 'ASC');

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
    const student = await this.studentsRepository.findOne({
      where: { id, instansiId },
      relations: ['classRoom', 'attendances', 'grades'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto, instansiId: number) {
    const student = await this.findOne(id, instansiId);
    Object.assign(student, updateStudentDto);
    return await this.studentsRepository.save(student);
  }

  async remove(id: number, instansiId: number) {
    const student = await this.findOne(id, instansiId);
    await this.studentsRepository.remove(student);
    return { message: 'Student deleted successfully' };
  }

  async getGrades(id: number, instansiId: number) {
    const student = await this.studentsRepository.findOne({
      where: { id, instansiId },
      relations: ['grades', 'grades.subject', 'grades.teacher'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student.grades;
  }

  async getAttendance(id: number, instansiId: number) {
    const student = await this.studentsRepository.findOne({
      where: { id, instansiId },
      relations: ['attendances', 'attendances.schedule', 'attendances.teacher'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student.attendances;
  }
}
