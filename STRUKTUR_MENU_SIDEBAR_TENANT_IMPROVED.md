# Struktur Menu Sidebar Admin Tenant - Revisi

**Versi:** 2.0 (Improved)  
**Tanggal:** 2025-01-27  
**Fokus:** Konsistensi, Keterbacaan, dan Profesionalitas

---

## 📋 Prinsip Perbaikan

1. ✅ **Hapus duplikasi "Dashboard"** - Setiap kategori tidak perlu sub-menu "Dashboard"
2. ✅ **Ikon konsisten** - Semua menggunakan Font Awesome 5 solid (`fas`)
3. ✅ **Penamaan seragam** - Tanpa redundansi dan lebih jelas
4. ✅ **Hierarki logis** - Grouping berdasarkan fungsi utama
5. ✅ **Komentar jelas** - Section comments untuk kejelasan

---

## 🎯 Struktur Menu Baru (Ringkas & Profesional)

```php
<?php
// ============================================
// STRUKTUR MENU SIDEBAR ADMIN TENANT
// ============================================

return [
    // ========================================
    // DASHBOARD
    // ========================================
    [
        'name' => 'Dashboard',
        'icon' => 'fas fa-tachometer-alt',
        'route' => 'tenant.dashboard',
        'type' => 'single',
    ],

    // ========================================
    // DATA POKOK
    // Manajemen data dasar sekolah
    // ========================================
    [
        'name' => 'Data Pokok',
        'icon' => 'fas fa-database',
        'route' => 'tenant.data-pokok.index',
        'type' => 'single',
    ],
    [
        'name' => 'Siswa',
        'icon' => 'fas fa-user-graduate',
        'route' => 'tenant.students.index',
        'type' => 'single',
        'permission' => 'module:students',
    ],
    [
        'name' => 'Guru',
        'icon' => 'fas fa-chalkboard-teacher',
        'route' => 'tenant.teachers.index',
        'type' => 'single',
        'permission' => 'module:teachers',
    ],
    [
        'name' => 'Kelas',
        'icon' => 'fas fa-door-open',
        'route' => 'tenant.classes.index',
        'type' => 'single',
        'permission' => 'module:classes',
    ],
    [
        'name' => 'Staf Non-Guru',
        'icon' => 'fas fa-users',
        'route' => 'tenant.data-pokok.non-teaching-staff.index',
        'type' => 'single',
        'permission' => 'data_pokok:read',
    ],
    [
        'name' => 'Supervisi Guru',
        'icon' => 'fas fa-clipboard-check',
        'route' => 'tenant.teacher-supervisions.index',
        'type' => 'single',
        'permission' => 'module:teachers',
    ],
    [
        'name' => 'Tugas Tambahan',
        'icon' => 'fas fa-briefcase',
        'route' => 'tenant.additional-duties.index',
        'type' => 'single',
        'permission' => 'teachers:update',
    ],
    [
        'name' => 'Mutasi Siswa',
        'icon' => 'fas fa-exchange-alt',
        'route' => 'tenant.data-pokok.mutasi-siswa.index',
        'type' => 'single',
        'permission' => 'data_pokok:mutasi',
        'conditional' => 'canManageMutasi',
    ],

    // ========================================
    // AKADEMIK
    // Manajemen kegiatan akademik dan pembelajaran
    // ========================================
    [
        'name' => 'Tahun Pelajaran',
        'icon' => 'fas fa-calendar-alt',
        'route' => 'tenant.academic-years.index',
        'type' => 'single',
    ],
    [
        'name' => 'Mata Pelajaran',
        'icon' => 'fas fa-book-open',
        'route' => 'tenant.subjects.index',
        'type' => 'single',
        'permission' => 'module:subjects',
    ],
    [
        'name' => 'Jadwal Pelajaran',
        'icon' => 'fas fa-calendar-week',
        'route' => 'tenant.schedules.index',
        'type' => 'single',
        'permission' => 'module:schedules',
    ],
    [
        'name' => 'Nilai Siswa',
        'icon' => 'fas fa-chart-line',
        'route' => 'tenant.student-grades.index',
        'type' => 'single',
    ],
    [
        'name' => 'Bobot Nilai',
        'icon' => 'fas fa-balance-scale',
        'route' => 'tenant.grade-weights.index',
        'type' => 'single',
    ],
    [
        'name' => 'Kenaikan Kelas',
        'icon' => 'fas fa-arrow-up',
        'route' => 'tenant.promotions.index',
        'type' => 'single',
    ],
    [
        'name' => 'Ujian Online',
        'icon' => 'fas fa-clipboard-list',
        'type' => 'dropdown',
        'route' => 'tenant.exam.index',
        'conditional_role' => ['admin', 'teacher'], // Dropdown untuk admin/guru
        'single_route' => 'tenant.exam.index', // Single untuk siswa
        'items' => [
            [
                'name' => 'Daftar Ujian',
                'icon' => 'fas fa-list',
                'route' => 'tenant.exam.exams.index',
            ],
            [
                'name' => 'Bank Soal',
                'icon' => 'fas fa-question-circle',
                'route' => 'tenant.exam.questions',
            ],
            [
                'name' => 'Hasil Ujian',
                'icon' => 'fas fa-chart-line',
                'route' => 'tenant.exam.attempts.index',
                'divider' => true, // Divider sebelum item ini
            ],
            [
                'name' => 'Buat Ujian Baru',
                'icon' => 'fas fa-plus-circle',
                'route' => 'tenant.exam.exams.create',
            ],
        ],
    ],
    [
        'name' => 'Laporan Akademik',
        'icon' => 'fas fa-chart-bar',
        'route' => 'tenant.academic-reports.dashboard',
        'type' => 'single',
    ],

    // ========================================
    // BIDANG KHUSUS
    // Program khusus di luar kurikulum inti
    // ========================================
    [
        'name' => 'Bimbingan Konseling',
        'icon' => 'fas fa-comments',
        'route' => 'tenant.counseling.index',
        'type' => 'single',
        'permission' => 'module:counseling',
        'conditional' => 'isBKAuthorized',
    ],
    [
        'name' => 'Kedisiplinan',
        'icon' => 'fas fa-gavel',
        'route' => 'tenant.discipline.index',
        'type' => 'single',
        'permission' => 'module:discipline',
        'conditional' => 'isDisciplineAuthorized',
    ],
    [
        'name' => 'Ekstrakurikuler',
        'icon' => 'fas fa-running',
        'route' => 'tenant.extracurricular.index',
        'type' => 'single',
        'permission' => 'module:extracurricular',
    ],
    [
        'name' => 'Kesehatan',
        'icon' => 'fas fa-heartbeat',
        'route' => 'tenant.health.index',
        'type' => 'single',
        'permission' => 'module:health',
    ],

    // ========================================
    // SUMBER DAYA & FASILITAS
    // Manajemen sumber daya dan infrastruktur sekolah
    // ========================================
    [
        'name' => 'Perpustakaan',
        'icon' => 'fas fa-book',
        'route' => 'tenant.library.index',
        'type' => 'single',
        'permission' => 'module:library',
    ],
    [
        'name' => 'SPP & Keuangan',
        'icon' => 'fas fa-money-bill-wave',
        'route' => 'tenant.spp.index',
        'type' => 'single',
        'permission' => 'module:spp',
    ],
    [
        'name' => 'SDM & HR',
        'icon' => 'fas fa-users-cog',
        'type' => 'dropdown',
        'route' => 'tenant.hr.index',
        'permission' => 'module:hr',
        'items' => [
            [
                'name' => 'Karyawan',
                'icon' => 'fas fa-user-tie',
                'route' => 'tenant.hr.employees',
            ],
            [
                'name' => 'Penggajian',
                'icon' => 'fas fa-money-check-alt',
                'route' => 'tenant.hr.payroll',
            ],
        ],
    ],
    [
        'name' => 'Inventori & Aset',
        'icon' => 'fas fa-boxes',
        'route' => 'tenant.inventory.index',
        'type' => 'single',
        'permission' => 'module:inventory',
        'conditional' => 'isInventoryAuthorized',
    ],
    [
        'name' => 'Sarana Prasarana',
        'icon' => 'fas fa-building',
        'type' => 'dropdown',
        'route' => 'facility.index',
        'permission' => 'module:facility',
        'conditional' => 'isFacilityAuthorized',
        'items' => [
            [
                'name' => 'Lahan',
                'icon' => 'fas fa-map',
                'route' => 'facility.lands',
            ],
            [
                'name' => 'Gedung',
                'icon' => 'fas fa-building',
                'route' => 'facility.buildings',
            ],
            [
                'name' => 'Ruangan',
                'icon' => 'fas fa-door-open',
                'route' => 'facility.rooms',
            ],
        ],
    ],
    [
        'name' => 'Transportasi',
        'icon' => 'fas fa-bus',
        'route' => 'tenant.transportation.index',
        'type' => 'single',
        'permission' => 'module:transportation',
    ],
    [
        'name' => 'Kafetaria',
        'icon' => 'fas fa-utensils',
        'route' => 'tenant.cafeteria.index',
        'type' => 'single',
        'permission' => 'module:cafeteria',
    ],
    [
        'name' => 'Persuratan',
        'icon' => 'fas fa-envelope-open-text',
        'type' => 'dropdown',
        'route' => 'tenant.letters.dashboard',
        'permission' => 'module:correspondence',
        'conditional' => 'isCorrespondenceAuthorized',
        'items' => [
            [
                'name' => 'Surat Masuk',
                'icon' => 'fas fa-inbox',
                'route' => 'tenant.letters.incoming.index',
            ],
            [
                'name' => 'Surat Keluar',
                'icon' => 'fas fa-paper-plane',
                'route' => 'tenant.letters.outgoing.index',
            ],
            [
                'name' => 'Template Surat',
                'icon' => 'fas fa-file-alt',
                'route' => 'tenant.letters.templates.index',
                'divider' => true,
            ],
            [
                'name' => 'Pengaturan Nomor',
                'icon' => 'fas fa-cog',
                'route' => 'tenant.letters.settings.number-settings.index',
            ],
        ],
    ],

    // ========================================
    // KEGIATAN & ADMINISTRASI
    // Manajemen kegiatan sekolah dan administrasi
    // ========================================
    [
        'name' => 'Event & Agenda',
        'icon' => 'fas fa-calendar-check',
        'route' => 'tenant.events.index',
        'type' => 'single',
        'permission' => 'module:events',
    ],
    [
        'name' => 'Buku Tamu',
        'icon' => 'fas fa-book-reader',
        'type' => 'dropdown',
        'route' => 'tenant.guest-book.index',
        'items' => [
            [
                'name' => 'Daftar Tamu',
                'icon' => 'fas fa-list',
                'route' => 'tenant.guest-book.index',
            ],
            [
                'name' => 'Tambah Tamu',
                'icon' => 'fas fa-user-plus',
                'route' => 'tenant.guest-book.create',
            ],
        ],
    ],
    [
        'name' => 'PPDB / SPMB',
        'icon' => 'fas fa-user-graduate',
        'type' => 'dropdown',
        'route' => 'tenant.ppdb.index',
        'permission' => 'module:ppdb',
        'items' => [
            [
                'name' => 'Data Pendaftar',
                'icon' => 'fas fa-users',
                'route' => 'tenant.ppdb.index',
            ],
            [
                'name' => 'Konfigurasi',
                'icon' => 'fas fa-cogs',
                'route' => 'tenant.ppdb.configuration',
                'divider' => true,
            ],
        ],
    ],
    [
        'name' => 'Alumni',
        'icon' => 'fas fa-graduation-cap',
        'route' => 'tenant.alumni.index',
        'type' => 'single',
        'permission' => 'module:alumni',
    ],
    [
        'name' => 'Pengumuman Kelulusan',
        'icon' => 'fas fa-certificate',
        'route' => 'tenant.graduation.index',
        'type' => 'single',
        'permission' => 'module:graduation',
    ],

    // ========================================
    // PENGATURAN & LAPORAN
    // Konfigurasi sistem dan laporan
    // ========================================
    [
        'name' => 'Absensi',
        'icon' => 'fas fa-clipboard-check',
        'route' => 'tenant.attendances.index',
        'type' => 'single',
        'permission' => 'module:attendance',
    ],
    [
        'name' => 'Laporan',
        'icon' => 'fas fa-chart-bar',
        'type' => 'dropdown',
        'route' => 'tenant.reports.dashboard',
        'permission' => 'module:report',
        'items' => [
            [
                'name' => 'Prestasi Akademik',
                'icon' => 'fas fa-graduation-cap',
                'route' => 'tenant.reports.academic-performance',
            ],
            [
                'name' => 'Kehadiran',
                'icon' => 'fas fa-calendar-check',
                'route' => 'tenant.reports.attendance',
            ],
            [
                'name' => 'Prestasi Siswa',
                'icon' => 'fas fa-user-graduate',
                'route' => 'tenant.reports.student-performance',
            ],
            [
                'name' => 'Beban Kerja Guru',
                'icon' => 'fas fa-chalkboard-teacher',
                'route' => 'tenant.reports.teacher-workload',
            ],
        ],
    ],
    [
        'name' => 'Profil Instansi',
        'icon' => 'fas fa-school',
        'route' => 'settings.index',
        'type' => 'single',
    ],
    [
        'name' => 'Portal Orang Tua',
        'icon' => 'fas fa-user-friends',
        'route' => 'tenant.parent-portal.index',
        'type' => 'single',
        'permission' => 'module:parent_portal',
    ],

    // ========================================
    // HALAMAN PUBLIK
    // Manajemen konten website publik
    // ========================================
    [
        'name' => 'Website Publik',
        'icon' => 'fas fa-globe',
        'route' => 'tenant.public-page.profile.show',
        'type' => 'single',
    ],
    [
        'name' => 'Berita',
        'icon' => 'fas fa-newspaper',
        'route' => 'public.news.index',
        'type' => 'single',
    ],
    [
        'name' => 'Galeri',
        'icon' => 'fas fa-images',
        'route' => 'public.gallery.index',
        'type' => 'single',
    ],
    [
        'name' => 'Tentang Kami',
        'icon' => 'fas fa-info-circle',
        'route' => 'public.about',
        'type' => 'single',
    ],
    [
        'name' => 'Kontak',
        'icon' => 'fas fa-envelope',
        'route' => 'public.contact',
        'type' => 'single',
    ],
];
```

