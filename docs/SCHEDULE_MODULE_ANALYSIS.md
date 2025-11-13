# Analisis & Roadmap Pengembangan Modul Jadwal

## 📊 Status Saat Ini

### Relasi yang Sudah Ada

#### 1. **Relasi Database (TypeORM)**
- ✅ **Schedule → ClassRoom** (ManyToOne)
- ✅ **Schedule → Subject** (ManyToOne)
- ✅ **Schedule → Teacher** (ManyToOne)
- ✅ **Schedule → Attendance** (OneToMany)

#### 2. **Modul yang Menggunakan Schedule**

**Backend:**
- ✅ **Attendance Module** - Menggunakan `scheduleId` untuk tracking kehadiran
- ✅ **Student Portal** - Menampilkan jadwal siswa berdasarkan `classId`
- ✅ **Mobile API** - Endpoint untuk mobile app melihat jadwal
- ✅ **Classes Module** - Relasi `classRoom.schedules`
- ✅ **Teachers Module** - Relasi `teacher.schedules`
- ✅ **Subjects Module** - Relasi `subject.schedules`

**Frontend:**
- ✅ Halaman `/schedules` - CRUD jadwal
- ✅ Halaman `/attendance` - Filter berdasarkan schedule
- ✅ Student Portal - Menampilkan jadwal harian

---

## 🔗 Kaitan dengan Modul Lain

### 1. **Attendance (Kehadiran)**
- **Status**: ✅ Terintegrasi
- **Kaitan**: Attendance menggunakan `scheduleId` untuk mengetahui jadwal mana yang dihadiri
- **Penggunaan**: Filter attendance berdasarkan schedule, tracking kehadiran per jadwal

### 2. **Student Portal & Mobile API**
- **Status**: ✅ Terintegrasi
- **Kaitan**: Menampilkan jadwal siswa berdasarkan kelas mereka
- **Penggunaan**: 
  - Student Portal: `/student-portal/schedule`
  - Mobile API: `/mobile/schedule`
  - Grouping by day of week

### 3. **Classes (Kelas)**
- **Status**: ✅ Terintegrasi
- **Kaitan**: Setiap jadwal terkait dengan satu kelas
- **Penggunaan**: Filter jadwal per kelas, melihat jadwal kelas

### 4. **Teachers (Guru)**
- **Status**: ✅ Terintegrasi
- **Kaitan**: Setiap jadwal memiliki guru pengajar
- **Penggunaan**: Filter jadwal per guru, melihat beban mengajar guru

### 5. **Subjects (Mata Pelajaran)**
- **Status**: ✅ Terintegrasi
- **Kaitan**: Setiap jadwal untuk satu mata pelajaran
- **Penggunaan**: Filter jadwal per mata pelajaran

### 6. **Exams (Ujian)**
- **Status**: ⚠️ Terpisah (ExamSchedule entity sendiri)
- **Kaitan**: Belum terintegrasi dengan Schedule utama
- **Potensi**: Bisa link ke Schedule untuk konflik jadwal

### 7. **Curriculum (Kurikulum)**
- **Status**: ⚠️ Terpisah (CurriculumSchedule entity sendiri)
- **Kaitan**: CurriculumSchedule untuk pembelajaran harian, Schedule untuk jadwal rutin
- **Potensi**: Bisa sinkronisasi atau link antara keduanya

### 8. **Grades (Nilai)**
- **Status**: ❌ Belum terintegrasi
- **Kaitan**: Belum ada relasi langsung
- **Potensi**: Bisa link assignment/grade ke schedule tertentu

---

## 🚀 Roadmap Pengembangan

### Phase 1: Validasi & Konflik Jadwal (Priority: HIGH)

#### 1.1 Validasi Konflik Jadwal
- [ ] **Konflik Guru**: Cek apakah guru sudah ada jadwal di waktu yang sama
- [ ] **Konflik Kelas**: Cek apakah kelas sudah ada jadwal di waktu yang sama
- [ ] **Konflik Ruangan**: Cek apakah ruangan sudah digunakan di waktu yang sama
- [ ] **Validasi Waktu**: Start time harus < end time
- [ ] **Validasi Hari**: Day of week harus valid (0-6)

**File yang perlu dimodifikasi:**
- `src/modules/schedules/schedules.service.ts` - Tambah method `checkConflict()`
- `src/modules/schedules/dto/create-schedule.dto.ts` - Tambah validasi
- `src/modules/schedules/schedules.controller.ts` - Handle error konflik

#### 1.2 Endpoint Validasi
```typescript
POST /schedules/check-conflict
Body: { classId, teacherId, dayOfWeek, startTime, endTime, room }
Response: { hasConflict: boolean, conflicts: [...] }
```

### Phase 2: Integrasi dengan Modul Lain (Priority: MEDIUM)

#### 2.1 Integrasi dengan Grades
- [ ] Tambah relasi `scheduleId` di `StudentGrade` entity (optional)
- [ ] Filter grades berdasarkan schedule
- [ ] Tampilkan assignment yang terkait dengan jadwal

#### 2.2 Integrasi dengan Curriculum Schedule
- [ ] Link CurriculumSchedule dengan Schedule
- [ ] Sinkronisasi jadwal rutin dengan pembelajaran harian
- [ ] Auto-generate CurriculumSchedule dari Schedule

#### 2.3 Integrasi dengan Exams
- [ ] Cek konflik jadwal ujian dengan jadwal rutin
- [ ] Notifikasi jika ada jadwal ujian di waktu yang sama

