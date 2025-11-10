'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: '📊',
      title: 'Manajemen Akademik',
      description: 'Kelola siswa, guru, kelas, jadwal, nilai, dan absensi dengan sistem terintegrasi',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '📚',
      title: 'Perpustakaan Digital',
      description: 'Sistem manajemen perpustakaan modern dengan katalog digital dan peminjaman online',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: '💰',
      title: 'Keuangan Sekolah',
      description: 'Kelola SPP, pembayaran, laporan keuangan, dan transaksi keuangan sekolah',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: '👥',
      title: 'SDM & HR',
      description: 'Manajemen sumber daya manusia, payroll, absensi karyawan, dan administrasi',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: '📝',
      title: 'Ujian Online',
      description: 'Sistem ujian online dengan bank soal, penilaian otomatis, dan analitik hasil',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: '📱',
      title: 'Portal Siswa',
      description: 'Akses informasi akademik, nilai, jadwal, dan komunikasi melalui portal siswa',
      color: 'from-teal-500 to-cyan-500',
    },
    {
      icon: '📋',
      title: 'PPDB Online',
      description: 'Sistem penerimaan peserta didik baru secara online dengan verifikasi otomatis',
      color: 'from-rose-500 to-pink-500',
    },
    {
      icon: '📧',
      title: 'Notifikasi Real-time',
      description: 'Notifikasi email, SMS, dan push notification untuk update penting secara real-time',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  const stats = [
    { number: '50+', label: 'Modul Lengkap' },
    { number: '100%', label: 'Cloud Based' },
    { number: '24/7', label: 'Support' },
    { number: '∞', label: 'Scalable' },
  ];

  const benefits = [
    {
      title: 'Multi-Tenant Architecture',
      description: 'Satu platform untuk banyak sekolah dengan isolasi data yang aman',
      icon: '🏢',
    },
    {
      title: 'Real-time Dashboard',
      description: 'Pantau aktivitas dan statistik sekolah secara real-time',
      icon: '📈',
    },
    {
      title: 'Mobile Responsive',
      description: 'Akses dari mana saja dengan desain yang responsif di semua perangkat',
      icon: '📱',
    },
    {
      title: 'Secure & Reliable',
      description: 'Keamanan data terjamin dengan enkripsi dan backup otomatis',
      icon: '🔒',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                C
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  CLASS
                </h1>
                <p className="text-xs text-gray-500">Comprehensive Learning and School System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              ✨ Platform Terdepan untuk Manajemen Sekolah
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Sistem Manajemen Sekolah
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Multi-Tenant
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Solusi lengkap untuk mengelola administrasi, akademik, dan operasional sekolah 
            dengan teknologi modern dan antarmuka yang intuitif
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold text-lg shadow-2xl hover:shadow-blue-500/50 transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center space-x-2">
                <span>Mulai Sekarang</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
            <Link
              href="/login"
              className="bg-white text-gray-800 px-10 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg border-2 border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Masuk ke Aplikasi
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Fitur <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Lengkap</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dilengkapi dengan berbagai fitur canggih untuk mendukung 
            operasional sekolah secara menyeluruh
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Mengapa Pilih CLASS?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Platform yang dirancang khusus untuk memudahkan manajemen sekolah
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Lebih dari <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">50 Modul</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Modul lengkap untuk mengelola semua aspek sekolah
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            'Data Pokok', 'Akademik', 'Perpustakaan', 'Keuangan', 'PPDB', 'HR & SDM',
            'E-Learning', 'Mobile API', 'Alumni', 'Event', 'Ekstrakurikuler', 'BK',
            'Kesehatan', 'Transportasi', 'Kafetaria', 'Kedisiplinan', 'Surat Menyurat', 'Laporan',
          ].map((module, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl text-center border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="font-semibold text-gray-800 text-sm">{module}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center text-white overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Siap Memulai?</h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
              Bergabunglah dengan sekolah-sekolah yang sudah menggunakan CLASS untuk transformasi digital mereka
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-blue-600 px-10 py-4 rounded-xl hover:bg-gray-100 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-white/50 transform hover:-translate-y-1"
              >
                Daftar Sekarang Gratis
              </Link>
              <Link
                href="/login"
                className="bg-transparent text-white px-10 py-4 rounded-xl hover:bg-white/10 transition-all duration-300 font-bold text-lg border-2 border-white hover:border-white/80"
              >
                Masuk ke Aplikasi
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                C
              </div>
              <h3 className="text-2xl font-bold">CLASS</h3>
            </div>
            <p className="text-gray-400 mb-2 text-lg">
              Sistem Manajemen Sekolah Multi-Tenant
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 CLASS. All rights reserved. Dibuat dengan ❤️ untuk pendidikan Indonesia
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