---

## 📊 Ringkasan Perubahan

### ✅ Perbaikan yang Dilakukan:

1. **Penghapusan Duplikasi "Dashboard"**
   - ❌ "Dashboard Data Pokok" → ✅ "Data Pokok"
   - ❌ "Dashboard HR" → ✅ "SDM & HR" (dengan sub-menu langsung)
   - ❌ "Dashboard Laporan" → ✅ "Laporan" (dengan sub-menu langsung)
   - ❌ "Dashboard" di dropdown → ✅ Langsung ke item utama

2. **Ikon Konsisten (Font Awesome 5)**
   - Semua menggunakan `fas` (Font Awesome Solid)
   - Ikon yang lebih relevan dan konsisten
   - Contoh: `fa-calendar-alt` → `fa-calendar-week`, `fa-book` → `fa-book-open`

3. **Penamaan yang Lebih Jelas**
   - ❌ "SPP / Keuangan" → ✅ "SPP & Keuangan"
   - ❌ "HR / SDM" → ✅ "SDM & HR"
   - ❌ "Event / Agenda" → ✅ "Event & Agenda"
   - ❌ "Bimbingan Konseling (BK)" → ✅ "Bimbingan Konseling"
   - ❌ "Inventori / Aset" → ✅ "Inventori & Aset"

