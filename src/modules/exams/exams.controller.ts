import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateExamQuestionDto } from './dto/create-exam-question.dto';
import { UpdateExamQuestionDto } from './dto/update-exam-question.dto';
import { CreateExamScheduleDto } from './dto/create-exam-schedule.dto';
import { UpdateExamScheduleDto } from './dto/update-exam-schedule.dto';
import { StartExamAttemptDto } from './dto/start-exam-attempt.dto';
import { SubmitExamAnswerDto } from './dto/submit-exam-answer.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ExamType, ExamStatus } from './entities/exam.entity';
import { ScheduleStatus } from './entities/exam-schedule.entity';

@Controller('exams')
// @UseGuards(JwtAuthGuard, TenantGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  // ========== Exam CRUD ==========
  @Post()
  create(@Body() createExamDto: CreateExamDto, @TenantId() instansiId: number) {
    return this.examsService.create(createExamDto, instansiId);
  }

  @Get()
  findAll(
    @TenantId() instansiId: number,
    @Query('search') search?: string,
    @Query('examType') examType?: ExamType,
    @Query('status') status?: ExamStatus,
    @Query('semester') semester?: string,
    @Query('academicYear') academicYear?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.examsService.findAll({
      search,
      examType,
      status,
      semester,
      academicYear,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.examsService.findOne(+id, instansiId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExamDto: UpdateExamDto,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.update(+id, updateExamDto, instansiId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.examsService.remove(+id, instansiId);
  }

  // ========== Exam Questions ==========
  @Post(':id/questions')
  createQuestion(
    @Param('id') examId: string,
    @Body() createQuestionDto: CreateExamQuestionDto,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.createQuestion(
      { ...createQuestionDto, examId: +examId },
      instansiId,
    );
  }

  @Get(':id/questions')
  findAllQuestions(
    @Param('id') examId: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.findAllQuestions(+examId, instansiId);
  }

  @Get('questions/:questionId')
  findOneQuestion(
    @Param('questionId') questionId: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.findOneQuestion(+questionId, instansiId);
  }

  @Patch('questions/:questionId')
  updateQuestion(
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: UpdateExamQuestionDto,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.updateQuestion(
      +questionId,
      updateQuestionDto,
      instansiId,
    );
  }

  @Delete('questions/:questionId')
  removeQuestion(
    @Param('questionId') questionId: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.removeQuestion(+questionId, instansiId);
  }

  // ========== Exam Schedules ==========
  @Post(':id/schedules')
  createSchedule(
    @Param('id') examId: string,
    @Body() createScheduleDto: CreateExamScheduleDto,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.createSchedule(
      { ...createScheduleDto, examId: +examId },
      instansiId,
    );
  }

  @Get('schedules')
  findAllSchedules(
    @TenantId() instansiId: number,
    @Query('examId') examId?: number,
    @Query('classId') classId?: number,
    @Query('subjectId') subjectId?: number,
    @Query('status') status?: ScheduleStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.examsService.findAllSchedules({
      examId: examId ? +examId : undefined,
      classId: classId ? +classId : undefined,
      subjectId: subjectId ? +subjectId : undefined,
      status,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Get('schedules/:scheduleId')
  findOneSchedule(
    @Param('scheduleId') scheduleId: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.findOneSchedule(+scheduleId, instansiId);
  }

  @Patch('schedules/:scheduleId')
  updateSchedule(
    @Param('scheduleId') scheduleId: string,
    @Body() updateScheduleDto: UpdateExamScheduleDto,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.updateSchedule(
      +scheduleId,
      updateScheduleDto,
      instansiId,
    );
  }

  @Delete('schedules/:scheduleId')
  removeSchedule(
    @Param('scheduleId') scheduleId: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.removeSchedule(+scheduleId, instansiId);
  }

  // ========== Exam Attempts ==========
  @Post('attempts/start')
  startAttempt(
    @Body() startAttemptDto: StartExamAttemptDto,
    @TenantId() instansiId: number,
    @Query('studentId') studentId?: number,
  ) {
    return this.examsService.startAttempt(
      startAttemptDto,
      instansiId,
      studentId ? +studentId : undefined,
    );
  }

  @Post('attempts/:attemptId/answers')
  submitAnswer(
    @Param('attemptId') attemptId: string,
    @Body() submitAnswerDto: SubmitExamAnswerDto,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.submitAnswer(
      +attemptId,
      submitAnswerDto,
      instansiId,
    );
  }

  @Post('attempts/:attemptId/submit')
  submitAttempt(
    @Param('attemptId') attemptId: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.submitAttempt(+attemptId, instansiId);
  }

  @Get('attempts/:attemptId')
  getAttempt(
    @Param('attemptId') attemptId: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.getAttempt(+attemptId, instansiId);
  }

  @Get('students/:studentId/attempts')
  getStudentAttempts(
    @Param('studentId') studentId: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.getStudentAttempts(+studentId, instansiId);
  }

  @Get(':id/results')
  getExamResults(
    @Param('id') examId: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.getExamResults(+examId, instansiId);
  }
}

