import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CounselingService } from './counseling.service';
import { CounselingSession } from './entities/counseling-session.entity';
import { CreateCounselingSessionDto } from './dto/create-counseling-session.dto';
import { UpdateCounselingSessionDto } from './dto/update-counseling-session.dto';
import { StudentsService } from '../students/students.service';
import { TeachersService } from '../teachers/teachers.service';

describe('CounselingService', () => {
  let service: CounselingService;
  let repository: Repository<CounselingSession>;
  let studentsService: StudentsService;
  let teachersService: TeachersService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    remove: jest.fn(),
  };

  const mockStudentsService = {
    findOne: jest.fn(),
  };

  const mockTeachersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CounselingService,
        {
          provide: getRepositoryToken(CounselingSession),
          useValue: mockRepository,
        },
        {
          provide: StudentsService,
          useValue: mockStudentsService,
        },
        {
          provide: TeachersService,
          useValue: mockTeachersService,
        },
      ],
    }).compile();

    service = module.get<CounselingService>(CounselingService);
    repository = module.get<Repository<CounselingSession>>(
      getRepositoryToken(CounselingSession),
    );
    studentsService = module.get<StudentsService>(StudentsService);
    teachersService = module.get<TeachersService>(TeachersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateCounselingSessionDto = {
      studentId: 1,
      counselorId: 2,
      sessionDate: '2024-12-20T10:00:00Z',
      issue: 'Siswa mengalami kesulitan dalam memahami pelajaran matematika',
      notes: 'Perlu pendampingan lebih intensif',
      status: 'scheduled',
      followUp: 'Follow-up dalam 1 minggu',
      followUpDate: '2024-12-27T10:00:00Z',
    };

    const instansiId = 1;

    it('should create a counseling session successfully', async () => {
      const mockSession = {
        id: 1,
        ...createDto,
        instansiId,
        sessionDate: new Date(createDto.sessionDate),
        followUpDate: new Date(createDto.followUpDate),
      };

      mockStudentsService.findOne.mockResolvedValue({ id: 1, name: 'Student 1' });
      mockTeachersService.findOne.mockResolvedValue({ id: 2, name: 'Teacher 1' });
      mockRepository.create.mockReturnValue(mockSession);
      mockRepository.save.mockResolvedValue(mockSession);

      const result = await service.create(createDto, instansiId);

      expect(mockStudentsService.findOne).toHaveBeenCalledWith(1, instansiId);
      expect(mockTeachersService.findOne).toHaveBeenCalledWith(2, instansiId);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockSession);
    });

    it('should throw NotFoundException if student not found', async () => {
      mockStudentsService.findOne.mockRejectedValue(
        new NotFoundException('Student not found'),
      );

      await expect(service.create(createDto, instansiId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if counselor not found', async () => {
      mockStudentsService.findOne.mockResolvedValue({ id: 1, name: 'Student 1' });
      mockTeachersService.findOne.mockRejectedValue(
        new NotFoundException('Teacher not found'),
      );

      await expect(service.create(createDto, instansiId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if completed session has future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const invalidDto = {
        ...createDto,
        status: 'completed',
        sessionDate: futureDate.toISOString(),
      };

      mockStudentsService.findOne.mockResolvedValue({ id: 1, name: 'Student 1' });
      mockTeachersService.findOne.mockResolvedValue({ id: 2, name: 'Teacher 1' });

      await expect(service.create(invalidDto, instansiId)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if followUpDate is before sessionDate', async () => {
      const invalidDto = {
        ...createDto,
        followUpDate: '2024-12-19T10:00:00Z', // Before sessionDate
      };

      mockStudentsService.findOne.mockResolvedValue({ id: 1, name: 'Student 1' });
      mockTeachersService.findOne.mockResolvedValue({ id: 2, name: 'Teacher 1' });

      await expect(service.create(invalidDto, instansiId)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const instansiId = 1;
    const mockSessions = [
      {
        id: 1,
        studentId: 1,
        counselorId: 2,
        sessionDate: new Date('2024-12-20T10:00:00Z'),
        issue: 'Test issue',
        status: 'scheduled',
      },
    ];

    it('should return paginated sessions', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockSessions, 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({
        instansiId,
        page: 1,
        limit: 20,
      });

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result.data).toEqual(mockSessions);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should apply filters correctly', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockSessions, 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll({
        instansiId,
        studentId: 1,
        counselorId: 2,
        status: 'scheduled',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        search: 'test',
        page: 1,
        limit: 20,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(5);
    });

    it('should throw BadRequestException for invalid status', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(
        service.findAll({
          instansiId,
          status: 'invalid_status',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    const instansiId = 1;
    const sessionId = 1;
    const mockSession = {
      id: sessionId,
      instansiId,
      studentId: 1,
      counselorId: 2,
      sessionDate: new Date(),
      issue: 'Test issue',
      status: 'scheduled',
    };

    it('should return a session by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockSession);

      const result = await service.findOne(sessionId, instansiId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: sessionId, instansiId },
        relations: ['student', 'counselor'],
      });
      expect(result).toEqual(mockSession);
    });

    it('should throw NotFoundException if session not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(sessionId, instansiId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const instansiId = 1;
    const sessionId = 1;
    const existingSession = {
      id: sessionId,
      instansiId,
      studentId: 1,
      counselorId: 2,
      sessionDate: new Date('2024-12-20T10:00:00Z'),
      issue: 'Old issue',
      status: 'scheduled',
      followUpDate: null,
    };

    const updateDto: UpdateCounselingSessionDto = {
      issue: 'Updated issue',
      status: 'completed',
    };

    it('should update a session successfully', async () => {
      mockRepository.findOne.mockResolvedValue(existingSession);
      mockRepository.save.mockResolvedValue({
        ...existingSession,
        ...updateDto,
      });

      const result = await service.update(sessionId, updateDto, instansiId);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.issue).toBe(updateDto.issue);
      expect(result.status).toBe(updateDto.status);
    });

    it('should throw NotFoundException if session not found', async () => {
      mockRepository.findOne.mockRejectedValue(
        new NotFoundException('Session not found'),
      );

      await expect(
        service.update(sessionId, updateDto, instansiId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate followUpDate is after sessionDate', async () => {
      const invalidUpdateDto = {
        followUpDate: '2024-12-19T10:00:00Z', // Before sessionDate
      };

      mockRepository.findOne.mockResolvedValue(existingSession);

      await expect(
        service.update(sessionId, invalidUpdateDto, instansiId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    const instansiId = 1;
    const sessionId = 1;
    const existingSession = {
      id: sessionId,
      instansiId,
      studentId: 1,
      sessionDate: new Date('2024-12-20T10:00:00Z'),
      status: 'scheduled',
    };

    it('should update status successfully', async () => {
      mockRepository.findOne.mockResolvedValue(existingSession);
      mockRepository.save.mockResolvedValue({
        ...existingSession,
        status: 'in_progress',
      });

      const result = await service.updateStatus(sessionId, 'in_progress', instansiId);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.status).toBe('in_progress');
    });

    it('should throw BadRequestException for invalid status', async () => {
      await expect(
        service.updateStatus(sessionId, 'invalid_status', instansiId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if completed session has future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const sessionWithFutureDate = {
        ...existingSession,
        sessionDate: futureDate,
      };

      mockRepository.findOne.mockResolvedValue(sessionWithFutureDate);

      await expect(
        service.updateStatus(sessionId, 'completed', instansiId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    const instansiId = 1;
    const sessionId = 1;
    const mockSession = {
      id: sessionId,
      instansiId,
      studentId: 1,
    };

    it('should remove a session successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockSession);
      mockRepository.remove.mockResolvedValue(mockSession);

      const result = await service.remove(sessionId, instansiId);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.remove).toHaveBeenCalledWith(mockSession);
      expect(result.message).toBe('Sesi konseling berhasil dihapus');
    });

    it('should throw NotFoundException if session not found', async () => {
      mockRepository.findOne.mockRejectedValue(
        new NotFoundException('Session not found'),
      );

      await expect(service.remove(sessionId, instansiId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