4. **Pengelompokan yang Lebih Logis**
   - **Data Pokok**: Data dasar sekolah
   - **Akademik**: Kegiatan pembelajaran
   - **Bidang Khusus**: Program khusus
   - **Sumber Daya & Fasilitas**: Infrastruktur
   - **Kegiatan & Administrasi**: Event dan adminsitrasi
   - **Pengaturan & Laporan**: Konfigurasi dan reporting
   - **Halaman Publik**: Konten website

5. **Komentar Section yang Jelas**
   - Setiap grup memiliki komentar deskriptif
   - Memudahkan developer memahami fungsi grup

---

## 🔧 Struktur Data untuk Implementasi

### Format JSON (untuk JavaScript/AJAX):

```json
{
  "sections": [
    {
      "name": "Dashboard",
      "icon": "fas fa-tachometer-alt",
      "route": "tenant.dashboard",
      "type": "single"
    },
    {
      "name": "Data Pokok",
      "items": [
        {
          "name": "Data Pokok",
          "icon": "fas fa-database",
          "route": "tenant.data-pokok.index",
          "type": "single"
        },
        {
          "name": "Siswa",
          "icon": "fas fa-user-graduate",
          "route": "tenant.students.index",
          "type": "single",
          "permission": "module:students"
        }
      ]
    }
  ]
}
```

