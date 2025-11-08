# Modul E-Learning

Modul E-Learning menyediakan sistem pembelajaran online yang lengkap untuk sekolah dengan berbagai fitur pembelajaran digital.

## Fitur Utama

### 1. Course Management (Manajemen Kursus)
- Buat, edit, hapus kursus
- Pengaturan kursus (deskripsi, silabus, level, kategori)
- Enrollment siswa per kursus
- Status kursus (Draft, Published, Archived)

### 2. Content Management (Materi Pembelajaran)
- Upload materi dalam berbagai format (PDF, PowerPoint, gambar, link)
- Struktur materi per bab
- Preview dan download materi
- Pengaturan urutan materi

### 3. Video Learning
- Upload video pembelajaran
- Streaming video (YouTube/Vimeo atau self-hosted)
- Progress tracking video
- Resume dari posisi terakhir
- Subtitle support

### 4. Assignment Management (Tugas)
- Buat tugas dengan deadline
- Upload file jawaban
- Penilaian manual oleh guru
- **Integrasi dengan modul penilaian** - nilai otomatis masuk ke gradebook
- Feedback dan komentar

### 5. Quiz/Exercise (Latihan)
- Quiz formatif (latihan ringan)
- Multiple choice, true/false, essay
- Auto-grading untuk pilihan ganda
- Review jawaban langsung
- Integrasi opsional ke modul penilaian

### 6. Forum Diskusi
- Forum per kursus
- Thread diskusi per topik
- Reply dan tagging
- File attachment
- Notifikasi

### 7. Live Class/Virtual Meeting
- Jadwal kelas virtual
- Integrasi Zoom/Google Meet/Jitsi
- Recording (opsional)
- Absensi otomatis

### 8. Progress Tracking & Analytics
- Progress per kursus (% selesai)
- Dashboard siswa dan guru
- Statistik engagement
- Kompletasi materi

### 9. Announcement (Pengumuman)
- Pengumuman per kursus
- Broadcast ke semua siswa
- Notifikasi
- Priority/important

### 10. Resource Library
- Library sumber daya
- Kategori: ebook, video, link, template
- Pencarian dan filter

### 11. Certificate & Badge
- Sertifikat kelulusan kursus
- Badge/achievement
- Progress badge

### 12. Notes & Bookmark
- Catatan siswa per materi
- Bookmark materi
- Highlight

## Integrasi dengan Modul Lain

### Modul Penilaian
- **Assignment**: Nilai tugas otomatis masuk ke `student_grades` dengan `assignment_type = 'tugas'`
- **Quiz**: Opsional masuk ke penilaian sebagai nilai quiz
- Progress tracking bisa jadi komponen penilaian

### Modul Ujian Online
- Tidak duplikasi dengan modul ujian online
- E-learning fokus pada pembelajaran, ujian online untuk assessment formal
- Quiz di e-learning lebih ringan (latihan)

### Modul Academic
- Kursus terhubung dengan `subjects` dan `class_rooms`
- Enrollment berdasarkan kelas yang sudah ada

## Instalasi

1. **Jalankan Migration**
```bash
php artisan migrate
```

2. **Jalankan Seeder** (jika diperlukan)
```bash
php artisan db:seed --class=Modules\\ELearning\\Database\\Seeders\\ELearningDatabaseSeeder
```

3. **Update Tenant Module**
Pastikan modul e-learning sudah terdaftar di sistem:
```bash
php artisan db:seed --class=TenantModuleSeeder
```

## Struktur Database

Modul ini menggunakan tabel-tabel berikut:
- `courses` - Tabel kursus
- `course_enrollments` - Pendaftaran siswa ke kursus
- `course_materials` - Materi pembelajaran
- `course_videos` - Video pembelajaran
- `course_assignments` - Tugas
- `course_assignment_submissions` - Jawaban tugas siswa
- `course_quizzes` - Quiz latihan
- `course_quiz_questions` - Pertanyaan quiz
- `course_quiz_attempts` - Attempt quiz siswa
- `course_forums` - Forum diskusi
- `course_forum_posts` - Posting forum
- `course_announcements` - Pengumuman
- `course_progress` - Progress tracking siswa
- `course_live_classes` - Jadwal kelas virtual
- `course_resources` - Resource library
- `course_certificates` - Sertifikat
- `course_badges` - Badge/achievement
- `course_notes` - Catatan siswa
- `course_bookmarks` - Bookmark

## Routes

Semua routes memiliki prefix `{tenant}/elearning` dan dilindungi oleh middleware:
- `web`
- `auth`
- `tenant`
- `tenant.model.binding`
- `tenant.access:module,elearning`

## Permissions

Modul e-learning memiliki permissions:
- `create` - Buat kursus, materi, tugas, dll
- `read` - Lihat kursus dan konten
- `update` - Edit kursus dan konten
- `delete` - Hapus kursus dan konten
- `enroll` - Daftar ke kursus
- `grade` - Beri nilai tugas/quiz

## Penggunaan

### Untuk Guru
1. Buat kursus baru
2. Tambahkan materi pembelajaran
3. Upload video pembelajaran
4. Buat tugas dan quiz
5. Kelola forum diskusi
6. Lihat progress siswa

### Untuk Siswa
1. Daftar ke kursus yang tersedia
2. Akses materi dan video
3. Kerjakan tugas dan quiz
4. Berpartisipasi di forum
5. Lihat progress pembelajaran

## Kontribusi

Modul ini masih dalam pengembangan. Fitur tambahan akan ditambahkan secara bertahap.

