'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type VisibilityMap = Record<string, boolean>;

const primarySolutions = [
  {
    icon: '📊',
    title: 'Akademik Terintegrasi',
    description:
      'Satu pusat kendali untuk kurikulum, jadwal, penilaian, dan analitik performa siswa secara real-time.',
  },
  {
    icon: '🧠',
    title: 'AI Learning Companion',
    description:
      'Rekomendasi otomatis berbasis AI untuk tindak lanjut pembelajaran dan insight keunggulan tiap peserta didik.',
  },
  {
    icon: '🤝',
    title: 'Kolaborasi Multi-Peran',
    description:
      'Portal modern untuk kepala sekolah, guru, orang tua, dan siswa dengan komunikasi terintegrasi.',
  },
];

const experienceMetrics = [
  {
    label: 'Sekolah Digital',
    value: '120+',
    detail: 'terimplementasi penuh, dari SD hingga SMK',
  },
  {
    label: 'Waktu Implementasi',
    value: '14 hari',
    detail: 'deploy cepat dengan migrasi data otomatis',
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
    step: 'Kickoff Strategis',
    detail: 'Workshop blueprint 360° melibatkan pimpinan sekolah dan tim IT.',
  },
  {
    step: 'Migrasi Data Cerdas',
    detail: 'Transformasi data lama dengan validasi otomatis dan quality check.',
  },
  {
    step: 'Implementasi Multi Tenant',
    detail: 'Deploy terpisah per sekolah/cabang dengan kontrol pusat.',
  },
  {
    step: 'Enablement & Scaling',
    detail: 'Onboarding interaktif, micro learning, dan monitoring adopsi.',
  },
];

