import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import PDFDocument from 'pdfkit';
import {
  PpdbRegistration,
  RegistrationStatus,
  RegistrationPath,
} from './entities/ppdb-registration.entity';
import { PpdbInterviewSchedule, ScheduleStatus } from './entities/ppdb-interview-schedule.entity';
import { CreatePpdbRegistrationDto } from './dto/create-ppdb-registration.dto';
import { UpdatePpdbRegistrationDto } from './dto/update-ppdb-registration.dto';
import { CreateInterviewScheduleDto, BookInterviewScheduleDto } from './dto/create-interview-schedule.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { TenantService } from '../tenant/tenant.service';
import { StudentsService } from '../students/students.service';
import { GraduationService } from '../graduation/graduation.service';

@Injectable()
export class PpdbService {
  private readonly logger = new Logger(PpdbService.name);

  constructor(
    @InjectRepository(PpdbRegistration)
    private registrationsRepository: Repository<PpdbRegistration>,
    @InjectRepository(PpdbInterviewSchedule)
    private interviewScheduleRepository: Repository<PpdbInterviewSchedule>,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
    private tenantService: TenantService,
    private studentsService: StudentsService,
    private graduationService: GraduationService,
  ) {}

  async generateRegistrationNumber(instansiId: number): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.registrationsRepository.count({
      where: { instansiId },
    });
    return `PPDB-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  async create(
    createDto: CreatePpdbRegistrationDto,
    instansiId: number,
  ): Promise<PpdbRegistration> {
    // Check if NISN already exists
    const existing = await this.registrationsRepository.findOne({
      where: { studentNisn: createDto.studentNisn, instansiId },
    });

    if (existing) {
      throw new BadRequestException('NISN sudah terdaftar di sekolah ini');
    }

    const registrationNumber = await this.generateRegistrationNumber(instansiId);

    const registration = this.registrationsRepository.create({
      ...createDto,
      registrationNumber,
      instansiId,
      birthDate: new Date(createDto.birthDate),
      registrationDate: new Date(),
      status: createDto.status || RegistrationStatus.PENDING,
    });

    return await this.registrationsRepository.save(registration);
  }

  async createForApplicant(
    createDto: CreatePpdbRegistrationDto,
    instansiId: number,
    userId: number,
  ): Promise<PpdbRegistration> {
    // Check if user already has registration
    const existing = await this.registrationsRepository.findOne({
      where: { userId, instansiId },
    });

    if (existing) {
      throw new BadRequestException('Anda sudah memiliki pendaftaran. Silakan update data yang sudah ada.');
    }

    // Check if NISN already exists
    const existingNisn = await this.registrationsRepository.findOne({
      where: { studentNisn: createDto.studentNisn, instansiId },
    });

    if (existingNisn) {
      throw new BadRequestException('NISN sudah terdaftar');
    }

    const registrationNumber = await this.generateRegistrationNumber(instansiId);

    const registration = this.registrationsRepository.create({
      ...createDto,
      registrationNumber,
      instansiId,
      userId,
      birthDate: new Date(createDto.birthDate),
      registrationDate: new Date(),
      status: RegistrationStatus.PENDING,
    });

    const savedRegistration = await this.registrationsRepository.save(registration);

    // Send confirmation email asynchronously (don't wait for it)
    this.sendRegistrationConfirmationEmail(savedRegistration).catch(err => {
      this.logger.error(`Failed to send registration confirmation email: ${err.message}`);
    });

    return savedRegistration;
  }

  async findByUserId(userId: number, instansiId: number) {
    const registration = await this.registrationsRepository.findOne({
      where: { userId, instansiId },
    });

    if (!registration) {
      return null;
    }

    return registration;
  }

  async updateByUserId(
    userId: number,
    updateDto: UpdatePpdbRegistrationDto,
    instansiId: number,
  ) {
    const registration = await this.findByUserId(userId, instansiId);

    if (!registration) {
      throw new NotFoundException('Pendaftaran tidak ditemukan');
    }

    // Hanya bisa update jika status masih pending atau registered
    if (registration.status !== RegistrationStatus.PENDING && 
        registration.status !== RegistrationStatus.REGISTERED) {
      throw new BadRequestException('Data pendaftaran tidak dapat diubah karena sudah masuk tahap seleksi');
    }

    if (updateDto.birthDate) {
      registration.birthDate = new Date(updateDto.birthDate);
    }

    Object.assign(registration, updateDto);

    // Calculate total score if scores are provided
    if (
      updateDto.selectionScore !== undefined ||
      updateDto.interviewScore !== undefined ||
      updateDto.documentScore !== undefined
    ) {
      const selection = updateDto.selectionScore ?? registration.selectionScore ?? 0;
      const interview = updateDto.interviewScore ?? registration.interviewScore ?? 0;
      const document = updateDto.documentScore ?? registration.documentScore ?? 0;
      registration.totalScore = selection + interview + document;
    }

    return await this.registrationsRepository.save(registration);
  }

  async findAll(filters: {
    search?: string;
    status?: RegistrationStatus;
    registrationPath?: string;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      search,
      status,
      registrationPath,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.registrationsRepository
      .createQueryBuilder('registration')
      .where('registration.instansiId = :instansiId', { instansiId });

    if (search) {
      queryBuilder.andWhere(
        '(registration.studentName LIKE :search OR registration.registrationNumber LIKE :search OR registration.studentNisn LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('registration.status = :status', { status });
    }

    if (registrationPath) {
      queryBuilder.andWhere('registration.registrationPath = :path', {
        path: registrationPath,
      });
    }

    queryBuilder.orderBy('registration.registrationDate', 'DESC');

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
    const registration = await this.registrationsRepository.findOne({
      where: { id, instansiId },
    });

    if (!registration) {
      throw new NotFoundException(
        `Pendaftaran dengan ID ${id} tidak ditemukan`,
      );
    }

    return registration;
  }

  async update(
    id: number,
    updateDto: UpdatePpdbRegistrationDto,
    instansiId: number,
  ) {
    const registration = await this.findOne(id, instansiId);

    if (updateDto.birthDate) {
      registration.birthDate = new Date(updateDto.birthDate);
    }

    Object.assign(registration, updateDto);

    // Calculate total score if scores are provided
    if (
      updateDto.selectionScore !== undefined ||
      updateDto.interviewScore !== undefined ||
      updateDto.documentScore !== undefined
    ) {
      const selection = updateDto.selectionScore ?? registration.selectionScore ?? 0;
      const interview = updateDto.interviewScore ?? registration.interviewScore ?? 0;
      const document = updateDto.documentScore ?? registration.documentScore ?? 0;
      registration.totalScore = selection + interview + document;
    }

    return await this.registrationsRepository.save(registration);
  }

  async remove(id: number, instansiId: number) {
    const registration = await this.findOne(id, instansiId);
    await this.registrationsRepository.remove(registration);
    return { message: 'Registration deleted successfully' };
  }

  async updateStatus(
    id: number,
    status: RegistrationStatus,
    instansiId: number,
    notes?: string,
  ): Promise<PpdbRegistration> {
    const registration = await this.findOne(id, instansiId);
    const oldStatus = registration.status;

    registration.status = status;

    if (status === RegistrationStatus.ANNOUNCED) {
      registration.announcementDate = new Date();
    } else if (status === RegistrationStatus.ACCEPTED) {
      registration.acceptedDate = new Date();
    }

    if (notes) {
      if (status === RegistrationStatus.REJECTED) {
        registration.rejectedReason = notes;
      } else {
        registration.notes = notes;
      }
    }

    const savedRegistration = await this.registrationsRepository.save(registration);

    // Send status change notification if status actually changed
    if (oldStatus !== status && savedRegistration.userId) {
      this.sendStatusChangeNotification(savedRegistration, oldStatus).catch(err => {
        this.logger.error(`Failed to send status change notification: ${err.message}`);
      });
    }

    return savedRegistration;
  }

  async getStatistics(instansiId: number) {
    const total = await this.registrationsRepository.count({
      where: { instansiId },
    });

    const byStatus = await this.registrationsRepository
      .createQueryBuilder('registration')
      .select('registration.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('registration.instansiId = :instansiId', { instansiId })
      .groupBy('registration.status')
      .getRawMany();

    const byPath = await this.registrationsRepository
      .createQueryBuilder('registration')
      .select('registration.registrationPath', 'path')
      .addSelect('COUNT(*)', 'count')
      .where('registration.instansiId = :instansiId', { instansiId })
      .groupBy('registration.registrationPath')
      .getRawMany();

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      byPath: byPath.reduce((acc, item) => {
        acc[item.path] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }

  async generateCertificate(registration: PpdbRegistration): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('BUKTI PENDAFTARAN PPDB', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica').text('Penerimaan Peserta Didik Baru', { align: 'center' });
        doc.moveDown(2);

        // Nomor Pendaftaran
        doc.fontSize(14).font('Helvetica-Bold').text(`No. Pendaftaran: ${registration.registrationNumber}`, { align: 'center' });
        doc.moveDown(2);

        // Data Siswa
        doc.fontSize(14).font('Helvetica-Bold').text('DATA CALON SISWA', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');

        const studentData = [
          ['Nama Lengkap', registration.studentName],
          ['NISN', registration.studentNisn],
          ['NIK', registration.studentNik],
          ['Tempat, Tanggal Lahir', `${registration.birthPlace}, ${new Date(registration.birthDate).toLocaleDateString('id-ID')}`],
          ['Jenis Kelamin', registration.gender === 'male' ? 'Laki-laki' : 'Perempuan'],
          ['Agama', registration.religion],
          ['Alamat', registration.address],
          ['Jalur Pendaftaran', this.getPathLabel(registration.registrationPath)],
        ];

        let y = doc.y;
        studentData.forEach(([label, value]) => {
          doc.text(`${label}:`, 50, y, { width: 150, continued: false });
          doc.text(value || '-', 200, y, { width: 300 });
          y += 20;
        });

        doc.moveDown(1);

        // Data Orang Tua
        doc.fontSize(14).font('Helvetica-Bold').text('DATA ORANG TUA', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');

        y = doc.y;
        const parentData = [
          ['Nama Orang Tua', registration.parentName],
          ['Telepon', registration.parentPhone],
          ['Pekerjaan', registration.parentOccupation],
          ['Penghasilan', `Rp ${registration.parentIncome.toLocaleString('id-ID')}`],
        ];

        parentData.forEach(([label, value]) => {
          doc.text(`${label}:`, 50, y, { width: 150, continued: false });
          doc.text(value || '-', 200, y, { width: 300 });
          y += 20;
        });

        doc.moveDown(1);

        // Data Sekolah Sebelumnya
        doc.fontSize(14).font('Helvetica-Bold').text('DATA SEKOLAH SEBELUMNYA', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');

        y = doc.y;
        doc.text('Nama Sekolah:', 50, y, { width: 150, continued: false });
        doc.text(registration.previousSchool || '-', 200, y, { width: 300 });
        y += 20;
        doc.text('Alamat Sekolah:', 50, y, { width: 150, continued: false });
        doc.text(registration.previousSchoolAddress || '-', 200, y, { width: 300 });

        doc.moveDown(2);

        // Status
        doc.fontSize(12).font('Helvetica-Bold').text(`Status: ${this.getStatusLabel(registration.status)}`, { align: 'center' });

        doc.moveDown(3);

        // Footer
        const footerY = doc.page.height - 100;
        doc.fontSize(9).font('Helvetica').text(
          `Dicetak pada: ${new Date().toLocaleString('id-ID')}`,
          50,
          footerY,
          { align: 'left' }
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }


  // ========== EMAIL NOTIFICATION METHODS ==========

  private generateEmailTemplate(
    title: string,
    content: string,
    registration: PpdbRegistration,
    tenantName?: string,
  ): string {
    const registrationDate = new Date(registration.registrationDate).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 10px 10px 0 0;
      text-align: center;
      margin: -30px -30px 30px -30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin: 20px 0;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box strong {
      color: #667eea;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      margin: 5px 0;
    }
    .status-pending { background-color: #fff3cd; color: #856404; }
    .status-registered { background-color: #cfe2ff; color: #084298; }
    .status-selection { background-color: #e7d5ff; color: #6f42c1; }
    .status-announced { background-color: #d1ecf1; color: #0c5460; }
    .status-accepted { background-color: #d4edda; color: #155724; }
    .status-rejected { background-color: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${tenantName || 'Sekolah'}</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px;">Penerimaan Peserta Didik Baru (PPDB)</p>
    </div>
    
    <div class="content">
      <h2 style="color: #667eea;">${title}</h2>
      ${content}
      
      <div class="info-box">
        <strong>Nomor Pendaftaran:</strong> ${registration.registrationNumber}<br>
        <strong>Nama Calon Siswa:</strong> ${registration.studentName}<br>
        <strong>NISN:</strong> ${registration.studentNisn}<br>
        <strong>Tanggal Pendaftaran:</strong> ${registrationDate}<br>
        <strong>Status:</strong> 
        <span class="status-badge status-${registration.status}">
          ${this.getStatusLabel(registration.status)}
        </span>
      </div>
    </div>
    
    <div class="footer">
      <p>Email ini dikirim secara otomatis. Mohon tidak membalas email ini.</p>
      <p>Jika ada pertanyaan, silakan hubungi sekolah melalui kontak yang tersedia.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private async sendRegistrationConfirmationEmail(
    registration: PpdbRegistration,
  ): Promise<void> {
    try {
      const user = registration.userId
        ? await this.usersService.findById(registration.userId)
        : null;
      
      if (!user || !user.email) {
        this.logger.warn(`No email found for registration ${registration.id}`);
        return;
      }

      const tenant = await this.tenantService.findOne(registration.instansiId);
      
      const content = `
        <p>Terima kasih telah mendaftar di ${tenant.name}.</p>
        <p>Pendaftaran Anda telah berhasil diterima dengan nomor pendaftaran <strong>${registration.registrationNumber}</strong>.</p>
        <p>Berikut langkah selanjutnya yang perlu Anda lakukan:</p>
        <ol>
          <li>Lengkapi data pendaftaran Anda melalui dashboard</li>
          <li>Upload dokumen pendukung yang diperlukan</li>
          <li>Pantau status pendaftaran secara berkala</li>
        </ol>
        <p>Anda dapat mengakses dashboard pendaftaran Anda dengan login menggunakan akun yang telah dibuat.</p>
      `;

      const emailContent = this.generateEmailTemplate(
        'Konfirmasi Pendaftaran PPDB',
        content,
        registration,
        tenant.name,
      );

      await this.notificationsService.sendEmail(
        registration.instansiId,
        registration.userId || 0,
        user.email,
        `Konfirmasi Pendaftaran PPDB - ${registration.registrationNumber}`,
        emailContent,
      );

      this.logger.log(`Registration confirmation email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send registration confirmation email: ${error.message}`, error.stack);
      // Don't throw error, just log it
    }
  }

  private async sendStatusChangeNotification(
    registration: PpdbRegistration,
    oldStatus: RegistrationStatus,
  ): Promise<void> {
    try {
      const user = registration.userId
        ? await this.usersService.findById(registration.userId)
        : null;
      
      if (!user || !user.email) {
        this.logger.warn(`No email found for registration ${registration.id}`);
        return;
      }

      const tenant = await this.tenantService.findOne(registration.instansiId);
      
      let content = '';
      let title = '';

      switch (registration.status) {
        case RegistrationStatus.REGISTERED:
          title = 'Pendaftaran Anda Telah Terverifikasi';
          content = `
            <p>Pendaftaran Anda dengan nomor <strong>${registration.registrationNumber}</strong> telah diverifikasi dan diterima.</p>
            <p>Data pendaftaran Anda sudah lengkap dan valid. Proses seleksi akan segera dimulai.</p>
          `;
          break;
        
        case RegistrationStatus.SELECTION:
          title = 'Pendaftaran Anda Masuk Tahap Seleksi';
          content = `
            <p>Pendaftaran Anda dengan nomor <strong>${registration.registrationNumber}</strong> telah masuk ke tahap seleksi.</p>
            <p>Tim seleksi sedang melakukan penilaian terhadap pendaftaran Anda. Hasil seleksi akan diumumkan kemudian.</p>
          `;
          break;
        
        case RegistrationStatus.ANNOUNCED:
          title = 'Pengumuman Hasil Seleksi';
          content = `
            <p>Hasil seleksi untuk pendaftaran nomor <strong>${registration.registrationNumber}</strong> telah diumumkan.</p>
            <p>Silakan login ke dashboard untuk melihat hasil lengkap.</p>
          `;
          break;
        
        case RegistrationStatus.ACCEPTED:
          title = 'Selamat! Anda Diterima';
          content = `
            <p><strong>Selamat!</strong> Pendaftaran Anda dengan nomor <strong>${registration.registrationNumber}</strong> telah diterima.</p>
            <p>Anda telah diterima sebagai calon siswa di ${tenant.name}.</p>
            <p>Silakan hubungi sekolah untuk informasi lebih lanjut mengenai proses selanjutnya.</p>
            ${registration.totalScore ? `<p><strong>Total Skor:</strong> ${registration.totalScore.toFixed(2)}</p>` : ''}
          `;
          break;
        
        case RegistrationStatus.REJECTED:
          title = 'Informasi Hasil Seleksi';
          content = `
            <p>Kami menginformasikan bahwa pendaftaran Anda dengan nomor <strong>${registration.registrationNumber}</strong> tidak dapat diterima.</p>
            ${registration.rejectedReason ? `<p><strong>Alasan:</strong> ${registration.rejectedReason}</p>` : ''}
            <p>Terima kasih atas minat Anda untuk bergabung dengan ${tenant.name}.</p>
          `;
          break;
        
        default:
          title = 'Perubahan Status Pendaftaran';
          content = `
            <p>Status pendaftaran Anda dengan nomor <strong>${registration.registrationNumber}</strong> telah berubah.</p>
            <p>Status baru: <strong>${this.getStatusLabel(registration.status)}</strong></p>
          `;
      }

      const emailContent = this.generateEmailTemplate(
        title,
        content,
        registration,
        tenant.name,
      );

      await this.notificationsService.sendEmail(
        registration.instansiId,
        registration.userId || 0,
        user.email,
        `${title} - ${registration.registrationNumber}`,
        emailContent,
      );

      this.logger.log(`Status change notification sent to ${user.email} for status: ${registration.status}`);
    } catch (error) {
      this.logger.error(`Failed to send status change notification: ${error.message}`, error.stack);
      // Don't throw error, just log it
    }
  }

  async sendDocumentReminder(registration: PpdbRegistration): Promise<void> {
    try {
      const user = registration.userId
        ? await this.usersService.findById(registration.userId)
        : null;
      
      if (!user || !user.email) {
        this.logger.warn(`No email found for registration ${registration.id}`);
        return;
      }

      const tenant = await this.tenantService.findOne(registration.instansiId);
      
      const missingDocs = [];
      const requiredDocs = ['akta_kelahiran', 'kartu_keluarga', 'ktp_ortu', 'ijazah'];
      const uploadedDocs = registration.documents ? Object.keys(registration.documents) : [];

      requiredDocs.forEach(doc => {
        if (!uploadedDocs.includes(doc)) {
          missingDocs.push(doc.replace(/_/g, ' '));
        }
      });

      if (missingDocs.length === 0) {
        return; // All documents uploaded
      }

      const content = `
        <p>Kami mengingatkan bahwa pendaftaran Anda dengan nomor <strong>${registration.registrationNumber}</strong> masih belum lengkap.</p>
        <p>Dokumen berikut masih perlu diupload:</p>
        <ul>
          ${missingDocs.map(doc => `<li>${doc}</li>`).join('')}
        </ul>
        <p>Silakan login ke dashboard dan lengkapi dokumen yang masih kurang untuk mempercepat proses verifikasi.</p>
      `;

      const emailContent = this.generateEmailTemplate(
        'Pengingat: Lengkapi Dokumen Pendaftaran',
        content,
        registration,
        tenant.name,
      );

      await this.notificationsService.sendEmail(
        registration.instansiId,
        registration.userId || 0,
        user.email,
        `Pengingat: Lengkapi Dokumen Pendaftaran - ${registration.registrationNumber}`,
        emailContent,
      );

      this.logger.log(`Document reminder sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send document reminder: ${error.message}`, error.stack);
      // Don't throw error, just log it
    }
  }

  async sendSelectionAnnouncement(
    registrations: PpdbRegistration[],
    instansiId: number,
  ): Promise<void> {
    try {
      const tenant = await this.tenantService.findOne(instansiId);
      
      for (const registration of registrations) {
        if (registration.status !== RegistrationStatus.ACCEPTED && 
            registration.status !== RegistrationStatus.REJECTED) {
          continue;
        }

        await this.sendStatusChangeNotification(registration, registration.status);
      }

      this.logger.log(`Selection announcement sent for ${registrations.length} registrations`);
    } catch (error) {
      this.logger.error(`Failed to send selection announcement: ${error.message}`, error.stack);
      // Don't throw error, just log it
    }
  }

  // ========== DOCUMENT VERIFICATION METHODS ==========

  async verifyDocument(
    registrationId: number,
    documentType: string,
    status: 'pending' | 'verified' | 'rejected',
    instansiId: number,
    verifiedBy: number,
    rejectionReason?: string,
  ): Promise<PpdbRegistration> {
    const registration = await this.findOne(registrationId, instansiId);

    if (!registration.documents || !registration.documents[documentType]) {
      throw new BadRequestException(`Dokumen ${documentType} tidak ditemukan`);
    }

    const documents = { ...registration.documents };
    const document = documents[documentType];

    document.verificationStatus = status;
    document.verifiedBy = verifiedBy;
    document.verifiedAt = new Date().toISOString();

    if (status === 'rejected' && rejectionReason) {
      document.rejectionReason = rejectionReason;
    } else if (status === 'verified') {
      document.rejectionReason = null;
    }

    documents[documentType] = document;

    const updatedRegistration = await this.registrationsRepository.save({
      ...registration,
      documents,
    });

    // Send notification if document is rejected
    if (status === 'rejected' && registration.userId) {
      this.sendDocumentRejectionNotification(updatedRegistration, documentType, rejectionReason || '').catch(err => {
        this.logger.error(`Failed to send document rejection notification: ${err.message}`);
      });
    }

    return updatedRegistration;
  }

  private async sendDocumentRejectionNotification(
    registration: PpdbRegistration,
    documentType: string,
    rejectionReason: string,
  ): Promise<void> {
    try {
      const user = registration.userId
        ? await this.usersService.findById(registration.userId)
        : null;
      
      if (!user || !user.email) {
        this.logger.warn(`No email found for registration ${registration.id}`);
        return;
      }

      const tenant = await this.tenantService.findOne(registration.instansiId);
      
      const documentName = documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      const content = `
        <p>Kami menginformasikan bahwa dokumen <strong>${documentName}</strong> pada pendaftaran nomor <strong>${registration.registrationNumber}</strong> tidak dapat diterima.</p>
        <p><strong>Alasan penolakan:</strong></p>
        <p style="background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 10px 0;">
          ${rejectionReason || 'Dokumen tidak memenuhi persyaratan'}
        </p>
        <p>Silakan upload ulang dokumen yang sesuai dengan persyaratan melalui dashboard pendaftaran Anda.</p>
        <p>Jika ada pertanyaan, silakan hubungi sekolah melalui kontak yang tersedia.</p>
      `;

      const emailContent = this.generateEmailTemplate(
        'Dokumen Ditolak - Perlu Tindak Lanjut',
        content,
        registration,
        tenant.name,
      );

      await this.notificationsService.sendEmail(
        registration.instansiId,
        registration.userId || 0,
        user.email,
        `Dokumen ${documentName} Ditolak - ${registration.registrationNumber}`,
        emailContent,
      );

      this.logger.log(`Document rejection notification sent to ${user.email} for document: ${documentType}`);
    } catch (error) {
      this.logger.error(`Failed to send document rejection notification: ${error.message}`, error.stack);
      // Don't throw error, just log it
    }
  }

  getDocumentVerificationStatus(registration: PpdbRegistration): {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
    documents: Array<{
      type: string;
      name: string;
      status: string;
      verifiedAt?: string;
      rejectionReason?: string;
    }>;
  } {
    if (!registration.documents) {
      return {
        total: 0,
        verified: 0,
        pending: 0,
        rejected: 0,
        documents: [],
      };
    }

    const documents = Object.entries(registration.documents).map(([type, doc]: [string, any]) => ({
      type,
      name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      status: doc.verificationStatus || 'pending',
      verifiedAt: doc.verifiedAt,
      rejectionReason: doc.rejectionReason,
    }));

    const verified = documents.filter(d => d.status === 'verified').length;
    const pending = documents.filter(d => d.status === 'pending').length;
    const rejected = documents.filter(d => d.status === 'rejected').length;

    return {
      total: documents.length,
      verified,
      pending,
      rejected,
      documents,
    };
  }

  // ========== PAYMENT METHODS ==========

  async uploadPaymentReceipt(
    registrationId: number,
    paymentData: {
      receiptUrl: string;
      receiptFilename: string;
      paymentAmount: number;
      paymentMethod?: string;
      paymentReference?: string;
      notes?: string;
    },
    instansiId: number,
  ): Promise<PpdbRegistration> {
    const registration = await this.findOne(registrationId, instansiId);

    registration.paymentReceipt = paymentData.receiptUrl;
    registration.paymentAmount = paymentData.paymentAmount;
    registration.paymentStatus = false; // Belum terverifikasi
    registration.paymentDate = new Date();

    // Simpan metadata pembayaran di notes jika ada
    if (paymentData.paymentMethod || paymentData.paymentReference || paymentData.notes) {
      const paymentNotes = {
        method: paymentData.paymentMethod,
        reference: paymentData.paymentReference,
        notes: paymentData.notes,
        uploadedAt: new Date().toISOString(),
      };
      registration.notes = registration.notes 
        ? `${registration.notes}\n\n[Pembayaran] ${JSON.stringify(paymentNotes)}`
        : `[Pembayaran] ${JSON.stringify(paymentNotes)}`;
    }

    return await this.registrationsRepository.save(registration);
  }

  async verifyPayment(
    registrationId: number,
    status: 'verified' | 'rejected',
    instansiId: number,
    verifiedBy: number,
    rejectionReason?: string,
  ): Promise<PpdbRegistration> {
    const registration = await this.findOne(registrationId, instansiId);

    if (status === 'verified') {
      registration.paymentStatus = true;
      registration.paymentDate = new Date();
      
      // Send notification
      if (registration.userId) {
        this.sendPaymentVerificationNotification(registration, true).catch(err => {
          this.logger.error(`Failed to send payment verification notification: ${err.message}`);
        });
      }
    } else {
      registration.paymentStatus = false;
      if (rejectionReason) {
        const paymentNotes = {
          rejectionReason,
          rejectedAt: new Date().toISOString(),
          rejectedBy: verifiedBy,
        };
        registration.notes = registration.notes 
          ? `${registration.notes}\n\n[Pembayaran Ditolak] ${JSON.stringify(paymentNotes)}`
          : `[Pembayaran Ditolak] ${JSON.stringify(paymentNotes)}`;
      }

      // Send rejection notification
      if (registration.userId) {
        this.sendPaymentVerificationNotification(registration, false, rejectionReason).catch(err => {
          this.logger.error(`Failed to send payment rejection notification: ${err.message}`);
        });
      }
    }

    return await this.registrationsRepository.save(registration);
  }

  private async sendPaymentVerificationNotification(
    registration: PpdbRegistration,
    verified: boolean,
    rejectionReason?: string,
  ): Promise<void> {
    try {
      const user = registration.userId
        ? await this.usersService.findById(registration.userId)
        : null;
      
      if (!user || !user.email) {
        this.logger.warn(`No email found for registration ${registration.id}`);
        return;
      }

      const tenant = await this.tenantService.findOne(registration.instansiId);
      
      let title = '';
      let content = '';

      if (verified) {
        title = 'Pembayaran Diverifikasi';
        content = `
          <p>Pembayaran untuk pendaftaran nomor <strong>${registration.registrationNumber}</strong> telah diverifikasi dan diterima.</p>
          <p><strong>Jumlah Pembayaran:</strong> Rp ${registration.paymentAmount?.toLocaleString('id-ID') || '-'}</p>
          <p>Terima kasih atas pembayaran Anda. Proses pendaftaran dapat dilanjutkan.</p>
        `;
      } else {
        title = 'Pembayaran Ditolak';
        content = `
          <p>Kami menginformasikan bahwa bukti pembayaran untuk pendaftaran nomor <strong>${registration.registrationNumber}</strong> tidak dapat diterima.</p>
          ${rejectionReason ? `<p><strong>Alasan:</strong> ${rejectionReason}</p>` : ''}
          <p>Silakan upload ulang bukti pembayaran yang valid melalui dashboard pendaftaran Anda.</p>
        `;
      }

      const emailContent = this.generateEmailTemplate(
        title,
        content,
        registration,
        tenant.name,
      );

      await this.notificationsService.sendEmail(
        registration.instansiId,
        registration.userId || 0,
        user.email,
        `${title} - ${registration.registrationNumber}`,
        emailContent,
      );

      this.logger.log(`Payment verification notification sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send payment verification notification: ${error.message}`, error.stack);
    }
  }

  // ========== ANNOUNCEMENT METHODS ==========

  async findByRegistrationNumberOrNisn(
    registrationNumber?: string,
    nisn?: string,
    instansiId?: number,
  ): Promise<PpdbRegistration | null> {
    const queryBuilder = this.registrationsRepository.createQueryBuilder('registration');

    if (instansiId) {
      queryBuilder.where('registration.instansiId = :instansiId', { instansiId });
    }

    if (registrationNumber) {
      queryBuilder.andWhere('registration.registrationNumber = :registrationNumber', {
        registrationNumber,
      });
    } else if (nisn) {
      queryBuilder.andWhere('registration.studentNisn = :nisn', { nisn });
    }

    // Hanya tampilkan yang sudah diumumkan (accepted atau rejected)
    queryBuilder.andWhere(
      '(registration.status = :accepted OR registration.status = :rejected)',
      {
        accepted: RegistrationStatus.ACCEPTED,
        rejected: RegistrationStatus.REJECTED,
      },
    );

    return await queryBuilder.getOne();
  }

  async getAnnouncementStatistics(instansiId: number): Promise<{
    total: number;
    accepted: number;
    rejected: number;
    byPath: Record<string, number>;
  }> {
    const total = await this.registrationsRepository.count({
      where: [
        { instansiId, status: RegistrationStatus.ACCEPTED },
        { instansiId, status: RegistrationStatus.REJECTED },
      ],
    });

    const accepted = await this.registrationsRepository.count({
      where: { instansiId, status: RegistrationStatus.ACCEPTED },
    });

    const rejected = await this.registrationsRepository.count({
      where: { instansiId, status: RegistrationStatus.REJECTED },
    });

    const byPath = await this.registrationsRepository
      .createQueryBuilder('registration')
      .select('registration.registrationPath', 'path')
      .addSelect('COUNT(*)', 'count')
      .where('registration.instansiId = :instansiId', { instansiId })
      .andWhere(
        '(registration.status = :accepted OR registration.status = :rejected)',
        {
          accepted: RegistrationStatus.ACCEPTED,
          rejected: RegistrationStatus.REJECTED,
        },
      )
      .groupBy('registration.registrationPath')
      .getRawMany();

    return {
      total,
      accepted,
      rejected,
      byPath: byPath.reduce((acc, item) => {
        acc[item.path] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }

  // ========== INTERVIEW SCHEDULE METHODS ==========

  async createInterviewSchedule(
    createDto: CreateInterviewScheduleDto,
    instansiId: number,
    createdBy: number,
  ): Promise<PpdbInterviewSchedule> {
    const schedule = this.interviewScheduleRepository.create({
      ...createDto,
      scheduleDate: new Date(createDto.scheduleDate),
      instansiId,
      createdBy,
      maxParticipants: createDto.maxParticipants || 1,
      status: createDto.status || ScheduleStatus.AVAILABLE,
    });

    return await this.interviewScheduleRepository.save(schedule);
  }

  async findAllInterviewSchedules(
    instansiId: number,
    filters?: {
      dateFrom?: Date;
      dateTo?: Date;
      status?: ScheduleStatus;
    },
  ): Promise<PpdbInterviewSchedule[]> {
    const queryBuilder = this.interviewScheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('schedule.registration', 'registration')
      .orderBy('schedule.scheduleDate', 'ASC')
      .addOrderBy('schedule.startTime', 'ASC');

    if (filters?.dateFrom) {
      queryBuilder.andWhere('schedule.scheduleDate >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters?.dateTo) {
      queryBuilder.andWhere('schedule.scheduleDate <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('schedule.status = :status', {
        status: filters.status,
      });
    }

    return await queryBuilder.getMany();
  }

  async findAvailableSchedules(instansiId: number): Promise<PpdbInterviewSchedule[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.interviewScheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.instansiId = :instansiId', { instansiId })
      .andWhere('schedule.status = :status', { status: ScheduleStatus.AVAILABLE })
      .andWhere('schedule.scheduleDate >= :today', { today })
      .andWhere('schedule.currentParticipants < schedule.maxParticipants')
      .orderBy('schedule.scheduleDate', 'ASC')
      .addOrderBy('schedule.startTime', 'ASC')
      .getMany();
  }

  async bookInterviewSchedule(
    scheduleId: number,
    registrationId: number,
    instansiId: number,
  ): Promise<PpdbInterviewSchedule> {
    const schedule = await this.interviewScheduleRepository.findOne({
      where: { id: scheduleId, instansiId },
      relations: ['registration'],
    });

    if (!schedule) {
      throw new NotFoundException('Jadwal tidak ditemukan');
    }

    if (schedule.status !== ScheduleStatus.AVAILABLE) {
      throw new BadRequestException('Jadwal tidak tersedia untuk dipesan');
    }

    if (schedule.currentParticipants >= schedule.maxParticipants) {
      throw new BadRequestException('Jadwal sudah penuh');
    }

    // Check if registration already has a schedule
    const existingSchedule = await this.interviewScheduleRepository.findOne({
      where: { registrationId, instansiId, status: ScheduleStatus.BOOKED },
    });

    if (existingSchedule) {
      throw new BadRequestException('Anda sudah memiliki jadwal wawancara');
    }

    schedule.registrationId = registrationId;
    schedule.status = ScheduleStatus.BOOKED;
    schedule.currentParticipants += 1;

    const savedSchedule = await this.interviewScheduleRepository.save(schedule);

    // Send notification
    const registration = await this.findOne(registrationId, instansiId);
    if (registration.userId) {
      this.sendInterviewScheduleNotification(registration, savedSchedule).catch(err => {
        this.logger.error(`Failed to send interview schedule notification: ${err.message}`);
      });
    }

    return savedSchedule;
  }

  async cancelInterviewSchedule(
    scheduleId: number,
    instansiId: number,
  ): Promise<PpdbInterviewSchedule> {
    const schedule = await this.interviewScheduleRepository.findOne({
      where: { id: scheduleId, instansiId },
    });

    if (!schedule) {
      throw new NotFoundException('Jadwal tidak ditemukan');
    }

    schedule.registrationId = null;
    schedule.status = ScheduleStatus.AVAILABLE;
    schedule.currentParticipants = Math.max(0, schedule.currentParticipants - 1);

    return await this.interviewScheduleRepository.save(schedule);
  }

  async getMyInterviewSchedule(
    registrationId: number,
    instansiId: number,
  ): Promise<PpdbInterviewSchedule | null> {
    return await this.interviewScheduleRepository.findOne({
      where: { registrationId, instansiId },
      relations: ['registration'],
    });
  }

  private async sendInterviewScheduleNotification(
    registration: PpdbRegistration,
    schedule: PpdbInterviewSchedule,
  ): Promise<void> {
    try {
      const user = registration.userId
        ? await this.usersService.findById(registration.userId)
        : null;
      
      if (!user || !user.email) {
        this.logger.warn(`No email found for registration ${registration.id}`);
        return;
      }

      const tenant = await this.tenantService.findOne(registration.instansiId);
      
      const scheduleDate = new Date(schedule.scheduleDate).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const content = `
        <p>Jadwal wawancara untuk pendaftaran nomor <strong>${registration.registrationNumber}</strong> telah ditetapkan.</p>
        <div class="info-box">
          <p><strong>Tanggal:</strong> ${scheduleDate}</p>
          <p><strong>Waktu:</strong> ${schedule.startTime} - ${schedule.endTime}</p>
          ${schedule.location ? `<p><strong>Lokasi:</strong> ${schedule.location}</p>` : ''}
          ${schedule.notes ? `<p><strong>Catatan:</strong> ${schedule.notes}</p>` : ''}
        </div>
        <p>Silakan hadir tepat waktu pada jadwal yang telah ditentukan.</p>
        <p>Jika ada perubahan atau pertanyaan, silakan hubungi sekolah melalui kontak yang tersedia.</p>
      `;

      const emailContent = this.generateEmailTemplate(
        'Jadwal Wawancara PPDB',
        content,
        registration,
        tenant.name,
      );

      await this.notificationsService.sendEmail(
        registration.instansiId,
        registration.userId || 0,
        user.email,
        `Jadwal Wawancara - ${registration.registrationNumber}`,
        emailContent,
      );

      this.logger.log(`Interview schedule notification sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send interview schedule notification: ${error.message}`, error.stack);
    }
  }

  // ========== ANALYTICS METHODS ==========

  async getAnalytics(
    instansiId: number,
    filters?: {
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<{
    daily: Array<{ date: string; count: number }>;
    monthly: Array<{ month: string; count: number }>;
    byPath: Record<string, number>;
    byStatus: Record<string, number>;
    paymentStats: {
      total: number;
      verified: number;
      pending: number;
      unpaid: number;
    };
    documentStats: {
      total: number;
      verified: number;
      pending: number;
      rejected: number;
    };
  }> {
    const dateFrom = filters?.dateFrom || new Date(new Date().getFullYear(), 0, 1);
    const dateTo = filters?.dateTo || new Date();

    // Daily registrations
    const dailyData = await this.registrationsRepository
      .createQueryBuilder('registration')
      .select('DATE(registration.registrationDate)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('registration.instansiId = :instansiId', { instansiId })
      .andWhere('registration.registrationDate >= :dateFrom', { dateFrom })
      .andWhere('registration.registrationDate <= :dateTo', { dateTo })
      .groupBy('DATE(registration.registrationDate)')
      .orderBy('DATE(registration.registrationDate)', 'ASC')
      .getRawMany();

    // Monthly registrations
    const monthlyData = await this.registrationsRepository
      .createQueryBuilder('registration')
      .select('DATE_FORMAT(registration.registrationDate, "%Y-%m")', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('registration.instansiId = :instansiId', { instansiId })
      .andWhere('registration.registrationDate >= :dateFrom', { dateFrom })
      .andWhere('registration.registrationDate <= :dateTo', { dateTo })
      .groupBy('DATE_FORMAT(registration.registrationDate, "%Y-%m")')
      .orderBy('DATE_FORMAT(registration.registrationDate, "%Y-%m")', 'ASC')
      .getRawMany();

    // By registration path
    const byPathData = await this.registrationsRepository
      .createQueryBuilder('registration')
      .select('registration.registrationPath', 'path')
      .addSelect('COUNT(*)', 'count')
      .where('registration.instansiId = :instansiId', { instansiId })
      .andWhere('registration.registrationDate >= :dateFrom', { dateFrom })
      .andWhere('registration.registrationDate <= :dateTo', { dateTo })
      .groupBy('registration.registrationPath')
      .getRawMany();

    // By status
    const byStatusData = await this.registrationsRepository
      .createQueryBuilder('registration')
      .select('registration.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('registration.instansiId = :instansiId', { instansiId })
      .andWhere('registration.registrationDate >= :dateFrom', { dateFrom })
      .andWhere('registration.registrationDate <= :dateTo', { dateTo })
      .groupBy('registration.status')
      .getRawMany();

    // Payment statistics
    const totalWithPayment = await this.registrationsRepository.count({
      where: { instansiId },
    });
    const verifiedPayments = await this.registrationsRepository.count({
      where: { instansiId, paymentStatus: true },
    });
    const pendingPayments = await this.registrationsRepository.count({
      where: { instansiId, paymentStatus: false, paymentReceipt: Not(null) },
    });
    const unpaidPayments = totalWithPayment - verifiedPayments - pendingPayments;

    // Document statistics
    const allRegistrations = await this.registrationsRepository.find({
      where: { instansiId },
      select: ['documents'],
    });

    let verifiedDocs = 0;
    let pendingDocs = 0;
    let rejectedDocs = 0;
    let totalDocs = 0;

    allRegistrations.forEach((reg) => {
      if (reg.documents) {
        Object.values(reg.documents).forEach((doc: any) => {
          totalDocs++;
          const status = doc.verificationStatus || 'pending';
          if (status === 'verified') verifiedDocs++;
          else if (status === 'rejected') rejectedDocs++;
          else pendingDocs++;
        });
      }
    });

    return {
      daily: dailyData.map((item) => ({
        date: item.date,
        count: parseInt(item.count),
      })),
      monthly: monthlyData.map((item) => ({
        month: item.month,
        count: parseInt(item.count),
      })),
      byPath: byPathData.reduce((acc, item) => {
        acc[item.path] = parseInt(item.count);
        return acc;
      }, {}),
      byStatus: byStatusData.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      paymentStats: {
        total: totalWithPayment,
        verified: verifiedPayments,
        pending: pendingPayments,
        unpaid: unpaidPayments,
      },
      documentStats: {
        total: totalDocs,
        verified: verifiedDocs,
        pending: pendingDocs,
        rejected: rejectedDocs,
      },
    };
  }

  // ========== BULK OPERATIONS METHODS ==========

  async bulkUpdateStatus(
    registrationIds: number[],
    status: RegistrationStatus,
    instansiId: number,
    notes?: string,
  ): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    for (const id of registrationIds) {
      try {
        await this.updateStatus(id, status, instansiId, notes);
        updated++;
      } catch (error) {
        this.logger.error(`Failed to update status for registration ${id}: ${error.message}`);
        failed++;
      }
    }

    return { updated, failed };
  }

  async bulkExport(
    exportDto: {
      registrationIds?: number[];
      status?: RegistrationStatus;
      format?: 'excel' | 'pdf';
    },
    instansiId: number,
  ): Promise<Buffer> {
    let registrations: PpdbRegistration[];

    if (exportDto.registrationIds && exportDto.registrationIds.length > 0) {
      registrations = await Promise.all(
        exportDto.registrationIds.map(id => this.findOne(id, instansiId))
      );
    } else {
      const queryOptions: any = { instansiId, page: 1, limit: 10000 };
      if (exportDto.status) {
        queryOptions.status = exportDto.status;
      }
      const result = await this.findAll(queryOptions);
      registrations = result.data || [];
    }

    if (registrations.length === 0) {
      throw new BadRequestException('Tidak ada data untuk diexport');
    }

    if (exportDto.format === 'pdf') {
      return this.generatePdfExport(registrations);
    } else {
      return this.generateExcelExport(registrations);
    }
  }

  async bulkImportScores(
    scores: Array<{
      registrationId: number;
      selectionScore?: number;
      interviewScore?: number;
      documentScore?: number;
    }>,
    instansiId: number,
  ): Promise<{ updated: number; failed: number; errors: string[] }> {
    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const scoreData of scores) {
      try {
        const registration = await this.findOne(scoreData.registrationId, instansiId);
        
        const updateData: any = {};
        if (scoreData.selectionScore !== undefined) updateData.selectionScore = scoreData.selectionScore;
        if (scoreData.interviewScore !== undefined) updateData.interviewScore = scoreData.interviewScore;
        if (scoreData.documentScore !== undefined) updateData.documentScore = scoreData.documentScore;

        // Calculate total score
        const total = (updateData.selectionScore || 0) + 
                     (updateData.interviewScore || 0) + 
                     (updateData.documentScore || 0);
        updateData.totalScore = total;

        await this.registrationsRepository.update(
          { id: scoreData.registrationId, instansiId },
          updateData,
        );
        updated++;
      } catch (error) {
        failed++;
        errors.push(`Registration ${scoreData.registrationId}: ${error.message}`);
      }
    }

    return { updated, failed, errors };
  }

  async bulkSendNotification(
    registrationIds: number[],
    subject: string,
    message: string,
    instansiId: number,
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const id of registrationIds) {
      try {
        const registration = await this.findOne(id, instansiId);
        if (registration.userId) {
          const user = await this.usersService.findById(registration.userId);
          if (user && user.email) {
            const tenant = await this.tenantService.findOne(instansiId);
            const emailContent = this.generateEmailTemplate(
              subject,
              message,
              registration,
              tenant.name,
            );

            await this.notificationsService.sendEmail(
              instansiId,
              registration.userId,
              user.email,
              subject,
              emailContent,
            );
            sent++;
          } else {
            failed++;
          }
        } else {
          failed++;
        }
      } catch (error) {
        this.logger.error(`Failed to send notification to registration ${id}: ${error.message}`);
        failed++;
      }
    }

    return { sent, failed };
  }

  private async generatePdfExport(registrations: PpdbRegistration[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        doc.fontSize(20).font('Helvetica-Bold').text('LAPORAN DATA PPDB', { align: 'center' });
        doc.moveDown(1);
        doc.fontSize(12).font('Helvetica').text(`Total: ${registrations.length} pendaftar`, { align: 'center' });
        doc.moveDown(2);

        registrations.forEach((reg, index) => {
          if (index > 0 && index % 3 === 0) {
            doc.addPage();
          }

          doc.fontSize(14).font('Helvetica-Bold').text(`${index + 1}. ${reg.studentName}`, { underline: true });
          doc.fontSize(11).font('Helvetica');
          doc.text(`No. Pendaftaran: ${reg.registrationNumber}`);
          doc.text(`NISN: ${reg.studentNisn}`);
          doc.text(`Jalur: ${this.getPathLabel(reg.registrationPath)}`);
          doc.text(`Status: ${this.getStatusLabel(reg.status)}`);
          if (reg.totalScore !== null) {
            doc.text(`Total Skor: ${reg.totalScore.toFixed(2)}`);
          }
          doc.moveDown(1);
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async generateExcelExport(registrations: PpdbRegistration[]): Promise<Buffer> {
    // Simple CSV export (can be enhanced with Excel library like exceljs)
    const headers = [
      'No. Pendaftaran',
      'Nama Siswa',
      'NISN',
      'NIK',
      'Jalur Pendaftaran',
      'Status',
      'Skor Seleksi',
      'Skor Wawancara',
      'Skor Dokumen',
      'Total Skor',
      'Tanggal Pendaftaran',
    ];

    const rows = registrations.map(reg => [
      reg.registrationNumber,
      reg.studentName,
      reg.studentNisn,
      reg.studentNik,
      this.getPathLabel(reg.registrationPath),
      this.getStatusLabel(reg.status),
      reg.selectionScore?.toFixed(2) || '',
      reg.interviewScore?.toFixed(2) || '',
      reg.documentScore?.toFixed(2) || '',
      reg.totalScore?.toFixed(2) || '',
      new Date(reg.registrationDate).toLocaleDateString('id-ID'),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return Buffer.from(csv, 'utf-8');
  }

  private getPathLabel(path: RegistrationPath): string {
    const labels: Record<RegistrationPath, string> = {
      zonasi: 'Zonasi',
      affirmative: 'Afirmasi',
      transfer: 'Pindahan',
      achievement: 'Prestasi',
      academic: 'Akademik',
    };
    return labels[path] || path;
  }

  private getStatusLabel(status: RegistrationStatus): string {
    const labels: Record<RegistrationStatus, string> = {
      pending: 'Menunggu',
      registered: 'Terdaftar',
      selection: 'Seleksi',
      announced: 'Diumumkan',
      accepted: 'Diterima',
      rejected: 'Ditolak',
      cancelled: 'Dibatalkan',
    };
    return labels[status] || status;
  }

  // ========== STUDENT TRANSFER METHODS ==========

  async searchStudentFromOtherTenant(
    nisn: string,
    sourceTenantNpsn: string,
    destinationTenantId: number,
  ): Promise<{
    student: any;
    sourceTenant: any;
    isEligible: boolean;
    eligibilityReason: string;
  }> {
    // Find source tenant
    const sourceTenant = await this.tenantService.findByNpsn(sourceTenantNpsn);
    
    if (sourceTenant.id === destinationTenantId) {
      throw new BadRequestException('Siswa sudah berada di tenant yang sama');
    }

    // Find student in source tenant by NIK (parameter nisn sebenarnya adalah NIK)
    const student = await this.studentsService.findByNik(nisn, sourceTenant.id);

    // Get destination tenant info
    const destinationTenant = await this.tenantService.findOne(destinationTenantId);

    // Validate academic level progression
    const sourceLevel = student.academicLevel?.toUpperCase();
    // Try to get level from tenant settings or infer from name
    const destinationLevel = destinationTenant.settings?.level?.toUpperCase() || 
                            (destinationTenant.name?.toUpperCase().includes('SMP') ? 'SMP' :
                             destinationTenant.name?.toUpperCase().includes('SMA') ? 'SMA' :
                             destinationTenant.name?.toUpperCase().includes('SMK') ? 'SMK' : null);

    let isEligible = false;
    let eligibilityReason = '';

    // Check if student is eligible (lulus atau tingkat akhir)
    const isGraduated = student.studentStatus === 'graduated' || 
                        (student.currentGrade && ['6', '9', '12'].includes(student.currentGrade));
    const isFinalGrade = student.currentGrade && ['6', '9', '12'].includes(student.currentGrade);

    // Validate progression: SD -> SMP, SMP -> SMA/SMK
    if (sourceLevel === 'SD' && (destinationLevel === 'SMP' || destinationLevel === 'MTS')) {
      if (isGraduated || (isFinalGrade && student.currentGrade === '6')) {
        isEligible = true;
        eligibilityReason = 'Siswa lulus SD dan dapat mendaftar ke SMP';
      } else {
        eligibilityReason = 'Siswa belum lulus atau belum di kelas 6 SD';
      }
    } else if ((sourceLevel === 'SMP' || sourceLevel === 'MTS') && 
               (destinationLevel === 'SMA' || destinationLevel === 'SMK' || destinationLevel === 'MA')) {
      if (isGraduated || (isFinalGrade && student.currentGrade === '9')) {
        isEligible = true;
        eligibilityReason = 'Siswa lulus SMP dan dapat mendaftar ke SMA/SMK';
      } else {
        eligibilityReason = 'Siswa belum lulus atau belum di kelas 9 SMP';
      }
    } else {
      eligibilityReason = `Tidak dapat transfer dari ${sourceLevel || 'tidak diketahui'} ke ${destinationLevel || 'tidak diketahui'}`;
    }

    // Prepare student data for auto-fill
    const studentData = {
      id: student.id,
      nisn: student.nisn,
      name: student.name,
      nik: student.nik,
      birthPlace: student.birthPlace,
      birthDate: student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : null,
      gender: student.gender === 'male' || student.gender === 'laki-laki' || student.gender === 'L' ? 'male' :
              student.gender === 'female' || student.gender === 'perempuan' || student.gender === 'P' ? 'female' :
              student.gender,
      religion: student.religion,
      address: student.address,
      phone: student.phone,
      email: student.email,
      parentName: student.parentName || student.fatherName || student.motherName,
      parentPhone: student.parentPhone || student.fatherPhone || student.motherPhone,
      parentEmail: student.parentEmail || student.fatherEmail || student.motherEmail,
      parentOccupation: student.fatherOccupation || student.motherOccupation || '',
      parentIncome: student.fatherIncome || student.motherIncome || 0,
      previousSchool: sourceTenant.name,
      previousSchoolAddress: sourceTenant.address || '',
      academicLevel: sourceLevel,
      currentGrade: student.currentGrade,
      studentStatus: student.studentStatus,
      isGraduated: isGraduated,
    };

    return {
      student: studentData,
      sourceTenant: {
        id: sourceTenant.id,
        npsn: sourceTenant.npsn,
        name: sourceTenant.name,
        level: sourceLevel,
      },
      isEligible,
      eligibilityReason,
    };
  }
}

