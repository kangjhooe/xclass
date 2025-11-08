# Struktur Menu Sidebar Admin Tenant

**Lokasi File:** `resources/views/layouts/tenant.blade.php`  
**Tanggal:** 2025-01-27

---

## 📋 Overview

Sidebar admin tenant memiliki struktur menu yang terorganisir dalam beberapa section. Menu ditampilkan berdasarkan:
- **Role user** (admin, teacher, student)
- **Module access** (permission untuk modul tertentu)
- **Tenant access** (modul yang diaktifkan untuk tenant)

---

## 🎯 Struktur Menu Lengkap

```
📱 SIDEBAR ADMIN TENANT
│
├── 🏠 Dashboard
│   └── Dashboard (fas fa-tachometer-alt)
│
├── 📊 DATA POKOK
│   ├── Dashboard Data Pokok (fas fa-database)
│   ├── Siswa (fas fa-user-graduate)
│   ├── Guru (fas fa-chalkboard-teacher)
│   ├── Supervisi Guru (fas fa-clipboard-check)
│   ├── Tugas Tambahan (fas fa-briefcase)
│   ├── Staf Non-Guru (fas fa-users)
│   ├── Mutasi Siswa (fas fa-exchange-alt) [Conditional]
│   └── Kelas (fas fa-door-open)
│
├── 📚 AKADEMIK
│   ├── Tahun Pelajaran (fas fa-calendar)
│   ├── Naik Kelas (fas fa-arrow-up)
│   ├── Mata Pelajaran (fas fa-book)
│   ├── Jadwal Pelajaran (fas fa-calendar-alt)
│   ├── Nilai Siswa (fas fa-chart-line)
│   ├── Bobot Nilai (fas fa-balance-scale)
│   │
│   ├── 📝 Ujian Online
│   │   ├── [Untuk Siswa]
│   │   │   └── Ujian Online (fas fa-clipboard-list)
│   │   │
│   │   └── [Untuk Admin/Guru] - Dropdown
│   │       ├── Dashboard
│   │       ├── Daftar Ujian
│   │       ├── Bank Soal
│   │       ├── ─────────────────
│   │       ├── Hasil Ujian
│   │       └── Buat Ujian Baru
│   │
│   └── Laporan Akademik (fas fa-chart-bar)
│
├── 🎓 BIDANG KHUSUS
│   ├── Kedisiplinan (fas fa-gavel) [Conditional]
│   ├── Bimbingan Konseling (BK) (fas fa-comments) [Conditional]
│   ├── Kesehatan (fas fa-heartbeat)
│   └── Ekstrakurikuler (fas fa-running)
│
├── 🏛️ SUMBER DAYA
│   ├── Perpustakaan (fas fa-book)
│   ├── SPP / Keuangan (fas fa-money-bill-wave)
│   │
│   ├── 👥 HR / SDM - Dropdown
│   │   ├── Dashboard HR
│   │   ├── Karyawan
│   │   └── Penggajian
│   │
│   ├── 📦 Inventori / Aset (fas fa-boxes) [Conditional]
│   │
│   ├── 🏢 Sarana Prasarana - Dropdown [Conditional]
│   │   ├── Dashboard
│   │   ├── Lahan
│   │   ├── Gedung
│   │   └── Ruangan
│   │
│   ├── 🚌 Transportasi (fas fa-bus)
│   ├── 📧 Persuratan - Dropdown [Conditional]
│   │   ├── Dashboard
│   │   ├── Surat Masuk
│   │   ├── Surat Keluar
│   │   ├── ─────────────────
│   │   ├── Template Surat
│   │   └── Pengaturan Nomor
│   │
│   └── 🍽️ Kafetaria (fas fa-utensils)
│
├── 📅 KEGIATAN & ADMINISTRASI
│   ├── 📖 Buku Tamu - Dropdown
│   │   ├── Dashboard
│   │   ├── Daftar Tamu
│   │   └── Tambah Tamu
│   │
│   ├── 📅 Event / Agenda (fas fa-calendar)
│   ├── 🎓 Alumni (fas fa-graduation-cap)
│   │
│   ├── 👨‍🎓 PPDB / SPMB - Dropdown
│   │   ├── Dashboard
│   │   ├── Data Pendaftar
│   │   ├── ─────────────────
│   │   └── Konfigurasi
│   │
│   └── 🎉 Pengumuman Kelulusan (fas fa-certificate)
│
├── ⚙️ PENGATURAN
│   ├── Profil Instansi (fas fa-building)
│   ├── Absensi (fas fa-clipboard-check)
│   │
│   └── 📊 Laporan - Dropdown
│       ├── Dashboard Laporan
│       ├── ─────────────────
│       ├── Prestasi Akademik
│       ├── Kehadiran
│       ├── Prestasi Siswa
│       └── Beban Kerja Guru
│
├── 🌐 DAN LAINNYA
│   └── Portal Orang Tua (fas fa-users)
│
└── 🌍 HALAMAN PUBLIK
    ├── Website Publik (fas fa-globe)
    ├── Kelola Tema (fas fa-palette)
    ├── Berita (fas fa-newspaper)
    ├── Galeri (fas fa-images)
    ├── Tentang Kami (fas fa-info-circle)
    ├── PPDB / SPMB (fas fa-user-graduate)
    └── Kontak (fas fa-envelope)
```

