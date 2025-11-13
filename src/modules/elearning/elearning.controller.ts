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
import { ELearningService } from './elearning.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateCourseEnrollmentDto } from './dto/create-course-enrollment.dto';
import { CreateCourseMaterialDto } from './dto/create-course-material.dto';
import { CreateCourseVideoDto } from './dto/create-course-video.dto';
import { CreateCourseAssignmentDto } from './dto/create-course-assignment.dto';
import { CreateCourseQuizDto } from './dto/create-course-quiz.dto';
import { CreateCourseAnnouncementDto } from './dto/create-course-announcement.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('elearning')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ELearningController {
  constructor(private readonly elearningService: ELearningService) {}

  // Course endpoints
  @Post('courses')
  createCourse(@Body() createCourseDto: CreateCourseDto, @TenantId() instansiId: number) {
    return this.elearningService.createCourse(createCourseDto, instansiId);
  }

  @Get('courses')
  findAllCourses(
    @TenantId() instansiId: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('teacherId') teacherId?: number,
    @Query('subjectId') subjectId?: number,
    @Query('classId') classId?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.elearningService.findAllCourses({
      search,
      status,
      teacherId: teacherId ? Number(teacherId) : undefined,
      subjectId: subjectId ? Number(subjectId) : undefined,
      classId: classId ? Number(classId) : undefined,
      page: Number(page),
      limit: Number(limit),
      instansiId,
    });
  }

  @Get('courses/:id')
  findOneCourse(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.elearningService.findOneCourse(+id, instansiId);
  }

  @Patch('courses/:id')
  updateCourse(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @TenantId() instansiId: number,
  ) {
    return this.elearningService.updateCourse(+id, updateCourseDto, instansiId);
  }

  @Delete('courses/:id')
  removeCourse(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.elearningService.removeCourse(+id, instansiId);
  }

  // Enrollment endpoints
  @Post('enrollments')
  enrollStudent(
    @Body() createEnrollmentDto: CreateCourseEnrollmentDto,
    @TenantId() instansiId: number,
  ) {
    return this.elearningService.enrollStudent(createEnrollmentDto, instansiId);
  }

  @Get('courses/:courseId/enrollments')
  getCourseEnrollments(@Param('courseId') courseId: string, @TenantId() instansiId: number) {
    return this.elearningService.getCourseEnrollments(+courseId, instansiId);
  }

  // Material endpoints
  @Post('materials')
  createMaterial(
    @Body() createMaterialDto: CreateCourseMaterialDto,
    @TenantId() instansiId: number,
  ) {
    return this.elearningService.createMaterial(createMaterialDto, instansiId);
  }

  @Get('courses/:courseId/materials')
  getCourseMaterials(@Param('courseId') courseId: string, @TenantId() instansiId: number) {
    return this.elearningService.getCourseMaterials(+courseId, instansiId);
  }

  // Video endpoints
  @Post('videos')
  createVideo(@Body() createVideoDto: CreateCourseVideoDto, @TenantId() instansiId: number) {
    return this.elearningService.createVideo(createVideoDto, instansiId);
  }

  @Get('courses/:courseId/videos')
  getCourseVideos(@Param('courseId') courseId: string, @TenantId() instansiId: number) {
    return this.elearningService.getCourseVideos(+courseId, instansiId);
  }

  // Assignment endpoints
  @Post('assignments')
  createAssignment(
    @Body() createAssignmentDto: CreateCourseAssignmentDto,
    @TenantId() instansiId: number,
  ) {
    return this.elearningService.createAssignment(createAssignmentDto, instansiId);
  }

  @Get('courses/:courseId/assignments')
  getCourseAssignments(@Param('courseId') courseId: string, @TenantId() instansiId: number) {
    return this.elearningService.getCourseAssignments(+courseId, instansiId);
  }

  // Quiz endpoints
  @Post('quizzes')
  createQuiz(@Body() createQuizDto: CreateCourseQuizDto, @TenantId() instansiId: number) {
    return this.elearningService.createQuiz(createQuizDto, instansiId);
  }

  @Get('courses/:courseId/quizzes')
  getCourseQuizzes(@Param('courseId') courseId: string, @TenantId() instansiId: number) {
    return this.elearningService.getCourseQuizzes(+courseId, instansiId);
  }

  // Announcement endpoints
  @Post('announcements')
  createAnnouncement(
    @Body() createAnnouncementDto: CreateCourseAnnouncementDto,
    @TenantId() instansiId: number,
  ) {
    return this.elearningService.createAnnouncement(createAnnouncementDto, instansiId);
  }

  @Get('courses/:courseId/announcements')
  getCourseAnnouncements(@Param('courseId') courseId: string, @TenantId() instansiId: number) {
    return this.elearningService.getCourseAnnouncements(+courseId, instansiId);
  }

  // Progress endpoints
  @Get('courses/:courseId/students/:studentId/progress')
  getStudentProgress(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @TenantId() instansiId: number,
  ) {
    return this.elearningService.getStudentProgress(+courseId, +studentId, instansiId);
  }

  // Add Question from Bank to Quiz
  @Post('quizzes/:quizId/questions/add')
  addQuestionToQuiz(
    @Param('quizId') quizId: string,
    @Body() body: { questionId: number },
    @TenantId() instansiId: number,
  ) {
    return this.elearningService.addQuestionToQuiz(+quizId, body.questionId, instansiId);
  }
}

