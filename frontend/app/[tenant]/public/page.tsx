'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api/public';
import { ppdbApi } from '@/lib/api/ppdb';
import Link from 'next/link';
import {
  Newspaper,
  Image as ImageIcon,
  Download,
  Mail,
  Users,
  GraduationCap,
  Award,
  Calendar,
  ArrowRight,
  FileText,
  Sparkles,
  Play,
  MapPin,
  PhoneCall,
  CheckCircle2,
  Star,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PublicHomePage() {
  const params = useParams();
  const tenantId = params.tenant as string;

  const { data: homeStats, isLoading: statsLoading } = useQuery({
    queryKey: ['public-home', tenantId],
    queryFn: () => publicApi.getHome(tenantId),
    enabled: !!tenantId,
  });

  const { data: featuredNews } = useQuery({
    queryKey: ['public-featured-news', tenantId],
    queryFn: () => publicApi.getFeaturedNews(tenantId, 3),
    enabled: !!tenantId,
  });

  const { data: latestNews } = useQuery({
    queryKey: ['public-latest-news', tenantId],
    queryFn: () => publicApi.getLatestNews(tenantId, 6),
    enabled: !!tenantId,
  });

  const { data: galleries } = useQuery({
    queryKey: ['public-galleries', tenantId],
    queryFn: () => publicApi.getGalleries(tenantId),
    enabled: !!tenantId,
  });

  const { data: ppdbInfo } = useQuery({
    queryKey: ['public-ppdb-info', tenantId],
    queryFn: () => ppdbApi.getPublicInfo(tenantId),
    enabled: !!tenantId,
  });

  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return '—';
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const heroHighlights = [
    {
      label: 'Siswa Aktif',
      value: formatNumber(homeStats?.studentCount),
      accent: 'from-sky-500/90 to-blue-600',
    },
    {
      label: 'Guru Profesional',
      value: formatNumber(homeStats?.teacherCount),
      accent: 'from-emerald-500/90 to-green-600',
    },
    {
      label: 'Berita & Program',
      value: formatNumber(homeStats?.newsCount),
      accent: 'from-violet-500/90 to-purple-600',
    },
    {
      label: 'Tahun Pengalaman',
      value: homeStats?.yearCount ? `${homeStats.yearCount}+` : '20+',
      accent: 'from-amber-500/90 to-orange-600',
    },
  ];

  const announcementSource =
    (featuredNews && featuredNews.length > 0 ? featuredNews : latestNews?.slice(0, 4)) ?? [];

  const announcements =
    announcementSource.length > 0
      ? announcementSource.map((item) => ({
          id: item.id,
          title: item.title,
          date: new Date(item.publishedAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
          }),
          href: `/${tenantId}/public/news/${item.slug}`,
        }))
      : [
          {
            id: 1,
            title: 'PPDB tahun pelajaran baru telah dibuka – segera daftar!',
            date: 'Hari ini',
            href: `/${tenantId}/public/ppdb`,
          },
        ];

  const ppdbSchedules = ppdbInfo?.availableSchedules?.slice(0, 3) ?? [];

  const quickLinks = [
    {
      href: `/${tenantId}/public/profile`,
      title: 'Profil Sekolah',
      description: 'Pelajari visi, misi, dan fasilitas unggulan sekolah',
      icon: Award,
      accent: 'text-blue-600 bg-blue-50',
    },
    {
      href: `/${tenantId}/public/ppdb`,
      title: 'PPDB',
      description: 'Informasi pendaftaran siswa baru secara lengkap',
      icon: GraduationCap,
      accent: 'text-green-600 bg-green-50',
    },
    {
      href: `/${tenantId}/public/download`,
      title: 'Download',
      description: 'Unduh formulir, brosur, dan dokumen akademik',
      icon: Download,
      accent: 'text-purple-600 bg-purple-50',
    },
    {
      href: `/${tenantId}/public/contact`,
      title: 'Kontak & Buku Tamu',
      description: 'Terhubung langsung dengan tim kami',
      icon: Mail,
      accent: 'text-orange-600 bg-orange-50',
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Evelyn – Alumni 2022',
      role: 'Mahasiswa Fakultas Kedokteran',
      quote:
        'Guru-guru membimbing dengan penuh perhatian. Saya mendapatkan banyak pengalaman berharga yang mengantar saya ke kampus impian.',
    },
    {
      id: 2,
      name: 'Rafi – Orang Tua',
      role: 'Wali murid kelas 9',
      quote:
        'Sekolah ini tidak hanya fokus akademik, tetapi juga karakter dan kepedulian sosial. Anak kami menjadi lebih percaya diri.',
    },
    {
      id: 3,
      name: 'Nadia – Siswa',
      role: 'Ketua OSIS',
      quote:
        'Kegiatan organisasi dan ekstrakurikuler sangat aktif. Kami diajak mengelola event besar dan belajar memimpin.',
    },
  ];

  if (statsLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-400"></div>
          <p className="mt-4 text-slate-200">Memuat halaman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-20 py-4">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/80 p-8 text-slate-900 shadow-[0_40px_120px_rgba(15,23,42,0.35)]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-90"></div>
        <div className="absolute -top-16 left-10 h-40 w-40 rounded-full bg-blue-200/50 blur-3xl animate-blob"></div>
        <div className="absolute -bottom-12 right-4 h-48 w-48 rounded-full bg-purple-200/50 blur-3xl animate-blob-fast"></div>
        <div className="relative grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-100">
              <Sparkles className="h-4 w-4" />
              Sekolah unggulan Kabupaten Pesisir Barat
            </div>
            <h2 className="mb-6 text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
              Pendidikan unggul yang membangun karakter, prestasi, dan masa depan.
            </h2>
            <p className="mb-8 text-lg text-slate-600">
              Kami menghadirkan pengalaman belajar kolaboratif, inovatif, dan ramah teknologi melalui
              kurikulum terbaru, guru profesional, serta lingkungan yang aman dan inspiratif.
            </p>
            <div className="mb-10 flex flex-wrap gap-4">
              <Link href={`/${tenantId}/public/ppdb`}>
                <Button size="lg" className="h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-white shadow-lg shadow-blue-500/30 hover:from-blue-500 hover:to-purple-500">
                  Daftar PPDB
                </Button>
              </Link>
              <Link href={`/${tenantId}/public/profile`}>
                <Button size="lg" variant="outline" className="h-12 rounded-full border-slate-200 px-8 text-slate-900 transition-all hover:border-blue-200 hover:bg-white/90">
                  <Play className="h-4 w-4" />
                  Jelajahi Profil
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {heroHighlights.map((item, index) => (
                <div
                  key={item.label}
                  className="glass-panel-light tilt-hover rounded-2xl p-5"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
                  <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${item.accent}`}></div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 scale-105 rounded-[32px] bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/20 blur-3xl"></div>
            <div className="relative rounded-[32px] border border-white/70 bg-white/90 p-8 text-slate-900 shadow-2xl animate-pulse-glow">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50">
                  <Users className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Lingkungan belajar nyaman</p>
                  <p className="text-lg font-semibold text-slate-900">Fasilitas lengkap & modern</p>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { label: 'Laboratorium Sains', value: '3 ruang' },
                  { label: 'Studio Kreatif', value: 'Multimedia' },
                  { label: 'Perpustakaan Digital', value: '24/7' },
                  { label: 'Ekstrakurikuler', value: '15+ pilihan' },
                ].map((facility) => (
                  <div key={facility.label} className="rounded-2xl border border-dashed border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">{facility.label}</p>
                    <p className="text-lg font-semibold text-slate-900">{facility.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <p className="text-sm text-white/80">Program unggulan</p>
                <p className="mb-3 text-2xl font-bold">Akademik & Karakter Terpadu</p>
                <p className="text-sm text-white/80">
                  Pendampingan minat bakat, kelas kepemimpinan, hingga program bahasa internasional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {announcements.length > 0 && (
        <section className="glass-panel-light rounded-[28px] p-8 text-slate-900 animate-fade-up">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
              <Calendar className="h-4 w-4" />
              Agenda & Pengumuman
            </div>
            <span className="text-sm text-slate-500">Selalu update dengan kabar terbaru kami</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {announcements.map((item, index) => (
              <Link
                key={item.id}
                href={item.href}
                className="group rounded-2xl border border-slate-100 bg-white/80 px-4 py-4 transition-all hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.date}</p>
                <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                  {item.title}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
                  Selengkapnya
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featuredNews && featuredNews.length > 0 && (
        <section className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-white">
            <h2 className="flex items-center gap-3 text-3xl font-bold">
              <Newspaper className="h-8 w-8 text-blue-300" />
              Berita Utama
            </h2>
            <Link href={`/${tenantId}/public/news`}>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Lihat Semua
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredNews.map((news, index) => (
              <Link key={news.id} href={`/${tenantId}/public/news/${news.slug}`}>
                <article
                  className="tilt-hover group overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-white backdrop-blur"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative h-56 overflow-hidden">
                    {news.featuredImage ? (
                      <img
                        src={news.featuredImage}
                        alt={news.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600/40 to-purple-600/40">
                        <Newspaper className="h-12 w-12 text-white/70" />
                      </div>
                    )}
                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                      <FileText className="h-4 w-4 text-blue-500" />
                      Rekomendasi
                    </div>
                  </div>
                  <div className="space-y-4 p-6">
                    <div className="flex items-center gap-2 text-sm text-slate-200">
                      <Calendar className="h-4 w-4" />
                      {new Date(news.publishedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                    <h3 className="line-clamp-2 text-xl font-semibold text-white">{news.title}</h3>
                    <p className="line-clamp-3 text-sm text-slate-200">
                      {news.excerpt || news.content?.substring(0, 140)}
                    </p>
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>{news.viewCount} pembaca</span>
                      <span className="inline-flex items-center gap-1 text-blue-200">
                        Baca selengkapnya
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {latestNews && latestNews.length > 0 && (
        <section className="space-y-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="flex items-center gap-3 text-2xl font-bold">
              <Newspaper className="h-6 w-6 text-blue-300" />
              Berita Terbaru
            </h2>
            <Link href={`/${tenantId}/public/news`}>
              <Button variant="ghost" className="text-blue-200 hover:bg-white/10 hover:text-white">
                Lihat semua kabar
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestNews.map((news, index) => (
              <Link key={news.id} href={`/${tenantId}/public/news/${news.slug}`}>
                <article
                  className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur transition hover:-translate-y-2 hover:shadow-2xl"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-200">
                    <Sparkles className="h-4 w-4" />
                    Update terbaru
                  </span>
                  <h3 className="mb-3 line-clamp-2 text-lg font-semibold">{news.title}</h3>
                  <p className="flex-1 text-sm text-slate-200 line-clamp-3">
                    {news.excerpt || news.content?.substring(0, 120)}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
                    <span>{new Date(news.publishedAt).toLocaleDateString('id-ID')}</span>
                    <span>{news.viewCount} pembaca</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {galleries && galleries.length > 0 && (
        <section className="space-y-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="flex items-center gap-3 text-2xl font-bold">
              <ImageIcon className="h-6 w-6 text-blue-300" />
              Galeri Kegiatan
            </h2>
            <Link href={`/${tenantId}/public/gallery`}>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Lihat semua galeri
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {galleries.slice(0, 8).map((gallery, index) => (
              <Link key={gallery.id} href={`/${tenantId}/public/gallery`}>
                <div
                  className="group relative aspect-square overflow-hidden rounded-3xl border border-white/10 shadow-lg"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <img
                    src={gallery.image}
                    alt={gallery.title || 'Galeri foto'}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%230f172a" width="400" height="400"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                  <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-sm font-semibold">{gallery.title || 'Galeri Sekolah'}</p>
                    <p className="text-xs text-slate-200">{gallery.description || 'Dokumentasi kegiatan pilihan'}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {ppdbSchedules.length > 0 && (
        <section className="rounded-[32px] border border-white/10 bg-white/90 p-8 text-slate-900 shadow-[0_30px_100px_rgba(15,23,42,0.25)]">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">Jadwal PPDB Terdekat</h2>
              <p className="text-slate-500">Pilih jadwal yang tersedia dan segera konfirmasi kehadiran Anda.</p>
            </div>
            <Link href={`/${tenantId}/public/ppdb`}>
              <Button className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 text-white">
                Lihat detail PPDB
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {ppdbSchedules.map((schedule, index) => (
              <div
                key={schedule.id}
                className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <p className="font-semibold">
                    {new Date(schedule.scheduleDate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4 text-blue-500" />
                  {schedule.startTime} - {schedule.endTime} WIB
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  {schedule.location}
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                  <Users className="h-4 w-4 text-emerald-500" />
                  {schedule.currentParticipants}/{schedule.maxParticipants} peserta
                </div>
                {schedule.notes && <p className="mt-3 text-xs text-slate-500">{schedule.notes}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_45%)] opacity-60"></div>
          <div className="relative space-y-4">
            <h2 className="text-3xl font-bold">Tur Virtual & Konsultasi Sekolah</h2>
            <p className="text-white/90">
              Dapatkan pengalaman menyeluruh tentang fasilitas, program unggulan, dan budaya belajar langsung dengan tim penerimaan kami.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3">
                <PhoneCall className="h-5 w-5" />
                <div>
                  <p className="text-xs uppercase text-white/70">Hotline Sekolah</p>
                  <p className="font-semibold">0728-123-456</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3">
                <MapPin className="h-5 w-5" />
                <div>
                  <p className="text-xs uppercase text-white/70">Lokasi</p>
                  <p className="font-semibold">Pesisir Barat, Lampung</p>
                </div>
              </div>
            </div>
            <Link href={`/${tenantId}/public/contact`}>
              <Button className="mt-4 rounded-full bg-white px-6 text-blue-700 hover:bg-white/90">
                Jadwalkan kunjungan
              </Button>
            </Link>
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/10 p-8 text-white backdrop-blur">
          <div className="mb-6 flex items-center gap-3">
            <Star className="h-6 w-6 text-yellow-300" />
            <div>
              <h2 className="text-2xl font-bold">Cerita Singkat</h2>
              <p className="text-sm text-slate-200">Suara siswa, alumni, dan orang tua</p>
            </div>
          </div>
          <div className="grid gap-4">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <p className="mb-3 text-sm text-slate-200">“{testimonial.quote}”</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                    <p className="text-xs text-slate-300">{testimonial.role}</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 text-slate-900 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <Link key={link.title} href={link.href}>
              <div
                className="glass-panel-light tilt-hover h-full rounded-2xl p-6"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${link.accent}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{link.title}</h3>
                <p className="text-sm text-slate-600">{link.description}</p>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

