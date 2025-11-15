'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { testimonialsApi, type Testimonial } from '@/lib/api/testimonials';
import {
  BookOpen,
  Users,
  Calendar,
  FileText,
  DollarSign,
  BarChart3,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowUp,
  Star,
  TrendingUp,
  Clock,
  Award,
  Globe,
  Smartphone,
  Cloud,
  Lock,
  MessageSquare,
  Bell,
  GraduationCap,
  Building2,
  Target,
  Sparkles,
  PlayCircle,
} from 'lucide-react';
import { BackToTop } from '@/components/ui/BackToTop';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { AccessibilityControls } from '@/components/ui/AccessibilityControls';

type VisibilityMap = Record<string, boolean>;

const primarySolutions = [
  {
    icon: BarChart3,
    title: 'Akademik Terintegrasi',
    description:
      'Satu pusat kendali untuk kurikulum, jadwal, penilaian, dan analitik performa siswa secara real-time.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Zap,
    title: 'AI Learning Companion',
    description:
      'Rekomendasi otomatis berbasis AI untuk tindak lanjut pembelajaran dan insight keunggulan tiap peserta didik.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Kolaborasi Multi-Peran',
    description:
      'Portal modern untuk kepala sekolah, guru, orang tua, dan siswa dengan komunikasi terintegrasi.',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

const keyFeatures = [
  { icon: BookOpen, title: 'E-Learning Platform', description: 'Pembelajaran digital interaktif dengan konten multimedia' },
  { icon: Calendar, title: 'Jadwal Pintar', description: 'Auto-scheduling dengan konflik detection dan optimasi ruang' },
  { icon: FileText, title: 'Bank Soal & CBT', description: 'Ujian online dengan auto-grading dan analitik mendalam' },
  { icon: DollarSign, title: 'Keuangan Terintegrasi', description: 'SPP, tagihan, dan laporan keuangan real-time' },
  { icon: Shield, title: 'Keamanan Multi-Layer', description: 'Enkripsi end-to-end dengan audit trail lengkap' },
  { icon: MessageSquare, title: 'Komunikasi Real-time', description: 'Notifikasi multi-channel untuk semua stakeholder' },
  { icon: Bell, title: 'Notifikasi Cerdas', description: 'Push notification, email, SMS, dan WhatsApp integration' },
  { icon: GraduationCap, title: 'Rapor Digital', description: 'Leger elektronik dengan tanda tangan digital' },
];

const benefits = [
  { icon: Clock, text: 'Aktif langsung setelah daftar' },
  { icon: TrendingUp, text: 'Peningkatan efisiensi 40%' },
  { icon: Award, text: 'Sertifikasi ISO 27001' },
  { icon: Globe, text: 'Cloud-native & scalable' },
  { icon: Smartphone, text: 'Mobile-first design' },
  { icon: Cloud, text: 'Backup otomatis harian' },
];

const experienceMetrics = [
  {
    label: 'Sekolah Digital',
    value: '120+',
    detail: 'terimplementasi penuh, dari SD hingga SMK',
  },
  {
    label: 'Waktu Aktivasi',
    value: 'Instan',
    detail: 'langsung aktif setelah pendaftaran selesai',
  },
  {
    label: 'Kepuasan Pengguna',
    value: '4.9/5',
    detail: 'survey live dari admin & tenaga pendidik',
  },
  {
    label: 'Keandalan',
    value: '99.9%',
    detail: 'uptime SLA pada infrastruktur cloud',
  },
];

const ecosystemTracks = [
  {
    tag: 'Insights',
    title: 'Intelligence Dashboard',
    description:
      'Visualisasi KPI instan untuk kehadiran, capaian nilai, hingga keterlibatan orang tua.',
    gradient: 'from-blue-500 via-sky-500 to-cyan-400',
  },
  {
    tag: 'Operations',
    title: 'Automation Engine',
    description:
      'Alur kerja otomatis untuk persetujuan, penjadwalan ulang, dan notifikasi lintas kanal.',
    gradient: 'from-violet-500 via-purple-500 to-pink-500',
  },
  {
    tag: 'Growth',
    title: 'PPDB Experience',
    description:
      'Journey pendaftaran digital dengan verifikasi dokumen, penjadwalan tes, dan pembayaran cashless.',
    gradient: 'from-emerald-500 via-teal-500 to-lime-400',
  },
];

const moduleShowcase = [
  'Database Siswa',
  'Buku Induk',
  'Jadwal Pelajaran',
  'CBT & Bank Soal',
  'Penilaian Kurikulum',
  'Leger Digital',
  'Keuangan Sekolah',
  'SPP & Tagihan',
  'Inventori',
  'HR & Payroll',
  'Absensi Biometrik',
  'Perpustakaan Digital',
  'PPDB Paperless',
  'E-Learning',
  'Komunikasi Orang Tua',
  'Notifikasi Multi Channel',
  'Surat Menyurat',
  'Aset Sekolah',
  'Tata Usaha',
  'Kesiswaan',
  'BK Terintegrasi',
  'Ekstrakurikuler',
  'Event & Agenda',
  'Rapor Digital',
];

const transformationTimeline = [
  {
    step: 'Daftar & Verifikasi',
    detail: 'Isi formulir pendaftaran dan verifikasi email instansi Anda.',
  },
  {
    step: 'Aktivasi Instan',
    detail: 'Sistem langsung aktif dan siap digunakan setelah verifikasi.',
  },
  {
    step: 'Setup Awal',
    detail: 'Lengkapi data sekolah, siswa, dan guru melalui dashboard.',
  },
  {
    step: 'Mulai Menggunakan',
    detail: 'Akses semua fitur CLASS dan mulai operasional sekolah digital.',
  },
];

// Testimonials akan diambil dari API, ini adalah fallback data
const defaultTestimonials = [
  {
    tenantName: 'SMA Negeri Pintar',
    reviewerName: 'Dr. Ahmad Hidayat',
    reviewerRole: 'Kepala Sekolah',
    quote:
      '"CLASS mengubah cara kami mengambil keputusan. Dashboard real-time memudahkan kami mengarahkan strategi akademik setiap minggu."',
    rating: 5,
    avatar: 'AH',
  },
  {
    tenantName: 'SMK Nusantara Digital',
    reviewerName: 'Budi Santoso',
    reviewerRole: 'Koordinator IT',
    quote:
      '"Migrasi antar tenant sangat rapi. Integrasi dengan sistem fingerprint kami berjalan mulus hanya dalam 3 hari."',
    rating: 5,
    avatar: 'BS',
  },
  {
    tenantName: 'SD Kreatif Mandiri',
    reviewerName: 'Ibu Siti Nurhaliza',
    reviewerRole: 'Orang Tua',
    quote:
      '"Aplikasi mobile CLASS membuat saya tidak pernah ketinggalan informasi nilai dan kehadiran anak lagi."',
    rating: 5,
    avatar: 'SN',
  },
];

const faqs = [
  {
    question: 'Berapa lama waktu aktivasi CLASS?',
    answer: 'Sistem langsung aktif setelah pendaftaran dan verifikasi email. Tidak perlu menunggu, langsung bisa digunakan untuk mengelola sekolah Anda.',
  },
  {
    question: 'Apakah data sekolah aman di cloud?',
    answer: 'Ya, kami menggunakan enkripsi AES-256, backup harian otomatis, dan sertifikasi ISO 27001 untuk keamanan data. Setiap tenant memiliki database terpisah dengan isolasi data yang ketat.',
  },
  {
    question: 'Bisakah diintegrasikan dengan sistem yang sudah ada?',
    answer: 'Tentu! CLASS menyediakan API dan webhook untuk integrasi dengan sistem fingerprint, payment gateway, LMS, dan aplikasi pihak ketiga. Tim teknis kami siap membantu proses integrasi.',
  },
  {
    question: 'Bagaimana dengan dukungan teknis?',
    answer: 'Kami menyediakan support 24/7 via chat, email, dan telepon. Plus dokumentasi lengkap, video tutorial, dan panduan step-by-step untuk setiap fitur.',
  },
  {
    question: 'Berapa biaya penggunaan CLASS?',
    answer: 'Gratis selamanya untuk sekolah dengan kurang dari 50 siswa. Untuk sekolah dengan 51+ siswa, biaya mulai dari Rp 4.000 - Rp 5.000 per siswa per tahun. Semua paket termasuk trial 1 bulan gratis.',
  },
  {
    question: 'Apakah ada batasan jumlah pengguna atau modul?',
    answer: 'Tidak ada batasan! Semua fitur dan 24+ modul tersedia untuk semua tenant, terlepas dari tier pricing. Perbedaan hanya pada jumlah siswa yang dapat dikelola.',
  },
  {
    question: 'Bagaimana cara migrasi data dari sistem lama?',
    answer: 'Anda dapat mengimpor data melalui Excel/CSV atau menggunakan API. Tim kami juga menyediakan layanan migrasi data profesional untuk memastikan semua data terpindah dengan akurat.',
  },
  {
    question: 'Apakah CLASS bisa digunakan untuk sekolah dengan banyak cabang?',
    answer: 'Ya! CLASS dirancang dengan arsitektur multi-tenant, sehingga setiap cabang dapat memiliki database terpisah namun tetap terpusat dalam satu platform. Ideal untuk yayasan atau sekolah dengan banyak unit.',
  },
  {
    question: 'Bagaimana sistem pembayaran dan billing?',
    answer: 'Billing dilakukan per tahun berdasarkan jumlah siswa. Penambahan kurang dari 20 siswa tidak dikenakan biaya tambahan. Harga terkunci saat subscription pertama dibuat, sehingga tidak akan berubah meskipun jumlah siswa bertambah.',
  },
  {
    question: 'Apakah ada aplikasi mobile untuk siswa dan orang tua?',
    answer: 'Ya, CLASS menyediakan aplikasi mobile untuk iOS dan Android yang memungkinkan siswa dan orang tua mengakses informasi akademik, kehadiran, nilai, dan komunikasi sekolah secara real-time.',
  },
  {
    question: 'Bagaimana dengan pelatihan untuk staf sekolah?',
    answer: 'Kami menyediakan video tutorial lengkap, dokumentasi interaktif, dan sesi pelatihan online. Tim support kami juga siap membantu melalui chat atau video call untuk memastikan semua pengguna dapat menggunakan sistem dengan optimal.',
  },
  {
    question: 'Apakah CLASS mendukung kurikulum Merdeka dan Kurikulum 2013?',
    answer: 'Ya, CLASS mendukung berbagai kurikulum termasuk Kurikulum Merdeka, Kurikulum 2013, dan kurikulum internasional. Sistem dapat dikonfigurasi sesuai kebutuhan sekolah Anda.',
  },
  {
    question: 'Bagaimana cara backup dan restore data?',
    answer: 'Backup dilakukan otomatis setiap hari secara real-time. Anda juga dapat melakukan backup manual kapan saja melalui dashboard. Restore data dapat dilakukan dengan mudah melalui antarmuka admin.',
  },
  {
    question: 'Apakah ada limit untuk penyimpanan file dan dokumen?',
    answer: 'Setiap tenant mendapatkan penyimpanan cloud yang cukup besar. Jika diperlukan lebih banyak, dapat diupgrade dengan mudah. Tidak ada limit untuk jumlah file yang dapat diunggah.',
  },
  {
    question: 'Bagaimana dengan keamanan akses dan hak pengguna?',
    answer: 'CLASS memiliki sistem role-based access control (RBAC) yang memungkinkan Anda mengatur hak akses untuk setiap pengguna. Mulai dari super admin, admin sekolah, guru, hingga siswa dan orang tua, semuanya dapat dikonfigurasi sesuai kebutuhan.',
  },
];

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [visibleSections, setVisibleSections] = useState<VisibilityMap>({ hero: true });
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({});
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch testimonials from API
  const { data: testimonialsData, isLoading: isLoadingTestimonials } = useQuery({
    queryKey: ['testimonials', 'featured'],
    queryFn: () => testimonialsApi.getFeatured(3),
    retry: 1, // Only retry once if fails
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use API data if available, otherwise use default
  const testimonials = testimonialsData && testimonialsData.length > 0
    ? testimonialsData.map((t: Testimonial) => ({
        tenantName: t.tenantName,
        reviewerName: t.reviewerName,
        reviewerRole: t.reviewerRole,
        quote: t.quote,
        rating: t.rating,
        avatar: t.reviewerAvatar || t.reviewerName.substring(0, 2).toUpperCase(),
      }))
    : defaultTestimonials;

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 80);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const markVisible = (key: string) => {
      setVisibleSections((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
    };

    if (typeof window === 'undefined') {
      return;
    }

    const animatedNodes = document.querySelectorAll<HTMLElement>('[data-animate-on-view]');

    if (!('IntersectionObserver' in window)) {
      animatedNodes.forEach((node) => {
        const key = node.dataset.animateOnView;
        if (key) {
          markVisible(key);
        }
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const key = entry.target.getAttribute('data-animate-on-view');
            if (key) {
              markVisible(key);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25, rootMargin: '0px 0px -10%' },
    );

    animatedNodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  const sectionVisibility = (key: string) => visibleSections[key];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 via-white to-slate-50 text-slate-900 selection:bg-blue-500/30">
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 opacity-60 blur-3xl animate-orb" />
        <div className="absolute -right-20 top-1/3 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-purple-200 via-rose-200 to-orange-200 opacity-50 blur-3xl animate-orb-delayed" />
        <div className="absolute left-1/2 top-2/3 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-200 via-cyan-200 to-emerald-200 opacity-40 blur-3xl animate-orb-alt" />
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:gap-6 sm:px-6">
          <Link href="/" className="flex items-center space-x-4 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-2xl font-bold text-white shadow-lg shadow-blue-500/50 animate-float-slow group-hover:scale-110 transition-transform">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="transition duration-700 ease-out">
              <p className="text-sm uppercase tracking-[0.4em] text-blue-600">CLASS PLATFORM</p>
              <p className="text-xl font-semibold text-slate-900">Comprehensive Learning & School System</p>
            </div>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:flex-nowrap sm:justify-end">
            <ThemeToggle variant="button" className="hidden sm:flex" />
            <LanguageSwitcher variant="button" className="hidden sm:flex" />
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 min-h-[44px]"
            >
              Masuk
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50 hover:brightness-110 hover:scale-105 min-h-[44px]"
            >
              Daftar
              <Sparkles className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-10 -z-10 h-64 bg-gradient-to-b from-blue-100/50 via-blue-50/30 to-transparent blur-3xl animate-gradient" />
          <div
            data-animate-on-view="hero"
            className={`mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-24 pt-20 transition duration-700 sm:px-6 md:flex-row md:items-center md:gap-16 ${
              sectionVisibility('hero') ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="md:w-3/5">
              <div
                className={`inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-medium uppercase tracking-widest text-blue-600 shadow-xl shadow-blue-500/10 transition duration-700 ${
                  isMounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              >
                <span className="h-2 w-2 animate-ping rounded-full bg-blue-500" />
                Next-Gen School Operating System
              </div>
              <h1
                className={`mt-6 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl ${
                  isMounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                } transition duration-700 delay-75`}
              >
                Bangun ekosistem pendidikan terbaik dengan
                <span className="relative ml-3 inline-flex rotate-1 items-center">
                  <span className="relative z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    CLASS Multi-Tenant
                  </span>
                  <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-200/60 via-indigo-200/60 to-purple-200/60 blur-lg" />
                </span>
              </h1>
              <p
                className={`mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl ${
                  isMounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                } transition duration-700 delay-150`}
              >
                Orkestrasi administrasi, akademik, hingga komunikasi lintas stakeholder dalam satu workspace modern.
                CLASS memadukan otomasi, AI, dan pengalaman pengguna premium untuk sekolah yang terus tumbuh.
              </p>

              <div
                className={`mt-10 flex flex-col gap-4 text-sm text-slate-700 sm:flex-row ${
                  isMounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                } transition duration-700 delay-200`}
              >
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/30 outline-none transition hover:shadow-blue-500/50 hover:scale-105"
                >
                  <span className="relative flex items-center gap-2">
                    Daftar
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 -z-10 opacity-0 blur-2xl transition group-hover:opacity-60">
                    <span className="absolute inset-0 bg-white/40" />
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 hover:scale-105"
                >
                  Lihat Portal Pengguna
                </Link>
                <Link
                  href="/panduan"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-300 bg-blue-50 px-8 py-4 text-base font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 hover:scale-105"
                >
                  <BookOpen className="h-4 w-4" />
                  Panduan
                </Link>
              </div>

              <div className="mt-14 grid gap-4 sm:grid-cols-2">
                {primarySolutions.map((solution, index) => {
                  const IconComponent = solution.icon;
                  return (
                  <div
                    key={solution.title}
                    style={{ transitionDelay: `${index * 0.12 + 0.2}s` }}
                      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-blue-500/5 transition-all duration-700 ease-out ${
                      isMounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                      } hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-blue-500/20 hover:scale-[1.02] animate-float-slower`}
                  >
                      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${solution.gradient} opacity-10 blur-2xl transition group-hover:opacity-20`} />
                      <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${solution.gradient} text-white shadow-lg`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">{solution.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{solution.description}</p>
                  </div>
                  );
                })}
              </div>
            </div>

            <div
              className={`relative flex flex-1 flex-col items-center justify-center rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-blue-50/30 to-white p-8 shadow-[0_0_60px_-15px_rgba(56,189,248,0.3)] backdrop-blur-2xl transition duration-700 delay-150 ${
                isMounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
            >
              <div className="absolute inset-x-12 top-10 h-32 rounded-full bg-gradient-to-b from-blue-200/40 via-transparent to-transparent blur-3xl" />
              <div className="relative w-full space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 animate-section shadow-md">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
                    <span>Realtime Snapshot</span>
                    <span>Live</span>
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-slate-900">360° School Health Index</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Satu tampilan untuk akademik, keuangan, dan engagement komunitas sekolah.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {experienceMetrics.map((metric, index) => (
                    <div
                      key={metric.label}
                      style={{ transitionDelay: `${index * 0.08 + 0.2}s` }}
                      className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-inner shadow-blue-500/5 transition duration-700 ease-out ${
                        isMounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                      } animate-float-slow`}
                    >
                      <p className="text-xs uppercase tracking-widest text-blue-600">{metric.label}</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-900">{metric.value}</p>
                      <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-t border-slate-200 bg-white py-24 backdrop-blur-xl">
          <div
            data-animate-on-view="ecosystem"
            className={`mx-auto max-w-6xl px-6 transition-all duration-700 ${
              sectionVisibility('ecosystem') ? 'animate-section opacity-100' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Ekosistem Produk</p>
                <h2 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
                  Tiga lintasan inovasi yang menyatukan seluruh stakeholder sekolah.
                </h2>
              </div>
              <p className="max-w-xl text-base text-slate-600">
                Setiap modul dalam CLASS saling terhubung. Otomatisasi menyeluruh memastikan tidak ada data yang silo,
                sementara kontrol akses tenant menjaga keamanan setiap unit pendidikan.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {ecosystemTracks.map((track, index) => (
                <div
                  key={track.title}
                  style={{ transitionDelay: `${index * 0.15 + 0.1}s` }}
                  className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-blue-500/5 transition-all duration-700 ${
                    sectionVisibility('ecosystem') ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                  } hover:border-blue-300 hover:bg-blue-50/50 animate-float-slower`}
                >
                  <div
                    className={`absolute -top-20 right-0 h-32 w-32 rounded-full bg-gradient-to-br ${track.gradient} opacity-20 blur-3xl transition group-hover:opacity-30 animate-orb`}
                  />
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">{track.tag}</span>
                  <h3 className="mt-5 text-2xl font-semibold text-slate-900">{track.title}</h3>
                  <p className="mt-3 text-sm text-slate-600">{track.description}</p>
                  <div className="mt-6 inline-flex items-center text-sm font-semibold text-blue-600 transition group-hover:text-blue-700">
                    Jelajahi modul
                    <span className="ml-2 transition group-hover:translate-x-1">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-slate-200 bg-gradient-to-b from-slate-50 via-white to-blue-50/30 py-24">
          <div
            data-animate-on-view="features"
            className={`mx-auto max-w-6xl px-6 transition-all duration-700 ${
              sectionVisibility('features') ? 'animate-section opacity-100' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Fitur Unggulan</p>
              <h2 className="mt-5 text-3xl font-bold text-slate-900 md:text-4xl">
                Semua yang Anda butuhkan dalam satu platform terintegrasi
              </h2>
              <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto">
                Dari manajemen akademik hingga komunikasi, semua fitur dirancang untuk meningkatkan efisiensi dan pengalaman pengguna.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {keyFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={feature.title}
                    style={{ transitionDelay: `${(index % 4) * 0.1}s` }}
                    className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-blue-500/5 transition-all duration-500 ${
                      sectionVisibility('features') ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                    } hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:shadow-blue-500/20 hover:-translate-y-1`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md group-hover:scale-110 transition-transform">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-slate-900">{feature.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative border-t border-slate-200 bg-white py-24">
          <div
            data-animate-on-view="modules"
            className={`mx-auto max-w-6xl px-6 transition-all duration-700 ${
              sectionVisibility('modules') ? 'animate-section opacity-100' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Modul Premium</p>
              <h2 className="mt-5 text-3xl font-bold text-slate-900 md:text-4xl">
                Lengkapi transformasi digital sekolah Anda dengan 24+ modul siap pakai.
              </h2>
            </div>

            <div className="mt-16 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {moduleShowcase.map((module, index) => (
                <div
                  key={module}
                  style={{ transitionDelay: `${(index % 6) * 0.08}s` }}
                  className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-lg shadow-blue-500/5 transition-all duration-500 ${
                    sectionVisibility('modules') ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                  } hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-slate-900 hover:shadow-blue-500/20 hover:-translate-y-1`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {module}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-slate-200 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 py-24">
          <div
            data-animate-on-view="benefits"
            className={`mx-auto max-w-6xl px-6 transition-all duration-700 ${
              sectionVisibility('benefits') ? 'animate-section opacity-100' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Keunggulan CLASS</p>
              <h2 className="mt-5 text-3xl font-bold text-slate-900 md:text-4xl">
                Mengapa ribuan sekolah mempercayai CLASS?
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div
                    key={benefit.text}
                    style={{ transitionDelay: `${index * 0.1}s` }}
                    className={`group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-500 ${
                      sectionVisibility('benefits') ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                    } hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-lg hover:scale-[1.02]`}
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md group-hover:scale-110 transition-transform">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <p className="text-base font-medium text-slate-900">{benefit.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative border-t border-slate-200 bg-gradient-to-b from-white via-blue-50/30 to-white py-24">
          <div
            data-animate-on-view="pricing"
            className={`mx-auto max-w-7xl px-6 transition-all duration-700 ${
              sectionVisibility('pricing') ? 'animate-section opacity-100' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Harga Terjangkau</p>
              <h2 className="mt-5 text-3xl font-bold text-slate-900 md:text-4xl">
                Pricing sederhana, transparan, dan terjangkau untuk semua sekolah
              </h2>
              <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto">
                Mulai dengan gratis selamanya untuk sekolah kecil, atau pilih paket sesuai kebutuhan Anda. Semua paket termasuk trial 1 bulan gratis.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 mt-12">
              {/* Free Forever Plan */}
              <div
                className={`group relative rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-xl transition-all duration-500 ${
                  sectionVisibility('pricing') ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                } hover:border-blue-300 hover:shadow-2xl hover:scale-[1.02]`}
                style={{ transitionDelay: '0.1s' }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                    GRATIS SELAMANYA
                  </span>
                </div>
                <div className="text-center mt-4">
                  <h3 className="text-2xl font-bold text-slate-900">Free Forever</h3>
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-slate-900">Rp 0</span>
                    <span className="text-slate-600 ml-2">/tahun</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Untuk sekolah dengan &lt; 50 siswa</p>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">Semua fitur CLASS</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">24+ modul lengkap</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">Advanced reports & analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">API access & integrasi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">Support via email</span>
                  </li>
                </ul>
                <Link
                  href="/register"
                  className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Daftar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Standard Plan */}
              <div
                className={`group relative rounded-3xl border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-2xl shadow-blue-500/20 transition-all duration-500 ${
                  sectionVisibility('pricing') ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                } hover:scale-[1.02] hover:shadow-blue-500/30`}
                style={{ transitionDelay: '0.2s' }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                    PALING POPULER
                  </span>
                </div>
                <div className="text-center mt-4">
                  <h3 className="text-2xl font-bold text-slate-900">Standard</h3>
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-slate-900">Rp 5.000</span>
                    <span className="text-slate-600 ml-2">/siswa/tahun</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Untuk 51 - 500 siswa</p>
                  <p className="text-xs text-blue-600 font-semibold mt-2">Trial 1 bulan gratis</p>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">Semua fitur CLASS</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">24+ modul lengkap</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">Advanced reports & analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">API access & integrasi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">Support via email</span>
                  </li>
                </ul>
                <Link
                  href="/register"
                  className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50 hover:scale-105"
                >
                  Daftar
                  <Sparkles className="h-4 w-4" />
                </Link>
              </div>

              {/* Enterprise Plan */}
              <div
                className={`group relative rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-xl transition-all duration-500 ${
                  sectionVisibility('pricing') ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                } hover:border-purple-300 hover:shadow-2xl hover:scale-[1.02]`}
                style={{ transitionDelay: '0.3s' }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                    ENTERPRISE
                  </span>
                </div>
                <div className="text-center mt-4">
                  <h3 className="text-2xl font-bold text-slate-900">Enterprise</h3>
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-slate-900">Rp 4.000</span>
                    <span className="text-slate-600 ml-2">/siswa/tahun</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Untuk 501+ siswa</p>
                  <p className="text-xs text-purple-600 font-semibold mt-2">Trial 1 bulan gratis</p>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">Semua fitur CLASS</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">24+ modul lengkap</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">Advanced reports & analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">API access & integrasi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">Support via email</span>
                  </li>
                </ul>
                <Link
                  href="/register"
                  className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-purple-500 bg-white px-6 py-3 text-sm font-semibold text-purple-600 transition hover:bg-purple-50 hover:scale-105"
                >
                  Daftar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-slate-600">
                💡 <strong>Catatan:</strong> Penambahan &lt; 20 siswa tidak dikenakan biaya tambahan. Harga locked saat subscription dibuat.
              </p>
            </div>
          </div>
        </section>

        <section className="relative border-t border-slate-200 bg-white py-24">
          <div
            data-animate-on-view="success"
            className={`mx-auto max-w-6xl px-6 transition-all duration-700 ${
              sectionVisibility('success') ? 'animate-section opacity-100' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Cerita Keberhasilan</p>
                <h2 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">Dipercaya sekolah inovatif seluruh Indonesia.</h2>
                <p className="mt-4 max-w-xl text-base text-slate-600">
                  CLASS membantu mengorkestrasi pertumbuhan sekolah, meningkatkan kolaborasi guru, dan memberikan
                  pengalaman baru bagi orang tua.
                </p>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={`${testimonial.tenantName}-${index}`}
                      style={{ transitionDelay: `${index * 0.12 + 0.1}s` }}
                      className={`group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-blue-500/5 transition-all duration-700 ${
                        sectionVisibility('success') ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                      } hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-blue-500/20 hover:scale-[1.02] animate-float-slow`}
                    >
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{testimonial.quote}</p>
                      <div className="mt-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white shadow-md">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{testimonial.reviewerName}</p>
                          <p className="text-xs uppercase tracking-[0.2em] text-blue-600">{testimonial.reviewerRole}</p>
                          <p className="text-xs text-slate-500 mt-1">{testimonial.tenantName}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div
                  className={`rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-blue-500/5 transition duration-700 ${
                    sectionVisibility('success') ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                  }`}
                  style={{ transitionDelay: '0.35s' }}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Blueprint Transformasi</p>
                  <h3 className="mt-4 text-2xl font-semibold text-slate-900">Landasan eksekusi digital yang terukur.</h3>
                  <p className="mt-3 text-sm text-slate-600">
                    Setup CLASS sangat mudah dan cepat. Semua fitur tersedia langsung setelah aktivasi akun.
                  </p>

                  <div className="mt-6 space-y-5">
                    {transformationTimeline.map((timeline, idx) => (
                      <div className="flex gap-4" key={timeline.step}>
                        <div className="mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-full border border-blue-300 bg-blue-50 text-sm font-semibold text-blue-600">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{timeline.step}</p>
                          <p className="text-xs text-slate-600">{timeline.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 shadow-lg shadow-blue-500/10 transition duration-700 ${
                    sectionVisibility('success') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: '0.55s' }}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Integrasi Ekosistem</p>
                  <p className="mt-4 text-base text-slate-700">
                    Tersedia API, webhook, dan marketplace add-on untuk menghubungkan CLASS dengan LMS, fingerprint,
                    pembayaran, hingga pelaporan pemerintah.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      Jadwalkan sesi konsultasi
                      <span className="transition group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-t border-slate-200 bg-gradient-to-b from-slate-50 via-white to-blue-50/30 py-24">
          <div
            data-animate-on-view="faq"
            className={`mx-auto max-w-4xl px-6 transition-all duration-700 ${
              sectionVisibility('faq') ? 'animate-section opacity-100' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Pertanyaan Umum</p>
              <h2 className="mt-5 text-3xl font-bold text-slate-900 md:text-4xl">
                Semua yang perlu Anda ketahui tentang CLASS
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaqs[index] || false;
                return (
                  <div
                    key={faq.question}
                    style={{ transitionDelay: `${index * 0.1}s` }}
                    className={`rounded-2xl border border-slate-200 bg-white transition-all duration-500 ${
                      sectionVisibility('faq') ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                    } ${isOpen ? 'bg-blue-50/50 border-blue-300 shadow-md' : 'hover:border-blue-300 hover:shadow-sm'}`}
                  >
                    <button
                      onClick={() => setOpenFaqs(prev => ({ ...prev, [index]: !prev[index] }))}
                      className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 group min-h-[44px]"
                    >
                      <span className="text-base font-semibold text-slate-900 pr-4">{faq.question}</span>
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center transition-transform group-hover:bg-blue-100 ${isOpen ? 'rotate-180 bg-blue-100' : ''}`}>
                        <ArrowRight className="h-4 w-4 text-slate-600 rotate-90" />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5">
                        <p className="text-sm text-slate-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative border-t border-slate-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 py-24">
          <div
            data-animate-on-view="cta"
            className={`mx-auto max-w-6xl rounded-[3rem] border border-blue-200 bg-white px-6 py-16 text-center shadow-2xl shadow-blue-500/20 backdrop-blur-xl transition duration-700 md:px-16 ${
              sectionVisibility('cta') ? 'animate-section opacity-100' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-medium uppercase tracking-widest text-blue-600 mb-6">
              <Sparkles className="h-3 w-3" />
              Siap Naik Kelas?
            </div>
            <h2 className="mt-6 text-3xl font-bold text-slate-900 md:text-4xl">
              Mulai perjalanan digital sekolah Anda dengan orkestrasi tenant yang rapi dan pengalaman pengguna memikat.
            </h2>
            <p className="mt-4 text-base text-slate-600 md:text-lg">
              Daftar sekarang dan langsung mulai menggunakan semua fitur CLASS. Setup mudah, aktivasi instan.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50 hover:scale-105 min-h-[44px]"
              >
                Daftar Sekarang
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-10 py-4 text-base font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 min-h-[44px]"
              >
                <PlayCircle className="h-4 w-4" />
                Masuk sebagai Sekolah
              </Link>
            </div>

            <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
              {experienceMetrics.slice(0, 3).map((metric, index) => (
                <div
                  key={metric.label}
                  style={{ transitionDelay: `${index * 0.1 + 0.2}s` }}
                  className={`rounded-3xl border border-slate-200 bg-white p-5 transition-all duration-700 ${
                    sectionVisibility('cta') ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                  } hover:border-blue-300 hover:bg-blue-50/50 hover:scale-[1.02] animate-float-slower`}
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-blue-600">{metric.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{metric.value}</p>
                  <p className="mt-1 text-xs text-slate-600">{metric.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-4 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-blue-500/40 animate-float-slow">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">CLASS</p>
                  <p className="text-sm text-slate-600">Comprehensive Learning and School System</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 max-w-md">
                Platform manajemen sekolah terintegrasi yang membantu ribuan institusi pendidikan di Indonesia mencapai transformasi digital yang sukses.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-sm text-slate-600 hover:text-blue-600 transition">Masuk</Link></li>
                <li><Link href="/register" className="text-sm text-slate-600 hover:text-blue-600 transition">Daftar</Link></li>
                <li><Link href="#" className="text-sm text-slate-600 hover:text-blue-600 transition">Fitur</Link></li>
                <li><Link href="#" className="text-sm text-slate-600 hover:text-blue-600 transition">Harga</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 mb-4">Dukungan</h3>
              <ul className="space-y-2">
                <li><Link href="/panduan" className="text-sm text-slate-600 hover:text-blue-600 transition">Panduan Penggunaan</Link></li>
                <li><Link href="#" className="text-sm text-slate-600 hover:text-blue-600 transition">Dokumentasi</Link></li>
                <li><Link href="#" className="text-sm text-slate-600 hover:text-blue-600 transition">Kontak</Link></li>
                <li><Link href="#" className="text-sm text-slate-600 hover:text-blue-600 transition">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <p className="text-sm text-slate-600">
              © {new Date().getFullYear()} CLASS. Membantu sekolah Indonesia melesat dengan pengalaman digital berkelas dunia.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-slate-600 hover:text-blue-600 transition">
                <Globe className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-600 hover:text-blue-600 transition">
                <MessageSquare className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <BackToTop />
      <AccessibilityControls />

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.02);
          }
        }
        @keyframes orbPulse {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          33% {
            transform: translate3d(30px, -50px, 0) scale(1.08);
          }
          66% {
            transform: translate3d(-40px, 40px, 0) scale(0.95);
          }
        }
        @keyframes gradientShift {
          0% {
            transform: translateX(-10%);
            opacity: 0.8;
          }
          50% {
            transform: translateX(12%);
            opacity: 1;
          }
          100% {
            transform: translateX(-10%);
            opacity: 0.8;
          }
        }
        @keyframes sectionReveal {
          0% {
            opacity: 0;
            transform: translate3d(0, 40px, 0) scale(0.98);
          }
          60% {
            opacity: 1;
            transform: translate3d(0, -6px, 0) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        .animate-float-slow {
          animation: float 12s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float 16s ease-in-out infinite;
        }
        .animate-orb {
          animation: orbPulse 18s ease-in-out infinite;
        }
        .animate-orb-delayed {
          animation: orbPulse 22s ease-in-out infinite;
          animation-delay: 3s;
        }
        .animate-orb-alt {
          animation: orbPulse 20s ease-in-out infinite;
          animation-delay: 5s;
        }
        .animate-gradient {
          animation: gradientShift 18s ease-in-out infinite;
        }
        .animate-section {
          animation: sectionReveal 0.9s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
      `}</style>
    </div>
  );
}
