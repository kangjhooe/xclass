import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ELearningController } from './elearning.controller';
import { ELearningService } from './elearning.service';
import { Course } from './entities/course.entity';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { CourseMaterial } from './entities/course-material.entity';
import { CourseVideo } from './entities/course-video.entity';
import { CourseVideoProgress } from './entities/course-video-progress.entity';
import { CourseAssignment } from './entities/course-assignment.entity';
import { CourseAssignmentSubmission } from './entities/course-assignment-submission.entity';
import { CourseQuiz } from './entities/course-quiz.entity';
import { CourseQuizQuestion } from './entities/course-quiz-question.entity';
import { CourseQuizAttempt } from './entities/course-quiz-attempt.entity';
import { CourseProgress } from './entities/course-progress.entity';
import { CourseAnnouncement } from './entities/course-announcement.entity';
import { Question } from '../exams/entities/question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseEnrollment,
      CourseMaterial,
      CourseVideo,
      CourseVideoProgress,
      CourseAssignment,
      CourseAssignmentSubmission,
      CourseQuiz,
      CourseQuizQuestion,
      CourseQuizAttempt,
      CourseProgress,
      CourseAnnouncement,
      Question,
    ]),
  ],
  controllers: [ELearningController],
  providers: [ELearningService],
  exports: [ELearningService],
})
export class ELearningModule {}

