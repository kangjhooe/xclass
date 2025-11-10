import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseStatus } from './entities/course.entity';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { CourseMaterial } from './entities/course-material.entity';
import { CourseVideo } from './entities/course-video.entity';
import { CourseAssignment } from './entities/course-assignment.entity';
import { CourseQuiz } from './entities/course-quiz.entity';
import { CourseProgress } from './entities/course-progress.entity';
import { CourseAnnouncement } from './entities/course-announcement.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateCourseEnrollmentDto } from './dto/create-course-enrollment.dto';
import { CreateCourseMaterialDto } from './dto/create-course-material.dto';
import { CreateCourseVideoDto } from './dto/create-course-video.dto';
import { CreateCourseAssignmentDto } from './dto/create-course-assignment.dto';
import { CreateCourseQuizDto } from './dto/create-course-quiz.dto';
import { CreateCourseAnnouncementDto } from './dto/create-course-announcement.dto';

@Injectable()
export class ELearningService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseEnrollment)
    private enrollmentRepository: Repository<CourseEnrollment>,
    @InjectRepository(CourseMaterial)
    private materialRepository: Repository<CourseMaterial>,
    @InjectRepository(CourseVideo)
    private videoRepository: Repository<CourseVideo>,
    @InjectRepository(CourseAssignment)
    private assignmentRepository: Repository<CourseAssignment>,
    @InjectRepository(CourseQuiz)
    private quizRepository: Repository<CourseQuiz>,
    @InjectRepository(CourseProgress)
    private progressRepository: Repository<CourseProgress>,
    @InjectRepository(CourseAnnouncement)
    private announcementRepository: Repository<CourseAnnouncement>,
  ) {}

  // Course CRUD
  async createCourse(createCourseDto: CreateCourseDto, instansiId: number) {
    const course = this.courseRepository.create({
      ...createCourseDto,
      instansiId,
      status: createCourseDto.status || CourseStatus.DRAFT,
    });
    return await this.courseRepository.save(course);
  }

  async findAllCourses(filters: {
    search?: string;
    status?: string;
    teacherId?: number;
    subjectId?: number;
    classId?: number;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      search,
      status,
      teacherId,
      subjectId,
      classId,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .where('course.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('course.teacher', 'teacher')
      .leftJoinAndSelect('course.subject', 'subject')
      .leftJoinAndSelect('course.classRoom', 'classRoom');

    if (search) {
      queryBuilder.andWhere(
        '(course.title LIKE :search OR course.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('course.status = :status', { status });
    }

    if (teacherId) {
      queryBuilder.andWhere('course.teacherId = :teacherId', { teacherId });
    }

    if (subjectId) {
      queryBuilder.andWhere('course.subjectId = :subjectId', { subjectId });
    }

    if (classId) {
      queryBuilder.andWhere('course.classId = :classId', { classId });
    }

    queryBuilder.orderBy('course.order', 'ASC').addOrderBy('course.createdAt', 'DESC');

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

  async findOneCourse(id: number, instansiId: number) {
    const course = await this.courseRepository.findOne({
      where: { id, instansiId },
      relations: [
        'teacher',
        'subject',
        'classRoom',
        'enrollments',
        'materials',
        'videos',
        'assignments',
        'quizzes',
        'announcements',
      ],
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async updateCourse(id: number, updateCourseDto: UpdateCourseDto, instansiId: number) {
    const course = await this.findOneCourse(id, instansiId);
    Object.assign(course, updateCourseDto);
    return await this.courseRepository.save(course);
  }

  async removeCourse(id: number, instansiId: number) {
    const course = await this.findOneCourse(id, instansiId);
    await this.courseRepository.remove(course);
    return { message: 'Course deleted successfully' };
  }

  // Enrollment
  async enrollStudent(createEnrollmentDto: CreateCourseEnrollmentDto, instansiId: number) {
    const course = await this.findOneCourse(createEnrollmentDto.courseId, instansiId);

    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        courseId: createEnrollmentDto.courseId,
        studentId: createEnrollmentDto.studentId,
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('Student already enrolled in this course');
    }

    const enrollment = this.enrollmentRepository.create({
      ...createEnrollmentDto,
      enrolledAt: createEnrollmentDto.enrolledAt
        ? new Date(createEnrollmentDto.enrolledAt)
        : new Date(),
    });

    const savedEnrollment = await this.enrollmentRepository.save(enrollment);

    // Create progress tracking
    await this.progressRepository.save(
      this.progressRepository.create({
        courseId: createEnrollmentDto.courseId,
        studentId: createEnrollmentDto.studentId,
        lastAccessedAt: new Date(),
      }),
    );

    return savedEnrollment;
  }

  async getCourseEnrollments(courseId: number, instansiId: number) {
    await this.findOneCourse(courseId, instansiId);
    return await this.enrollmentRepository.find({
      where: { courseId },
      relations: ['student'],
      order: { enrolledAt: 'DESC' },
    });
  }

  // Materials
  async createMaterial(createMaterialDto: CreateCourseMaterialDto, instansiId: number) {
    await this.findOneCourse(createMaterialDto.courseId, instansiId);
    const material = this.materialRepository.create(createMaterialDto);
    return await this.materialRepository.save(material);
  }

  async getCourseMaterials(courseId: number, instansiId: number) {
    await this.findOneCourse(courseId, instansiId);
    return await this.materialRepository.find({
      where: { courseId },
      order: { order: 'ASC', chapter: 'ASC' },
    });
  }

  // Videos
  async createVideo(createVideoDto: CreateCourseVideoDto, instansiId: number) {
    await this.findOneCourse(createVideoDto.courseId, instansiId);
    const video = this.videoRepository.create(createVideoDto);
    return await this.videoRepository.save(video);
  }

  async getCourseVideos(courseId: number, instansiId: number) {
    await this.findOneCourse(courseId, instansiId);
    return await this.videoRepository.find({
      where: { courseId },
      order: { order: 'ASC' },
    });
  }

  // Assignments
  async createAssignment(createAssignmentDto: CreateCourseAssignmentDto, instansiId: number) {
    await this.findOneCourse(createAssignmentDto.courseId, instansiId);
    const assignment = this.assignmentRepository.create({
      ...createAssignmentDto,
      dueDate: new Date(createAssignmentDto.dueDate),
    });
    return await this.assignmentRepository.save(assignment);
  }

  async getCourseAssignments(courseId: number, instansiId: number) {
    await this.findOneCourse(courseId, instansiId);
    return await this.assignmentRepository.find({
      where: { courseId },
      order: { order: 'ASC' },
    });
  }

  // Quizzes
  async createQuiz(createQuizDto: CreateCourseQuizDto, instansiId: number) {
    await this.findOneCourse(createQuizDto.courseId, instansiId);
    const quiz = this.quizRepository.create(createQuizDto);
    return await this.quizRepository.save(quiz);
  }

  async getCourseQuizzes(courseId: number, instansiId: number) {
    await this.findOneCourse(courseId, instansiId);
    return await this.quizRepository.find({
      where: { courseId },
      relations: ['questions'],
      order: { order: 'ASC' },
    });
  }

  // Announcements
  async createAnnouncement(
    createAnnouncementDto: CreateCourseAnnouncementDto,
    instansiId: number,
  ) {
    await this.findOneCourse(createAnnouncementDto.courseId, instansiId);
    const announcement = this.announcementRepository.create(createAnnouncementDto);
    return await this.announcementRepository.save(announcement);
  }

  async getCourseAnnouncements(courseId: number, instansiId: number) {
    await this.findOneCourse(courseId, instansiId);
    return await this.announcementRepository.find({
      where: { courseId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  // Progress
  async getStudentProgress(courseId: number, studentId: number, instansiId: number) {
    await this.findOneCourse(courseId, instansiId);
    return await this.progressRepository.findOne({
      where: { courseId, studentId },
      relations: ['course', 'student'],
    });
  }
}

