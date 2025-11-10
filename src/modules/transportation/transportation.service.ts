import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransportationRoute } from './entities/transportation-route.entity';
import { TransportationSchedule } from './entities/transportation-schedule.entity';
import { CreateTransportationRouteDto } from './dto/create-transportation-route.dto';
import { CreateTransportationScheduleDto } from './dto/create-transportation-schedule.dto';

@Injectable()
export class TransportationService {
  constructor(
    @InjectRepository(TransportationRoute)
    private routeRepository: Repository<TransportationRoute>,
    @InjectRepository(TransportationSchedule)
    private scheduleRepository: Repository<TransportationSchedule>,
  ) {}

  // ========== ROUTES ==========

  async createRoute(
    createDto: CreateTransportationRouteDto,
    instansiId: number,
  ) {
    const route = this.routeRepository.create({
      ...createDto,
      instansiId,
    });

    return await this.routeRepository.save(route);
  }

  async findAllRoutes(instansiId: number, status?: string) {
    const queryBuilder = this.routeRepository
      .createQueryBuilder('route')
      .leftJoinAndSelect('route.schedules', 'schedules')
      .where('route.instansiId = :instansiId', { instansiId })
      .orderBy('route.name', 'ASC');

    if (status) {
      queryBuilder.andWhere('route.status = :status', { status });
    }

    return queryBuilder.getMany();
  }

  async findOneRoute(id: number, instansiId: number) {
    const route = await this.routeRepository.findOne({
      where: { id, instansiId },
      relations: ['schedules'],
    });

    if (!route) {
      throw new NotFoundException(`Rute dengan ID ${id} tidak ditemukan`);
    }

    return route;
  }

  async removeRoute(id: number, instansiId: number) {
    const route = await this.findOneRoute(id, instansiId);
    await this.routeRepository.remove(route);
    return { message: 'Rute berhasil dihapus' };
  }

  // ========== SCHEDULES ==========

  async createSchedule(
    createDto: CreateTransportationScheduleDto,
    instansiId: number,
  ) {
    // Verify route exists
    await this.findOneRoute(createDto.routeId, instansiId);

    const schedule = this.scheduleRepository.create({
      ...createDto,
      instansiId,
    });

    return await this.scheduleRepository.save(schedule);
  }

  async findAllSchedules(instansiId: number, routeId?: number) {
    const queryBuilder = this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.route', 'route')
      .where('schedule.instansiId = :instansiId', { instansiId })
      .orderBy('schedule.departureTime', 'ASC');

    if (routeId) {
      queryBuilder.andWhere('schedule.routeId = :routeId', { routeId });
    }

    return queryBuilder.getMany();
  }

  async findOneSchedule(id: number, instansiId: number) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id, instansiId },
      relations: ['route'],
    });

    if (!schedule) {
      throw new NotFoundException(
        `Jadwal transportasi dengan ID ${id} tidak ditemukan`,
      );
    }

    return schedule;
  }

  async removeSchedule(id: number, instansiId: number) {
    const schedule = await this.findOneSchedule(id, instansiId);
    await this.scheduleRepository.remove(schedule);
    return { message: 'Jadwal transportasi berhasil dihapus' };
  }
}