---

## 📝 Catatan Implementasi

### 1. Conditional Functions

```php
// Helper functions untuk conditional menu
function isBKAuthorized($user) {
    return $user->role === 'school_admin' 
        || $user->role === 'super_admin' 
        || ($user->role === 'teacher' && teacher_has_module_access('counseling'));
}

function isDisciplineAuthorized($user) {
    return $user->role === 'school_admin' 
        || $user->role === 'super_admin' 
        || ($user->role === 'teacher' && teacher_has_module_access('discipline'));
}

function isInventoryAuthorized($user) {
    return $user->role === 'school_admin' 
        || $user->role === 'super_admin' 
        || ($user->role === 'teacher' && teacher_has_module_access('inventory'));
}

function isFacilityAuthorized($user) {
    return $user->role === 'school_admin' 
        || $user->role === 'super_admin' 
        || ($user->role === 'teacher' && teacher_has_module_access('facility'));
}

function isCorrespondenceAuthorized($user) {
    return $user->role === 'school_admin' 
        || $user->role === 'super_admin' 
        || ($user->role === 'teacher' && teacher_has_module_access('correspondence'));
}
```

### 2. Menu Rendering Logic

```php
// Example: Render menu dengan conditional
@foreach($menuItems as $item)
    @if(isset($item['conditional']) && !checkCondition($item['conditional']))
        @continue
    @endif
    
    @if($item['type'] === 'dropdown')
        // Render dropdown
    @else
        // Render single menu
    @endif
@endforeach
```

---

## ✅ Checklist Implementasi

- [x] Hapus semua duplikasi "Dashboard" di kategori
- [x] Standardisasi ikon Font Awesome 5
- [x] Perbaiki penamaan menu
- [x] Reorganisasi grouping menu
- [x] Tambahkan komentar section
- [x] Buat struktur data siap implementasi
- [x] Dokumentasi conditional functions
- [x] Contoh rendering logic

---

**Versi:** 2.0  
**Dibuat:** 2025-01-27  
**Status:** ✅ Siap Implementasi

