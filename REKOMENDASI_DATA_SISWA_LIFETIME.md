# Rekomendasi: Data Siswa Lifetime (SD - SMA)

## 📋 Ringkasan

Dokumen ini menjelaskan strategi dan implementasi untuk memastikan **semua data siswa mengikuti siswa tersebut dari kelas 1 SD sampai lulus SMA**, termasuk data kedisiplinan, kesehatan, nilai, dan data lainnya.

## 🎯 Tujuan

1. **Data Persistence**: Memastikan semua data historis siswa tetap terikat dan dapat diakses sepanjang perjalanan akademik
2. **Data Integrity**: Memastikan tidak ada data yang hilang saat siswa pindah kelas atau sekolah
3. **Lifetime Tracking**: Mampu melacak riwayat lengkap siswa dari SD hingga SMA

## 🏗️ Arsitektur Data

### 1. Identifier Utama: NISN

**NISN (Nomor Induk Siswa Nasional)** adalah identifier utama yang:
- **Unique** di seluruh sistem
- **Tidak berubah** sepanjang perjalanan akademik siswa
- Digunakan sebagai **primary key** untuk tracking data siswa

```typescript
@Column({ type: 'varchar', length: 20, nullable: true, unique: true })
nisn: string;
```

### 2. Struktur Data Siswa

#### Field Baru yang Ditambahkan:

```typescript
// Tracking Level Akademik
@Column({ type: 'varchar', length: 20, nullable: true })
academicLevel: string; // 'SD', 'SMP', 'SMA', 'SMK'

@Column({ type: 'varchar', length: 10, nullable: true })
currentGrade: string; // '1'-'6' (SD), '7'-'9' (SMP), '10'-'12' (SMA)

@Column({ type: 'varchar', length: 10, nullable: true })
academicYear: string; // '2024/2025'
```

#### Relasi Data yang Terikat ke Siswa:

1. **Nilai (Grades)** - `StudentGrade`
2. **Kesehatan (Health Records)** - `HealthRecord`
3. **Kedisiplinan (Disciplinary Actions)** - `DisciplinaryAction`
4. **Konseling (Counseling Sessions)** - `CounselingSession`
5. **Kehadiran (Attendance)** - `Attendance`
6. **Ekstrakurikuler** - `ExtracurricularParticipant`
7. **E-Learning** - `CourseEnrollment`, `CourseProgress`
8. **Ujian (Exams)** - `ExamAttempt`
9. **Alumni** - `Alumni`
10. **Kelulusan (Graduation)** - `Graduation`
11. **Mutasi (Transfer)** - `StudentTransfer`

## 📊 Relasi Database

### Student Entity (Updated)

```typescript
@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  nisn: string; // PRIMARY IDENTIFIER

  // ... field lainnya

  // Relasi One-to-Many ke semua data terkait
  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendances: Attendance[];

  @OneToMany(() => StudentGrade, (grade) => grade.student)
  grades: StudentGrade[];

  @OneToMany(() => HealthRecord, (healthRecord) => healthRecord.student)
  healthRecords: HealthRecord[];

  @OneToMany(() => DisciplinaryAction, (disciplinaryAction) => disciplinaryAction.student)
  disciplinaryActions: DisciplinaryAction[];

  @OneToMany(() => CounselingSession, (counselingSession) => counselingSession.student)
  counselingSessions: CounselingSession[];

  // ... relasi lainnya
}
```

## 🔄 Skenario Data Lifetime

### Skenario 1: Naik Kelas (Dalam Sekolah yang Sama)

**Contoh**: Siswa naik dari kelas 1 SD ke kelas 2 SD

**Yang Terjadi**:
- ✅ `classId` berubah (kelas baru)
- ✅ `currentGrade` berubah ('1' → '2')
- ✅ `academicYear` berubah ('2023/2024' → '2024/2025')
- ✅ **Semua data historis tetap terikat** ke `studentId` dan `nisn`
- ✅ Data nilai, kesehatan, disiplin dari tahun sebelumnya tetap ada

**Query untuk melihat riwayat lengkap**:
```sql
-- Semua nilai siswa dari kelas 1 sampai sekarang
SELECT * FROM student_grades 
WHERE student_id = ? 
ORDER BY date ASC;

-- Semua catatan kesehatan
SELECT * FROM health_records 
WHERE student_id = ? 
ORDER BY checkup_date ASC;

-- Semua catatan disiplin
SELECT * FROM disciplinary_actions 
WHERE student_id = ? 
ORDER BY incident_date ASC;
```