const testimonials = [
  {
    name: 'SMA Negeri Pintar',
    role: 'Kepala Sekolah',
    quote:
      '“CLASS mengubah cara kami mengambil keputusan. Dashboard real-time memudahkan kami mengarahkan strategi akademik setiap minggu.”',
  },
  {
    name: 'SMK Nusantara Digital',
    role: 'Koordinator IT',
    quote:
      '“Migrasi antar tenant sangat rapi. Integrasi dengan sistem fingerprint kami berjalan mulus hanya dalam 3 hari.”',
  },
  {
    name: 'SD Kreatif Mandiri',
    role: 'Orang Tua',
    quote:
      '“Aplikasi mobile CLASS membuat saya tidak pernah ketinggalan informasi nilai dan kehadiran anak lagi.”',
  },
];

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [visibleSections, setVisibleSections] = useState<VisibilityMap>({ hero: true });

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 80);
    return () => clearTimeout(timeout);
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
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-2xl font-bold text-white shadow-lg shadow-blue-500/50 animate-float-slow">
              C
            </div>
            <div className="transition duration-700 ease-out">
              <p className="text-sm uppercase tracking-[0.4em] text-blue-600">CLASS PLATFORM</p>
              <p className="text-xl font-semibold text-slate-900">Comprehensive Learning & School System</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:flex-nowrap sm:justify-end">
            <Link
              href="/login"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50 hover:brightness-110"
            >
              Coba Gratis
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
                  className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/30 outline-none transition hover:shadow-blue-500/50"
                >
                  <span className="relative flex items-center gap-2">
                    Mulai Demo Interaktif
                    <span className="transition group-hover:translate-x-1">→</span>
                  </span>
                  <span className="absolute inset-0 -z-10 opacity-0 blur-2xl transition group-hover:opacity-60">
                    <span className="absolute inset-0 bg-white/40" />
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Lihat Portal Pengguna
                </Link>
              </div>

              <div className="mt-14 grid gap-4 sm:grid-cols-2">
                {primarySolutions.map((solution, index) => (
                  <div
                    key={solution.title}
                    style={{ transitionDelay: `${index * 0.12 + 0.2}s` }}
                    className={`group rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-blue-500/5 transition-all duration-700 ease-out ${
                      isMounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                    } hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-blue-500/20 animate-float-slower`}
                  >
                    <span className="text-3xl">{solution.icon}</span>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">{solution.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{solution.description}</p>
                  </div>
                ))}
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
                  className={`rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-lg shadow-blue-500/5 transition duration-700 ${
                    sectionVisibility('modules') ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                  } hover:border-blue-300 hover:bg-blue-50 hover:text-slate-900 animate-float-slow`}
                >
                  {module}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/10 bg-slate-950/70 py-24">
          <div
            data-animate-on-view="success"
            className={`mx-auto max-w-6xl px-6 transition-all duration-700 ${
              sectionVisibility('success') ? 'animate-section opacity-100' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">Cerita Keberhasilan</p>
                <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">Dipercaya sekolah inovatif seluruh Indonesia.</h2>
                <p className="mt-4 max-w-xl text-base text-slate-200/80">
                  CLASS membantu mengorkestrasi pertumbuhan sekolah, meningkatkan kolaborasi guru, dan memberikan
                  pengalaman baru bagi orang tua.
                </p>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={testimonial.name}
                      style={{ transitionDelay: `${index * 0.12 + 0.1}s` }}
                      className={`flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-lg shadow-blue-500/10 transition duration-700 ${
                        sectionVisibility('success') ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                      } animate-float-slow`}
                    >
                      <p className="text-sm text-slate-200/80">{testimonial.quote}</p>
                      <div className="mt-6">
                        <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-blue-200/80">{testimonial.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div
                  className={`rounded-3xl border border-white/15 bg-white/[0.07] p-8 shadow-xl shadow-blue-500/10 transition duration-700 ${
                    sectionVisibility('success') ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                  }`}
                  style={{ transitionDelay: '0.35s' }}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200/90">Blueprint Transformasi</p>
                  <h3 className="mt-4 text-2xl font-semibold text-white">Landasan eksekusi digital yang terukur.</h3>
                  <p className="mt-3 text-sm text-slate-200/80">
                    Langkah implementasi CLASS dibuat modular agar mudah disesuaikan dengan kesiapan organisasi sekolah.
                  </p>

                  <div className="mt-6 space-y-5">
                    {transformationTimeline.map((timeline, idx) => (
                      <div className="flex gap-4" key={timeline.step}>
                        <div className="mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-full border border-blue-300/30 bg-blue-400/20 text-sm font-semibold text-blue-100">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{timeline.step}</p>
                          <p className="text-xs text-slate-200/70">{timeline.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/30 p-8 shadow-lg shadow-blue-500/20 transition duration-700 ${
                    sectionVisibility('success') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: '0.55s' }}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200/90">Integrasi Ekosistem</p>
                  <p className="mt-4 text-base text-slate-100">
                    Tersedia API, webhook, dan marketplace add-on untuk menghubungkan CLASS dengan LMS, fingerprint,
                    pembayaran, hingga pelaporan pemerintah.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-blue-100"
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

        <section className="relative border-t border-white/10 bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-purple-600/20 py-24">
          <div
            data-animate-on-view="cta"
            className={`mx-auto max-w-6xl rounded-[3rem] border border-white/10 bg-slate-950/80 px-6 py-16 text-center shadow-2xl shadow-blue-500/30 backdrop-blur-xl transition duration-700 md:px-16 ${
              sectionVisibility('cta') ? 'animate-section opacity-100' : 'opacity-0 translate-y-10'
            }`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">Siap Naik Kelas?</p>
            <h2 className="mt-6 text-3xl font-bold text-white md:text-4xl">
              Mulai perjalanan digital sekolah Anda dengan orkestrasi tenant yang rapi dan pengalaman pengguna memikat.
            </h2>
            <p className="mt-4 text-base text-slate-200/80 md:text-lg">
              Tim kami akan mendampingi dari analisis kebutuhan, migrasi data, hingga aktivasi penuh seluruh modul.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50"
              >
                Request Live Demo
                <span className="transition group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/15 px-10 py-4 text-base font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
              >
                Masuk sebagai Sekolah
              </Link>
            </div>

            <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
              {experienceMetrics.slice(0, 3).map((metric, index) => (
                <div
                  key={metric.label}
                  style={{ transitionDelay: `${index * 0.1 + 0.2}s` }}
                  className={`rounded-3xl border border-white/10 bg-white/[0.05] p-5 transition duration-700 ${
                    sectionVisibility('cta') ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                  } animate-float-slower`}
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-blue-200/80">{metric.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{metric.value}</p>
                  <p className="mt-1 text-xs text-slate-300/80">{metric.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/90 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-xl font-bold text-white shadow-lg shadow-blue-500/40 animate-float-slow">
                C
              </div>
              <div>
                <p className="text-lg font-semibold text-white">CLASS</p>
                <p className="text-sm text-slate-300/80">Comprehensive Learning and School System</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} CLASS. Membantu sekolah Indonesia melesat dengan pengalaman digital berkelas dunia.
            </p>
          </div>
        </div>
      </footer>

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
