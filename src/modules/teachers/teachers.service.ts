import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teachersRepository: Repository<Teacher>,
    @InjectRepository(Subject)
    private subjectsRepository: Repository<Subject>,
  ) {}

  async create(createTeacherDto: CreateTeacherDto, instansiId: number) {
    const isActive = createTeacherDto.isActive ?? true;
    let isMainTenant = createTeacherDto.isMainTenant ?? false;
    
    // Validasi: Guru bisa aktif di banyak tenant, tapi hanya 1 yang menjadi tenant induk
    if (isActive && createTeacherDto.nik) {
      // Cek apakah sudah ada guru dengan NIK yang sama yang aktif
      const activeTeachersWithSameNik = await this.teachersRepository.find({
        where: { 
          nik: createTeacherDto.nik, 
          isActive: true,
        },
      });
      
      // Cek apakah sudah ada tenant induk untuk NIK ini
      const existingMainTenant = activeTeachersWithSameNik.find(t => t.isMainTenant === true);
      
      if (existingMainTenant && existingMainTenant.instansiId !== instansiId) {
        // Sudah ada tenant induk, jadi tenant baru otomatis menjadi cabang
        isMainTenant = false;
      } else if (!existingMainTenant && activeTeachersWithSameNik.length > 0) {
        // Belum ada tenant induk, dan ini adalah tenant pertama yang aktif
        // Jika user tidak set isMainTenant, set sebagai induk
        if (createTeacherDto.isMainTenant === undefined) {
          isMainTenant = true;
        }
      } else if (!existingMainTenant && activeTeachersWithSameNik.length === 0) {
        // Ini adalah guru pertama dengan NIK ini, set sebagai induk jika tidak ditentukan
        if (createTeacherDto.isMainTenant === undefined) {
          isMainTenant = true;
        }
      }
      
      // Jika user set isMainTenant = true, pastikan tidak ada tenant induk lain
      if (isMainTenant && existingMainTenant && existingMainTenant.instansiId !== instansiId) {
        // Set tenant induk lama menjadi cabang
        existingMainTenant.isMainTenant = false;
        await this.teachersRepository.save(existingMainTenant);
      }
    }

    const teacher = this.teachersRepository.create({
      ...createTeacherDto,
      instansiId,
      isActive,
      isMainTenant,
    });
    return await this.teachersRepository.save(teacher);
  }

  async findAll(filters: { 
    search?: string; 
    instansiId: number;
    page?: number;
    limit?: number;
    isActive?: boolean;
    gender?: string;
  }) {
    const { search, instansiId, page = 1, limit = 10, isActive, gender } = filters;
    const queryBuilder = this.teachersRepository
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.subjects', 'subjects')
      .where('teacher.instansiId = :instansiId', { instansiId });

    if (search) {
      queryBuilder.andWhere(
        '(teacher.name LIKE :search OR teacher.employeeNumber LIKE :search OR teacher.nip LIKE :search OR teacher.email LIKE :search OR teacher.nuptk LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('teacher.isActive = :isActive', { isActive });
    }

    if (gender) {
      queryBuilder.andWhere('teacher.gender = :gender', { gender });
    }

    queryBuilder.orderBy('teacher.name', 'ASC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, instansiId: number) {
    const teacher = await this.teachersRepository.findOne({
      where: { id, instansiId },
      relations: [
        'classRooms',
        'schedules',
        'schedules.classRoom',
        'schedules.subject',
        'subjects',
      ],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return teacher;
  }

  async update(id: number, updateTeacherDto: UpdateTeacherDto, instansiId: number) {
    const teacher = await this.findOne(id, instansiId);
    
    // Handle subject assignment if provided
    if (updateTeacherDto.subjectIds && Array.isArray(updateTeacherDto.subjectIds)) {
      const subjects = await this.subjectsRepository.find({
        where: { 
          id: In(updateTeacherDto.subjectIds),
          instansiId 
        },
      });
      teacher.subjects = subjects;
      delete (updateTeacherDto as any).subjectIds;
    }
    
    // Validasi: Guru bisa aktif di banyak tenant, tapi hanya 1 yang menjadi tenant induk
    const nikToCheck = updateTeacherDto.nik || teacher.nik;
    const willBeActive = updateTeacherDto.isActive !== undefined ? updateTeacherDto.isActive : teacher.isActive;
    const willBeMainTenant = updateTeacherDto.isMainTenant !== undefined ? updateTeacherDto.isMainTenant : teacher.isMainTenant;
    
    if (willBeActive && nikToCheck) {
      // Cek semua guru aktif dengan NIK yang sama
      const activeTeachersWithSameNik = await this.teachersRepository.find({
        where: { 
          nik: nikToCheck, 
          isActive: true,
        },
      });
      
      // Cek apakah sudah ada tenant induk lain
      const existingMainTenant = activeTeachersWithSameNik.find(
        t => t.isMainTenant === true && t.id !== id
      );
      
      // Jika user ingin set sebagai tenant induk
      if (willBeMainTenant && existingMainTenant) {
        // Set tenant induk lama menjadi cabang
        existingMainTenant.isMainTenant = false;
        await this.teachersRepository.save(existingMainTenant);
      } else if (willBeMainTenant && !existingMainTenant && activeTeachersWithSameNik.length > 0) {
        // Ini akan menjadi tenant induk pertama
        // Tidak perlu action
      } else if (!willBeMainTenant && !existingMainTenant && activeTeachersWithSameNik.length > 0) {
        // Tidak ada tenant induk, dan user set sebagai cabang
        // Set tenant pertama sebagai induk otomatis
        const firstActiveTeacher = activeTeachersWithSameNik.find(t => t.id !== id);
        if (firstActiveTeacher) {
          firstActiveTeacher.isMainTenant = true;
          await this.teachersRepository.save(firstActiveTeacher);
        }
      }
    }
    
    Object.assign(teacher, updateTeacherDto);
    return await this.teachersRepository.save(teacher);
  }

  async updateSubjects(id: number, subjectIds: number[], instansiId: number) {
    const teacher = await this.findOne(id, instansiId);
    const subjects = await this.subjectsRepository.find({
      where: { 
        id: In(subjectIds),
        instansiId 
      },
    });
    teacher.subjects = subjects;
    return await this.teachersRepository.save(teacher);
  }

  async remove(id: number, instansiId: number) {
    const teacher = await this.findOne(id, instansiId);
    await this.teachersRepository.remove(teacher);
    return { message: 'Teacher deleted successfully' };
  }
}
