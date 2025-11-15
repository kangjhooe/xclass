'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  BookOpen,
  ArrowRight,
  Home,
  CheckCircle2,
  UserPlus,
  LogIn,
  Settings,
  Calendar,
  Building2,
  Users,
  GraduationCap,
  UserCheck,
  Plus,
} from 'lucide-react';

const guideSteps = [
  {
    id: 1,
    title: 'Cara Registrasi',
    icon: UserPlus,
    description: 'Panduan lengkap untuk mendaftar akun CLASS',
    steps: [
      'Kunjungi halaman registrasi di website CLASS',
      'Klik tombol "Daftar"',
      'Isi formulir registrasi dengan data sekolah Anda:',
      '  - Nama sekolah',
      '  - NPSN (Nomor Pokok Sekolah Nasional)',
      '  - Alamat lengkap sekolah',
      '  - Email sekolah (akan digunakan untuk login)',
      '  - Nomor telepon',
      '  - Nama kepala sekolah',
      '  - Password untuk akun',
      'Centang persetujuan syarat dan ketentuan',
      'Klik "Daftar" untuk mengirim formulir',
      'Tunggu email verifikasi yang dikirim ke email sekolah Anda',
      'Klik link verifikasi di email untuk mengaktifkan akun',
      'Akun Anda sudah siap digunakan!',
    ],
  },
  {
    id: 2,
    title: 'Setelah Registrasi - Login',
    icon: LogIn,
    description: 'Cara login ke dashboard CLASS setelah registrasi',
    steps: [
      'Kunjungi halaman login CLASS',
      'Masukkan email sekolah yang digunakan saat registrasi',
      'Masukkan password yang telah dibuat',
      'Klik tombol "Masuk"',
      'Jika lupa password, klik "Lupa Password" dan ikuti instruksi di email',
      'Setelah login berhasil, Anda akan diarahkan ke dashboard',
      'Dashboard menampilkan ringkasan data dan menu navigasi',
    ],
  },
  {
    id: 3,
    title: 'Isi Pengaturan',
    icon: Settings,
    description: 'Lengkapi pengaturan awal sekolah di CLASS',
    steps: [
      'Setelah login, buka menu "Pengaturan" atau "Profil Sekolah"',
      'Lengkapi informasi sekolah:',
      '  - Upload logo sekolah',
      '  - Nama lengkap sekolah',
      '  - Alamat lengkap',
      '  - Nomor telepon dan fax',
      '  - Email dan website',
      '  - Visi dan misi sekolah',
      '  - Sejarah sekolah (opsional)',
      'Atur pengaturan sistem:',
      '  - Zona waktu',
      '  - Format tanggal',
      '  - Bahasa interface',
      'Simpan semua perubahan',
      'Pengaturan akan digunakan di seluruh sistem',
    ],
  },
  {
    id: 4,
    title: 'Buat Tahun Pelajaran',
    icon: Calendar,
    description: 'Cara membuat tahun pelajaran baru di CLASS',
    steps: [
      'Buka menu "Akademik" > "Tahun Pelajaran"',
      'Klik tombol "Tambah Tahun Pelajaran"',
      'Isi informasi tahun pelajaran:',
      '  - Nama tahun pelajaran (contoh: 2024/2025)',
      '  - Tanggal mulai tahun pelajaran',
      '  - Tanggal akhir tahun pelajaran',
      '  - Status (Aktif/Non-aktif)',
      'Atur semester:',
      '  - Semester 1: tanggal mulai dan akhir',
      '  - Semester 2: tanggal mulai dan akhir',
      'Simpan tahun pelajaran',
      'Aktifkan tahun pelajaran yang baru dibuat',
      'Tahun pelajaran aktif akan digunakan untuk semua data akademik',
    ],
  },
  {
    id: 5,
    title: 'Buat Data Infrastruktur (Lahan, Gedung, Ruang)',
    icon: Building2,
    description: 'Mengisi data infrastruktur sekolah: lahan, gedung, dan ruangan',
    steps: [
      'Buka menu "Infrastruktur" atau "Fasilitas"',
      'Mulai dengan menambahkan Lahan:',
      '  - Klik "Lahan" > "Tambah Lahan"',
      '  - Isi data lahan: nama, luas, alamat, status',
      '  - Simpan data lahan',
      'Tambahkan Gedung:',
      '  - Klik "Gedung" > "Tambah Gedung"',
      '  - Isi data gedung: nama, jumlah lantai, lahan tempat gedung berada',
      '  - Upload foto gedung (opsional)',
      '  - Simpan data gedung',
      'Tambahkan Ruangan:',
      '  - Klik "Ruangan" > "Tambah Ruangan"',
      '  - Pilih gedung tempat ruangan berada',
      '  - Isi data ruangan:',
      '    • Nama ruangan',
      '    • Lantai',
      '    • Kapasitas',
      '    • Jenis ruangan (Kelas, Lab, Perpustakaan, dll)',
      '    • Fasilitas yang tersedia',
      '  - Simpan data ruangan',
      'Ulangi langkah di atas untuk semua lahan, gedung, dan ruangan di sekolah',
      'Data infrastruktur akan digunakan saat membuat jadwal pelajaran',
    ],
  },
  {
    id: 6,
    title: 'Isi Data Siswa',
    icon: Users,
    description: 'Cara mengisi data siswa ke dalam sistem CLASS',
    steps: [
      'Buka menu "Siswa" > "Data Siswa"',
      'Klik tombol "Tambah Siswa"',
      'Isi formulir data siswa:',
      '  - NISN (Nomor Induk Siswa Nasional)',
      '  - NIS (Nomor Induk Sekolah)',
      '  - Nama lengkap siswa',
      '  - Tempat dan tanggal lahir',
      '  - Jenis kelamin',
      '  - Agama',
      '  - Alamat lengkap',
      '  - Nomor telepon',
      '  - Email (jika ada)',
      'Data orang tua/wali:',
      '  - Nama ayah, ibu, wali',
      '  - Pekerjaan dan kontak orang tua',
      'Upload foto siswa (opsional)',
      'Simpan data siswa',
      'Atau gunakan fitur Import Excel untuk menambah banyak siswa sekaligus:',
      '  - Download template Excel',
      '  - Isi data siswa sesuai template',
      '  - Upload file Excel',
      '  - Verifikasi data yang berhasil diimport',
    ],
  },
  {
    id: 7,
    title: 'Isi Data Guru',
    icon: UserCheck,
    description: 'Cara mengisi data guru dan tenaga kependidikan',
    steps: [
      'Buka menu "Guru" > "Data Guru"',
      'Klik tombol "Tambah Guru"',
      'Isi formulir data guru:',
      '  - NIP (Nomor Induk Pegawai)',
      '  - NUPTK (jika ada)',
      '  - Nama lengkap',
      '  - Tempat dan tanggal lahir',
      '  - Jenis kelamin',
      '  - Agama',
      '  - Alamat lengkap',
      '  - Nomor telepon dan email',
      'Data kepegawaian:',
      '  - Status pegawai (PNS, CPNS, Honorer, dll)',
      '  - Jabatan (Guru, Kepala Sekolah, Wali Kelas, dll)',
      '  - Mata pelajaran yang diampu',
      '  - Riwayat pendidikan',
      'Upload foto guru (opsional)',
      'Simpan data guru',
      'Atau gunakan fitur Import Excel untuk menambah banyak guru sekaligus',
    ],
  },
  {
    id: 8,
    title: 'Buat Kelas',
    icon: GraduationCap,
    description: 'Cara membuat kelas di sistem CLASS',
    steps: [
      'Buka menu "Kelas" atau "Akademik" > "Kelas"',
      'Klik tombol "Tambah Kelas"',
      'Isi informasi kelas:',
      '  - Nama kelas (contoh: X-A, XI IPA 1, XII IPS 2)',
      '  - Tingkat kelas (X, XI, XII untuk SMA/SMK)',
      '  - Jurusan/Program (jika ada)',
      '  - Tahun pelajaran (pilih tahun pelajaran aktif)',
      '  - Wali kelas (pilih dari data guru)',
      '  - Ruangan (pilih dari data ruangan yang sudah dibuat)',
      '  - Kapasitas maksimal siswa',
      'Simpan kelas',
      'Ulangi untuk membuat semua kelas yang ada di sekolah',
      'Kelas yang sudah dibuat akan muncul di menu "Kelas"',
    ],
  },
  {
    id: 9,
    title: 'Tambahkan Siswa ke dalam Kelas',
    icon: Plus,
    description: 'Cara menambahkan siswa ke dalam kelas yang sudah dibuat',
    steps: [
      'Buka menu "Kelas" > pilih kelas yang ingin diisi siswanya',
      'Atau buka menu "Siswa" > pilih siswa yang ingin ditambahkan ke kelas',
      'Metode 1: Dari halaman kelas',
      '  - Klik pada kelas yang diinginkan',
      '  - Klik tombol "Tambah Siswa" atau "Atur Siswa"',
      '  - Pilih siswa dari daftar siswa yang belum memiliki kelas',
      '  - Atau cari siswa dengan search bar',
      '  - Klik "Tambahkan" untuk setiap siswa',
      'Metode 2: Dari halaman siswa',
      '  - Pilih siswa yang ingin ditambahkan ke kelas',
      '  - Klik "Edit" atau "Detail"',
      '  - Pilih kelas dari dropdown "Kelas"',
      '  - Simpan perubahan',
      'Metode 3: Bulk assignment (banyak siswa sekaligus)',
      '  - Buka menu "Kelas" > pilih kelas',
      '  - Klik "Import Siswa" atau "Tambah Banyak Siswa"',
      '  - Pilih beberapa siswa sekaligus dari daftar',
      '  - Klik "Tambahkan ke Kelas"',
      'Verifikasi daftar siswa di kelas sudah benar',
      'Siswa yang sudah ditambahkan ke kelas akan muncul di halaman kelas',
    ],
  },
  {
    id: 10,
    title: 'Buat Mata Pelajaran',
    icon: BookOpen,
    description: 'Cara membuat dan mengatur mata pelajaran',
    steps: [
      'Buka menu "Akademik" > "Mata Pelajaran"',
      'Klik tombol "Tambah Mata Pelajaran"',
      'Isi informasi mata pelajaran:',
      '  - Kode mata pelajaran',
      '  - Nama mata pelajaran',
      '  - Kelompok mata pelajaran (Wajib, Peminatan, dll)',
      '  - Tingkat kelas yang menggunakan (X, XI, XII, atau semua)',
      '  - Jurusan yang menggunakan (jika ada)',
      '  - Guru pengampu (pilih dari data guru)',
      '  - Bobot nilai (jika berbeda dari default)',
      'Simpan mata pelajaran',
      'Ulangi untuk semua mata pelajaran di sekolah',
    ],
  },
  {
    id: 11,
    title: 'Buat Jadwal Pelajaran',
    icon: Calendar,
    description: 'Cara membuat jadwal pelajaran untuk setiap kelas',
    steps: [
      'Buka menu "Jadwal" > "Jadwal Pelajaran"',
      'Pilih tahun pelajaran dan semester',
      'Klik "Buat Jadwal Baru"',
      'Pilih kelas yang akan dibuat jadwalnya',
      'Untuk setiap slot waktu:',
      '  - Pilih hari (Senin, Selasa, dst)',
      '  - Pilih jam pelajaran',
      '  - Pilih mata pelajaran',
      '  - Pilih guru pengampu',
      '  - Pilih ruangan',
      'Sistem akan otomatis mendeteksi konflik jadwal',
      'Jika ada konflik, sistem akan memberikan peringatan',
      'Atur ulang jadwal yang konflik',
      'Simpan jadwal pelajaran',
      'Jadwal akan muncul di dashboard siswa dan guru',
    ],
  },
];

