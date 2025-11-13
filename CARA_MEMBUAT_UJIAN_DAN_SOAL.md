# 📝 Cara Membuat Ujian dan Soal

## 📋 Alur Pembuatan Ujian Online

### **Langkah 1: Membuat Ujian (Exam)**

1. **Akses Halaman Ujian**
   - Login sebagai Admin/Guru
   - Navigasi ke: `/exams` (halaman manajemen ujian)

2. **Klik "Tambah Ujian"**
   - Form akan muncul dengan field:
     - **Judul Ujian** (wajib)
     - **Deskripsi** (opsional)
     - **Mata Pelajaran** (opsional - untuk filtering)
     - **Kelas** (opsional - untuk filtering)
     - **Tanggal Mulai** (wajib - datetime)
     - **Tanggal Selesai** (wajib - datetime)
     - **Durasi** (menit) - default: 60
     - **Jumlah Soal** (opsional - untuk informasi)
     - **Nilai Lulus** (persentase) - default: 60%

3. **Simpan Ujian**
   - Ujian akan dibuat dengan status `DRAFT`
   - Ujian belum bisa dikerjakan siswa sampai dibuat Schedule dan Soal

### **Langkah 2: Membuat Schedule (Jadwal Ujian)**

Schedule menghubungkan ujian dengan kelas, mata pelajaran, dan guru tertentu.

**Via Backend API:**
```typescript
POST /exams/:examId/schedules
{
  examId: number,
  classId: number,
  subjectId: number,
  teacherId: number,
  startTime: string (datetime),
  endTime: string (datetime),
  duration: number (menit),
  totalQuestions: number,
  passingScore: number,
  instructions?: string,
  maxAttempts?: number (default: 1)
}
```

**Field Penting:**
- `classId`: Kelas yang akan mengerjakan ujian
- `subjectId`: Mata pelajaran ujian
- `teacherId`: Guru yang bertanggung jawab
- `startTime` & `endTime`: Waktu kapan ujian bisa dikerjakan
- `duration`: Durasi pengerjaan (menit)
- `maxAttempts`: Maksimal percobaan (default: 1)

### **Langkah 3: Membuat Soal (Questions)**

Soal dibuat per ujian. Setiap soal memiliki:

**Tipe Soal yang Didukung:**
1. **Multiple Choice** (`multiple_choice`) - Pilihan ganda
2. **True/False** (`true_false`) - Benar/Salah
3. **Essay** (`essay`) - Uraian
4. **Fill Blank** (`fill_blank`) - Isian singkat
5. **Matching** (`matching`) - Menjodohkan

**Struktur Soal:**
```typescript
{
  examId: number,
  questionText: string,        // Teks pertanyaan
  questionType: QuestionType,  // Tipe soal
  options?: {                  // Untuk multiple choice
    "A": "Jawaban A",
    "B": "Jawaban B",
    "C": "Jawaban C",
    "D": "Jawaban D"
  },
  correctAnswer: string,       // Jawaban benar (key untuk MC, atau teks untuk essay)
  explanation?: string,        // Penjelasan jawaban
  points: number,              // Bobot nilai (default: 1)
  difficulty: 'easy' | 'medium' | 'hard',
  order: number,                // Urutan soal
  isActive: boolean
}
```

**Contoh Soal Multiple Choice:**
```json
{
  "examId": 1,
  "questionText": "Apa ibukota Indonesia?",
  "questionType": "multiple_choice",
  "options": {
    "A": "Jakarta",
    "B": "Bandung",
    "C": "Surabaya",
    "D": "Yogyakarta"
  },
  "correctAnswer": "A",
  "explanation": "Jakarta adalah ibukota Indonesia sejak tahun 1945",
  "points": 10,
  "difficulty": "easy",
  "order": 1
}
```

**Contoh Soal Essay:**
```json
{
  "examId": 1,
  "questionText": "Jelaskan proses fotosintesis!",
  "questionType": "essay",
  "correctAnswer": "Fotosintesis adalah proses...",
  "points": 20,
  "difficulty": "medium",
  "order": 2
}
```

## 🔄 Alur Lengkap

```
1. Admin/Guru Login
   ↓
2. Buat Ujian (Exam)
   - Isi informasi dasar
   - Status: DRAFT
   ↓
3. Buat Schedule
   - Tentukan kelas, mata pelajaran, guru
   - Set waktu mulai & selesai
   - Set durasi & max attempts
   ↓
4. Buat Soal-soal
   - Tambah soal satu per satu
   - Atau import bulk (jika tersedia)
   - Set jawaban benar & penjelasan
   ↓
5. Aktifkan Ujian
   - Ubah status dari DRAFT ke SCHEDULED/ONGOING
   ↓
6. Siswa Mengerjakan
   - Siswa melihat ujian di student portal
   - Mulai ujian sesuai jadwal
   - Submit jawaban
   ↓
7. Review Hasil
   - Guru/admin lihat hasil
   - Siswa lihat hasil (jika diizinkan)
```

## 📍 Endpoint API

### **Exam Management**
- `GET /exams` - List semua ujian
- `POST /exams` - Buat ujian baru
- `GET /exams/:id` - Detail ujian
- `PATCH /exams/:id` - Update ujian
- `DELETE /exams/:id` - Hapus ujian

### **Question Management**
- `GET /exams/:examId/questions` - List soal ujian
- `POST /exams/:examId/questions` - Tambah soal
- `GET /exams/questions/:questionId` - Detail soal
- `PATCH /exams/questions/:questionId` - Update soal
- `DELETE /exams/questions/:questionId` - Hapus soal

### **Schedule Management**
- `GET /exams/schedules` - List semua schedule
- `POST /exams/:examId/schedules` - Buat schedule
- `GET /exams/schedules/:scheduleId` - Detail schedule
- `PATCH /exams/schedules/:scheduleId` - Update schedule
- `DELETE /exams/schedules/:scheduleId` - Hapus schedule

## 🎯 Status Ujian

- **DRAFT**: Ujian masih dalam tahap pembuatan
- **SCHEDULED**: Ujian sudah dijadwalkan, belum dimulai
- **ONGOING**: Ujian sedang berlangsung
- **COMPLETED**: Ujian sudah selesai
- **CANCELLED**: Ujian dibatalkan

## ⚙️ Pengaturan Ujian

- **allowReview**: Siswa bisa review jawaban setelah submit
- **showCorrectAnswers**: Tampilkan jawaban benar setelah submit
- **randomizeQuestions**: Acak urutan soal untuk setiap siswa
- **randomizeAnswers**: Acak urutan pilihan jawaban (untuk MC)
- **maxAttempts**: Maksimal percobaan mengerjakan

## 💡 Tips

1. **Buat ujian dalam status DRAFT** dulu, baru tambahkan soal
2. **Set schedule** setelah semua soal selesai dibuat
3. **Test ujian** dengan membuat attempt sebagai admin sebelum publish
4. **Gunakan explanation** untuk membantu siswa belajar
5. **Set points** sesuai tingkat kesulitan soal
6. **Gunakan randomize** untuk mencegah kecurangan

