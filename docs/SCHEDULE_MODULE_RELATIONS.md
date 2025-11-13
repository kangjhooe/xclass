# Diagram Relasi Modul Jadwal

## 🗺️ Peta Kaitan Modul Jadwal

```
┌─────────────────────────────────────────────────────────────────┐
│                        MODUL JADWAL (Schedule)                   │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  ClassRoom   │  │   Subject    │  │   Teacher    │          │
│  │  (ManyToOne) │  │  (ManyToOne) │  │  (ManyToOne) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Attendance (OneToMany)                      │   │
│  │  - Setiap jadwal bisa punya banyak kehadiran             │   │
│  │  - Tracking kehadiran siswa per jadwal                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Student Portal│    │  Mobile API    │    │  Attendance   │
│               │    │                │    │    Module     │
│ - View jadwal │    │ - View jadwal  │    │ - Filter by   │
│   per hari    │    │   untuk app    │    │   schedule    │
│ - Group by    │    │ - Group by day │    │ - Track       │
│   day of week │    │                │    │   attendance │
└───────────────┘    └───────────────┘    └───────────────┘
```

## 📊 Status Integrasi

### ✅ Sudah Terintegrasi

| Modul | Status | Keterangan |
|-------|--------|------------|
| **Attendance** | ✅ | Menggunakan `scheduleId`, filter attendance by schedule |
| **Student Portal** | ✅ | Menampilkan jadwal siswa berdasarkan kelas |
| **Mobile API** | ✅ | Endpoint `/mobile/schedule` untuk mobile app |
| **Classes** | ✅ | Relasi `classRoom.schedules` |
| **Teachers** | ✅ | Relasi `teacher.schedules` |
| **Subjects** | ✅ | Relasi `subject.schedules` |

### ⚠️ Terpisah (Potensi Integrasi)

| Modul | Status | Keterangan |
|-------|--------|------------|
| **Exams** | ⚠️ | Punya `ExamSchedule` sendiri, belum link ke Schedule |
| **Curriculum** | ⚠️ | Punya `CurriculumSchedule` sendiri, untuk pembelajaran harian |

### ❌ Belum Terintegrasi

| Modul | Status | Potensi |
|-------|--------|---------|
| **Grades** | ❌ | Bisa link assignment/grade ke schedule tertentu |
| **Assignments** | ❌ | Bisa assign tugas berdasarkan jadwal |
| **Notifications** | ❌ | Notifikasi jadwal hari ini/besok |

## 🔄 Flow Data

### 1. Flow Membuat Jadwal
```
User Input → CreateScheduleDto
    ↓
SchedulesService.create()
    ↓
Validasi (belum ada) → Check Conflict (perlu ditambah)
    ↓
Save to Database
    ↓
Return Schedule dengan relations (classRoom, subject, teacher)
```

### 2. Flow Menampilkan Jadwal Siswa
```
Student Login → Get Student by email
    ↓
Get Student.classId
    ↓
SchedulesService.findAll({ classId })
    ↓
Group by dayOfWeek
    ↓
Return grouped schedules
```

### 3. Flow Absensi Berdasarkan Jadwal
```
User Input → CreateAttendanceDto (scheduleId, studentId, date)
    ↓
AttendanceService.create()
    ↓
Link ke Schedule
    ↓
Save Attendance
    ↓
Schedule.attendances[] updated
```

## 🎯 Use Cases

### Use Case 1: Guru Melihat Jadwal Mengajar
```
GET /schedules?teacherId=123
→ Filter semua jadwal guru tersebut
→ Tampilkan per hari
→ Bisa lihat beban mengajar
```

### Use Case 2: Siswa Melihat Jadwal Kelas
```
GET /student-portal/schedule
→ Get student by email
→ Get schedules by classId
→ Group by day
→ Tampilkan di calendar view
```

### Use Case 3: Admin Membuat Jadwal Baru
```
POST /schedules
Body: { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room }
→ Validasi (perlu ditambah: check conflict)
→ Create schedule
→ Return dengan relations
```

### Use Case 4: Tracking Kehadiran per Jadwal
```
GET /attendance?scheduleId=456&date=2024-01-15
→ Filter attendance by schedule dan tanggal
→ Tampilkan siapa yang hadir/tidak hadir
→ Bisa update status kehadiran
```

## 🚀 Pengembangan yang Disarankan

### Priority 1: Validasi & Konflik
```
┌─────────────────────────────────────┐
│  Check Schedule Conflict            │
│                                     │
│  ✓ Teacher conflict?               │
│  ✓ Class conflict?                  │
│  ✓ Room conflict?                   │
│  ✓ Time overlap?                    │
└─────────────────────────────────────┘
```

### Priority 2: Integrasi Grades
```
Schedule ──→ StudentGrade (optional)
    │              │
    │              └─→ Assignment untuk jadwal ini
    │
    └─→ Bisa filter grades by schedule
```

### Priority 3: Schedule Substitute
```
Original Schedule ──→ ScheduleSubstitute
    │                      │
    │                      └─→ Substitute Teacher
    │                      └─→ Status: pending/approved
    │
    └─→ Notifikasi ke siswa
```

### Priority 4: Calendar View
```
GET /schedules/calendar?month=1&year=2024
    ↓
Return: {
  "2024-01-15": [schedule1, schedule2],
  "2024-01-16": [schedule3],
  ...
}
```

## 📈 Metrik & Analytics Potensial

1. **Beban Mengajar Guru**
   - Total jam mengajar per minggu
   - Distribusi jadwal per hari
   - Kelas yang diampu

2. **Penggunaan Ruangan**
   - Ruangan paling sering digunakan
   - Ruangan yang kosong
   - Konflik penggunaan ruangan

3. **Distribusi Jadwal Kelas**
   - Total jam pelajaran per kelas
   - Mata pelajaran per hari
   - Gap waktu yang tidak efisien

4. **Kehadiran per Jadwal**
   - Rate kehadiran per jadwal
   - Jadwal dengan absensi tinggi
   - Trend kehadiran

## 🔗 API Endpoints Saat Ini

### Schedules Module
- `GET /schedules` - List semua jadwal (filter: classId, teacherId, dayOfWeek)
- `GET /schedules/:id` - Detail jadwal
- `POST /schedules` - Buat jadwal baru
- `PATCH /schedules/:id` - Update jadwal
- `DELETE /schedules/:id` - Hapus jadwal

### Student Portal
- `GET /student-portal/schedule` - Jadwal siswa (grouped by day)

### Mobile API
- `GET /mobile/schedule` - Jadwal untuk mobile app

## 💡 Kesimpulan

Modul Jadwal adalah **core module** yang terhubung ke banyak modul lain. Saat ini sudah terintegrasi dengan baik untuk use case dasar, tapi masih ada banyak peluang pengembangan untuk membuatnya lebih powerful dan user-friendly.

**Next Steps:**
1. Implement validasi konflik jadwal
2. Tambah integrasi dengan Grades
3. Buat calendar view
4. Implement schedule substitute
5. Tambah analytics dashboard