---

## 📝 Detail Menu Item

### 1. Dashboard
- **Route:** `tenant.dashboard`
- **Icon:** `fas fa-tachometer-alt`
- **Access:** Selalu tersedia untuk semua user

---

### 2. Data Pokok

#### Dashboard Data Pokok
- **Route:** `tenant.data-pokok.index`
- **Icon:** `fas fa-database`

#### Siswa
- **Route:** `tenant.students.index`
- **Icon:** `fas fa-user-graduate`
- **Permission:** `module:students`

#### Guru
- **Route:** `tenant.teachers.index`
- **Icon:** `fas fa-chalkboard-teacher`
- **Permission:** `module:teachers`

#### Supervisi Guru
- **Route:** `tenant.teacher-supervisions.index`
- **Icon:** `fas fa-clipboard-check`
- **Permission:** `module:teachers`

#### Tugas Tambahan
- **Route:** `tenant.additional-duties.index`
- **Icon:** `fas fa-briefcase`
- **Permission:** `permission:teachers:update`

#### Staf Non-Guru
- **Route:** `tenant.data-pokok.non-teaching-staff.index`
- **Icon:** `fas fa-users`
- **Permission:** `permission:data_pokok:read`

#### Mutasi Siswa
- **Route:** `tenant.data-pokok.mutasi-siswa.index`
- **Icon:** `fas fa-exchange-alt`
- **Permission:** `permission:data_pokok:mutasi`
- **Conditional:** Hanya muncul jika user memiliki permission `canManageMutasi()`

#### Kelas
- **Route:** `tenant.classes.index`
- **Icon:** `fas fa-door-open`
- **Permission:** `module:classes`

---

### 3. Akademik

#### Tahun Pelajaran
- **Route:** `tenant.academic-years.index`
- **Icon:** `fas fa-calendar`

#### Naik Kelas
- **Route:** `tenant.promotions.index`
- **Icon:** `fas fa-arrow-up`

#### Mata Pelajaran
- **Route:** `tenant.subjects.index`
- **Icon:** `fas fa-book`
- **Permission:** `module:subjects`

#### Jadwal Pelajaran
- **Route:** `tenant.schedules.index`
- **Icon:** `fas fa-calendar-alt`
- **Permission:** `module:schedules`

#### Nilai Siswa
- **Route:** `tenant.student-grades.index`
- **Icon:** `fas fa-chart-line`

#### Bobot Nilai
- **Route:** `tenant.grade-weights.index`
- **Icon:** `fas fa-balance-scale`

#### Ujian Online
**Untuk Siswa:**
- **Route:** `tenant.exam.index`
- **Icon:** `fas fa-clipboard-list`
- **Conditional:** Hanya muncul jika `auth()->user()->role === 'student'`

**Untuk Admin/Guru - Dropdown:**
- **Route Parent:** `tenant.exam.index`
- **Icon:** `fas fa-clipboard-list`
- **Sub-menu:**
  - Dashboard → `tenant.exam.index`
  - Daftar Ujian → `tenant.exam.exams.index`
  - Bank Soal → `tenant.exam.questions`
  - ─────────────────
  - Hasil Ujian → `tenant.exam.attempts.index`
  - Buat Ujian Baru → `tenant.exam.exams.create`

#### Laporan Akademik
- **Route:** `tenant.academic-reports.dashboard`
- **Icon:** `fas fa-chart-bar`

---

### 4. Bidang Khusus

#### Kedisiplinan
- **Route:** `tenant.discipline.index`
- **Icon:** `fas fa-gavel`
- **Conditional:** 
  - `role === 'school_admin'` OR
  - `role === 'super_admin'` OR
  - `(role === 'teacher' && teacher_has_module_access('discipline'))`

