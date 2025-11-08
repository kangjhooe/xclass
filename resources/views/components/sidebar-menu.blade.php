{{-- 
    ============================================
    SIDEBAR MENU COMPONENT - IMPROVED VERSION
    ============================================
    Struktur menu yang rapi, konsisten, dan profesional
    Versi: 2.0
--}}

<nav class="nav flex-column" id="sidebarNav">
    {{-- ======================================== --}}
    {{-- DASHBOARD --}}
    {{-- ======================================== --}}
    <a href="{{ tenant_route('tenant.dashboard') }}" class="nav-link {{ request()->routeIs('tenant.dashboard') ? 'active' : '' }}">
        <i class="fas fa-tachometer-alt"></i>
        <span>Dashboard</span>
    </a>
    
    {{-- ======================================== --}}
    {{-- DATA POKOK --}}
    {{-- Manajemen data dasar sekolah --}}
    {{-- ======================================== --}}
    <div class="menu-section">Data Pokok</div>
    
    <a href="{{ tenant_route('tenant.data-pokok.index') }}" class="nav-link {{ request()->routeIs('tenant.data-pokok.*') ? 'active' : '' }}">
        <i class="fas fa-database"></i>
        <span>Data Pokok</span>
    </a>
    
    <a href="{{ tenant_route('tenant.students.index') }}" class="nav-link {{ request()->routeIs('tenant.students.*') ? 'active' : '' }}">
        <i class="fas fa-user-graduate"></i>
        <span>Siswa</span>
    </a>
    
    <a href="{{ tenant_route('tenant.teachers.index') }}" class="nav-link {{ request()->routeIs('tenant.teachers.*') ? 'active' : '' }}">
        <i class="fas fa-chalkboard-teacher"></i>
        <span>Guru</span>
    </a>
    
    <a href="{{ tenant_route('tenant.classes.index') }}" class="nav-link {{ request()->routeIs('tenant.classes.*') ? 'active' : '' }}">
        <i class="fas fa-door-open"></i>
        <span>Kelas</span>
    </a>
    
    <a href="{{ tenant_route('tenant.data-pokok.non-teaching-staff.index') }}" class="nav-link {{ request()->routeIs('tenant.data-pokok.non-teaching-staff.*') ? 'active' : '' }}">
        <i class="fas fa-users"></i>
        <span>Staf Non-Guru</span>
    </a>
    
    <a href="{{ tenant_route('tenant.teacher-supervisions.index') }}" class="nav-link {{ request()->routeIs('tenant.teacher-supervisions.*') ? 'active' : '' }}">
        <i class="fas fa-clipboard-check"></i>
        <span>Supervisi Guru</span>
    </a>
    
    <a href="{{ tenant_route('tenant.additional-duties.index') }}" class="nav-link {{ request()->routeIs('tenant.additional-duties.*') ? 'active' : '' }}">
        <i class="fas fa-briefcase"></i>
        <span>Tugas Tambahan</span>
    </a>
    
    @if(\App\Helpers\RbacHelper::canManageMutasi(auth()->user()))
    <a href="{{ tenant_route('tenant.data-pokok.mutasi-siswa.index') }}" class="nav-link {{ request()->routeIs('tenant.data-pokok.mutasi-siswa.*') ? 'active' : '' }}">
        <i class="fas fa-exchange-alt"></i>
        <span>Mutasi Siswa</span>
    </a>
    @endif
    
    {{-- ======================================== --}}
    {{-- AKADEMIK --}}
    {{-- Manajemen kegiatan akademik dan pembelajaran --}}
    {{-- ======================================== --}}
    <div class="menu-section">Akademik</div>
    
    <a href="{{ tenant_route('tenant.academic-years.index') }}" class="nav-link {{ request()->routeIs('tenant.academic-years.*') ? 'active' : '' }}">
        <i class="fas fa-calendar-alt"></i>
        <span>Tahun Pelajaran</span>
    </a>
    
    <a href="{{ tenant_route('tenant.subjects.index') }}" class="nav-link {{ request()->routeIs('tenant.subjects.*') ? 'active' : '' }}">
        <i class="fas fa-book-open"></i>
        <span>Mata Pelajaran</span>
    </a>
    
    <a href="{{ tenant_route('tenant.schedules.index') }}" class="nav-link {{ request()->routeIs('tenant.schedules.*') ? 'active' : '' }}">
        <i class="fas fa-calendar-week"></i>
        <span>Jadwal Pelajaran</span>
    </a>
    
    <a href="{{ tenant_route('tenant.student-grades.index') }}" class="nav-link {{ request()->routeIs('tenant.student-grades.*') ? 'active' : '' }}">
        <i class="fas fa-chart-line"></i>
        <span>Nilai Siswa</span>
    </a>
    
    <a href="{{ tenant_route('tenant.grade-weights.index') }}" class="nav-link {{ request()->routeIs('tenant.grade-weights.*') ? 'active' : '' }}">
        <i class="fas fa-balance-scale"></i>
        <span>Bobot Nilai</span>
    </a>
    
    <a href="{{ tenant_route('tenant.promotions.index') }}" class="nav-link {{ request()->routeIs('tenant.promotions.*') ? 'active' : '' }}">
        <i class="fas fa-arrow-up"></i>
        <span>Kenaikan Kelas</span>
    </a>
    
    {{-- Ujian Online --}}
    @if(auth()->user()->role === 'student')
        <a href="{{ tenant_route('tenant.exam.index') }}" class="nav-link {{ request()->routeIs('tenant.exam.*') ? 'active' : '' }}">
            <i class="fas fa-clipboard-list"></i>
            <span>Ujian Online</span>
        </a>
    @else
        <div class="nav-item dropdown">
            <a class="nav-link dropdown-toggle {{ request()->routeIs('tenant.exam.*') ? 'active' : '' }}" 
               href="#" role="button" data-bs-toggle="dropdown">
                <i class="fas fa-clipboard-list"></i>
                <span>Ujian Online</span>
            </a>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="{{ tenant_route('tenant.exam.exams.index') }}">
                    <i class="fas fa-list me-2"></i>Daftar Ujian
                </a></li>
                <li><a class="dropdown-item" href="{{ tenant_route('tenant.exam.questions') }}">
                    <i class="fas fa-question-circle me-2"></i>Bank Soal
                </a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="{{ tenant_route('tenant.exam.attempts.index') }}">
                    <i class="fas fa-chart-line me-2"></i>Hasil Ujian
                </a></li>
                <li><a class="dropdown-item" href="{{ tenant_route('tenant.exam.exams.create') }}">
                    <i class="fas fa-plus-circle me-2"></i>Buat Ujian Baru
                </a></li>
            </ul>
        </div>
    @endif
    
    <a href="{{ tenant_route('tenant.academic-reports.dashboard') }}" class="nav-link {{ request()->routeIs('tenant.academic-reports.*') ? 'active' : '' }}">
        <i class="fas fa-chart-bar"></i>
        <span>Laporan Akademik</span>
    </a>
    
    {{-- ======================================== --}}
    {{-- BIDANG KHUSUS --}}
    {{-- Program khusus di luar kurikulum inti --}}
    {{-- ======================================== --}}
    <div class="menu-section">Bidang Khusus</div>
    
    @if(auth()->user()->role === 'school_admin' || auth()->user()->role === 'super_admin' || (auth()->user()->role === 'teacher' && teacher_has_module_access('counseling')))
    <a href="{{ tenant_route('tenant.counseling.index') }}" class="nav-link {{ request()->routeIs('tenant.counseling.*') ? 'active' : '' }}">
        <i class="fas fa-comments"></i>
        <span>Bimbingan Konseling</span>
    </a>
    @endif
    
    @if(auth()->user()->role === 'school_admin' || auth()->user()->role === 'super_admin' || (auth()->user()->role === 'teacher' && teacher_has_module_access('discipline')))
    <a href="{{ tenant_route('tenant.discipline.index') }}" class="nav-link {{ request()->routeIs('tenant.discipline.*') ? 'active' : '' }}">
        <i class="fas fa-gavel"></i>
        <span>Kedisiplinan</span>
    </a>
    @endif
    
    <a href="{{ tenant_route('tenant.extracurricular.index') }}" class="nav-link {{ request()->routeIs('tenant.extracurricular.*') ? 'active' : '' }}">
        <i class="fas fa-running"></i>
        <span>Ekstrakurikuler</span>
    </a>
    
    <a href="{{ tenant_route('tenant.health.index') }}" class="nav-link {{ request()->routeIs('tenant.health.*') ? 'active' : '' }}">
        <i class="fas fa-heartbeat"></i>
        <span>Kesehatan</span>
    </a>
    
    {{-- ======================================== --}}
    {{-- SUMBER DAYA & FASILITAS --}}
    {{-- Manajemen sumber daya dan infrastruktur sekolah --}}
    {{-- ======================================== --}}
    <div class="menu-section">Sumber Daya & Fasilitas</div>
    
    <a href="{{ tenant_route('tenant.library.index') }}" class="nav-link {{ request()->routeIs('tenant.library.*') ? 'active' : '' }}">
        <i class="fas fa-book"></i>
        <span>Perpustakaan</span>
    </a>
    
    <a href="{{ tenant_route('tenant.spp.index') }}" class="nav-link {{ request()->routeIs('tenant.spp.*') ? 'active' : '' }}">
        <i class="fas fa-money-bill-wave"></i>
        <span>SPP & Keuangan</span>
    </a>
    
    {{-- SDM & HR --}}
    <div class="nav-item dropdown">
        <a class="nav-link dropdown-toggle {{ request()->routeIs('tenant.hr.*') ? 'active' : '' }}" 
           href="#" role="button" data-bs-toggle="dropdown">
            <i class="fas fa-users-cog"></i>
            <span>SDM & HR</span>
        </a>
        <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="{{ tenant_route('tenant.hr.employees') }}">
                <i class="fas fa-user-tie me-2"></i>Karyawan
            </a></li>
            <li><a class="dropdown-item" href="{{ tenant_route('tenant.hr.payroll') }}">
                <i class="fas fa-money-check-alt me-2"></i>Penggajian
            </a></li>
        </ul>
    </div>
    
    @if(auth()->user()->role === 'school_admin' || auth()->user()->role === 'super_admin' || (auth()->user()->role === 'teacher' && teacher_has_module_access('inventory')))
    <a href="{{ tenant_route('tenant.inventory.index') }}" class="nav-link {{ request()->routeIs('tenant.inventory.*') ? 'active' : '' }}">
        <i class="fas fa-boxes"></i>
        <span>Inventori & Aset</span>
    </a>
    @endif
    
    @if(auth()->user()->role === 'school_admin' || auth()->user()->role === 'super_admin' || (auth()->user()->role === 'teacher' && teacher_has_module_access('facility')))
    <div class="nav-item dropdown">
        <a class="nav-link dropdown-toggle {{ request()->routeIs('facility.*') ? 'active' : '' }}" 
           href="#" role="button" data-bs-toggle="dropdown">
            <i class="fas fa-building"></i>
            <span>Sarana Prasarana</span>
        </a>
        <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="{{ tenant_route('facility.lands') }}">
                <i class="fas fa-map me-2"></i>Lahan
            </a></li>
            <li><a class="dropdown-item" href="{{ tenant_route('facility.buildings') }}">
                <i class="fas fa-building me-2"></i>Gedung
            </a></li>
            <li><a class="dropdown-item" href="{{ tenant_route('facility.rooms') }}">
                <i class="fas fa-door-open me-2"></i>Ruangan
            </a></li>
        </ul>
    </div>
    @endif
    
    <a href="{{ tenant_route('tenant.transportation.index') }}" class="nav-link {{ request()->routeIs('tenant.transportation.*') ? 'active' : '' }}">
        <i class="fas fa-bus"></i>
        <span>Transportasi</span>
    </a>
    
    <a href="{{ tenant_route('tenant.cafeteria.index') }}" class="nav-link {{ request()->routeIs('tenant.cafeteria.*') ? 'active' : '' }}">
        <i class="fas fa-utensils"></i>
        <span>Kafetaria</span>
    </a>
    
    @if(auth()->user()->role === 'school_admin' || auth()->user()->role === 'super_admin' || (auth()->user()->role === 'teacher' && teacher_has_module_access('correspondence')))
    <div class="nav-item dropdown">
        <a class="nav-link dropdown-toggle {{ request()->routeIs('tenant.letters.*') ? 'active' : '' }}" 
           href="#" role="button" data-bs-toggle="dropdown">
            <i class="fas fa-envelope-open-text"></i>
            <span>Persuratan</span>
        </a>
        <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="{{ tenant_route('tenant.letters.incoming.index') }}">
                <i class="fas fa-inbox me-2"></i>Surat Masuk
            </a></li>
            <li><a class="dropdown-item" href="{{ tenant_route('tenant.letters.outgoing.index') }}">
                <i class="fas fa-paper-plane me-2"></i>Surat Keluar
            </a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="{{ tenant_route('tenant.letters.templates.index') }}">
                <i class="fas fa-file-alt me-2"></i>Template Surat
            </a></li>
            <li><a class="dropdown-item" href="{{ tenant_route('tenant.letters.settings.number-settings.index') }}">
                <i class="fas fa-cog me-2"></i>Pengaturan Nomor
            </a></li>
        </ul>
    </div>
    @endif
    
    {{-- ======================================== --}}
    {{-- KEGIATAN & ADMINISTRASI --}}
    {{-- Manajemen kegiatan sekolah dan administrasi --}}
    {{-- ======================================== --}}
    <div class="menu-section">Kegiatan & Administrasi</div>
    
    <a href="{{ tenant_route('tenant.events.index') }}" class="nav-link {{ request()->routeIs('tenant.events.*') ? 'active' : '' }}">
        <i class="fas fa-calendar-check"></i>
        <span>Event & Agenda</span>
    </a>
    
    <div class="nav-item dropdown">
        <a class="nav-link dropdown-toggle {{ request()->routeIs('tenant.guest-book.*') ? 'active' : '' }}" 
           href="#" role="button" data-bs-toggle="dropdown">
            <i class="fas fa-book-reader"></i>
            <span>Buku Tamu</span>
        </a>
        <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="{{ tenant_route('tenant.guest-book.index') }}">
                <i class="fas fa-list me-2"></i>Daftar Tamu
            </a></li>
            <li><a class="dropdown-item" href="{{ tenant_route('tenant.guest-book.create') }}">
                <i class="fas fa-user-plus me-2"></i>Tambah Tamu
            </a></li>
        </ul>
    </div>
    
    <div class="nav-item dropdown">
        <a class="nav-link dropdown-toggle {{ request()->routeIs('tenant.ppdb.*') ? 'active' : '' }}" 
           href="#" role="button" data-bs-toggle="dropdown">
            <i class="fas fa-user-graduate"></i>
            <span>PPDB / SPMB</span>
        </a>
        <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="{{ tenant_route('tenant.ppdb.index') }}">
                <i class="fas fa-users me-2"></i>Data Pendaftar
            </a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="{{ tenant_route('tenant.ppdb.configuration') }}">
                <i class="fas fa-cogs me-2"></i>Konfigurasi
            </a></li>
        </ul>
    </div>
    
    <a href="{{ tenant_route('tenant.alumni.index') }}" class="nav-link {{ request()->routeIs('tenant.alumni.*') ? 'active' : '' }}">
        <i class="fas fa-graduation-cap"></i>
        <span>Alumni</span>
    </a>
    
    <a href="{{ tenant_route('tenant.graduation.index') }}" class="nav-link {{ request()->routeIs('tenant.graduation.*') ? 'active' : '' }}">
        <i class="fas fa-certificate"></i>
        <span>Pengumuman Kelulusan</span>
    </a>
    
    {{-- ======================================== --}}
    {{-- PENGATURAN & LAPORAN --}}
    {{-- Konfigurasi sistem dan laporan --}}
    {{-- ======================================== --}}
    <div class="menu-section">Pengaturan & Laporan</div>
    
    <a href="{{ tenant_route('tenant.attendances.index') }}" class="nav-link {{ request()->routeIs('tenant.attendances.*') ? 'active' : '' }}">
        <i class="fas fa-clipboard-check"></i>
        <span>Absensi</span>
    </a>
    
    <div class="nav-item dropdown">
        <a class="nav-link dropdown-toggle {{ request()->routeIs('tenant.reports*') ? 'active' : '' }}" 
           href="#" role="button" data-bs-toggle="dropdown">
            <i class="fas fa-chart-bar"></i>
            <span>Laporan</span>
        </a>
        <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="{{ tenant_route('tenant.reports.academic-performance') }}">
                <i class="fas fa-graduation-cap me-2"></i>Prestasi Akademik
            </a></li>
            <li><a class="dropdown-item" href="{{ tenant_route('tenant.reports.attendance') }}">
                <i class="fas fa-calendar-check me-2"></i>Kehadiran
            </a></li>
            <li><a class="dropdown-item" href="{{ tenant_route('tenant.reports.student-performance') }}">
                <i class="fas fa-user-graduate me-2"></i>Prestasi Siswa
            </a></li>
            <li><a class="dropdown-item" href="{{ tenant_route('tenant.reports.teacher-workload') }}">
                <i class="fas fa-chalkboard-teacher me-2"></i>Beban Kerja Guru
            </a></li>
        </ul>
    </div>
    
    <a href="{{ tenant_route('settings.index') }}" class="nav-link {{ request()->routeIs('tenant.settings.*') || request()->routeIs('tenant.profile*') ? 'active' : '' }}">
        <i class="fas fa-school"></i>
        <span>Profil Instansi</span>
    </a>
    
    @if(auth()->user()->role === 'school_admin')
    <a href="{{ tenant_route('tenant.super-admin-access.index') }}" class="nav-link {{ request()->routeIs('tenant.super-admin-access.*') ? 'active' : '' }}">
        <i class="fas fa-user-shield"></i>
        <span>Kelola Akses Super Admin</span>
    </a>
    @endif
    
    <a href="{{ tenant_route('tenant.parent-portal.index') }}" class="nav-link {{ request()->routeIs('tenant.parent-portal.*') ? 'active' : '' }}">
        <i class="fas fa-user-friends"></i>
        <span>Portal Orang Tua</span>
    </a>
    
    {{-- ======================================== --}}
    {{-- HALAMAN PUBLIK --}}
    {{-- Manajemen konten website publik --}}
    {{-- ======================================== --}}
    <div class="menu-section">Halaman Publik</div>
    
    <a href="{{ tenant_route('tenant.public-page.profile.show') }}" class="nav-link {{ request()->routeIs('tenant.public-page.profile.*') ? 'active' : '' }}">
        <i class="fas fa-globe"></i>
        <span>Website Publik</span>
    </a>
    
    <a href="{{ tenant_route('admin.news.index') }}" class="nav-link {{ request()->routeIs('admin.news.*') || request()->routeIs('tenant.public-page.news.*') ? 'active' : '' }}">
        <i class="fas fa-newspaper"></i>
        <span>Berita</span>
    </a>
    
    <a href="{{ tenant_route('tenant.public-page.gallery.index') }}" class="nav-link {{ request()->routeIs('tenant.public-page.gallery.*') ? 'active' : '' }}">
        <i class="fas fa-images"></i>
        <span>Galeri</span>
    </a>
    
    <a href="{{ route('tenant.public.about', ['tenant' => request()->route('tenant')]) }}" class="nav-link {{ request()->routeIs('tenant.public.about') ? 'active' : '' }}">
        <i class="fas fa-info-circle"></i>
        <span>Tentang Kami</span>
    </a>
    
    <a href="{{ route('tenant.public.contact', ['tenant' => request()->route('tenant')]) }}" class="nav-link {{ request()->routeIs('tenant.public.contact') ? 'active' : '' }}">
        <i class="fas fa-envelope"></i>
        <span>Kontak</span>
    </a>
</nav>

