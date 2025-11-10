import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThan, LessThan } from 'typeorm';
import { Exam, ExamStatus, ExamType } from './entities/exam.entity';
import { ExamQuestion, QuestionType } from './entities/exam-question.entity';
import { ExamSchedule, ScheduleStatus } from './entities/exam-schedule.entity';
import { ExamAttempt, AttemptStatus } from './entities/exam-attempt.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateExamQuestionDto } from './dto/create-exam-question.dto';
import { UpdateExamQuestionDto } from './dto/update-exam-question.dto';
import { CreateExamScheduleDto } from './dto/create-exam-schedule.dto';
import { UpdateExamScheduleDto } from './dto/update-exam-schedule.dto';
import { CreateExamAttemptDto } from './dto/create-exam-attempt.dto';
import { StartExamAttemptDto } from './dto/start-exam-attempt.dto';
import { SubmitExamAnswerDto } from './dto/submit-exam-answer.dto';

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

  async findOneQuestion(questionId: number, instansiId: number) {
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

  async updateQuestion(
    questionId: number,
    updateQuestionDto: UpdateExamQuestionDto,
    instansiId: number,
  ) {
    const question = await this.findOneQuestion(questionId, instansiId);
    Object.assign(question, updateQuestionDto);
    return await this.examQuestionsRepository.save(question);
  }

  async removeQuestion(questionId: number, instansiId: number) {
    const question = await this.findOneQuestion(questionId, instansiId);
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

    const question = await this.findOneQuestion(
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
}