#### Bimbingan Konseling (BK)
- **Route:** `tenant.counseling.index`
- **Icon:** `fas fa-comments`
- **Conditional:** 
  - `role === 'school_admin'` OR
  - `role === 'super_admin'` OR
  - `(role === 'teacher' && teacher_has_module_access('counseling'))`

#### Kesehatan
- **Route:** `tenant.health.index`
- **Icon:** `fas fa-heartbeat`
- **Permission:** `module:health`

#### Ekstrakurikuler
- **Route:** `tenant.extracurricular.index`
- **Icon:** `fas fa-running`
- **Permission:** `module:extracurricular`

---

### 5. Sumber Daya

#### Perpustakaan
- **Route:** `tenant.library.index`
- **Icon:** `fas fa-book`
- **Permission:** `module:library`

#### SPP / Keuangan
- **Route:** `tenant.spp.index`
- **Icon:** `fas fa-money-bill-wave`
- **Permission:** `module:spp`

#### HR / SDM - Dropdown
- **Route Parent:** `tenant.hr.index`
- **Icon:** `fas fa-users-cog`
- **Permission:** `module:hr`
- **Sub-menu:**
  - Dashboard HR → `tenant.hr.index`
  - Karyawan → `tenant.hr.employees`
  - Penggajian → `tenant.hr.payroll`

#### Inventori / Aset
- **Route:** `tenant.inventory.index`
- **Icon:** `fas fa-boxes`
- **Permission:** `module:inventory`
- **Conditional:** 
  - `role === 'school_admin'` OR
  - `role === 'super_admin'` OR
  - `(role === 'teacher' && teacher_has_module_access('inventory'))`

#### Sarana Prasarana - Dropdown
- **Route Parent:** `facility.index`
- **Icon:** `fas fa-building`
- **Permission:** `module:facility`
- **Conditional:** 
  - `role === 'school_admin'` OR
  - `role === 'super_admin'` OR
  - `(role === 'teacher' && teacher_has_module_access('facility'))`
- **Sub-menu:**
  - Dashboard → `facility.index`
  - Lahan → `facility.lands`
  - Gedung → `facility.buildings`
  - Ruangan → `facility.rooms`

#### Transportasi
- **Route:** `tenant.transportation.index`
- **Icon:** `fas fa-bus`
- **Permission:** `module:transportation`

#### Persuratan - Dropdown
- **Route Parent:** `tenant.letters.dashboard`
- **Icon:** `fas fa-envelope`
- **Permission:** `module:correspondence`
- **Conditional:** 
  - `role === 'school_admin'` OR
  - `role === 'super_admin'` OR
  - `(role === 'teacher' && teacher_has_module_access('correspondence'))`
- **Sub-menu:**
  - Dashboard → `tenant.letters.dashboard`
  - Surat Masuk → `tenant.letters.incoming.index`
  - Surat Keluar → `tenant.letters.outgoing.index`
  - ─────────────────
  - Template Surat → `tenant.letters.templates.index`
  - Pengaturan Nomor → `tenant.letters.settings.number-settings.index`

#### Kafetaria
- **Route:** `tenant.cafeteria.index`
- **Icon:** `fas fa-utensils`
- **Permission:** `module:cafeteria`

---

### 6. Kegiatan & Administrasi

#### Buku Tamu - Dropdown
- **Route Parent:** `tenant.guest-book.dashboard`
- **Icon:** `fas fa-book`
- **Sub-menu:**
  - Dashboard → `tenant.guest-book.dashboard`
  - Daftar Tamu → `tenant.guest-book.index`
  - Tambah Tamu → `tenant.guest-book.create`

#### Event / Agenda
- **Route:** `tenant.events.index`
- **Icon:** `fas fa-calendar`
- **Permission:** `module:events`

#### Alumni
- **Route:** `tenant.alumni.index`
- **Icon:** `fas fa-graduation-cap`
- **Permission:** `module:alumni`

#### PPDB / SPMB - Dropdown
- **Route Parent:** `tenant.ppdb.dashboard`
- **Icon:** `fas fa-user-graduate`
- **Permission:** `module:ppdb`
- **Sub-menu:**
  - Dashboard → `tenant.ppdb.dashboard`
  - Data Pendaftar → `tenant.ppdb.index`
  - ─────────────────
  - Konfigurasi → `tenant.ppdb.configuration`

#### Pengumuman Kelulusan
- **Route:** `tenant.graduation.index`
- **Icon:** `fas fa-certificate`
- **Permission:** `module:graduation`