### Skenario 2: Pindah Sekolah (SD ke SMP, atau SMP ke SMA)

**Contoh**: Siswa lulus SD dan masuk SMP

**Yang Terjadi**:
- ✅ Sistem **Student Transfer** memindahkan data terkait
- ✅ `instansiId` berubah (sekolah baru)
- ✅ `academicLevel` berubah ('SD' → 'SMP')
- ✅ `currentGrade` berubah ('6' → '7')
- ✅ **Data historis dipindahkan** ke sekolah baru melalui `transferRelatedData()`

**Data yang Dipindahkan**:
- ✅ Nilai (Grades)
- ✅ Catatan Kesehatan (Health Records)
- ✅ Catatan Disiplin (Disciplinary Actions)
- ✅ Konseling (Counseling Sessions)
- ✅ Ekstrakurikuler Aktif
- ✅ Progress E-Learning

**Data yang TIDAK Dipindahkan** (karena terkait dengan sekolah asal):
- ⚠️ Kehadiran (Attendance) - terkait jadwal kelas spesifik
- ⚠️ Pembayaran SPP - terkait keuangan sekolah asal
- ⚠️ Ujian - terkait ujian spesifik sekolah asal

### Skenario 3: Lulus SMA

**Contoh**: Siswa lulus SMA

**Yang Terjadi**:
- ✅ `studentStatus` berubah menjadi 'graduated'
- ✅ `isActive` berubah menjadi `false`
- ✅ Data dipindahkan ke tabel `alumni`
- ✅ **Semua data historis tetap dapat diakses** melalui relasi

## 🛠️ Implementasi

### 1. Migration Database

Buat migration untuk menambahkan field baru:

```sql
ALTER TABLE students 
ADD COLUMN academic_level VARCHAR(20) NULL COMMENT 'SD, SMP, SMA, SMK',
ADD COLUMN current_grade VARCHAR(10) NULL COMMENT '1-6 (SD), 7-9 (SMP), 10-12 (SMA)',
ADD COLUMN academic_year VARCHAR(10) NULL COMMENT '2024/2025';

-- Index untuk performa query
CREATE INDEX idx_students_nisn ON students(nisn);
CREATE INDEX idx_students_academic_level ON students(academic_level);
CREATE INDEX idx_students_academic_year ON students(academic_year);
```

### 2. Service Layer

#### Update Student Service

```typescript
// src/modules/students/students.service.ts

async updateAcademicLevel(
  studentId: number,
  academicLevel: string,
  currentGrade: string,
  academicYear: string,
) {
  const student = await this.studentRepository.findOne({
    where: { id: studentId },
  });

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  student.academicLevel = academicLevel;
  student.currentGrade = currentGrade;
  student.academicYear = academicYear;

  return await this.studentRepository.save(student);
}

async getStudentLifetimeData(nisn: string) {
  const student = await this.studentRepository.findOne({
    where: { nisn },
    relations: [
      'grades',
      'healthRecords',
      'disciplinaryActions',
      'counselingSessions',
      'attendances',
      'extracurricularParticipants',
      'courseEnrollments',
      'examAttempts',
      'alumniRecords',
      'graduations',
      'transfers',
    ],
  });

  return {
    student: {
      id: student.id,
      nisn: student.nisn,
      name: student.name,
      academicLevel: student.academicLevel,
      currentGrade: student.currentGrade,
    },
    grades: student.grades,
    healthRecords: student.healthRecords,
    disciplinaryActions: student.disciplinaryActions,
    counselingSessions: student.counselingSessions,
    attendances: student.attendances,
    // ... data lainnya
  };
}
```

### 3. Student Transfer Service (Sudah Ada)

Service `StudentTransferService` sudah memiliki method `transferRelatedData()` yang:
- Memindahkan data terkait saat siswa pindah sekolah
- Memastikan `studentId` tetap konsisten
- Memindahkan `instansiId` ke sekolah baru

**Pastikan** saat transfer:
1. Data dipindahkan dengan benar
2. `nisn` tetap sama
3. Data historis tidak hilang

## 📝 Best Practices

### 1. Selalu Gunakan NISN untuk Query