### Phase 3: Fitur Advanced (Priority: MEDIUM-LOW)

#### 3.1 Jadwal Pengganti (Substitute)
- [ ] Entity `ScheduleSubstitute` untuk jadwal pengganti
- [ ] Fitur request substitute (guru sakit/izin)
- [ ] Approval workflow untuk substitute
- [ ] Notifikasi ke siswa tentang perubahan jadwal

#### 3.2 Recurring Schedules
- [ ] Support untuk jadwal yang berulang (weekly, bi-weekly)
- [ ] Bulk create schedules untuk satu semester
- [ ] Template jadwal per kelas

#### 3.3 Calendar View
- [ ] Endpoint untuk calendar view (monthly/weekly)
- [ ] Frontend calendar component
- [ ] Drag & drop untuk reschedule

#### 3.4 Notification & Reminder
- [ ] Notifikasi jadwal hari ini ke siswa
- [ ] Reminder jadwal besok ke guru
- [ ] Notifikasi perubahan jadwal
- [ ] Integration dengan notification service

### Phase 4: Analytics & Reporting (Priority: LOW)

#### 4.1 Schedule Analytics
- [ ] Dashboard jadwal per guru (beban mengajar)
- [ ] Dashboard jadwal per kelas
- [ ] Statistik penggunaan ruangan
- [ ] Report konflik jadwal

#### 4.2 Schedule Optimization
- [ ] Saran optimalisasi jadwal
- [ ] Deteksi gap waktu yang tidak efisien
- [ ] Rekomendasi distribusi jadwal

---

## 📝 Detail Implementasi

### 1. Validasi Konflik Jadwal

**Service Method:**
```typescript
async checkScheduleConflict(
  classId: number,
  teacherId: number,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  room: string,
  excludeScheduleId?: number,
  instansiId: number
): Promise<{ hasConflict: boolean; conflicts: ConflictInfo[] }>
```

**Conflict Types:**
- Teacher conflict: Guru sudah ada jadwal di waktu yang sama
- Class conflict: Kelas sudah ada jadwal di waktu yang sama
- Room conflict: Ruangan sudah digunakan di waktu yang sama

### 2. Integrasi dengan Grades

**Modifikasi Entity:**
```typescript
// src/modules/grades/entities/student-grade.entity.ts
@Column({ nullable: true })
scheduleId?: number;

@ManyToOne(() => Schedule, { nullable: true })
@JoinColumn({ name: 'schedule_id' })
schedule?: Schedule;
```

### 3. Schedule Substitute

**Entity Baru:**
```typescript
@Entity('schedule_substitutes')
export class ScheduleSubstitute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalScheduleId: number;

  @Column()
  substituteTeacherId: number;

  @Column({ type: 'date' })
  substituteDate: Date;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  @Column({ nullable: true })
  reason: string;

  // ... relations
}
```

### 4. Calendar View API

**Endpoint:**
```typescript
GET /schedules/calendar
Query: { month, year, classId?, teacherId? }
Response: { 
  schedules: Schedule[],
  groupedByDate: { [date: string]: Schedule[] }
}
```

---

## 🎯 Prioritas Implementasi

### Immediate (1-2 minggu)
1. ✅ Validasi konflik jadwal (guru, kelas, ruangan)
2. ✅ Error handling yang lebih baik
3. ✅ Frontend menggunakan ModulePageShell (konsistensi)

### Short Term (1 bulan)
1. ✅ Integrasi dengan Grades (optional scheduleId)
2. ✅ Calendar view endpoint
3. ✅ Schedule analytics dashboard

### Medium Term (2-3 bulan)
1. ✅ Schedule Substitute feature
2. ✅ Recurring schedules
3. ✅ Notification system

### Long Term (3+ bulan)
1. ✅ Schedule optimization
2. ✅ Advanced analytics
3. ✅ AI-powered schedule suggestions

---

## 🔧 Technical Debt & Improvements

### Current Issues
1. ❌ Tidak ada validasi konflik jadwal
2. ❌ Frontend schedules page tidak konsisten (tidak pakai ModulePageShell)
3. ❌ Tidak ada endpoint untuk calendar view
4. ❌ Tidak ada relasi dengan Grades/Assignments
5. ❌ Tidak ada fitur substitute/pengganti

### Code Quality
- ✅ Service layer sudah baik
- ✅ Controller sudah baik
- ⚠️ Perlu validasi lebih ketat
- ⚠️ Perlu error handling yang lebih baik

---

## 📚 Referensi Modul Terkait

1. **Attendance Module** - `src/modules/attendance/`
2. **Student Portal** - `src/modules/student-portal/`
3. **Mobile API** - `src/modules/mobile-api/`
4. **Exams Module** - `src/modules/exams/` (ExamSchedule)
5. **Curriculum Module** - `src/modules/curriculum/` (CurriculumSchedule)

---

## 💡 Kesimpulan

Modul Jadwal sudah memiliki **fondasi yang kuat** dengan relasi ke modul utama (Classes, Teachers, Subjects, Attendance). Namun masih ada **peluang pengembangan** yang signifikan:

1. **Validasi & Konflik** - Prioritas tertinggi untuk mencegah jadwal bentrok
2. **Integrasi** - Perlu lebih terintegrasi dengan Grades dan Curriculum
3. **Fitur Advanced** - Substitute, recurring, calendar view
4. **Analytics** - Dashboard dan reporting untuk insight

Dengan implementasi roadmap ini, modul jadwal akan menjadi **core module** yang lebih powerful dan terintegrasi dengan seluruh sistem.