---

### 7. Pengaturan

#### Profil Instansi
- **Route:** `settings.index`
- **Icon:** `fas fa-building`

#### Absensi
- **Route:** `tenant.attendances.index`
- **Icon:** `fas fa-clipboard-check`
- **Permission:** `module:attendance`

#### Laporan - Dropdown
- **Route Parent:** `tenant.reports.dashboard`
- **Icon:** `fas fa-chart-bar`
- **Permission:** `module:report`
- **Sub-menu:**
  - Dashboard Laporan → `tenant.reports.dashboard`
  - ─────────────────
  - Prestasi Akademik → `tenant.reports.academic-performance`
  - Kehadiran → `tenant.reports.attendance`
  - Prestasi Siswa → `tenant.reports.student-performance`
  - Beban Kerja Guru → `tenant.reports.teacher-workload`

---

### 8. Dan Lainnya

#### Portal Orang Tua
- **Route:** `tenant.parent-portal.index`
- **Icon:** `fas fa-users`
- **Permission:** `module:parent_portal`

---

### 9. Halaman Publik

#### Website Publik
- **Route:** `tenant.public-page.profile.show`
- **Icon:** `fas fa-globe`

#### Kelola Tema
- **Route:** `tenant.public-page.themes.index`
- **Icon:** `fas fa-palette`

#### Berita
- **Route:** `public.news.index`
- **Icon:** `fas fa-newspaper`

#### Galeri
- **Route:** `public.gallery.index`
- **Icon:** `fas fa-images`

#### Tentang Kami
- **Route:** `public.about`
- **Icon:** `fas fa-info-circle`

#### PPDB / SPMB (Public)
- **Route:** `public.ppdb.index`
- **Icon:** `fas fa-user-graduate`

#### Kontak
- **Route:** `public.contact`
- **Icon:** `fas fa-envelope`

---

## 🔐 Kondisi Akses Menu

### Menu yang Conditional (Muncul berdasarkan kondisi):

1. **Mutasi Siswa**
   - Hanya muncul jika user memiliki permission `canManageMutasi()`

2. **Ujian Online**
   - Untuk siswa: Menu sederhana
   - Untuk admin/guru: Menu dropdown dengan sub-menu

3. **Kedisiplinan**
   - Hanya untuk: `school_admin`, `super_admin`, atau teacher dengan akses module

4. **Bimbingan Konseling**
   - Hanya untuk: `school_admin`, `super_admin`, atau teacher dengan akses module

5. **Inventori / Aset**
   - Hanya untuk: `school_admin`, `super_admin`, atau teacher dengan akses module

6. **Sarana Prasarana**
   - Hanya untuk: `school_admin`, `super_admin`, atau teacher dengan akses module

7. **Persuratan**
   - Hanya untuk: `school_admin`, `super_admin`, atau teacher dengan akses module

---

## 📊 Statistik Menu

- **Total Menu Items:** ~50+ menu items
- **Menu dengan Dropdown:** 6 menu
- **Menu Conditional:** 7 menu
- **Menu Section:** 9 section utama
- **Menu dengan Permission:** Semua menu (kecuali Dashboard)

---

## 🎨 Fitur Sidebar

1. **Search Box**
   - Pencarian menu real-time
   - Filter menu berdasarkan keyword

2. **Collapse/Expand**
   - Toggle untuk collapse sidebar
   - State disimpan di localStorage

3. **Active State**
   - Highlight menu aktif berdasarkan route
   - Active class: `active`

4. **Responsive Design**
   - Mobile-friendly
   - Hamburger menu untuk mobile

5. **Icons**
   - Semua menu menggunakan Font Awesome icons
   - Konsisten dan modern

---

## 📝 Catatan Implementasi

1. **Menu dinamis berdasarkan:**
   - Role user (admin, teacher, student)
   - Module access (permission)
   - Tenant module activation

2. **Helper Functions:**
   - `tenant_route()` - Generate tenant route
   - `teacher_has_module_access()` - Check teacher module access
   - `\App\Helpers\RbacHelper::canManageMutasi()` - Check mutasi permission

3. **Route Naming:**
   - Semua route menggunakan prefix `tenant.`
   - Route pattern: `tenant.{module}.{action}`

4. **Menu Sections:**
   - Section header menggunakan class `menu-section`
   - Styling khusus untuk section headers

---

**Dibuat oleh:** AI Assistant  
**Tanggal:** 2025-01-27  
**Versi:** 1.0

