import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result as User;
    }
    return null;
  }

  async create(userData: Partial<User>): Promise<User> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    Object.assign(user, userData);
    return this.userRepository.save(user);
  }

  async findAll(instansiId?: number): Promise<User[]> {
    if (instansiId) {
      return this.userRepository.find({ where: { instansiId } });
    }
    return this.userRepository.find();
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.userRepository.update(id, { lastLoginAt: new Date() });
  }
}

