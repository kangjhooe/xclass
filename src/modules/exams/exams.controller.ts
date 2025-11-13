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
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateExamQuestionDto } from './dto/create-exam-question.dto';
import { UpdateExamQuestionDto } from './dto/update-exam-question.dto';
import { CreateExamScheduleDto } from './dto/create-exam-schedule.dto';
import { UpdateExamScheduleDto } from './dto/update-exam-schedule.dto';
import { StartExamAttemptDto } from './dto/start-exam-attempt.dto';
import { SubmitExamAnswerDto } from './dto/submit-exam-answer.dto';
import { CreateQuestionBankDto } from './dto/create-question-bank.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateStimulusDto } from './dto/create-stimulus.dto';
import { CreateQuestionShareDto } from './dto/create-question-share.dto';
import { CreateGradeConversionDto } from './dto/create-grade-conversion.dto';
import { CreateExamWeightDto } from './dto/create-exam-weight.dto';
import { AddQuestionToExamDto } from './dto/add-question-to-exam.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ExamType, ExamStatus } from './entities/exam.entity';
import { ScheduleStatus } from './entities/exam-schedule.entity';
import { QuestionType } from './entities/question.entity';

@Controller({ path: ['exams', 'tenants/:tenant/exams'] })
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

  @Delete(':examId/questions/:questionId')
  removeQuestionFromExam(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.removeQuestionFromExam(+examId, +questionId, instansiId);
  }

  @Get(':examId/questions/:questionId')
  findOneExamQuestion(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.findOneExamQuestion(+questionId, instansiId);
  }

  @Patch(':examId/questions/:questionId')
  updateExamQuestion(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: UpdateExamQuestionDto,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.updateExamQuestion(+questionId, updateQuestionDto, instansiId);
  }

  @Delete(':examId/questions/:questionId')
  removeExamQuestion(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.removeExamQuestion(+questionId, instansiId);
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

  // ========== Question Bank ==========
  @Post('question-banks')
  createQuestionBank(
    @Body() createBankDto: CreateQuestionBankDto,
    @Request() req: any,
    @TenantId() instansiId: number,
  ) {
    const teacherId = req.user?.userId || req.user?.id;
    return this.examsService.createQuestionBank(createBankDto, teacherId, instansiId);
  }

  @Get('question-banks')
  findAllQuestionBanks(
    @Request() req: any,
    @TenantId() instansiId: number,
    @Query('subjectId') subjectId?: number,
    @Query('classId') classId?: number,
  ) {
    const teacherId = req.user?.userId || req.user?.id;
    return this.examsService.findAllQuestionBanks(
      teacherId,
      instansiId,
      { subjectId: subjectId ? +subjectId : undefined, classId: classId ? +classId : undefined },
    );
  }

  @Get('question-banks/:bankId')
  findOneQuestionBank(
    @Param('bankId') bankId: string,
    @Request() req: any,
    @TenantId() instansiId: number,
  ) {
    const teacherId = req.user?.userId || req.user?.id;
    return this.examsService.findOneQuestionBank(+bankId, teacherId, instansiId);
  }

  @Patch('question-banks/:bankId')
  updateQuestionBank(
    @Param('bankId') bankId: string,
    @Body() updateBankDto: Partial<CreateQuestionBankDto>,
    @Request() req: any,
    @TenantId() instansiId: number,
  ) {
    const teacherId = req.user?.userId || req.user?.id;
    return this.examsService.updateQuestionBank(+bankId, updateBankDto, teacherId, instansiId);
  }

  @Delete('question-banks/:bankId')
  removeQuestionBank(
    @Param('bankId') bankId: string,
    @Request() req: any,
    @TenantId() instansiId: number,
  ) {
    const teacherId = req.user?.userId || req.user?.id;
    return this.examsService.removeQuestionBank(+bankId, teacherId, instansiId);
  }

  // ========== Questions ==========
  @Post('questions')
  createBankQuestion(
    @Body() createQuestionDto: CreateQuestionDto,
    @Request() req: any,
    @TenantId() instansiId: number,
  ) {
    const teacherId = req.user?.userId || req.user?.id;
    return this.examsService.createBankQuestion(createQuestionDto, teacherId, instansiId);
  }

  @Get('questions')
  findAllBankQuestions(
    @Request() req: any,
    @TenantId() instansiId: number,
    @Query('questionBankId') questionBankId?: number,
    @Query('difficulty') difficulty?: number,
    @Query('questionType') questionType?: QuestionType,
  ) {
    const teacherId = req.user?.userId || req.user?.id;
    return this.examsService.findAllBankQuestions(teacherId, instansiId, {
      questionBankId: questionBankId ? +questionBankId : undefined,
      difficulty: difficulty ? +difficulty : undefined,
      questionType,
    });
  }

  @Get('questions/:questionId')
  findOneQuestion(
    @Param('questionId') questionId: string,
    @Request() req: any,
    @TenantId() instansiId: number,
  ) {
    const teacherId = req.user?.userId || req.user?.id;
    return this.examsService.findOneQuestion(+questionId, teacherId, instansiId);
  }

  @Patch('questions/:questionId')
  updateBankQuestion(
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: Partial<CreateQuestionDto>,
    @Request() req: any,
    @TenantId() instansiId: number,
  ) {
    const teacherId = req.user?.userId || req.user?.id;
    return this.examsService.updateBankQuestion(+questionId, updateQuestionDto, teacherId, instansiId);
  }

  @Delete('questions/:questionId')
  removeBankQuestion(
    @Param('questionId') questionId: string,
    @Request() req: any,
    @TenantId() instansiId: number,
  ) {
    const teacherId = req.user?.userId || req.user?.id;
    return this.examsService.removeBankQuestion(+questionId, teacherId, instansiId);
  }

  // ========== Stimulus ==========
  @Post('stimuli')
  createStimulus(
    @Body() createStimulusDto: CreateStimulusDto,
    @Request() req: any,
    @TenantId() instansiId: number,
  ) {
    const teacherId = req.user?.userId || req.user?.id;
    return this.examsService.createStimulus(createStimulusDto, teacherId, instansiId);
  }

  @Get('stimuli')
  findAllStimuli(
    @Request() req: any,
    @TenantId() instansiId: number,
  ) {
    const teacherId = req.user?.userId || req.user?.id;
    return this.examsService.findAllStimuli(teacherId, instansiId);
  }

  // ========== Add Question to Exam ==========
  @Post(':examId/questions/add')
  addQuestionToExam(
    @Param('examId') examId: string,
    @Body() addQuestionDto: AddQuestionToExamDto,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.addQuestionToExam(+examId, addQuestionDto, instansiId);
  }

  // ========== Question Share ==========
  @Post('questions/share')
  shareQuestion(
    @Body() shareDto: CreateQuestionShareDto,
    @Request() req: any,
    @TenantId() instansiId: number,
  ) {
    const fromTeacherId = req.user?.userId || req.user?.id;
    const fromInstansiId = req.user?.instansiId || instansiId;
    return this.examsService.shareQuestion(shareDto, fromTeacherId, fromInstansiId, instansiId);
  }

  @Post('question-shares/:shareId/approve')
  approveQuestionShare(
    @Param('shareId') shareId: string,
    @Request() req: any,
    @TenantId() instansiId: number,
  ) {
    const approverTeacherId = req.user?.userId || req.user?.id;
    return this.examsService.approveQuestionShare(+shareId, approverTeacherId, instansiId);
  }

  @Post('question-shares/:shareId/reject')
  rejectQuestionShare(
    @Param('shareId') shareId: string,
    @Request() req: any,
    @TenantId() instansiId: number,
  ) {
    const teacherId = req.user?.userId || req.user?.id;
    return this.examsService.rejectQuestionShare(+shareId, teacherId, instansiId);
  }

  @Get('question-shares/pending')
  getPendingShares(
    @Request() req: any,
    @TenantId() instansiId: number,
  ) {
    const teacherId = req.user?.userId || req.user?.id;
    return this.examsService.getPendingShares(teacherId, instansiId);
  }

  @Get('question-shares/approved')
  getApprovedShares(
    @Request() req: any,
    @TenantId() instansiId: number,
  ) {
    const teacherId = req.user?.userId || req.user?.id;
    return this.examsService.getApprovedShares(teacherId, instansiId);
  }

  // ========== Grade Conversion ==========
  @Post('grade-conversions')
  createGradeConversion(
    @Body() conversionDto: CreateGradeConversionDto,
    @Request() req: any,
    @TenantId() instansiId: number,
  ) {
    const teacherId = req.user?.userId || req.user?.id;
    return this.examsService.createGradeConversion(conversionDto, teacherId, instansiId);
  }

  @Post(':examId/grade-conversions/:conversionId/apply')
  applyGradeConversion(
    @Param('examId') examId: string,
    @Param('conversionId') conversionId: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.applyGradeConversion(+examId, +conversionId, instansiId);
  }

  // ========== Exam Weight ==========
  @Post('exam-weights')
  createExamWeight(
    @Body() weightDto: CreateExamWeightDto,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.createExamWeight(weightDto, instansiId);
  }

  @Get('exam-weights')
  getExamWeights(
    @Query('subjectId') subjectId: string,
    @Query('classId') classId: string,
    @Query('semester') semester: string,
    @Query('academicYear') academicYear: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.getExamWeights(
      +subjectId,
      +classId,
      semester,
      academicYear,
      instansiId,
    );
  }

  @Patch('exam-weights/:weightId')
  updateExamWeight(
    @Param('weightId') weightId: string,
    @Body() updateWeightDto: Partial<CreateExamWeightDto>,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.updateExamWeight(+weightId, updateWeightDto, instansiId);
  }

  @Delete('exam-weights/:weightId')
  removeExamWeight(
    @Param('weightId') weightId: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.removeExamWeight(+weightId, instansiId);
  }

  // ========== Export/Import Question Bank ==========
  @Get('question-banks/:bankId/export')
  async exportQuestionBank(
    @Param('bankId') bankId: string,
    @Request() req: any,
    @TenantId() instansiId: number,
    @Res() res: Response,
    @Query('includeStimuli') includeStimuli?: string,
  ) {
    const teacherId = req.user?.userId || req.user?.id;
    const includeStimuliFlag = includeStimuli !== 'false';
    const zipBuffer = await this.examsService.exportQuestionBank(
      +bankId,
      teacherId,
      instansiId,
      includeStimuliFlag,
    );

    const bank = await this.examsService.findOneQuestionBank(+bankId, teacherId, instansiId);
    const filename = `${bank.name.replace(/[^a-z0-9]/gi, '_')}_export_${new Date().toISOString().split('T')[0]}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(zipBuffer);
  }

  @Post('question-banks/import')
  @UseInterceptors(FileInterceptor('file'))
  async importQuestionBank(
    @UploadedFile() file: Express.Multer.File,
    @Body() importDto: any,
    @Request() req: any,
    @TenantId() instansiId: number,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!file.mimetype.includes('zip') && !file.originalname.endsWith('.zip')) {
      throw new BadRequestException('File must be a ZIP archive');
    }

    const teacherId = req.user?.userId || req.user?.id;
    const result = await this.examsService.importQuestionBank(
      file.buffer,
      {
        targetBankId: importDto.targetBankId ? +importDto.targetBankId : undefined,
        name: importDto.name,
        subjectId: importDto.subjectId ? +importDto.subjectId : undefined,
        classId: importDto.classId ? +importDto.classId : undefined,
        overwriteExisting: importDto.overwriteExisting === 'true' || importDto.overwriteExisting === true,
      },
      teacherId,
      instansiId,
    );

    return {
      success: true,
      message: `Successfully imported ${result.imported} questions. ${result.skipped} questions skipped.`,
      data: result,
    };
  }

  // ========== Question Item Analysis ==========
  @Post(':examId/item-analysis')
  analyzeExamQuestions(
    @Param('examId') examId: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.analyzeExamQuestions(+examId, instansiId);
  }

  @Get(':examId/item-analysis')
  getAllItemAnalyses(
    @Param('examId') examId: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.getAllItemAnalyses(+examId, instansiId);
  }

  @Get(':examId/item-analysis/:questionId')
  getQuestionItemAnalysis(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
    @TenantId() instansiId: number,
  ) {
    return this.examsService.getQuestionItemAnalysis(+examId, +questionId, instansiId);
  }
}