export default function PanduanPage() {
  const [openSteps, setOpenSteps] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSteps = guideSteps.filter((step) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      step.title.toLowerCase().includes(query) ||
      step.description.toLowerCase().includes(query) ||
      step.steps.some((s) => s.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg group-hover:scale-110 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Panduan CLASS</p>
              <p className="text-xs text-slate-500">Dokumentasi Lengkap</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Home className="h-4 w-4" />
              Beranda
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl mb-4">
            Panduan Penggunaan CLASS
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Ikuti panduan step-by-step ini secara berurutan untuk setup awal sistem CLASS di sekolah Anda
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari panduan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-12 py-4 text-slate-900 placeholder-slate-400 shadow-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {filteredSteps.map((step) => {
            const IconComponent = step.icon;
            const isOpen = openSteps[step.id] || false;
            
            return (
              <div
                key={step.id}
                className={`group rounded-2xl border-2 transition-all duration-300 ${
                  isOpen
                    ? 'border-blue-500 bg-blue-50/50 shadow-lg'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <button
                  onClick={() => setOpenSteps((prev) => ({ ...prev, [step.id]: !prev[step.id] }))}
                  className="w-full px-6 py-5 text-left flex items-start gap-4 group"
                >
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md transition-transform ${
                    isOpen ? 'scale-110' : 'group-hover:scale-105'
                  }`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                            {step.id}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{step.description}</p>
                        {!isOpen && (
                          <p className="text-xs text-slate-500">
                            {step.steps.length} langkah • Klik untuk melihat detail
                          </p>
                        )}
                      </div>
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center transition-transform ${
                        isOpen ? 'rotate-180 bg-blue-100' : 'group-hover:bg-slate-200'
                      }`}>
                        <ArrowRight className="h-4 w-4 text-slate-600 rotate-90" />
                      </div>
                    </div>
                  </div>
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-6 pl-20">
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      {step.steps.map((stepItem, index) => (
                        <div
                          key={index}
                          className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/30"
                        >
                          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
                            {index + 1}
                          </div>
                          <p className="flex-1 text-sm text-slate-700 leading-relaxed">{stepItem}</p>
                        </div>
                      ))}
                    </div>
                    
                    {step.id < guideSteps.length && (
                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Lanjut ke langkah berikutnya: <strong>{guideSteps.find(s => s.id === step.id + 1)?.title}</strong></span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="mt-12 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Butuh Bantuan?</h3>
              <p className="text-sm text-slate-700 mb-3">
                Jika Anda mengalami kesulitan dalam mengikuti panduan ini, jangan ragu untuk menghubungi tim support kami.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:support@class.id"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
                >
                  Email Support
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  Live Chat
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <p className="text-sm text-slate-600">
              © {new Date().getFullYear()} CLASS. Panduan ini akan terus diperbarui.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 transition">
                Beranda
              </Link>
              <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition">
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

