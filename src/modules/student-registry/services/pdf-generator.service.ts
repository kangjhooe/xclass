import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import { DigitalSignature } from '../../academic-reports/entities/digital-signature.entity';
import * as fs from 'fs';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  constructor(
    @InjectRepository(DigitalSignature)
    private signatureRepository: Repository<DigitalSignature>,
  ) {}

  /**
   * Generate buku induk PDF dengan template yang bagus
   */
  async generateRegistryPDF(
    registryData: any,
    options: {
      includeSignature?: boolean;
      signatureId?: number;
    } = {},
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
          info: {
            Title: `Buku Induk Siswa - ${registryData.student.name}`,
            Author: 'CLASS System',
            Subject: 'Buku Induk Siswa',
            Creator: 'CLASS Platform',
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Generate PDF content
        this.generatePDFContent(doc, registryData, options);

        doc.end();
      } catch (error) {
        this.logger.error(`Failed to generate PDF: ${error.message}`, error);
        reject(error);
      }
    });
  }

  /**
   * Generate PDF content
   */
  private async generatePDFContent(
    doc: PDFKit.PDFDocument,
    data: any,
    options: {
      includeSignature?: boolean;
      signatureId?: number;
    },
  ) {
    const student = data.student;
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 40;
    let yPosition = margin;

    // Helper function to add new page if needed
    const checkNewPage = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - margin - 50) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function to draw section header
    const drawSectionHeader = (title: string) => {
      checkNewPage(30);
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#1e40af')
        .text(title, margin, yPosition, { underline: true });
      yPosition += 25;
      doc.fillColor('#000000');
    };

    // Helper function to draw field
    const drawField = (label: string, value: any, width: number = 250) => {
      if (checkNewPage(20)) {
        drawField(label, value, width);
        return;
      }
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(label + ':', margin, yPosition, { width: 120, continued: false });
      doc
        .font('Helvetica')
        .text(value || '-', margin + 125, yPosition, { width: width - 125 });
      yPosition += 18;
    };

    // Helper function to draw table header
    const drawTableHeader = (headers: string[], widths: number[]) => {
      checkNewPage(25);
      const startY = yPosition;
      let x = margin;
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
      
      headers.forEach((header, index) => {
        doc.rect(x, startY, widths[index], 20).fill('#1e40af');
        doc.text(header, x + 5, startY + 5, { width: widths[index] - 10, align: 'left' });
        x += widths[index];
      });
      
      doc.fillColor('#000000');
      yPosition = startY + 20;
    };

    // Helper function to draw table row
    const drawTableRow = (cells: string[], widths: number[]) => {
      if (checkNewPage(20)) {
        drawTableHeader(
          ['No', 'Tanggal', 'Keterangan'],
          widths,
        );
      }
      const startY = yPosition;
      let x = margin;
      doc.fontSize(8).font('Helvetica');
      
      cells.forEach((cell, index) => {
        doc.rect(x, startY, widths[index], 18).stroke();
        doc.text(cell || '-', x + 5, startY + 4, { width: widths[index] - 10, align: 'left' });
        x += widths[index];
      });
      
      yPosition = startY + 18;
    };

    // ============================================
    // COVER PAGE
    // ============================================
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#1e40af')
      .text('BUKU INDUK SISWA', margin, pageHeight / 2 - 100, {
        align: 'center',
        width: pageWidth - 2 * margin,
      });

    doc
      .fontSize(16)
      .font('Helvetica')
      .fillColor('#4b5563')
      .text('Sistem Informasi Manajemen Sekolah', margin, pageHeight / 2 - 50, {
        align: 'center',
        width: pageWidth - 2 * margin,
      });

    doc
      .fontSize(12)
      .text(`NIK: ${student.nik || '-'}`, margin, pageHeight / 2, {
        align: 'center',
        width: pageWidth - 2 * margin,
      });

    doc
      .fontSize(12)
      .text(`NISN: ${student.nisn || '-'}`, margin, pageHeight / 2 + 20, {
        align: 'center',
        width: pageWidth - 2 * margin,
      });

    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(student.name.toUpperCase(), margin, pageHeight / 2 + 60, {
        align: 'center',
        width: pageWidth - 2 * margin,
      });

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text(
        `Dibuat pada: ${new Date().toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`,
        margin,
        pageHeight - 100,
        {
          align: 'center',
          width: pageWidth - 2 * margin,
        },
      );

    // ============================================
    // PAGE 2: IDENTITAS SISWA
    // ============================================
    doc.addPage();
    yPosition = margin;

    drawSectionHeader('I. IDENTITAS SISWA');

    drawField('NIK', student.nik);
    drawField('NISN', student.nisn);
    drawField('NIS', student.studentNumber);
    drawField('Nama Lengkap', student.name);
    drawField('Jenis Kelamin', this.formatGender(student.gender));
    drawField('Tempat Lahir', student.birthPlace);
    drawField('Tanggal Lahir', this.formatDate(student.birthDate));
    drawField('Agama', student.religion);
    drawField('Kewarganegaraan', student.nationality);
    drawField('Suku Bangsa', student.ethnicity);
    drawField('Bahasa Sehari-hari', student.language);
    drawField('Golongan Darah', student.bloodType);

    yPosition += 10;
    drawSectionHeader('Alamat Lengkap');
    drawField('Alamat', student.address);
    drawField('RT/RW', `${student.rt || '-'}/${student.rw || '-'}`);
    drawField('Kelurahan/Desa', student.village);
    drawField('Kecamatan', student.subDistrict);
    drawField('Kabupaten/Kota', student.district || student.city);
    drawField('Provinsi', student.province);
    drawField('Kode Pos', student.postalCode);
    drawField('Jenis Tempat Tinggal', student.residenceType);
    drawField('Alat Transportasi', student.transportation);

    yPosition += 10;
    drawSectionHeader('Data Kesehatan');
    drawField('Tinggi Badan (cm)', student.height?.toString());
    drawField('Berat Badan (kg)', student.weight?.toString());
    drawField('Kondisi Kesehatan', student.healthCondition);
    drawField('Alergi', student.allergies);
    drawField('Obat-obatan', student.medications);
    if (student.disabilityType) {
      drawField('Jenis Disabilitas', student.disabilityType);
      drawField('Keterangan Disabilitas', student.disabilityDescription);
    }

    yPosition += 10;
    drawSectionHeader('Data Sekolah Sebelumnya');
    if (student.previousSchool) {
      drawField('Nama Sekolah', student.previousSchool);
      drawField('Alamat Sekolah', student.previousSchoolAddress);
      drawField('Tahun Lulus', student.previousSchoolGraduationYear);
      drawField('No. Ijazah', student.previousSchoolCertificateNumber);
    } else {
      doc.fontSize(9).text('Tidak ada data sekolah sebelumnya', margin, yPosition);
      yPosition += 18;
    }

    // ============================================
    // PAGE 3: DATA ORANG TUA/WALI
    // ============================================
    doc.addPage();
    yPosition = margin;

    drawSectionHeader('II. DATA ORANG TUA/WALI');

    yPosition += 5;
    doc.fontSize(12).font('Helvetica-Bold').text('A. Data Ayah', margin, yPosition);
    yPosition += 20;

    drawField('Nama Lengkap', student.fatherName);
    drawField('NIK', student.fatherNik);
    drawField('Tempat Lahir', student.fatherBirthPlace);
    drawField('Tanggal Lahir', this.formatDate(student.fatherBirthDate));
    drawField('Pendidikan', student.fatherEducation);
    drawField('Pekerjaan', student.fatherOccupation);
    drawField('Nama Perusahaan', student.fatherCompany);
    drawField('No. Telepon', student.fatherPhone);
    drawField('Email', student.fatherEmail);
    if (student.fatherIncome) {
      drawField('Penghasilan', this.formatCurrency(student.fatherIncome));
    }

    yPosition += 10;
    doc.fontSize(12).font('Helvetica-Bold').text('B. Data Ibu', margin, yPosition);
    yPosition += 20;

    drawField('Nama Lengkap', student.motherName);
    drawField('NIK', student.motherNik);
    drawField('Tempat Lahir', student.motherBirthPlace);
    drawField('Tanggal Lahir', this.formatDate(student.motherBirthDate));
    drawField('Pendidikan', student.motherEducation);
    drawField('Pekerjaan', student.motherOccupation);
    drawField('Nama Perusahaan', student.motherCompany);
    drawField('No. Telepon', student.motherPhone);
    drawField('Email', student.motherEmail);
    if (student.motherIncome) {
      drawField('Penghasilan', this.formatCurrency(student.motherIncome));
    }

    if (student.guardianName) {
      yPosition += 10;
      doc.fontSize(12).font('Helvetica-Bold').text('C. Data Wali', margin, yPosition);
      yPosition += 20;

      drawField('Nama Lengkap', student.guardianName);
      drawField('NIK', student.guardianNik);
      drawField('Hubungan', student.guardianRelationship);
      drawField('Tempat Lahir', student.guardianBirthPlace);
      drawField('Tanggal Lahir', this.formatDate(student.guardianBirthDate));
      drawField('Pendidikan', student.guardianEducation);
      drawField('Pekerjaan', student.guardianOccupation);
      drawField('No. Telepon', student.guardianPhone);
      drawField('Email', student.guardianEmail);
      if (student.guardianIncome) {
        drawField('Penghasilan', this.formatCurrency(student.guardianIncome));
      }
    }

    yPosition += 10;
    drawSectionHeader('Kontak Darurat');
    drawField('Nama', student.emergencyContactName);
    drawField('No. Telepon', student.emergencyContactPhone);
    drawField('Hubungan', student.emergencyContactRelationship);

    // ============================================
    // PAGE 4: DATA AKADEMIK
    // ============================================
    if (data.grades || data.attendance) {
      doc.addPage();
      yPosition = margin;

      drawSectionHeader('III. DATA AKADEMIK');

      yPosition += 5;
      doc.fontSize(12).font('Helvetica-Bold').text('A. Informasi Akademik', margin, yPosition);
      yPosition += 20;

      drawField('Tahun Ajaran', data.academicYear || student.academicYear);
      drawField('Level Akademik', student.academicLevel);
      drawField('Kelas Saat Ini', student.currentGrade);
      drawField('Status', student.studentStatus);
      drawField('Tanggal Masuk', this.formatDate(student.enrollmentDate));
      drawField('Tahun Masuk', student.enrollmentYear);
      if (student.classRoom) {
        drawField('Kelas', student.classRoom.name);
      }

      // Nilai
      if (data.grades && data.grades.total > 0) {
        yPosition += 10;
        doc.fontSize(12).font('Helvetica-Bold').text('B. Nilai Akademik', margin, yPosition);
        yPosition += 20;

        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Rata-rata Nilai: ${data.grades.average}`, margin, yPosition);
        yPosition += 20;

        // Table header
        const tableWidths = [30, 200, 80, 80, 100];
        drawTableHeader(['No', 'Mata Pelajaran', 'Nilai', 'Semester', 'Tahun Ajaran'], tableWidths);

        // Table rows
        let no = 1;
        data.grades.allGrades.forEach((grade: any) => {
          drawTableRow(
            [
              no.toString(),
              grade.subject || '-',
              grade.score?.toString() || '-',
              grade.semester || '-',
              grade.academicYear || '-',
            ],
            tableWidths,
          );
          no++;
        });
      }

      // Kehadiran
      if (data.attendance) {
        yPosition += 10;
        doc.fontSize(12).font('Helvetica-Bold').text('C. Data Kehadiran', margin, yPosition);
        yPosition += 20;

        drawField('Total Kehadiran', data.attendance.total.toString());
        drawField('Hadir', data.attendance.present.toString());
        drawField('Tidak Hadir', data.attendance.absent.toString());
        drawField('Terlambat', data.attendance.late.toString());
        drawField('Izin', data.attendance.excused.toString());
        drawField('Tingkat Kehadiran', `${data.attendance.attendanceRate}%`);
      }
    }

    // ============================================
    // PAGE 5: DATA KESEHATAN & DISIPLIN
    // ============================================
    if (data.health || data.discipline) {
      doc.addPage();
      yPosition = margin;

      if (data.health && data.health.total > 0) {
        drawSectionHeader('IV. DATA KESEHATAN');

        drawField('Total Catatan Kesehatan', data.health.total.toString());

        const tableWidths = [30, 80, 100, 150];
        drawTableHeader(['No', 'Tanggal', 'Status', 'Diagnosis'], tableWidths);

        let no = 1;
        data.health.records.slice(0, 20).forEach((record: any) => {
          drawTableRow(
            [
              no.toString(),
              this.formatDate(record.checkupDate),
              record.healthStatus || '-',
              record.diagnosis || '-',
            ],
            tableWidths,
          );
          no++;
        });
      }

      if (data.discipline && data.discipline.total > 0) {
        yPosition += 10;
        drawSectionHeader('V. DATA PELANGGARAN & DISIPLIN');

        drawField('Total Pelanggaran', data.discipline.total.toString());

        const tableWidths = [30, 80, 120, 200];
        drawTableHeader(['No', 'Tanggal', 'Jenis', 'Tindakan'], tableWidths);

        let no = 1;
        data.discipline.actions.forEach((action: any) => {
          drawTableRow(
            [
              no.toString(),
              this.formatDate(action.incidentDate),
              action.violationType || '-',
              action.actionTaken || '-',
            ],
            tableWidths,
          );
          no++;
        });
      }
    }

    // ============================================
    // PAGE 6: DATA LAINNYA
    // ============================================
    const hasOtherData =
      data.counseling ||
      data.extracurricular ||
      data.exams ||
      data.promotion ||
      data.transfer ||
      data.graduation;

    if (hasOtherData) {
      doc.addPage();
      yPosition = margin;

      if (data.counseling && data.counseling.total > 0) {
        drawSectionHeader('VI. DATA KONSELING');
        drawField('Total Sesi Konseling', data.counseling.total.toString());
        yPosition += 20;
      }

      if (data.extracurricular && data.extracurricular.total > 0) {
        drawSectionHeader('VII. EKSTRAKURIKULER');
        drawField('Total Kegiatan', data.extracurricular.total.toString());
        yPosition += 20;
      }

      if (data.promotion && data.promotion.total > 0) {
        drawSectionHeader('VIII. RIWAYAT NAIK KELAS');
        drawField('Total Kenaikan', data.promotion.total.toString());
        yPosition += 20;
      }

      if (data.transfer && data.transfer.total > 0) {
        drawSectionHeader('IX. RIWAYAT MUTASI');
        drawField('Total Mutasi', data.transfer.total.toString());
        yPosition += 20;
      }

      if (data.graduation && data.graduation.total > 0) {
        drawSectionHeader('X. DATA KELULUSAN');
        data.graduation.graduations.forEach((grad: any) => {
          drawField('Tanggal Kelulusan', this.formatDate(grad.graduationDate));
          drawField('Tahun Ajaran', grad.academicYear);
          drawField('No. Ijazah', grad.certificateNumber);
          if (grad.finalGPA) {
            drawField('IPK Akhir', grad.finalGPA.toString());
          }
        });
      }
    }

    // ============================================
    // SIGNATURE PAGE
    // ============================================
    doc.addPage();
    yPosition = pageHeight - 200;

    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Catatan:', margin, yPosition, { width: pageWidth - 2 * margin });
    yPosition += 20;
    doc.text(
      'Buku induk ini adalah dokumen resmi yang berisi data lengkap siswa selama masa studi.',
      margin,
      yPosition,
      { width: pageWidth - 2 * margin },
    );
    yPosition += 30;

    // Signature section
    if (options.includeSignature && options.signatureId) {
      try {
        const signature = await this.signatureRepository.findOne({
          where: { id: options.signatureId },
        });

        if (signature) {
          const signatureY = pageHeight - 150;
          const signatureX = pageWidth - 250;

          // Decode signature image
          let signatureImageBuffer: Buffer;
          if (signature.signatureImage.startsWith('data:image')) {
            const base64Data = signature.signatureImage.split(',')[1];
            signatureImageBuffer = Buffer.from(base64Data, 'base64');
          } else if (fs.existsSync(signature.signatureImage)) {
            signatureImageBuffer = fs.readFileSync(signature.signatureImage);
          }

          if (signatureImageBuffer) {
            doc.image(signatureImageBuffer, signatureX, signatureY, {
              width: 150,
              height: 60,
            });

            doc
              .fontSize(10)
              .font('Helvetica-Bold')
              .text(signature.name, signatureX, signatureY + 70, {
                width: 150,
                align: 'center',
              });
            // Map signature type to position text
            const positionMap: Record<string, string> = {
              headmaster: 'Kepala Sekolah',
              teacher: 'Guru',
              admin: 'Administrator',
              counselor: 'Konselor',
            };
            const positionText = signature.metadata?.position || positionMap[signature.type] || 'Kepala Sekolah';
            doc
              .fontSize(9)
              .font('Helvetica')
              .text(positionText, signatureX, signatureY + 85, {
                width: 150,
                align: 'center',
              });
            doc
              .fontSize(8)
              .text(
                `Tanda Tangan Digital: ${signature.signatureHash?.substring(0, 16)}...`,
                signatureX,
                signatureY + 105,
                {
                  width: 150,
                  align: 'center',
                },
              );
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to add signature: ${error.message}`);
      }
    } else {
      // Placeholder for manual signature
      doc
        .rect(pageWidth - 250, pageHeight - 150, 150, 60)
        .stroke();
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Tanda Tangan', pageWidth - 250, pageHeight - 80, {
          width: 150,
          align: 'center',
        });
      doc
        .fontSize(9)
        .text('Kepala Sekolah', pageWidth - 250, pageHeight - 65, {
          width: 150,
          align: 'center',
        });
    }

    // Footer
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text(
        `Dokumen ini dibuat secara otomatis oleh sistem CLASS pada ${new Date().toLocaleString('id-ID')}`,
        margin,
        pageHeight - 30,
        {
          width: pageWidth - 2 * margin,
          align: 'center',
        },
      );
  }

  /**
   * Format helpers
   */
  private formatDate(date: any): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private formatGender(gender: string): string {
    if (!gender) return '-';
    const map: Record<string, string> = {
      male: 'Laki-laki',
      female: 'Perempuan',
      l: 'Laki-laki',
      p: 'Perempuan',
      laki: 'Laki-laki',
      perempuan: 'Perempuan',
    };
    return map[gender.toLowerCase()] || gender;
  }

  private formatCurrency(amount: number): string {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}

