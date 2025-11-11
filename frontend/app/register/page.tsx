'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { authApi, RegisterPayload } from '@/lib/api/auth';

type VisibilityMap = Record<string, boolean>;

type StepKey = 1 | 2;

const heroHighlights = [
  {
    title: 'Blueprint Digitalisasi',
    description: 'Kurasi modul sesuai kebutuhan sekolah dengan arsitektur multi-tenant.',
  },
  {
    title: 'Implementasi Kilat',
    description: 'Aktifkan sistem dalam 14 hari dengan migrasi data cerdas.',
  },
  {
    title: 'Pendampingan 24/7',
    description: 'Tim success siap membantu onboarding dan pengembangan lanjutan.',
  },
];

const statShowcase = [
  { label: 'Tenant aktif', value: '120+' },
  { label: 'Modul premium', value: '24+' },
  { label: 'Rating kepuasan', value: '4.9/5' },
];

const stepTitles: Record<StepKey, string> = {
  1: 'Data Instansi',
  2: 'Kontak & Akun',
};

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepKey>(1);
  const [formData, setFormData] = useState<RegisterPayload>({
    npsn: '',
    name: '',
    jenisInstansi: '',
    jenjang: '',
    status: '',
    email: '',
    password: '',
    password_confirmation: '',
    picName: '',
    picWhatsapp: '',
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [visibleSections, setVisibleSections] = useState<VisibilityMap>({ hero: true });

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 80);
    return () => clearTimeout(timer);
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

  const sectionVisible = (key: string) => visibleSections[key];

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: () => {
      router.push('/login?registered=true');
    },
    onError: (err: any) => {
      console.error('Register error details:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
      });

      let errorMessage = 'Registrasi gagal. Silakan coba lagi.';
      const responseData = err?.response?.data;

      if (responseData?.errors) {
        const backendErrors: Record<string, string> = {};
        Object.keys(responseData.errors).forEach((key) => {
          backendErrors[key] = Array.isArray(responseData.errors[key])
            ? responseData.errors[key][0]
            : responseData.errors[key];
        });
        setErrors(backendErrors);
        errorMessage = 'Terdapat kesalahan pada form. Silakan periksa kembali.';
      } else if (responseData?.message || responseData?.error) {
        errorMessage = responseData.message || responseData.error;
      } else if (err?.request) {
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan backend berjalan.';
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    },
  });

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.npsn.trim()) {
      newErrors.npsn = 'NPSN wajib diisi';
    } else if (formData.npsn.length < 8) {
      newErrors.npsn = 'NPSN harus minimal 8 karakter';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nama Instansi wajib diisi';
    }

    if (!formData.jenisInstansi) {
      newErrors.jenisInstansi = 'Jenis Instansi wajib dipilih';
    }

    if (!formData.jenjang) {
      newErrors.jenjang = 'Jenjang wajib dipilih';
    }

    if (!formData.status) {
      newErrors.status = 'Status wajib dipilih';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.picName.trim()) {
      newErrors.picName = 'Nama PIC wajib diisi';
    }

    if (!formData.picWhatsapp.trim()) {
      newErrors.picWhatsapp = 'No WA PIC wajib diisi';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.picWhatsapp)) {
      newErrors.picWhatsapp = 'Format nomor WhatsApp tidak valid';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email instansi wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Konfirmasi password wajib diisi';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Password dan konfirmasi password tidak cocok';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
      setErrors({});
      setError('');
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setErrors({});
    setError('');
  };

  const handleChange = (key: keyof RegisterPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});

    if (!validateStep2()) {
      return;
    }

    await registerMutation.mutateAsync(formData);
  };

  const loading = registerMutation.isPending;

  const animatedHeroHighlights = useMemo(
    () =>
      heroHighlights.map((highlight, index) => ({
        ...highlight,
        delay: `${index * 0.15 + 0.1}s`,
      })),
    [],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 via-white to-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-36 -top-40 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 opacity-60 blur-3xl animate-orb" />
        <div className="absolute -right-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-purple-200 via-rose-200 to-orange-200 opacity-50 blur-3xl animate-orb-delayed" />
        <div className="absolute left-1/2 bottom-[-6rem] h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-200 via-cyan-200 to-emerald-200 opacity-40 blur-3xl animate-orb-alt" />
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-blue-100/50 via-blue-50/30 to-transparent blur-3xl animate-gradient" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16 md:flex-row md:items-center md:gap-16">
        <section
          data-animate-on-view="hero"
          className={`md:w-1/2 ${sectionVisible('hero') ? 'animate-section opacity-100' : 'translate-y-8 opacity-0'}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-2xl font-bold text-white shadow-lg shadow-blue-500/40 animate-float-slow">
              C
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] text-blue-600">CLASS PLATFORM</p>
              <p className="text-lg font-semibold text-slate-900">Comprehensive Learning & School System</p>
            </div>
          </div>

          <h1
            className={`mt-10 text-4xl font-semibold leading-tight text-slate-900 md:text-5xl ${
              isMounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            } transition duration-700`}
          >
            Daftarkan sekolah Anda dan hadirkan pengalaman digital yang modern.
          </h1>
          <p
            className={`mt-6 text-base text-slate-600 md:text-lg ${
              isMounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            } transition duration-700 delay-100`}
          >
            Mulai dari data instansi hingga aktivasi akun PIC, hanya dua langkah untuk bergabung ke ekosistem CLASS.
          </p>

          <div className="mt-10 space-y-4">
            {animatedHeroHighlights.map((highlight) => (
              <div
                key={highlight.title}
                style={{ transitionDelay: highlight.delay }}
                className={`rounded-2xl border border-slate-200 bg-white p-5 backdrop-blur-sm shadow-lg shadow-blue-500/5 transition duration-700 ${
                  isMounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                } animate-float-slower`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
                  {highlight.title}
                </p>
                <p className="mt-2 text-sm text-slate-600">{highlight.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {statShowcase.map((stat, idx) => (
              <div
                key={stat.label}
                style={{ transitionDelay: `${idx * 0.12 + 0.2}s` }}
                className={`rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-inner shadow-blue-500/5 transition duration-700 ${
                  isMounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                } animate-float-slow`}
              >
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.3em] text-blue-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          data-animate-on-view="form"
          className={`md:w-1/2 ${sectionVisible('form') ? 'animate-section opacity-100' : 'translate-y-8 opacity-0'}`}
        >
          <div className="relative overflow-hidden rounded-[2.25rem] border border-white/15 bg-white/95 shadow-[0_45px_80px_-40px_rgba(59,130,246,0.45)] backdrop-blur">
            <div className="absolute -top-16 -right-24 h-44 w-44 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="absolute -bottom-16 -left-24 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl" />

            <div className="relative px-8 py-10 sm:px-10">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 animate-float-slow">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-blue-600">Langkah {currentStep} dari 2</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">{stepTitles[currentStep]}</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Lengkapi informasi untuk mengaktifkan tenant sekolah Anda.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-blue-400 hover:text-blue-600"
                >
                  ← Kembali ke Beranda
                </Link>
              </div>

              {error && (
                <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-600 shadow-inner animate-section">
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium leading-relaxed">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={currentStep === 1 ? handleNext : handleSubmit} className="mt-8 space-y-6">
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="npsn" className="block text-sm font-semibold text-slate-700">
                        NPSN <span className="text-red-500">*</span>
                      </label>
                      <div className="group relative mt-2">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition group-focus-within:text-blue-500">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="npsn"
                          value={formData.npsn}
                          onChange={handleChange('npsn')}
                          className={`w-full rounded-2xl border bg-white/90 py-3 pl-11 pr-4 text-slate-700 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                            errors.npsn ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' : 'border-slate-200'
                          }`}
                          placeholder="Masukkan NPSN (minimal 8 karakter)"
                          required
                        />
                      </div>
                      {errors.npsn && <p className="mt-2 text-xs font-medium text-red-500">{errors.npsn}</p>}
                    </div>

                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                        Nama Instansi <span className="text-red-500">*</span>
                      </label>
                      <div className="group relative mt-2">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition group-focus-within:text-blue-500">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={handleChange('name')}
                          className={`w-full rounded-2xl border bg-white/90 py-3 pl-11 pr-4 text-slate-700 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                            errors.name ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' : 'border-slate-200'
                          }`}
                          placeholder="Masukkan nama instansi"
                          required
                        />
                      </div>
                      {errors.name && <p className="mt-2 text-xs font-medium text-red-500">{errors.name}</p>}
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="jenisInstansi" className="block text-sm font-semibold text-slate-700">
                          Jenis Instansi <span className="text-red-500">*</span>
                        </label>
                        <div className="group relative mt-2">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition group-focus-within:text-blue-500">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <select
                            id="jenisInstansi"
                            value={formData.jenisInstansi}
                            onChange={(e) => {
                              handleChange('jenisInstansi')(e);
                              setFormData((prev) => ({ ...prev, jenjang: '' }));
                            }}
                            className={`w-full appearance-none rounded-2xl border bg-white/90 py-3 pl-11 pr-10 text-slate-700 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                              errors.jenisInstansi
                                ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
                                : 'border-slate-200'
                            }`}
                            required
                          >
                            <option value="">Pilih Jenis Instansi</option>
                            <option value="Sekolah Umum">Sekolah Umum</option>
                            <option value="Madrasah">Madrasah</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        {errors.jenisInstansi && <p className="mt-2 text-xs font-medium text-red-500">{errors.jenisInstansi}</p>}
                      </div>

                      <div>
                        <label htmlFor="jenjang" className="block text-sm font-semibold text-slate-700">
                          Jenjang <span className="text-red-500">*</span>
                        </label>
                        <div className="group relative mt-2">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition group-focus-within:text-blue-500">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 7l9-4 9 4-9 4-9-4zm0 6l9 4 9-4m-9 4v7"
                              />
                            </svg>
                          </div>
                          <select
                            id="jenjang"
                            value={formData.jenjang}
                            onChange={handleChange('jenjang')}
                            className={`w-full appearance-none rounded-2xl border bg-white/90 py-3 pl-11 pr-10 text-slate-700 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                              errors.jenjang ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' : 'border-slate-200'
                            }`}
                            required
                          >
                            <option value="">Pilih Jenjang</option>
                            <option value="SD">SD</option>
                            <option value="MI">MI</option>
                            <option value="SMP">SMP</option>
                            <option value="MTs">MTs</option>
                            <option value="SMA">SMA</option>
                            <option value="MA">MA</option>
                            <option value="SMK">SMK</option>
                            <option value="MAK">MAK</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        {errors.jenjang && <p className="mt-2 text-xs font-medium text-red-500">{errors.jenjang}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-semibold text-slate-700">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <div className="group relative mt-2">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition group-focus-within:text-blue-500">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c1.657 0 3-1.567 3-3.5S13.657 1 12 1 9 2.567 9 4.5 10.343 8 12 8zM5 22a7 7 0 0114 0H5z"
                            />
                          </svg>
                        </div>
                        <select
                          id="status"
                          value={formData.status}
                          onChange={handleChange('status')}
                          className={`w-full appearance-none rounded-2xl border bg-white/90 py-3 pl-11 pr-10 text-slate-700 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                            errors.status ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' : 'border-slate-200'
                          }`}
                          required
                        >
                          <option value="">Pilih Status</option>
                          <option value="Negeri">Negeri</option>
                          <option value="Swasta">Swasta</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {errors.status && <p className="mt-2 text-xs font-medium text-red-500">{errors.status}</p>}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="picName" className="block text-sm font-semibold text-slate-700">
                        Nama PIC <span className="text-red-500">*</span>
                      </label>
                      <div className="group relative mt-2">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition group-focus-within:text-blue-500">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="picName"
                          value={formData.picName}
                          onChange={handleChange('picName')}
                          className={`w-full rounded-2xl border bg-white/90 py-3 pl-11 pr-4 text-slate-700 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                            errors.picName ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' : 'border-slate-200'
                          }`}
                          placeholder="Nama lengkap PIC"
                          required
                        />
                      </div>
                      {errors.picName && <p className="mt-2 text-xs font-medium text-red-500">{errors.picName}</p>}
                    </div>

                    <div>
                      <label htmlFor="picWhatsapp" className="block text-sm font-semibold text-slate-700">
                        No WhatsApp PIC <span className="text-red-500">*</span>
                      </label>
                      <div className="group relative mt-2">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition group-focus-within:text-blue-500">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.213l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.213-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="picWhatsapp"
                          value={formData.picWhatsapp}
                          onChange={handleChange('picWhatsapp')}
                          className={`w-full rounded-2xl border bg-white/90 py-3 pl-11 pr-4 text-slate-700 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                            errors.picWhatsapp
                              ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
                              : 'border-slate-200'
                          }`}
                          placeholder="Contoh: 0812xxxx"
                          required
                        />
                      </div>
                      {errors.picWhatsapp && <p className="mt-2 text-xs font-medium text-red-500">{errors.picWhatsapp}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                        Email Instansi <span className="text-red-500">*</span>
                      </label>
                      <div className="group relative mt-2">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition group-focus-within:text-blue-500">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                            />
                          </svg>
                        </div>
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange('email')}
                          className={`w-full rounded-2xl border bg-white/90 py-3 pl-11 pr-4 text-slate-700 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                            errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' : 'border-slate-200'
                          }`}
                          placeholder="nama@instansi.sch.id"
                          required
                        />
                      </div>
                      {errors.email && <p className="mt-2 text-xs font-medium text-red-500">{errors.email}</p>}
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="group relative mt-2">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition group-focus-within:text-blue-500">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          </div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={formData.password}
                            onChange={handleChange('password')}
                            className={`w-full rounded-2xl border bg-white/90 py-3 pl-11 pr-12 text-slate-700 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                              errors.password ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' : 'border-slate-200'
                            }`}
                            placeholder="Minimal 8 karakter"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-600"
                            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                          >
                            {showPassword ? (
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m13.42 13.42l-3.29-3.29M3 3l18 18"
                                />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                        {errors.password && <p className="mt-2 text-xs font-medium text-red-500">{errors.password}</p>}
                      </div>

                      <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-semibold text-slate-700">
                          Konfirmasi Password <span className="text-red-500">*</span>
                        </label>
                        <div className="group relative mt-2">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition group-focus-within:text-blue-500">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <input
                            type={showPasswordConfirmation ? 'text' : 'password'}
                            id="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange('password_confirmation')}
                            className={`w-full rounded-2xl border bg-white/90 py-3 pl-11 pr-12 text-slate-700 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                              errors.password_confirmation
                                ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
                                : 'border-slate-200'
                            }`}
                            placeholder="Ulangi password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-600"
                            aria-label={showPasswordConfirmation ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}
                          >
                            {showPasswordConfirmation ? (
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m13.42 13.42l-3.29-3.29M3 3l18 18"
                                />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                        {errors.password_confirmation && (
                          <p className="mt-2 text-xs font-medium text-red-500">{errors.password_confirmation}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600"
                      >
                        ← Kembali
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:from-blue-500 hover:to-purple-500 hover:shadow-blue-500/60 disabled:opacity-60"
                      >
                        {loading ? 'Memproses...' : 'Daftar Sekarang'}
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:from-blue-500 hover:to-purple-500"
                    >
                      Lanjutkan →
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-blue-600 transition hover:text-blue-700">
              Masuk di sini
            </Link>
          </p>
        </section>
      </div>

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
          40% {
            transform: translate3d(20px, -35px, 0) scale(1.05);
          }
          70% {
            transform: translate3d(-28px, 40px, 0) scale(0.96);
          }
        }
        @keyframes gradientShift {
          0% {
            transform: translateX(-10%);
            opacity: 0.75;
          }
          50% {
            transform: translateX(12%);
            opacity: 1;
          }
          100% {
            transform: translateX(-10%);
            opacity: 0.75;
          }
        }
        @keyframes sectionReveal {
          0% {
            opacity: 0;
            transform: translate3d(0, 32px, 0) scale(0.98);
          }
          60% {
            opacity: 1;
            transform: translate3d(0, -4px, 0) scale(1.01);
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
          animation: orbPulse 24s ease-in-out infinite;
          animation-delay: 3.2s;
        }
        .animate-orb-alt {
          animation: orbPulse 22s ease-in-out infinite;
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

