import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThan, LessThan } from 'typeorm';
import { Readable } from 'stream';
import { Exam, ExamStatus, ExamType } from './entities/exam.entity';
import { ExamQuestion } from './entities/exam-question.entity';
import { ExamSchedule, ScheduleStatus } from './entities/exam-schedule.entity';
import { ExamAttempt, AttemptStatus } from './entities/exam-attempt.entity';
import { QuestionBank } from './entities/question-bank.entity';
import { Question, QuestionType } from './entities/question.entity';
import { Stimulus, StimulusType } from './entities/stimulus.entity';
import { QuestionShare, ShareStatus, ShareType } from './entities/question-share.entity';
import { GradeConversion, ConversionType } from './entities/grade-conversion.entity';
import { ExamWeight } from './entities/exam-weight.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateExamQuestionDto } from './dto/create-exam-question.dto';
import { UpdateExamQuestionDto } from './dto/update-exam-question.dto';
import { CreateExamScheduleDto } from './dto/create-exam-schedule.dto';
import { UpdateExamScheduleDto } from './dto/update-exam-schedule.dto';
import { CreateExamAttemptDto } from './dto/create-exam-attempt.dto';
import { StartExamAttemptDto } from './dto/start-exam-attempt.dto';
import { SubmitExamAnswerDto } from './dto/submit-exam-answer.dto';
import { CreateQuestionBankDto } from './dto/create-question-bank.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateStimulusDto } from './dto/create-stimulus.dto';
import { CreateQuestionShareDto } from './dto/create-question-share.dto';
import { CreateGradeConversionDto } from './dto/create-grade-conversion.dto';
import { CreateExamWeightDto } from './dto/create-exam-weight.dto';
import { AddQuestionToExamDto } from './dto/add-question-to-exam.dto';
import { ExportQuestionBankDto } from './dto/export-question-bank.dto';
import { ImportQuestionBankDto } from './dto/import-question-bank.dto';
import { StorageService } from '../storage/storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TeachersService } from '../teachers/teachers.service';
import { QuestionItemAnalysis } from './entities/question-item-analysis.entity';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam)
    private examsRepository: Repository<Exam>,
    @InjectRepository(ExamQuestion)
    private examQuestionsRepository: Repository<ExamQuestion>,
    @InjectRepository(ExamSchedule)
    private examSchedulesRepository: Repository<ExamSchedule>,
    @InjectRepository(ExamAttempt)
    private examAttemptsRepository: Repository<ExamAttempt>,
    @InjectRepository(QuestionBank)
    private questionBanksRepository: Repository<QuestionBank>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(Stimulus)
    private stimuliRepository: Repository<Stimulus>,
    @InjectRepository(QuestionShare)
    private questionSharesRepository: Repository<QuestionShare>,
    @InjectRepository(GradeConversion)
    private gradeConversionsRepository: Repository<GradeConversion>,
    @InjectRepository(ExamWeight)
    private examWeightsRepository: Repository<ExamWeight>,
    @InjectRepository(QuestionItemAnalysis)
    private itemAnalysisRepository: Repository<QuestionItemAnalysis>,
    private storageService: StorageService,
    private notificationsService: NotificationsService,
    private teachersService: TeachersService,
  ) {}

  // ========== Exam CRUD ==========
  async create(createExamDto: CreateExamDto, instansiId: number) {
    const exam = this.examsRepository.create({
      ...createExamDto,
      startTime: new Date(createExamDto.startTime),
      endTime: new Date(createExamDto.endTime),
      instansiId,
      status: createExamDto.status || ExamStatus.DRAFT,
      examType: createExamDto.examType || ExamType.QUIZ,
      allowReview: createExamDto.allowReview ?? true,
      showCorrectAnswers: createExamDto.showCorrectAnswers ?? false,
      randomizeQuestions: createExamDto.randomizeQuestions ?? false,
      randomizeAnswers: createExamDto.randomizeAnswers ?? false,
      maxAttempts: createExamDto.maxAttempts || 1,
    });
    return await this.examsRepository.save(exam);
  }

  async findAll(filters: {
    search?: string;
    examType?: ExamType;
    status?: ExamStatus;
    semester?: string;
    academicYear?: string;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      search,
      examType,
      status,
      semester,
      academicYear,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.examsRepository
      .createQueryBuilder('exam')
      .where('exam.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('exam.schedules', 'schedules')
      .leftJoinAndSelect('exam.questions', 'questions')
      .leftJoinAndSelect('exam.attempts', 'attempts');

    if (search) {
      queryBuilder.andWhere(
        '(exam.title LIKE :search OR exam.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (examType) {
      queryBuilder.andWhere('exam.examType = :examType', { examType });
    }

    if (status) {
      queryBuilder.andWhere('exam.status = :status', { status });
    }

    if (semester) {
      queryBuilder.andWhere('exam.semester = :semester', { semester });
    }

    if (academicYear) {
      queryBuilder.andWhere('exam.academicYear = :academicYear', {
        academicYear,
      });
    }

    queryBuilder.orderBy('exam.createdAt', 'DESC');

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
    const exam = await this.examsRepository.findOne({
      where: { id, instansiId },
      relations: ['schedules', 'schedules.classRoom', 'schedules.subject', 'schedules.teacher', 'questions', 'attempts'],
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }

    return exam;
  }

  async update(id: number, updateExamDto: UpdateExamDto, instansiId: number) {
    const exam = await this.findOne(id, instansiId);
    
    if (updateExamDto.startTime) {
      exam.startTime = new Date(updateExamDto.startTime);
    }
    if (updateExamDto.endTime) {
      exam.endTime = new Date(updateExamDto.endTime);
    }
    
    Object.assign(exam, updateExamDto);
    return await this.examsRepository.save(exam);
  }

  async remove(id: number, instansiId: number) {
    const exam = await this.findOne(id, instansiId);
    await this.examsRepository.remove(exam);
    return { message: 'Exam deleted successfully' };
  }

  // ========== Exam Question CRUD ==========
  async createQuestion(
    createQuestionDto: CreateExamQuestionDto,
    instansiId: number,
  ) {
    // Verify exam exists and belongs to instansi
    const exam = await this.findOne(createQuestionDto.examId, instansiId);

    const question = this.examQuestionsRepository.create({
      ...createQuestionDto,
      instansiId,
      questionType: createQuestionDto.questionType || QuestionType.MULTIPLE_CHOICE,
      points: createQuestionDto.points || 1,
      order: createQuestionDto.order || 0,
      isActive: createQuestionDto.isActive ?? true,
    });

    return await this.examQuestionsRepository.save(question);
  }

  async findAllQuestions(examId: number, instansiId: number) {
    const exam = await this.findOne(examId, instansiId);
    
    return await this.examQuestionsRepository.find({
      where: { examId, instansiId },
      order: { order: 'ASC' },
    });
  }

  async findOneExamQuestion(questionId: number, instansiId: number) {
    const question = await this.examQuestionsRepository.findOne({
      where: { id: questionId, instansiId },
      relations: ['exam'],
    });

    if (!question) {
      throw new NotFoundException(
        `Question with ID ${questionId} not found`,
      );
    }

    return question;
  }

  async updateExamQuestion(
    questionId: number,
    updateQuestionDto: UpdateExamQuestionDto,
    instansiId: number,
  ) {
    const question = await this.findOneExamQuestion(questionId, instansiId);
    Object.assign(question, updateQuestionDto);
    return await this.examQuestionsRepository.save(question);
  }

  async removeExamQuestion(questionId: number, instansiId: number) {
    const question = await this.findOneExamQuestion(questionId, instansiId);
    await this.examQuestionsRepository.remove(question);
    return { message: 'Question deleted successfully' };
  }

  // ========== Exam Schedule CRUD ==========
  async createSchedule(
    createScheduleDto: CreateExamScheduleDto,
    instansiId: number,
  ) {
    // Verify exam exists
    await this.findOne(createScheduleDto.examId, instansiId);

    const schedule = this.examSchedulesRepository.create({
      ...createScheduleDto,
      startTime: new Date(createScheduleDto.startTime),
      endTime: new Date(createScheduleDto.endTime),
      instansiId,
      status: createScheduleDto.status || ScheduleStatus.SCHEDULED,
      totalQuestions: createScheduleDto.totalQuestions || 0,
      totalScore: createScheduleDto.totalScore || 0,
      passingScore: createScheduleDto.passingScore || 0,
      allowReview: createScheduleDto.allowReview ?? true,
      showCorrectAnswers: createScheduleDto.showCorrectAnswers ?? false,
      randomizeQuestions: createScheduleDto.randomizeQuestions ?? false,
      randomizeAnswers: createScheduleDto.randomizeAnswers ?? false,
      maxAttempts: createScheduleDto.maxAttempts || 1,
    });

    return await this.examSchedulesRepository.save(schedule);
  }

  async findAllSchedules(filters: {
    examId?: number;
    classId?: number;
    subjectId?: number;
    status?: ScheduleStatus;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      examId,
      classId,
      subjectId,
      status,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.examSchedulesRepository
      .createQueryBuilder('schedule')
      .where('schedule.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('schedule.exam', 'exam')
      .leftJoinAndSelect('schedule.classRoom', 'classRoom')
      .leftJoinAndSelect('schedule.subject', 'subject')
      .leftJoinAndSelect('schedule.teacher', 'teacher');

    if (examId) {
      queryBuilder.andWhere('schedule.examId = :examId', { examId });
    }

    if (classId) {
      queryBuilder.andWhere('schedule.classId = :classId', { classId });
    }

    if (subjectId) {
      queryBuilder.andWhere('schedule.subjectId = :subjectId', { subjectId });
    }

    if (status) {
      queryBuilder.andWhere('schedule.status = :status', { status });
    }

    queryBuilder.orderBy('schedule.startTime', 'ASC');

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

  async findOneSchedule(scheduleId: number, instansiId: number) {
    const schedule = await this.examSchedulesRepository.findOne({
      where: { id: scheduleId, instansiId },
      relations: ['exam', 'classRoom', 'subject', 'teacher'],
    });

    if (!schedule) {
      throw new NotFoundException(
        `Schedule with ID ${scheduleId} not found`,
      );
    }

    return schedule;
  }

  async updateSchedule(
    scheduleId: number,
    updateScheduleDto: UpdateExamScheduleDto,
    instansiId: number,
  ) {
    const schedule = await this.findOneSchedule(scheduleId, instansiId);
    
    if (updateScheduleDto.startTime) {
      schedule.startTime = new Date(updateScheduleDto.startTime);
    }
    if (updateScheduleDto.endTime) {
      schedule.endTime = new Date(updateScheduleDto.endTime);
    }
    
    Object.assign(schedule, updateScheduleDto);
    return await this.examSchedulesRepository.save(schedule);
  }

  async removeSchedule(scheduleId: number, instansiId: number) {
    const schedule = await this.findOneSchedule(scheduleId, instansiId);
    await this.examSchedulesRepository.remove(schedule);
    return { message: 'Schedule deleted successfully' };
  }

  // ========== Exam Attempt Management ==========
  async startAttempt(
    startAttemptDto: StartExamAttemptDto,
    instansiId: number,
    studentId?: number,
  ) {
    const exam = await this.findOne(startAttemptDto.examId, instansiId);

    // Check if exam is available
    const now = new Date();
    if (now < exam.startTime) {
      throw new BadRequestException('Exam has not started yet');
    }
    if (now > exam.endTime) {
      throw new BadRequestException('Exam has ended');
    }

    if (exam.status !== ExamStatus.ONGOING && exam.status !== ExamStatus.SCHEDULED) {
      throw new BadRequestException('Exam is not available for attempts');
    }

    const actualStudentId = startAttemptDto.studentId || studentId;
    if (!actualStudentId) {
      throw new BadRequestException('Student ID is required');
    }

    // Check existing attempts
    const existingAttempts = await this.examAttemptsRepository.find({
      where: {
        examId: exam.id,
        studentId: actualStudentId,
        instansiId,
      },
    });

    const completedAttempts = existingAttempts.filter(
      (a) => a.status === AttemptStatus.COMPLETED,
    ).length;

    if (completedAttempts >= exam.maxAttempts) {
      throw new ForbiddenException(
        `Maximum attempts (${exam.maxAttempts}) reached for this exam`,
      );
    }

    // Check for in-progress attempt
    const inProgressAttempt = existingAttempts.find(
      (a) =>
        a.status === AttemptStatus.STARTED ||
        a.status === AttemptStatus.IN_PROGRESS,
    );

    if (inProgressAttempt) {
      // Resume existing attempt
      inProgressAttempt.status = AttemptStatus.IN_PROGRESS;
      return await this.examAttemptsRepository.save(inProgressAttempt);
    }

    // Get questions for the exam
    const questions = await this.findAllQuestions(exam.id, instansiId);
    if (questions.length === 0) {
      throw new BadRequestException('Exam has no questions');
    }

    // Randomize questions if needed
    let questionOrder = questions.map((q) => q.id);
    if (exam.randomizeQuestions) {
      questionOrder = questionOrder.sort(() => Math.random() - 0.5);
    }

    // Create new attempt
    const attempt = this.examAttemptsRepository.create({
      examId: exam.id,
      studentId: actualStudentId,
      instansiId,
      startedAt: new Date(),
      status: AttemptStatus.IN_PROGRESS,
      totalQuestions: questions.length,
      questionOrder,
      ipAddress: startAttemptDto.ipAddress,
      userAgent: startAttemptDto.userAgent,
    });

    return await this.examAttemptsRepository.save(attempt);
  }

  async submitAnswer(
    attemptId: number,
    submitAnswerDto: SubmitExamAnswerDto,
    instansiId: number,
  ) {
    const attempt = await this.examAttemptsRepository.findOne({
      where: { id: attemptId, instansiId },
      relations: ['exam', 'student'],
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }

    if (
      attempt.status !== AttemptStatus.IN_PROGRESS &&
      attempt.status !== AttemptStatus.STARTED
    ) {
      throw new BadRequestException('Attempt is not in progress');
    }

    const question = await this.findOneExamQuestion(
      submitAnswerDto.questionId,
      instansiId,
    );

    if (question.examId !== attempt.examId) {
      throw new BadRequestException(
        'Question does not belong to this exam',
      );
    }

    // Check if answer is correct
    const isCorrect = this.checkAnswer(question, submitAnswerDto.answer);

    // Update answer order
    const answerOrder = attempt.answerOrder || {};
    answerOrder[submitAnswerDto.questionId] = {
      answer: submitAnswerDto.answer,
      answerData: submitAnswerDto.answerData,
      isCorrect,
      timeSpent: submitAnswerDto.timeSpent || 0,
      submittedAt: new Date(),
    };
    attempt.answerOrder = answerOrder;

    // Update correct answers count
    const previousAnswer = answerOrder[submitAnswerDto.questionId];
    const wasCorrect = previousAnswer?.isCorrect || false;
    
    if (isCorrect && !wasCorrect) {
      attempt.correctAnswers = (attempt.correctAnswers || 0) + 1;
    } else if (!isCorrect && wasCorrect) {
      attempt.correctAnswers = Math.max(0, (attempt.correctAnswers || 0) - 1);
    }

    return await this.examAttemptsRepository.save(attempt);
  }

  async submitAttempt(attemptId: number, instansiId: number) {
    const attempt = await this.examAttemptsRepository.findOne({
      where: { id: attemptId, instansiId },
      relations: ['exam'],
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }

    if (
      attempt.status !== AttemptStatus.IN_PROGRESS &&
      attempt.status !== AttemptStatus.STARTED
    ) {
      throw new BadRequestException('Attempt is not in progress');
    }

    // Get questions and calculate score based on correct answers
    const questions = await this.findAllQuestions(attempt.examId, instansiId);
    const answerOrder = attempt.answerOrder || {};
    let totalScore = 0;

    // Calculate score based on correct answers and question points
    for (const question of questions) {
      const answerData = answerOrder[question.id];
      if (answerData && answerData.isCorrect) {
        totalScore += question.points;
      }
    }

    attempt.status = AttemptStatus.COMPLETED;
    attempt.submittedAt = new Date();
    attempt.score = totalScore;

    if (attempt.startedAt) {
      attempt.timeSpent = Math.floor(
        (new Date().getTime() - attempt.startedAt.getTime()) / 1000,
      );
    }

    return await this.examAttemptsRepository.save(attempt);
  }

  async getAttempt(attemptId: number, instansiId: number) {
    const attempt = await this.examAttemptsRepository.findOne({
      where: { id: attemptId, instansiId },
      relations: ['exam', 'exam.questions', 'student'],
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }

    return attempt;
  }

  async getStudentAttempts(studentId: number, instansiId: number) {
    return await this.examAttemptsRepository.find({
      where: { studentId, instansiId },
      relations: ['exam'],
      order: { createdAt: 'DESC' },
    });
  }

  async getExamResults(examId: number, instansiId: number) {
    await this.findOne(examId, instansiId);

    const attempts = await this.examAttemptsRepository.find({
      where: { examId, instansiId, status: AttemptStatus.COMPLETED },
      relations: ['student'],
      order: { score: 'DESC' },
    });

    return {
      totalAttempts: attempts.length,
      averageScore:
        attempts.length > 0
          ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
          : 0,
      highestScore: attempts.length > 0 ? attempts[0].score : 0,
      lowestScore:
        attempts.length > 0 ? attempts[attempts.length - 1].score : 0,
      attempts,
    };
  }

  // ========== Helper Methods ==========
  private checkAnswer(question: ExamQuestion, answer: string): boolean {
    if (!question.correctAnswer) {
      return false;
    }

    switch (question.questionType) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.TRUE_FALSE:
        return question.correctAnswer === answer;

      case QuestionType.FILL_BLANK:
        const correctAnswers = Array.isArray(question.correctAnswer)
          ? question.correctAnswer
          : [question.correctAnswer];
        const studentAnswers = Array.isArray(answer) ? answer : [answer];
        const normalizedCorrect = correctAnswers.map((a) =>
          a.toLowerCase().trim(),
        );
        const normalizedStudent = studentAnswers.map((a) =>
          a.toLowerCase().trim(),
        );
        return normalizedStudent.some((a) => normalizedCorrect.includes(a));

      case QuestionType.ESSAY:
        // Essay questions require manual grading
        return false;

      case QuestionType.MATCHING:
        if (typeof answer === 'object' && typeof question.correctAnswer === 'object') {
          return JSON.stringify(answer) === JSON.stringify(question.correctAnswer);
        }
        return false;

      default:
        return false;
    }
  }

  // ========== Question Bank CRUD ==========
  async createQuestionBank(
    createBankDto: CreateQuestionBankDto,
    teacherId: number,
    instansiId: number,
  ) {
    const bank = this.questionBanksRepository.create({
      ...createBankDto,
      teacherId,
      instansiId,
      isShared: createBankDto.isShared ?? false,
    });
    return await this.questionBanksRepository.save(bank);
  }

  async findAllQuestionBanks(
    teacherId: number,
    instansiId: number,
    filters?: { subjectId?: number; classId?: number },
  ) {
    const queryBuilder = this.questionBanksRepository
      .createQueryBuilder('bank')
      .where('bank.instansiId = :instansiId', { instansiId })
      .andWhere(
        '(bank.teacherId = :teacherId OR (bank.isShared = true AND bank.teacherId != :teacherId))',
        { teacherId },
      )
      .leftJoinAndSelect('bank.subject', 'subject')
      .leftJoinAndSelect('bank.classRoom', 'classRoom')
      .leftJoinAndSelect('bank.questions', 'questions')
      .leftJoinAndSelect('bank.teacher', 'teacher');

    if (filters?.subjectId) {
      queryBuilder.andWhere('bank.subjectId = :subjectId', {
        subjectId: filters.subjectId,
      });
    }

    if (filters?.classId) {
      queryBuilder.andWhere('bank.classId = :classId', {
        classId: filters.classId,
      });
    }

    return await queryBuilder.getMany();
  }

  async findOneQuestionBank(
    bankId: number,
    teacherId: number,
    instansiId: number,
  ) {
    const bank = await this.questionBanksRepository.findOne({
      where: { id: bankId, instansiId },
      relations: ['subject', 'classRoom', 'questions', 'questions.stimulus', 'teacher'],
    });

    if (!bank) {
      throw new NotFoundException('Question bank not found');
    }

    // Check if teacher owns the bank or if it's shared
    if (bank.teacherId !== teacherId && !bank.isShared) {
      throw new ForbiddenException('You do not have access to this question bank');
    }

    return bank;
  }

  async updateQuestionBank(
    bankId: number,
    updateBankDto: Partial<CreateQuestionBankDto>,
    teacherId: number,
    instansiId: number,
  ) {
    const bank = await this.questionBanksRepository.findOne({
      where: { id: bankId, instansiId },
    });

    if (!bank) {
      throw new NotFoundException('Question bank not found');
    }

    // Only owner can update
    if (bank.teacherId !== teacherId) {
      throw new ForbiddenException('You can only update your own question banks');
    }

    Object.assign(bank, updateBankDto);
    return await this.questionBanksRepository.save(bank);
  }

  async removeQuestionBank(bankId: number, teacherId: number, instansiId: number) {
    const bank = await this.questionBanksRepository.findOne({
      where: { id: bankId, instansiId },
    });

    if (!bank) {
      throw new NotFoundException('Question bank not found');
    }

    // Only owner can delete
    if (bank.teacherId !== teacherId) {
      throw new ForbiddenException('You can only delete your own question banks');
    }

    await this.questionBanksRepository.remove(bank);
    return { message: 'Question bank deleted successfully' };
  }

  // ========== Question CRUD ==========
  async createBankQuestion(
    createQuestionDto: CreateQuestionDto,
    teacherId: number,
    instansiId: number,
  ) {
    const question = this.questionsRepository.create({
      ...createQuestionDto,
      createdBy: teacherId,
      instansiId,
      questionType: createQuestionDto.questionType || QuestionType.MULTIPLE_CHOICE,
      points: createQuestionDto.points || 1,
      difficulty: createQuestionDto.difficulty || 3,
      isActive: createQuestionDto.isActive ?? true,
    });

    const savedQuestion = await this.questionsRepository.save(question);

    // Jika ada questionBankId, tambahkan ke bank soal
    if (createQuestionDto.questionBankId) {
      const bank = await this.findOneQuestionBank(
        createQuestionDto.questionBankId,
        teacherId,
        instansiId,
      );
      bank.questions = [...(bank.questions || []), savedQuestion];
      await this.questionBanksRepository.save(bank);
    }

    return savedQuestion;
  }

  async findAllBankQuestions(
    teacherId: number,
    instansiId: number,
    filters?: {
      questionBankId?: number;
      difficulty?: number;
      questionType?: QuestionType;
    },
  ) {
    const queryBuilder = this.questionsRepository
      .createQueryBuilder('question')
      .where('question.createdBy = :teacherId', { teacherId })
      .andWhere('question.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('question.stimulus', 'stimulus')
      .leftJoinAndSelect('question.banks', 'banks');

    if (filters?.questionBankId) {
      queryBuilder.andWhere('banks.id = :bankId', {
        bankId: filters.questionBankId,
      });
    }

    if (filters?.difficulty) {
      queryBuilder.andWhere('question.difficulty = :difficulty', {
        difficulty: filters.difficulty,
      });
    }

    if (filters?.questionType) {
      queryBuilder.andWhere('question.questionType = :questionType', {
        questionType: filters.questionType,
      });
    }

    return await queryBuilder.getMany();
  }

  async findOneQuestion(questionId: number, teacherId: number, instansiId: number) {
    const question = await this.questionsRepository.findOne({
      where: { id: questionId, createdBy: teacherId, instansiId },
      relations: ['stimulus', 'banks'],
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async updateBankQuestion(
    questionId: number,
    updateQuestionDto: Partial<CreateQuestionDto>,
    teacherId: number,
    instansiId: number,
  ) {
    const question = await this.findOneQuestion(questionId, teacherId, instansiId);
    Object.assign(question, updateQuestionDto);
    return await this.questionsRepository.save(question);
  }

  async removeBankQuestion(questionId: number, teacherId: number, instansiId: number) {
    const question = await this.findOneQuestion(questionId, teacherId, instansiId);
    await this.questionsRepository.remove(question);
    return { message: 'Question deleted successfully' };
  }

  // ========== Stimulus CRUD ==========
  async createStimulus(
    createStimulusDto: CreateStimulusDto,
    teacherId: number,
    instansiId: number,
  ) {
    const stimulus = this.stimuliRepository.create({
      ...createStimulusDto,
      createdBy: teacherId,
      instansiId,
      contentType: createStimulusDto.contentType || StimulusType.TEXT,
    });
    return await this.stimuliRepository.save(stimulus);
  }

  async findAllStimuli(teacherId: number, instansiId: number) {
    return await this.stimuliRepository.find({
      where: { createdBy: teacherId, instansiId },
      order: { createdAt: 'DESC' },
    });
  }

  // ========== Add Question to Exam (Snapshot) ==========
  async addQuestionToExam(
    examId: number,
    addQuestionDto: AddQuestionToExamDto,
    instansiId: number,
  ) {
    const exam = await this.findOne(examId, instansiId);
    const question = await this.questionsRepository.findOne({
      where: { id: addQuestionDto.questionId, instansiId },
      relations: ['stimulus'],
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Create snapshot
    const examQuestion = this.examQuestionsRepository.create({
      examId,
      questionId: question.id,
      stimulusId: question.stimulusId,
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      points: addQuestionDto.points || question.points,
      difficulty: question.difficulty,
      order: addQuestionDto.order || 0,
      isActive: true,
      isSnapshot: true,
      instansiId,
    });

    return await this.examQuestionsRepository.save(examQuestion);
  }

  async removeQuestionFromExam(examId: number, questionId: number, instansiId: number) {
    await this.findOne(examId, instansiId);
    const examQuestion = await this.examQuestionsRepository.findOne({
      where: { id: questionId, examId, instansiId },
    });

    if (!examQuestion) {
      throw new NotFoundException('Question not found in this exam');
    }

    await this.examQuestionsRepository.remove(examQuestion);
    return { message: 'Question removed from exam successfully' };
  }

  // ========== Question Share ==========
  async shareQuestion(
    shareDto: CreateQuestionShareDto,
    fromTeacherId: number,
    fromInstansiId: number,
    instansiId: number,
  ) {
    const question = await this.questionsRepository.findOne({
      where: { id: shareDto.questionId, instansiId: fromInstansiId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Jika dalam tenant yang sama, langsung approve
    if (fromInstansiId === shareDto.toInstansiId) {
      const share = this.questionSharesRepository.create({
        ...shareDto,
        fromTeacherId,
        fromInstansiId,
        status: ShareStatus.APPROVED,
        requestedAt: new Date(),
        approvedAt: new Date(),
        approvedBy: shareDto.toTeacherId,
        instansiId,
      });
      const savedShare = await this.questionSharesRepository.save(share);

      // Send notification to receiving teacher
      try {
        const toTeacher = await this.teachersService.findOne(shareDto.toTeacherId, shareDto.toInstansiId);
        if (toTeacher?.email) {
          await this.notificationsService.sendEmail(
            shareDto.toInstansiId,
            shareDto.toTeacherId,
            toTeacher.email,
            'Soal Berhasil Dibagikan',
            `Guru telah membagikan soal kepada Anda. Soal telah otomatis ditambahkan ke bank soal Anda.`,
          );
        }
      } catch (error) {
        console.error('Failed to send notification:', error);
      }

      return savedShare;
    }

    // Jika antar tenant, perlu approval
    const share = this.questionSharesRepository.create({
      ...shareDto,
      fromTeacherId,
      fromInstansiId,
      status: ShareStatus.PENDING,
      requestedAt: new Date(),
      instansiId,
    });
    const savedShare = await this.questionSharesRepository.save(share);

    // Send notification to receiving teacher about pending request
    try {
      const toTeacher = await this.teachersService.findOne(shareDto.toTeacherId, shareDto.toInstansiId);
      const fromTeacher = await this.teachersService.findOne(fromTeacherId, fromInstansiId);
      if (toTeacher?.email) {
        await this.notificationsService.sendEmail(
          shareDto.toInstansiId,
          shareDto.toTeacherId,
          toTeacher.email,
          'Permintaan Berbagi Soal',
          `Guru ${fromTeacher?.name || 'dari tenant lain'} meminta izin untuk membagikan soal kepada Anda. Silakan cek halaman Permintaan Berbagi Soal untuk menyetujui atau menolak.`,
        );
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    return savedShare;
  }

  async approveQuestionShare(
    shareId: number,
    approverTeacherId: number,
    instansiId: number,
  ) {
    const share = await this.questionSharesRepository.findOne({
      where: { id: shareId, toInstansiId: instansiId },
      relations: ['question'],
    });

    if (!share) {
      throw new NotFoundException('Share request not found');
    }

    share.status = ShareStatus.APPROVED;
    share.approvedAt = new Date();
    share.approvedBy = approverTeacherId;

    await this.questionSharesRepository.save(share);

    // Jika shareType adalah COPY atau EDIT, otomatis copy question ke bank soal penerima
    if (share.shareType === ShareType.COPY || share.shareType === ShareType.EDIT) {
      const originalQuestion = await this.questionsRepository.findOne({
        where: { id: share.questionId },
        relations: ['stimulus'],
      });

      if (originalQuestion) {
        // Create new question for the receiving teacher
        const newQuestion = this.questionsRepository.create({
          questionText: originalQuestion.questionText,
          questionType: originalQuestion.questionType,
          options: originalQuestion.options,
          correctAnswer: originalQuestion.correctAnswer,
          explanation: originalQuestion.explanation,
          points: originalQuestion.points,
          difficulty: originalQuestion.difficulty,
          stimulusId: originalQuestion.stimulusId,
          createdBy: share.toTeacherId,
          instansiId: share.toInstansiId,
          isActive: true,
        });

        await this.questionsRepository.save(newQuestion);
      }
    }

    return share;
  }

  async getPendingShares(teacherId: number, instansiId: number) {
    return await this.questionSharesRepository.find({
      where: {
        toTeacherId: teacherId,
        toInstansiId: instansiId,
        status: ShareStatus.PENDING,
      },
      relations: ['question', 'fromTeacher'],
      order: { requestedAt: 'DESC' },
    });
  }

  async getApprovedShares(teacherId: number, instansiId: number) {
    return await this.questionSharesRepository.find({
      where: {
        toTeacherId: teacherId,
        toInstansiId: instansiId,
        status: ShareStatus.APPROVED,
      },
      relations: ['question', 'fromTeacher'],
      order: { approvedAt: 'DESC' },
    });
  }

  // ========== Grade Conversion (Katrol Nilai) ==========
  async createGradeConversion(
    conversionDto: CreateGradeConversionDto,
    teacherId: number,
    instansiId: number,
  ) {
    const conversion = this.gradeConversionsRepository.create({
      ...conversionDto,
      createdBy: teacherId,
      instansiId,
      conversionType: conversionDto.conversionType || ConversionType.PER_CLASS,
    });
    return await this.gradeConversionsRepository.save(conversion);
  }

  async applyGradeConversion(
    examId: number,
    conversionId: number,
    instansiId: number,
  ) {
    const conversion = await this.gradeConversionsRepository.findOne({
      where: { id: conversionId, examId, instansiId },
    });

    if (!conversion) {
      throw new NotFoundException('Grade conversion not found');
    }

    // Get all attempts for this exam
    const attempts = await this.examAttemptsRepository.find({
      where: { examId, instansiId, status: AttemptStatus.COMPLETED },
    });

    // Apply conversion
    for (const attempt of attempts) {
      let newScore = attempt.score;

      if (attempt.score < conversion.minScore) {
        newScore = conversion.minScore;
      } else if (attempt.score > conversion.maxScore) {
        newScore = conversion.maxScore;
      }

      attempt.score = newScore;
      await this.examAttemptsRepository.save(attempt);
    }

    return { message: 'Grade conversion applied successfully', affected: attempts.length };
  }

  // ========== Exam Weight ==========
  async createExamWeight(
    weightDto: CreateExamWeightDto,
    instansiId: number,
  ) {
    // Check total weight for this subject + class + semester
    const existingWeights = await this.examWeightsRepository.find({
      where: {
        subjectId: weightDto.subjectId,
        classId: weightDto.classId,
        semester: weightDto.semester,
        academicYear: weightDto.academicYear,
        instansiId,
      },
    });

    const totalWeight = existingWeights.reduce((sum, w) => sum + Number(w.weight), 0) + weightDto.weight;

    if (totalWeight > 100) {
      throw new BadRequestException(
        `Total weight cannot exceed 100%. Current total: ${totalWeight}%`,
      );
    }

    const weight = this.examWeightsRepository.create({
      ...weightDto,
      instansiId,
    });
    return await this.examWeightsRepository.save(weight);
  }

  async getExamWeights(
    subjectId: number,
    classId: number,
    semester: string,
    academicYear: string,
    instansiId: number,
  ) {
    return await this.examWeightsRepository.find({
      where: {
        subjectId,
        classId,
        semester,
        academicYear,
        instansiId,
      },
      relations: ['subject', 'classRoom'],
    });
  }

  async updateExamWeight(
    weightId: number,
    updateWeightDto: Partial<CreateExamWeightDto>,
    instansiId: number,
  ) {
    const weight = await this.examWeightsRepository.findOne({
      where: { id: weightId, instansiId },
    });

    if (!weight) {
      throw new NotFoundException('Exam weight not found');
    }

    // Check total weight if weight value is being updated
    if (updateWeightDto.weight !== undefined) {
      const existingWeights = await this.examWeightsRepository.find({
        where: {
          subjectId: updateWeightDto.subjectId || weight.subjectId,
          classId: updateWeightDto.classId || weight.classId,
          semester: updateWeightDto.semester || weight.semester,
          academicYear: updateWeightDto.academicYear || weight.academicYear,
          instansiId,
        },
      });

      const totalWeight = existingWeights
        .filter((w) => w.id !== weightId)
        .reduce((sum, w) => sum + Number(w.weight), 0) + updateWeightDto.weight;

      if (totalWeight > 100) {
        throw new BadRequestException(
          `Total weight cannot exceed 100%. Current total: ${totalWeight}%`,
        );
      }
    }

    Object.assign(weight, updateWeightDto);
    return await this.examWeightsRepository.save(weight);
  }

  async removeExamWeight(weightId: number, instansiId: number) {
    const weight = await this.examWeightsRepository.findOne({
      where: { id: weightId, instansiId },
    });

    if (!weight) {
      throw new NotFoundException('Exam weight not found');
    }

    await this.examWeightsRepository.remove(weight);
    return { message: 'Exam weight deleted successfully' };
  }

  async rejectQuestionShare(shareId: number, teacherId: number, instansiId: number) {
    const share = await this.questionSharesRepository.findOne({
      where: {
        id: shareId,
        toTeacherId: teacherId,
        toInstansiId: instansiId,
        status: ShareStatus.PENDING,
      },
    });

    if (!share) {
      throw new NotFoundException('Share request not found');
    }

    share.status = ShareStatus.REJECTED;
    const savedShare = await this.questionSharesRepository.save(share);

    // Send notification to requesting teacher about rejection
    try {
      const fromTeacher = await this.teachersService.findOne(share.fromTeacherId, share.fromInstansiId);
      const toTeacher = await this.teachersService.findOne(share.toTeacherId, share.toInstansiId);
      if (fromTeacher?.email) {
        await this.notificationsService.sendEmail(
          share.fromInstansiId,
          share.fromTeacherId,
          fromTeacher.email,
          'Permintaan Berbagi Soal Ditolak',
          `Guru ${toTeacher?.name || 'penerima'} telah menolak permintaan berbagi soal Anda.`,
        );
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    return savedShare;
  }

  // ========== Export/Import Question Bank ==========
  async exportQuestionBank(
    bankId: number,
    teacherId: number,
    instansiId: number,
    includeStimuli: boolean = true,
  ): Promise<Buffer> {
    const bank = await this.findOneQuestionBank(bankId, teacherId, instansiId);

    // Get all questions with relations
    const questions = await this.questionsRepository.find({
      where: { questionBankId: bankId, instansiId },
      relations: ['stimulus'],
      order: { id: 'ASC' },
    });

    // Prepare metadata
    const metadata = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      bank: {
        name: bank.name,
        description: bank.description,
        subjectId: bank.subjectId,
        classId: bank.classId,
        subjectName: bank.subject?.name,
        className: bank.classRoom?.name,
      },
      totalQuestions: questions.length,
      totalStimuli: questions.filter((q) => q.stimulusId).length,
    };

    // Prepare questions data (remove IDs for portability)
    const questionsData = questions.map((q) => ({
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      points: q.points,
      difficulty: q.difficulty,
      stimulusId: q.stimulusId,
      stimulusTitle: q.stimulus?.title,
      stimulusContentType: q.stimulus?.contentType,
      stimulusFileUrl: q.stimulus?.fileUrl,
    }));

    // Get unique stimuli
    const stimulusIds = [...new Set(questions.map((q) => q.stimulusId).filter((id) => id))];
    const stimuli = await this.stimuliRepository.find({
      where: { id: In(stimulusIds), instansiId },
    });

    // Create ZIP file
    const AdmZip = require('adm-zip');
    const zip = new AdmZip();

    // Add metadata.json
    zip.addFile('metadata.json', Buffer.from(JSON.stringify(metadata, null, 2)));

    // Add questions.json
    zip.addFile('questions.json', Buffer.from(JSON.stringify(questionsData, null, 2)));

    // Add stimuli files if requested
    if (includeStimuli && stimuli.length > 0) {
      for (const stimulus of stimuli) {
        if (stimulus.fileUrl && stimulus.contentType !== 'text') {
          try {
            // Extract file path from URL
            const filePath = stimulus.fileUrl.replace(/^\/storage\//, '');
            const fileBuffer = await this.storageService.getFile(filePath);
            const fileName = `stimuli/${stimulus.id}-${stimulus.title || 'stimulus'}${this.getFileExtension(stimulus.fileUrl)}`;
            zip.addFile(fileName, fileBuffer);

            // Add stimulus metadata
            const stimulusMetadata = {
              id: stimulus.id,
              title: stimulus.title,
              contentType: stimulus.contentType,
              fileUrl: fileName, // Relative path in ZIP
            };
            zip.addFile(`stimuli/${stimulus.id}-metadata.json`, Buffer.from(JSON.stringify(stimulusMetadata, null, 2)));
          } catch (error) {
            // If file not found, skip it
            console.warn(`Stimulus file not found: ${stimulus.fileUrl}`);
          }
        } else if (stimulus.contentType === 'text') {
          // For text stimuli, save content directly
          const stimulusMetadata = {
            id: stimulus.id,
            title: stimulus.title,
            contentType: stimulus.contentType,
            content: stimulus.content,
          };
          zip.addFile(`stimuli/${stimulus.id}-metadata.json`, Buffer.from(JSON.stringify(stimulusMetadata, null, 2)));
        }
      }
    }

    // Add README
    const readme = `Question Bank Export
==================

Bank Soal: ${bank.name}
${bank.description ? `Deskripsi: ${bank.description}` : ''}
Mata Pelajaran: ${bank.subject?.name || 'N/A'}
Kelas: ${bank.classRoom?.name || 'N/A'}
Total Soal: ${questions.length}
Total Stimulus: ${stimuli.length}

Format:
- metadata.json: Informasi bank soal
- questions.json: Data semua soal
- stimuli/: Folder berisi file-file stimulus

Cara Import:
1. Buka halaman Bank Soal
2. Klik tombol "Import Bank Soal"
3. Pilih file ZIP ini
4. Pilih bank soal tujuan atau buat bank baru
5. Klik "Import"

Catatan:
- File stimulus akan di-upload otomatis ke storage
- Soal yang sudah ada akan di-skip (kecuali overwrite mode)
`;
    zip.addFile('README.txt', Buffer.from(readme, 'utf-8'));

    return zip.toBuffer();
  }

  async importQuestionBank(
    zipBuffer: Buffer,
    importDto: ImportQuestionBankDto,
    teacherId: number,
    instansiId: number,
  ): Promise<{ bank: QuestionBank; imported: number; skipped: number }> {
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(zipBuffer);

    // Read metadata
    const metadataEntry = zip.getEntry('metadata.json');
    if (!metadataEntry) {
      throw new BadRequestException('Invalid export file: metadata.json not found');
    }
    const metadata = JSON.parse(metadataEntry.getData().toString('utf-8'));

    // Read questions
    const questionsEntry = zip.getEntry('questions.json');
    if (!questionsEntry) {
      throw new BadRequestException('Invalid export file: questions.json not found');
    }
    const questionsData = JSON.parse(questionsEntry.getData().toString('utf-8'));

    // Get or create target bank
    let targetBank: QuestionBank;
    if (importDto.targetBankId) {
      targetBank = await this.findOneQuestionBank(importDto.targetBankId, teacherId, instansiId);
    } else {
      // Create new bank
      targetBank = this.questionBanksRepository.create({
        name: importDto.name || metadata.bank.name || 'Imported Bank',
        description: metadata.bank.description || '',
        teacherId,
        instansiId,
        subjectId: importDto.subjectId || metadata.bank.subjectId,
        classId: importDto.classId || metadata.bank.classId,
        isShared: false,
      });
      targetBank = await this.questionBanksRepository.save(targetBank);
    }

    // Map stimulus files to new IDs
    const stimulusMap = new Map<number, number>(); // oldId -> newId

    // Import stimuli first
    const stimulusEntries = zip.getEntries().filter((entry) =>
      entry.entryName.startsWith('stimuli/') && entry.entryName.endsWith('-metadata.json'),
    );

    for (const entry of stimulusEntries) {
      const stimulusData = JSON.parse(entry.getData().toString('utf-8'));
      const oldStimulusId = stimulusData.id;

      // Check if stimulus already exists (by title and content)
      let existingStimulus = await this.stimuliRepository.findOne({
        where: {
          title: stimulusData.title,
          createdBy: teacherId,
          instansiId,
        },
      });

      if (!existingStimulus) {
        // Create new stimulus
        const newStimulus = this.stimuliRepository.create({
          title: stimulusData.title,
          contentType: stimulusData.contentType,
          createdBy: teacherId,
          instansiId,
        });

        if (stimulusData.contentType === 'text') {
          newStimulus.content = stimulusData.content;
        } else if (stimulusData.fileUrl) {
          // Upload file from ZIP
          const fileEntry = zip.getEntry(stimulusData.fileUrl);
          if (fileEntry) {
            const fileBuffer = fileEntry.getData();
            const fileExtension = this.getFileExtension(stimulusData.fileUrl);
            const mimeType = this.getMimeTypeFromExtension(fileExtension);

            // Create a temporary file object for upload
            const tempFile: Express.Multer.File = {
              fieldname: 'file',
              originalname: `${stimulusData.title}${fileExtension}`,
              encoding: '7bit',
              mimetype: mimeType,
              buffer: fileBuffer,
              size: fileBuffer.length,
              destination: '',
              filename: '',
              path: '',
              stream: Readable.from(fileBuffer),
            };

            const uploadResult = await this.storageService.uploadFile(tempFile, 'stimuli', instansiId);
            newStimulus.fileUrl = uploadResult.url;
          }
        }

        existingStimulus = await this.stimuliRepository.save(newStimulus);
      }

      stimulusMap.set(oldStimulusId, existingStimulus.id);
    }

    // Import questions
    let imported = 0;
    let skipped = 0;

    for (const questionData of questionsData) {
      // Check if question already exists (by text)
      const existingQuestion = await this.questionsRepository.findOne({
        where: {
          questionText: questionData.questionText,
          questionBankId: targetBank.id,
          instansiId,
        },
      });

      if (existingQuestion && !importDto.overwriteExisting) {
        skipped++;
        continue;
      }

      const newQuestion = this.questionsRepository.create({
        questionText: questionData.questionText,
        questionType: questionData.questionType,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation,
        points: questionData.points,
        difficulty: questionData.difficulty,
        questionBankId: targetBank.id,
        stimulusId: questionData.stimulusId ? stimulusMap.get(questionData.stimulusId) : null,
        createdBy: teacherId,
        instansiId,
        isActive: true,
      });

      if (existingQuestion && importDto.overwriteExisting) {
        // Update existing question
        Object.assign(existingQuestion, newQuestion);
        await this.questionsRepository.save(existingQuestion);
      } else {
        await this.questionsRepository.save(newQuestion);
      }

      imported++;
    }

    return {
      bank: targetBank,
      imported,
      skipped,
    };
  }

  private getFileExtension(filePath: string): string {
    const match = filePath.match(/\.([^.]+)$/);
    return match ? match[1] : '';
  }

  private getMimeTypeFromExtension(ext: string): string {
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      pdf: 'application/pdf',
      mp4: 'video/mp4',
      mp3: 'audio/mpeg',
    };
    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
  }

  // ========== Question Item Analysis ==========
  async analyzeExamQuestions(examId: number, instansiId: number): Promise<QuestionItemAnalysis[]> {
    const exam = await this.findOne(examId, instansiId);
    
    // Get all attempts for this exam
    const attempts = await this.examAttemptsRepository.find({
      where: { examId, instansiId, status: AttemptStatus.COMPLETED },
      relations: ['student'],
    });

    if (attempts.length === 0) {
      throw new BadRequestException('No completed attempts found for this exam');
    }

    // Get all questions for this exam
    const questions = await this.examQuestionsRepository.find({
      where: { examId, instansiId, isActive: true },
      order: { order: 'ASC' },
    });

    // Calculate total score for each student (for grouping)
    const studentScores = attempts.map((attempt) => ({
      studentId: attempt.studentId,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      answerOrder: attempt.answerOrder || {},
    }));

    // Sort by score to get top and bottom groups
    studentScores.sort((a, b) => b.score - a.score);
    const topGroupSize = Math.ceil(studentScores.length * 0.27); // Top 27%
    const bottomGroupSize = Math.ceil(studentScores.length * 0.27); // Bottom 27%
    const topGroup = studentScores.slice(0, topGroupSize);
    const bottomGroup = studentScores.slice(-bottomGroupSize);

    const analyses: QuestionItemAnalysis[] = [];

    for (const question of questions) {
      let totalAttempts = 0;
      let correctAnswers = 0;
      let incorrectAnswers = 0;
      let blankAnswers = 0;
      const optionStats: Record<string, { selected: number; percentage: number; isCorrect: boolean }> = {};
      
      let topGroupCorrect = 0;
      let bottomGroupCorrect = 0;

      // Initialize option stats
      if (question.questionType === QuestionType.MULTIPLE_CHOICE && question.options) {
        Object.keys(question.options).forEach((key) => {
          optionStats[key] = {
            selected: 0,
            percentage: 0,
            isCorrect: key === question.correctAnswer,
          };
        });
      }

      // Analyze each attempt
      for (const attempt of attempts) {
        const answerData = attempt.answerOrder?.[question.id.toString()];
        
        if (!answerData) {
          blankAnswers++;
          continue;
        }

        totalAttempts++;
        const userAnswer = answerData.answer || '';

        // Check if correct
        const isCorrect = this.checkAnswer(question, userAnswer);
        
        if (isCorrect) {
          correctAnswers++;
        } else {
          incorrectAnswers++;
        }

        // Update option statistics
        if (question.questionType === QuestionType.MULTIPLE_CHOICE && question.options) {
          if (optionStats[userAnswer]) {
            optionStats[userAnswer].selected++;
          }
        }

        // Check top and bottom groups
        const studentScore = studentScores.find((s) => s.studentId === attempt.studentId);
        if (studentScore) {
          const isTopGroup = topGroup.some((t) => t.studentId === attempt.studentId);
          const isBottomGroup = bottomGroup.some((b) => b.studentId === attempt.studentId);
          
          if (isTopGroup && isCorrect) {
            topGroupCorrect++;
          }
          if (isBottomGroup && isCorrect) {
            bottomGroupCorrect++;
          }
        }
      }

      // Calculate percentages for options
      if (totalAttempts > 0) {
        Object.keys(optionStats).forEach((key) => {
          optionStats[key].percentage = (optionStats[key].selected / totalAttempts) * 100;
        });
      }

      // Calculate difficulty index (proportion of correct answers)
      const difficultyIndex = totalAttempts > 0 ? correctAnswers / totalAttempts : 0;

      // Calculate discrimination index
      const topGroupPercentage = topGroup.length > 0 ? topGroupCorrect / topGroup.length : 0;
      const bottomGroupPercentage = bottomGroup.length > 0 ? bottomGroupCorrect / bottomGroup.length : 0;
      const discriminationIndex = topGroupPercentage - bottomGroupPercentage;

      // Generate analysis and recommendations
      let analysis = '';
      if (difficultyIndex < 0.3) {
        analysis += 'Soal terlalu sulit. ';
      } else if (difficultyIndex > 0.7) {
        analysis += 'Soal terlalu mudah. ';
      } else {
        analysis += 'Tingkat kesulitan soal baik. ';
      }

      if (discriminationIndex < 0.2) {
        analysis += 'Daya pembeda rendah - soal tidak membedakan siswa yang pandai dan kurang pandai dengan baik. ';
      } else if (discriminationIndex > 0.4) {
        analysis += 'Daya pembeda sangat baik. ';
      } else {
        analysis += 'Daya pembeda baik. ';
      }

      // Check distractor effectiveness
      if (question.questionType === QuestionType.MULTIPLE_CHOICE && question.options) {
        const ineffectiveDistractors: string[] = [];
        Object.keys(optionStats).forEach((key) => {
          if (!optionStats[key].isCorrect && optionStats[key].percentage < 5) {
            ineffectiveDistractors.push(key);
          }
        });
        if (ineffectiveDistractors.length > 0) {
          analysis += `Pilihan jawaban ${ineffectiveDistractors.join(', ')} kurang efektif (dipilih <5% siswa). `;
        }
      }

      // Check if question should be reviewed
      if (difficultyIndex < 0.2 || difficultyIndex > 0.8 || discriminationIndex < 0.1) {
        analysis += 'Disarankan untuk mereview soal ini.';
      }

      // Save or update analysis
      let itemAnalysis = await this.itemAnalysisRepository.findOne({
        where: { examId, questionId: question.id, instansiId },
      });

      if (itemAnalysis) {
        itemAnalysis.totalAttempts = totalAttempts;
        itemAnalysis.correctAnswers = correctAnswers;
        itemAnalysis.incorrectAnswers = incorrectAnswers;
        itemAnalysis.blankAnswers = blankAnswers;
        itemAnalysis.difficultyIndex = difficultyIndex;
        itemAnalysis.discriminationIndex = discriminationIndex;
        itemAnalysis.optionStatistics = optionStats;
        itemAnalysis.topGroupStats = {
          correct: topGroupCorrect,
          total: topGroup.length,
          percentage: topGroup.length > 0 ? (topGroupCorrect / topGroup.length) * 100 : 0,
        };
        itemAnalysis.bottomGroupStats = {
          correct: bottomGroupCorrect,
          total: bottomGroup.length,
          percentage: bottomGroup.length > 0 ? (bottomGroupCorrect / bottomGroup.length) * 100 : 0,
        };
        itemAnalysis.analysis = analysis;
      } else {
        itemAnalysis = this.itemAnalysisRepository.create({
          examId,
          questionId: question.id,
          totalAttempts,
          correctAnswers,
          incorrectAnswers,
          blankAnswers,
          difficultyIndex,
          discriminationIndex,
          optionStatistics: optionStats,
          topGroupStats: {
            correct: topGroupCorrect,
            total: topGroup.length,
            percentage: topGroup.length > 0 ? (topGroupCorrect / topGroup.length) * 100 : 0,
          },
          bottomGroupStats: {
            correct: bottomGroupCorrect,
            total: bottomGroup.length,
            percentage: bottomGroup.length > 0 ? (bottomGroupCorrect / bottomGroup.length) * 100 : 0,
          },
          analysis,
          instansiId,
        });
      }

      itemAnalysis = await this.itemAnalysisRepository.save(itemAnalysis);
      analyses.push(itemAnalysis);
    }

    return analyses;
  }

  async getQuestionItemAnalysis(examId: number, questionId: number, instansiId: number): Promise<QuestionItemAnalysis> {
    const analysis = await this.itemAnalysisRepository.findOne({
      where: { examId, questionId, instansiId },
      relations: ['question', 'exam'],
    });

    if (!analysis) {
      throw new NotFoundException('Item analysis not found. Please run analysis first.');
    }

    return analysis;
  }

  async getAllItemAnalyses(examId: number, instansiId: number): Promise<QuestionItemAnalysis[]> {
    return await this.itemAnalysisRepository
      .createQueryBuilder('analysis')
      .leftJoinAndSelect('analysis.question', 'question')
      .leftJoinAndSelect('analysis.exam', 'exam')
      .where('analysis.examId = :examId', { examId })
      .andWhere('analysis.instansiId = :instansiId', { instansiId })
      .orderBy('question.order', 'ASC')
      .getMany();
  }
}

