/**
 * Example: How to use caching in services
 * 
 * This is an example file showing how to integrate caching into existing services.
 * Copy the patterns to your actual service files.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CacheService } from '../../common/cache/cache.service';
import { CacheKeys } from '../../common/cache/cache-keys';
import { Cacheable, CacheInvalidate } from '../../common/decorators/cache.decorator';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentsServiceExample {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private cacheService: CacheService,
  ) {}

  /**
   * Example 1: Using decorator for automatic caching
   */
  @Cacheable('students:all', 300) // Cache for 5 minutes
  async findAll(instansiId: number) {
    return this.studentRepository.find({
      where: { instansiId, isActive: true },
    });
  }

  /**
   * Example 2: Manual caching with cache service
   */
  async findOne(id: number, instansiId: number) {
    const cacheKey = CacheKeys.student(id, instansiId);
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return this.studentRepository.findOne({
          where: { id, instansiId },
        });
      },
      300, // 5 minutes TTL
    );
  }

  /**
   * Example 3: Invalidate cache after update
   */
  @CacheInvalidate('tenant:*:student:*')
  async update(id: number, instansiId: number, updateData: Partial<Student>) {
    await this.studentRepository.update({ id, instansiId }, updateData);
    
    // Also invalidate specific cache
    const cacheKey = CacheKeys.student(id, instansiId);
    await this.cacheService.del(cacheKey);
    
    // Invalidate list cache
    await this.cacheService.invalidatePattern(CacheKeys.studentsPattern(instansiId));
    
    return this.findOne(id, instansiId);
  }

  /**
   * Example 4: Invalidate cache after create
   */
  async create(instansiId: number, studentData: Partial<Student>) {
    const student = this.studentRepository.create({
      ...studentData,
      instansiId,
    });
    
    const saved = await this.studentRepository.save(student);
    
    // Invalidate list cache
    await this.cacheService.invalidatePattern(CacheKeys.studentsPattern(instansiId));
    
    return saved;
  }

  /**
   * Example 5: Invalidate cache after delete
   */
  async remove(id: number, instansiId: number) {
    await this.studentRepository.delete({ id, instansiId });
    
    // Remove from cache
    const cacheKey = CacheKeys.student(id, instansiId);
    await this.cacheService.del(cacheKey);
    
    // Invalidate list cache
    await this.cacheService.invalidatePattern(CacheKeys.studentsPattern(instansiId));
  }
}