```typescript
// ✅ BENAR - Gunakan NISN
const student = await studentRepository.findOne({
  where: { nisn: '1234567890' },
});

// ❌ SALAH - Jangan hanya gunakan ID
const student = await studentRepository.findOne({
  where: { id: 123 },
});
```

### 2. Validasi NISN Wajib

```typescript
@Column({ type: 'varchar', length: 20, nullable: true, unique: true })
nisn: string;

// Validasi saat create/update
if (!student.nisn) {
  throw new BadRequestException('NISN is required');
}
```

### 3. Jangan Hapus Data Historis

```typescript
// ❌ JANGAN hapus data saat siswa pindah
// await healthRecordRepository.delete({ studentId });

// ✅ UPDATE instansiId dan studentId jika perlu
await healthRecordRepository.update(
  { studentId: oldStudentId },
  { instansiId: newInstansiId, studentId: newStudentId }
);
```

### 4. Gunakan Soft Delete untuk Data Penting

```typescript
@Column({ default: true })
isActive: boolean; // Soft delete

// Saat siswa lulus
student.isActive = false;
await studentRepository.save(student);
```

## 🔍 Query untuk Melihat Riwayat Lengkap

### 1. Riwayat Nilai Sepanjang Masa

```typescript
async getStudentAllTimeGrades(nisn: string) {
  const student = await this.studentRepository.findOne({
    where: { nisn },
    relations: ['grades', 'grades.subject'],
  });

  return student.grades.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
```

### 2. Riwayat Kesehatan

```typescript
async getStudentHealthHistory(nisn: string) {
  const student = await this.studentRepository.findOne({
    where: { nisn },
    relations: ['healthRecords'],
  });

  return student.healthRecords.sort((a, b) => 
    new Date(a.checkupDate).getTime() - new Date(b.checkupDate).getTime()
  );
}
```

### 3. Riwayat Disiplin

```typescript
async getStudentDisciplineHistory(nisn: string) {
  const student = await this.studentRepository.findOne({
    where: { nisn },
    relations: ['disciplinaryActions'],
  });

  return student.disciplinaryActions.sort((a, b) => 
    new Date(a.incidentDate).getTime() - new Date(b.incidentDate).getTime()
  );
}
```

## 📈 Monitoring dan Reporting

### Dashboard Riwayat Siswa

Buat endpoint untuk melihat riwayat lengkap siswa:

```typescript
@Get('students/:nisn/lifetime')
async getStudentLifetimeData(@Param('nisn') nisn: string) {
  return await this.studentsService.getStudentLifetimeData(nisn);
}
```

**Response**:
```json
{
  "student": {
    "id": 123,
    "nisn": "1234567890",
    "name": "John Doe",
    "academicLevel": "SMA",
    "currentGrade": "12"
  },
  "academicHistory": [
    {
      "academicYear": "2020/2021",
      "academicLevel": "SD",
      "grade": "1",
      "school": "SD Negeri 1"
    },
    // ... tahun-tahun berikutnya
  ],
  "grades": [...],
  "healthRecords": [...],
  "disciplinaryActions": [...],
  "transfers": [...]
}
```

## ⚠️ Catatan Penting

1. **NISN adalah Kunci**: Pastikan NISN selalu diisi dan valid
2. **Data Tidak Dihapus**: Data historis tidak boleh dihapus, hanya di-archive
3. **Transfer Data**: Saat siswa pindah, pastikan semua data terkait dipindahkan
4. **Backup**: Lakukan backup rutin untuk data siswa
5. **Audit Trail**: Simpan log semua perubahan data siswa

## 🚀 Langkah Selanjutnya

1. ✅ **Selesai**: Update Student Entity dengan relasi lengkap
2. ✅ **Selesai**: Tambahkan field academic level tracking
3. ⏳ **Todo**: Buat migration untuk field baru
4. ⏳ **Todo**: Update Student Service dengan method lifetime data
5. ⏳ **Todo**: Buat endpoint API untuk lifetime data
6. ⏳ **Todo**: Update frontend untuk menampilkan riwayat lengkap
7. ⏳ **Todo**: Testing transfer data antar sekolah

## 📚 Referensi

- [TypeORM Relations Documentation](https://typeorm.io/relations)
- [Student Transfer Service](./src/modules/student-transfer/student-transfer.service.ts)
- [Student Entity](./src/modules/students/entities/student.entity.ts)

---

**Dibuat**: 2025-01-XX  
**Versi**: 1.0  
**Status**: Implementasi Awal

