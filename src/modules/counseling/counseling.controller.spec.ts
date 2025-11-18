import { Test, TestingModule } from '@nestjs/testing';
import { CounselingController } from './counseling.controller';
import { CounselingService } from './counseling.service';
import { CreateCounselingSessionDto } from './dto/create-counseling-session.dto';
import { UpdateCounselingSessionDto } from './dto/update-counseling-session.dto';

describe('CounselingController', () => {
  let controller: CounselingController;
  let service: CounselingService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CounselingController],
      providers: [
        {
          provide: CounselingService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CounselingController>(CounselingController);
    service = module.get<CounselingService>(CounselingService);
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
      status: 'scheduled',
    };
    const instansiId = 1;
    const mockSession = {
      id: 1,
      ...createDto,
      instansiId,
    };

    it('should create a counseling session', async () => {
      mockService.create.mockResolvedValue(mockSession);

      const result = await controller.create(createDto, instansiId);

      expect(service.create).toHaveBeenCalledWith(createDto, instansiId);
      expect(result).toEqual(mockSession);
    });
  });

  describe('findAll', () => {
    const instansiId = 1;
    const mockSessions = {
      data: [
        {
          id: 1,
          studentId: 1,
          counselorId: 2,
          sessionDate: new Date('2024-12-20T10:00:00Z'),
          issue: 'Test issue',
          status: 'scheduled',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };

    it('should return paginated sessions', async () => {
      mockService.findAll.mockResolvedValue(mockSessions);

      const result = await controller.findAll(
        instansiId,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        1,
        20,
      );

      expect(service.findAll).toHaveBeenCalledWith({
        instansiId,
        studentId: undefined,
        counselorId: undefined,
        status: undefined,
        startDate: undefined,
        endDate: undefined,
        search: undefined,
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(mockSessions);
    });

    it('should apply filters correctly', async () => {
      mockService.findAll.mockResolvedValue(mockSessions);

      await controller.findAll(
        instansiId,
        1,
        2,
        'scheduled',
        '2024-12-01',
        '2024-12-31',
        'test',
        1,
        20,
      );

      expect(service.findAll).toHaveBeenCalledWith({
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
    });
  });

  describe('findOne', () => {
    const instansiId = 1;
    const sessionId = '1';
    const mockSession = {
      id: 1,
      studentId: 1,
      counselorId: 2,
      sessionDate: new Date(),
      issue: 'Test issue',
      status: 'scheduled',
    };

    it('should return a session by id', async () => {
      mockService.findOne.mockResolvedValue(mockSession);

      const result = await controller.findOne(sessionId, instansiId);

      expect(service.findOne).toHaveBeenCalledWith(1, instansiId);
      expect(result).toEqual(mockSession);
    });
  });

  describe('update', () => {
    const instansiId = 1;
    const sessionId = '1';
    const updateDto: UpdateCounselingSessionDto = {
      issue: 'Updated issue',
      status: 'completed',
    };
    const mockUpdatedSession = {
      id: 1,
      ...updateDto,
    };

    it('should update a session', async () => {
      mockService.update.mockResolvedValue(mockUpdatedSession);

      const result = await controller.update(sessionId, updateDto, instansiId);

      expect(service.update).toHaveBeenCalledWith(1, updateDto, instansiId);
      expect(result).toEqual(mockUpdatedSession);
    });
  });

  describe('updateStatus', () => {
    const instansiId = 1;
    const sessionId = '1';
    const status = 'in_progress';
    const mockUpdatedSession = {
      id: 1,
      status: 'in_progress',
    };

    it('should update session status', async () => {
      mockService.updateStatus.mockResolvedValue(mockUpdatedSession);

      const result = await controller.updateStatus(sessionId, status, instansiId);

      expect(service.updateStatus).toHaveBeenCalledWith(1, status, instansiId);
      expect(result).toEqual(mockUpdatedSession);
    });
  });

  describe('remove', () => {
    const instansiId = 1;
    const sessionId = '1';
    const mockResponse = {
      message: 'Sesi konseling berhasil dihapus',
    };

    it('should remove a session', async () => {
      mockService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove(sessionId, instansiId);

      expect(service.remove).toHaveBeenCalledWith(1, instansiId);
      expect(result).toEqual(mockResponse);
    });
  });
});

