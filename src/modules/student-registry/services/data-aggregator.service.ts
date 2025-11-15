import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { StudentGrade } from '../../grades/entities/student-grade.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { HealthRecord } from '../../health/entities/health-record.entity';
import { DisciplinaryAction } from '../../discipline/entities/disciplinary-action.entity';
import { CounselingSession } from '../../counseling/entities/counseling-session.entity';
import { ExtracurricularParticipant } from '../../extracurricular/entities/extracurricular-participant.entity';
import { ExamAttempt } from '../../exams/entities/exam-attempt.entity';
import { Promotion } from '../../promotion/entities/promotion.entity';
import { StudentTransfer } from '../../student-transfer/entities/student-transfer.entity';
import { Graduation } from '../../graduation/entities/graduation.entity';
import { Alumni } from '../../alumni/entities/alumni.entity';
import { BookLoan } from '../../library/entities/book-loan.entity';
import { SppPayment } from '../../finance/entities/spp-payment.entity';
import { EventRegistration } from '../../events/entities/event-registration.entity';

@Injectable()
export class DataAggregatorService {
  private readonly logger = new Logger(DataAggregatorService.name);

  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(StudentGrade)
    private gradeRepository: Repository<StudentGrade>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(HealthRecord)
    private healthRecordRepository: Repository<HealthRecord>,
    @InjectRepository(DisciplinaryAction)
    private disciplinaryActionRepository: Repository<DisciplinaryAction>,
    @InjectRepository(CounselingSession)
    private counselingSessionRepository: Repository<CounselingSession>,
    @InjectRepository(ExtracurricularParticipant)
    private extracurricularParticipantRepository: Repository<ExtracurricularParticipant>,
    @InjectRepository(ExamAttempt)
    private examAttemptRepository: Repository<ExamAttempt>,
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
    @InjectRepository(StudentTransfer)
    private transferRepository: Repository<StudentTransfer>,
    @InjectRepository(Graduation)
    private graduationRepository: Repository<Graduation>,
    @InjectRepository(Alumni)
    private alumniRepository: Repository<Alumni>,
    @InjectRepository(BookLoan)
    private bookLoanRepository: Repository<BookLoan>,
    @InjectRepository(SppPayment)
    private sppPaymentRepository: Repository<SppPayment>,
    @InjectRepository(EventRegistration)
    private eventRegistrationRepository: Repository<EventRegistration>,
  ) {}

  /**
   * Aggregate all student data for buku induk
   */
  async aggregateStudentData(
    studentId: number,
    instansiId: number,
    options: {
      academicYear?: string;
      categories?: string[];
    } = {},
  ) {
    // Load student with all relations
    const student = await this.studentRepository.findOne({
      where: { id: studentId, instansiId },
      relations: ['classRoom'],
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Determine which categories to include
    const categories = options.categories || [
      'identity',
      'parents',
      'academic',
      'grades',
      'attendance',
      'health',
      'discipline',
      'counseling',
      'extracurricular',
      'exams',
      'promotion',
      'transfer',
      'graduation',
      'alumni',
      'library',
      'finance',
      'events',
    ];

    const data: any = {
      student: this.formatStudentData(student),
      generatedAt: new Date().toISOString(),
      academicYear: options.academicYear || student.academicYear,
    };

    // Aggregate data based on categories
    if (categories.includes('grades')) {
      data.grades = await this.aggregateGrades(studentId, instansiId, options.academicYear);
    }

    if (categories.includes('attendance')) {
      data.attendance = await this.aggregateAttendance(studentId, instansiId, options.academicYear);
    }

    if (categories.includes('health')) {
      data.health = await this.aggregateHealth(studentId, instansiId);
    }

    if (categories.includes('discipline')) {
      data.discipline = await this.aggregateDiscipline(studentId, instansiId);
    }

    if (categories.includes('counseling')) {
      data.counseling = await this.aggregateCounseling(studentId, instansiId);
    }

    if (categories.includes('extracurricular')) {
      data.extracurricular = await this.aggregateExtracurricular(studentId, instansiId);
    }

    if (categories.includes('exams')) {
      data.exams = await this.aggregateExams(studentId, instansiId, options.academicYear);
    }

    if (categories.includes('promotion')) {
      data.promotion = await this.aggregatePromotion(studentId, instansiId);
    }

    if (categories.includes('transfer')) {
      data.transfer = await this.aggregateTransfer(studentId, instansiId);
    }

    if (categories.includes('graduation')) {
      data.graduation = await this.aggregateGraduation(studentId, instansiId);
    }

    if (categories.includes('alumni')) {
      data.alumni = await this.aggregateAlumni(studentId, instansiId);
    }

    if (categories.includes('library')) {
      data.library = await this.aggregateLibrary(studentId, instansiId);
    }

    if (categories.includes('finance')) {
      data.finance = await this.aggregateFinance(studentId, instansiId);
    }

    if (categories.includes('events')) {
      data.events = await this.aggregateEvents(studentId, instansiId);
    }

    // Calculate statistics
    data.statistics = this.calculateStatistics(data);

    return data;
  }

  /**
   * Format student basic data
   */
  private formatStudentData(student: Student) {
    return {
      id: student.id,
      nik: student.nik,
      nisn: student.nisn,
      studentNumber: student.studentNumber,
      name: student.name,
      email: student.email,
      phone: student.phone,
      gender: student.gender,
      birthPlace: student.birthPlace,
      birthDate: student.birthDate,
      religion: student.religion,
      nationality: student.nationality,
      ethnicity: student.ethnicity,
      language: student.language,
      bloodType: student.bloodType,
      address: student.address,
      rt: student.rt,
      rw: student.rw,
      village: student.village,
      subDistrict: student.subDistrict,
      district: student.district,
      city: student.city,
      province: student.province,
      postalCode: student.postalCode,
      residenceType: student.residenceType,
      transportation: student.transportation,
      height: student.height,
      weight: student.weight,
      healthCondition: student.healthCondition,
      healthNotes: student.healthNotes,
      allergies: student.allergies,
      medications: student.medications,
      disabilityType: student.disabilityType,
      disabilityDescription: student.disabilityDescription,
      previousSchool: student.previousSchool,
      previousSchoolAddress: student.previousSchoolAddress,
      enrollmentDate: student.enrollmentDate,
      enrollmentYear: student.enrollmentYear,
      enrollmentSemester: student.enrollmentSemester,
      studentStatus: student.studentStatus,
      academicLevel: student.academicLevel,
      currentGrade: student.currentGrade,
      academicYear: student.academicYear,
      classRoom: student.classRoom ? {
        id: student.classRoom.id,
        name: student.classRoom.name,
      } : null,
      // Parents data
      fatherName: student.fatherName,
      fatherNik: student.fatherNik,
      fatherBirthDate: student.fatherBirthDate,
      fatherBirthPlace: student.fatherBirthPlace,
      fatherEducation: student.fatherEducation,
      fatherOccupation: student.fatherOccupation,
      fatherCompany: student.fatherCompany,
      fatherPhone: student.fatherPhone,
      fatherEmail: student.fatherEmail,
      fatherIncome: student.fatherIncome,
      motherName: student.motherName,
      motherNik: student.motherNik,
      motherBirthDate: student.motherBirthDate,
      motherBirthPlace: student.motherBirthPlace,
      motherEducation: student.motherEducation,
      motherOccupation: student.motherOccupation,
      motherCompany: student.motherCompany,
      motherPhone: student.motherPhone,
      motherEmail: student.motherEmail,
      motherIncome: student.motherIncome,
      guardianName: student.guardianName,
      guardianNik: student.guardianNik,
      guardianBirthDate: student.guardianBirthDate,
      guardianBirthPlace: student.guardianBirthPlace,
      guardianEducation: student.guardianEducation,
      guardianOccupation: student.guardianOccupation,
      guardianPhone: student.guardianPhone,
      guardianEmail: student.guardianEmail,
      guardianIncome: student.guardianIncome,
      guardianRelationship: student.guardianRelationship,
      emergencyContactName: student.emergencyContactName,
      emergencyContactPhone: student.emergencyContactPhone,
      emergencyContactRelationship: student.emergencyContactRelationship,
      notes: student.notes,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }

  /**
   * Aggregate grades data
   */
  private async aggregateGrades(studentId: number, instansiId: number, academicYear?: string) {
    const query = this.gradeRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.subject', 'subject')
      .leftJoinAndSelect('grade.teacher', 'teacher')
      .where('grade.studentId = :studentId', { studentId })
      .andWhere('grade.instansiId = :instansiId', { instansiId });

    if (academicYear) {
      query.andWhere('grade.academicYear = :academicYear', { academicYear });
    }

    const grades = await query.orderBy('grade.date', 'DESC').getMany();

    // Group by subject and calculate averages
    const subjectGroups: Record<string, any[]> = {};
    grades.forEach((grade) => {
      const subjectName = grade.subject?.name || 'Unknown';
      if (!subjectGroups[subjectName]) {
        subjectGroups[subjectName] = [];
      }
      subjectGroups[subjectName].push({
        id: grade.id,
        score: grade.score,
        date: grade.date,
        semester: grade.semester,
        academicYear: grade.academicYear,
        teacher: grade.teacher ? {
          name: grade.teacher.name,
        } : null,
        notes: grade.notes,
      });
    });

    // Calculate statistics
    const allScores = grades.map((g) => parseFloat(g.score.toString()));
    const average = allScores.length > 0
      ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
      : 0;

    return {
      total: grades.length,
      average: average.toFixed(2),
      bySubject: Object.entries(subjectGroups).map(([subject, subjectGrades]) => {
        const subjectScores = subjectGrades.map((g) => parseFloat(g.score.toString()));
        const subjectAverage = subjectScores.length > 0
          ? subjectScores.reduce((sum, score) => sum + score, 0) / subjectScores.length
          : 0;
        return {
          subject,
          count: subjectGrades.length,
          average: subjectAverage.toFixed(2),
          grades: subjectGrades,
        };
      }),
      allGrades: grades.map((g) => ({
        id: g.id,
        subject: g.subject?.name,
        score: g.score,
        date: g.date,
        semester: g.semester,
        academicYear: g.academicYear,
        teacher: g.teacher?.name,
        notes: g.notes,
      })),
    };
  }

  /**
   * Aggregate attendance data
   */
  private async aggregateAttendance(studentId: number, instansiId: number, academicYear?: string) {
    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.studentId = :studentId', { studentId })
      .andWhere('attendance.instansiId = :instansiId', { instansiId });

    if (academicYear) {
      query.andWhere('attendance.academicYear = :academicYear', { academicYear });
    }

    const attendances = await query.orderBy('attendance.date', 'DESC').getMany();

    // Calculate statistics
    const statusCounts: Record<string, number> = {};
    attendances.forEach((att) => {
      statusCounts[att.status] = (statusCounts[att.status] || 0) + 1;
    });

    const total = attendances.length;
    const present = statusCounts['present'] || 0;
    const absent = statusCounts['absent'] || 0;
    const late = statusCounts['late'] || 0;
    const excused = statusCounts['excused'] || 0;

    return {
      total,
      present,
      absent,
      late,
      excused,
      attendanceRate: total > 0 ? ((present / total) * 100).toFixed(2) : '0.00',
      statusCounts,
      recent: attendances.slice(0, 30).map((att) => ({
        date: att.date,
        status: att.status,
        notes: att.notes,
      })),
    };
  }

  /**
   * Aggregate health records
   */
  private async aggregateHealth(studentId: number, instansiId: number) {
    const records = await this.healthRecordRepository.find({
      where: { studentId, instansiId },
      order: { checkupDate: 'DESC' },
    });

    return {
      total: records.length,
      records: records.map((r) => ({
        id: r.id,
        checkupDate: r.checkupDate,
        healthStatus: r.healthStatus,
        height: r.height,
        weight: r.weight,
        temperature: r.temperature,
        bloodPressure: r.bloodPressure,
        symptoms: r.symptoms,
        diagnosis: r.diagnosis,
        treatment: r.treatment,
        notes: r.notes,
      })),
    };
  }

  /**
   * Aggregate disciplinary actions
   */
  private async aggregateDiscipline(studentId: number, instansiId: number) {
    const actions = await this.disciplinaryActionRepository.find({
      where: { studentId, instansiId },
      relations: ['reporter'],
      order: { incidentDate: 'DESC' },
    });

    return {
      total: actions.length,
      actions: actions.map((a) => ({
        id: a.id,
        incidentDate: a.incidentDate,
        violationType: a.violationType,
        description: a.description,
        actionTaken: a.actionTaken,
        reporter: a.reporter ? {
          name: a.reporter.name,
        } : null,
        notes: a.notes,
      })),
    };
  }

  /**
   * Aggregate counseling sessions
   */
  private async aggregateCounseling(studentId: number, instansiId: number) {
    const sessions = await this.counselingSessionRepository.find({
      where: { studentId, instansiId },
      relations: ['counselor'],
      order: { sessionDate: 'DESC' },
    });

    return {
      total: sessions.length,
      sessions: sessions.map((s) => ({
        id: s.id,
        sessionDate: s.sessionDate,
        sessionType: s.sessionType,
        issues: s.issues,
        recommendations: s.recommendations,
        counselor: s.counselor ? {
          name: s.counselor.name,
        } : null,
        notes: s.notes,
      })),
    };
  }

  /**
   * Aggregate extracurricular activities
   */
  private async aggregateExtracurricular(studentId: number, instansiId: number) {
    const participants = await this.extracurricularParticipantRepository.find({
      where: { studentId, instansiId },
      relations: ['extracurricular'],
      order: { joinedDate: 'DESC' },
    });

    return {
      total: participants.length,
      activities: participants.map((p) => ({
        id: p.id,
        extracurricular: p.extracurricular ? {
          name: p.extracurricular.name,
          type: p.extracurricular.type,
        } : null,
        joinedDate: p.joinedDate,
        role: p.role,
        achievements: p.achievements,
        notes: p.notes,
      })),
    };
  }

  /**
   * Aggregate exam attempts
   */
  private async aggregateExams(studentId: number, instansiId: number, academicYear?: string) {
    const query = this.examAttemptRepository
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('attempt.exam', 'exam')
      .where('attempt.studentId = :studentId', { studentId })
      .andWhere('attempt.instansiId = :instansiId', { instansiId });

    if (academicYear) {
      query.andWhere('attempt.academicYear = :academicYear', { academicYear });
    }

    const attempts = await query.orderBy('attempt.startedAt', 'DESC').getMany();

    return {
      total: attempts.length,
      attempts: attempts.map((a) => ({
        id: a.id,
        exam: a.exam ? {
          name: a.exam.name,
          type: a.exam.type,
        } : null,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
        score: a.score,
        maxScore: a.maxScore,
        status: a.status,
      })),
    };
  }

  /**
   * Aggregate promotion history
   */
  private async aggregatePromotion(studentId: number, instansiId: number) {
    const promotions = await this.promotionRepository.find({
      where: { studentId, instansiId },
      order: { promotionDate: 'DESC' },
    });

    return {
      total: promotions.length,
      promotions: promotions.map((p) => ({
        id: p.id,
        fromGrade: p.fromGrade,
        toGrade: p.toGrade,
        promotionDate: p.promotionDate,
        academicYear: p.academicYear,
        notes: p.notes,
      })),
    };
  }

  /**
   * Aggregate transfer history
   */
  private async aggregateTransfer(studentId: number, instansiId: number) {
    const transfers = await this.transferRepository.find({
      where: { studentId, instansiId },
      order: { transferDate: 'DESC' },
    });

    return {
      total: transfers.length,
      transfers: transfers.map((t) => ({
        id: t.id,
        transferType: t.transferType,
        transferDate: t.transferDate,
        fromSchool: t.fromSchool,
        toSchool: t.toSchool,
        reason: t.reason,
        notes: t.notes,
      })),
    };
  }

  /**
   * Aggregate graduation data
   */
  private async aggregateGraduation(studentId: number, instansiId: number) {
    const graduations = await this.graduationRepository.find({
      where: { studentId, instansiId },
      order: { graduationDate: 'DESC' },
    });

    return {
      total: graduations.length,
      graduations: graduations.map((g) => ({
        id: g.id,
        graduationDate: g.graduationDate,
        academicYear: g.academicYear,
        certificateNumber: g.certificateNumber,
        finalGPA: g.finalGPA,
        notes: g.notes,
      })),
    };
  }

  /**
   * Aggregate alumni data
   */
  private async aggregateAlumni(studentId: number, instansiId: number) {
    const alumniRecords = await this.alumniRepository.find({
      where: { studentId, instansiId },
      order: { graduationYear: 'DESC' },
    });

    return {
      total: alumniRecords.length,
      records: alumniRecords.map((a) => ({
        id: a.id,
        graduationYear: a.graduationYear,
        currentOccupation: a.currentOccupation,
        currentInstitution: a.currentInstitution,
        contactInfo: a.contactInfo,
        achievements: a.achievements,
      })),
    };
  }

  /**
   * Aggregate library data
   */
  private async aggregateLibrary(studentId: number, instansiId: number) {
    const loans = await this.bookLoanRepository.find({
      where: { studentId, instansiId },
      relations: ['book'],
      order: { loanDate: 'DESC' },
    });

    return {
      total: loans.length,
      loans: loans.map((l) => ({
        id: l.id,
        book: l.book ? {
          title: l.book.title,
          author: l.book.author,
        } : null,
        loanDate: l.loanDate,
        returnDate: l.returnDate,
        dueDate: l.dueDate,
        status: l.status,
      })),
    };
  }

  /**
   * Aggregate finance data
   */
  private async aggregateFinance(studentId: number, instansiId: number) {
    const payments = await this.sppPaymentRepository.find({
      where: { studentId, instansiId },
      order: { paymentDate: 'DESC' },
    });

    const totalPaid = payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

    return {
      totalPayments: payments.length,
      totalPaid,
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        paymentDate: p.paymentDate,
        dueDate: p.dueDate,
        status: p.status,
        notes: p.notes,
      })),
    };
  }

  /**
   * Aggregate events data
   */
  private async aggregateEvents(studentId: number, instansiId: number) {
    const registrations = await this.eventRegistrationRepository.find({
      where: { studentId, instansiId },
      relations: ['event'],
      order: { registeredAt: 'DESC' },
    });

    return {
      total: registrations.length,
      events: registrations.map((r) => ({
        id: r.id,
        event: r.event ? {
          name: r.event.name,
          eventDate: r.event.eventDate,
        } : null,
        registeredAt: r.registeredAt,
        status: r.status,
      })),
    };
  }

  /**
   * Calculate overall statistics
   */
  private calculateStatistics(data: any) {
    return {
      totalGrades: data.grades?.total || 0,
      averageGrade: data.grades?.average || '0.00',
      totalAttendance: data.attendance?.total || 0,
      attendanceRate: data.attendance?.attendanceRate || '0.00',
      totalHealthRecords: data.health?.total || 0,
      totalDisciplinaryActions: data.discipline?.total || 0,
      totalCounselingSessions: data.counseling?.total || 0,
      totalExtracurriculars: data.extracurricular?.total || 0,
      totalExams: data.exams?.total || 0,
      totalPromotions: data.promotion?.total || 0,
      totalTransfers: data.transfer?.total || 0,
      totalGraduations: data.graduation?.total || 0,
      totalAlumniRecords: data.alumni?.total || 0,
      totalBookLoans: data.library?.total || 0,
      totalPayments: data.finance?.totalPayments || 0,
      totalEvents: data.events?.total || 0,
    };
  }
}

