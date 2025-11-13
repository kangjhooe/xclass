'use client';

import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth';
import { authApi, LoginPayload, LoginResponse } from '@/lib/api/auth';
import { tenantApi } from '@/lib/api/tenant';

type VisibilityMap = Record<string, boolean>;

const highlights = [
  {
    icon: '🧠',
    title: 'Analitik Real-time',
    description: 'Pantau performa akademik dan operasional sekolah secara instan.',
  },
  {
    icon: '🔐',
    title: 'Keamanan Terjamin',
    description: 'Multi-tier security dengan enkripsi dan kontrol akses terpusat.',
  },
  {
    icon: '⚡',
    title: 'Integrasi Cepat',
    description: 'Terhubung dengan sistem sekolah lain hanya dalam hitungan menit.',
  },
];

const heroStats = [
  { label: 'Pengguna aktif', value: '10K+' },
  { label: 'Modul terintegrasi', value: '50+' },
  { label: 'Uptime', value: '99.9%' },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, isAuthenticated, user } = useAuthStore();
  const [formData, setFormData] = useState<LoginPayload>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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

  const loginMutation = useMutation<LoginResponse, any, LoginPayload>({
    mutationFn: (payload) => authApi.login(payload),
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const redirectToTenant = async () => {
      if (user.role === 'super_admin') {
        router.replace('/admin/dashboard');
        return;
      }

      const tenantIdentifier = user.instansiId || user.tenant_id;
      if (!tenantIdentifier) {
        console.warn('Tenant identifier missing for user, staying on login page.');
        return;
      }

      try {
        // Try to get tenant by ID first
        const tenant = await tenantApi.getById(tenantIdentifier);
        if (tenant?.npsn) {
          router.replace(`/${tenant.npsn}/dashboard`);
          return;
        }
        // If no NPSN, try to resolve using identifier
        const resolvedTenant = await tenantApi.getByIdentifier(tenantIdentifier.toString());
        if (resolvedTenant?.npsn) {
          router.replace(`/${resolvedTenant.npsn}/dashboard`);
          return;
        }
        // Last resort: use tenant ID as string
        router.replace(`/${tenantIdentifier}/dashboard`);
      } catch (tenantError) {
        console.error('Tenant resolution error, trying alternative methods:', tenantError);
        try {
          // Try to resolve using identifier API
          const resolvedTenant = await tenantApi.getByIdentifier(tenantIdentifier.toString());
          if (resolvedTenant?.npsn) {
            router.replace(`/${resolvedTenant.npsn}/dashboard`);
            return;
          }
        } catch (resolveError) {
          console.error('Failed to resolve tenant identifier:', resolveError);
        }
        // Last resort: use tenant ID as string (not number 1)
        router.replace(`/${tenantIdentifier}/dashboard`);
      }
    };

    redirectToTenant();
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (searchParams?.get('registered') === 'true') {
      setSuccess('Pendaftaran berhasil. Silakan login menggunakan kredensial Anda.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await loginMutation.mutateAsync(formData);
      const { user: loggedInUser, access_token } = response;

      if (!loggedInUser || !access_token) {
        throw new Error('Response dari server tidak valid');
      }

      const userWithTenantId = {
        ...loggedInUser,
        tenant_id: loggedInUser.instansiId ?? loggedInUser.tenant_id,
      };

      setAuth(userWithTenantId, access_token);

      if (loggedInUser.role === 'super_admin') {
        router.push('/admin/dashboard');
        return;
      }

      const tenantIdentifier = loggedInUser.instansiId ?? loggedInUser.tenant_id;
      if (!tenantIdentifier) {
        console.warn('Tenant identifier missing for logged in user.');
        return;
      }

      try {
        // Try to get tenant by ID first
        const tenant = await tenantApi.getById(tenantIdentifier);
        if (tenant?.npsn) {
          router.push(`/${tenant.npsn}/dashboard`);
          return;
        }
        // If no NPSN, try to resolve using identifier
        const resolvedTenant = await tenantApi.getByIdentifier(tenantIdentifier.toString());
        if (resolvedTenant?.npsn) {
          router.push(`/${resolvedTenant.npsn}/dashboard`);
          return;
        }
        // Last resort: use tenant ID as string
        router.push(`/${tenantIdentifier}/dashboard`);
      } catch (tenantError) {
        console.error('Tenant resolution error, trying alternative methods:', tenantError);
        try {
          // Try to resolve using identifier API
          const resolvedTenant = await tenantApi.getByIdentifier(tenantIdentifier.toString());
          if (resolvedTenant?.npsn) {
            router.push(`/${resolvedTenant.npsn}/dashboard`);
            return;
          }
        } catch (resolveError) {
          console.error('Failed to resolve tenant identifier:', resolveError);
        }
        // Last resort: use tenant ID as string (not number 1)
        router.push(`/${tenantIdentifier}/dashboard`);
      }
    } catch (err: unknown) {
      console.error('Login error details (raw):', err);

      const fallbackMessage = 'Login gagal. Silakan coba lagi.';

      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;
        const messageFromResponse =
          typeof responseData === 'string'
            ? responseData
            : responseData?.message || responseData?.error;

        if (messageFromResponse) {
          setError(messageFromResponse);
          return;
        }

        if (err.response) {
          setError(`Error ${err.response.status}: ${err.response.statusText || 'Terjadi kesalahan.'}`);
          return;
        }

        if (err.request) {
          setError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
          return;
        }
      }

      if (err instanceof Error && err.message) {
        setError(err.message);
        return;
      }

      if (typeof err === 'string' && err.trim().length > 0) {
        setError(err);
        return;
      }

      setError(fallbackMessage);
    }
  };

  const isSubmitting = loginMutation.isPending;

  const heroHighlightItems = useMemo(
    () =>
      highlights.map((highlight, index) => ({
        ...highlight,
        delay: `${index * 0.1 + 0.1}s`,
      })),
    [],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 via-white to-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-48 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 opacity-60 blur-3xl animate-orb" />
        <div className="absolute -right-24 top-1/3 h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-purple-200 via-rose-200 to-orange-200 opacity-50 blur-3xl animate-orb-delayed" />
        <div className="absolute left-1/2 top-[65%] h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-200 via-cyan-200 to-emerald-200 opacity-40 blur-3xl animate-orb-alt" />
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-blue-100/50 via-blue-50/30 to-transparent blur-3xl animate-gradient" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <section
          data-animate-on-view="hero"
          className={`hidden flex-1 flex-col justify-between px-8 py-14 lg:flex xl:px-16 ${
            sectionVisible('hero') ? 'animate-section opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="max-w-xl space-y-10">
            <div
              className={`inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600 shadow-blue-500/10 transition ${
                isMounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              } duration-700`}
            >
              <span className="h-2 w-2 animate-ping rounded-full bg-blue-500" />
              Selamat Datang
            </div>
            <div>
              <h1
                className={`text-4xl font-semibold leading-tight text-slate-900 md:text-5xl xl:text-6xl ${
                  isMounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                } transition duration-700 delay-75`}
              >
                Kelola <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">ekosistem sekolah</span> Anda dalam satu platform.
              </h1>
              <p
                className={`mt-6 text-lg text-slate-600 ${
                  isMounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                } transition duration-700 delay-150`}
              >
                CLASS membantu institusi pendidikan mengatur akademik, administrasi, dan komunikasi dengan cepat,
                aman, dan terukur.
              </p>
            </div>

            <ul className="space-y-5">
              {heroHighlightItems.map((highlight) => (
                <li
                  key={highlight.title}
                  style={{ transitionDelay: highlight.delay }}
                  className={`flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 backdrop-blur-sm shadow-lg shadow-blue-500/5 transition duration-700 ${
                    isMounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                  } hover:border-blue-300 hover:bg-blue-50/50 animate-float-slower`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl shadow-inner">
                    {highlight.icon}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{highlight.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{highlight.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 text-xs uppercase tracking-[0.2em] text-blue-600">
            {heroStats.map((stat, idx) => (
              <div
                key={stat.label}
                style={{ transitionDelay: `${idx * 0.1 + 0.2}s` }}
                className={`rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-inner shadow-blue-500/5 transition duration-700 ${
                  isMounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                } animate-float-slow`}
              >
                <p className="text-2xl font-semibold text-slate-900 tracking-normal">{stat.value}</p>
                <p className="mt-2 text-[10px] text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10 md:px-12 lg:px-16">
          <div
            data-animate-on-view="form"
            className={`w-full max-w-md transition duration-700 ${
              sectionVisible('form') ? 'animate-section opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/15 bg-white/95 shadow-[0_45px_80px_-40px_rgba(59,130,246,0.4)] backdrop-blur">
              <div className="absolute -top-16 -right-20 h-40 w-40 rounded-full bg-blue-500/15 blur-3xl" />
              <div className="absolute -bottom-14 -left-24 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl" />

              <div className="relative px-8 py-10 sm:px-10">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 animate-float-slow">
                    <span className="text-2xl font-bold">C</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-blue-600">CLASS Platform</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-900">Masuk ke Akun Anda</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Masukkan kredensial Anda untuk melanjutkan ke dashboard sekolah.
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

                {success && (
                  <div className="mt-8 rounded-2xl border border-green-200 bg-green-50/80 p-4 text-sm text-green-600 shadow-inner animate-section">
                    <div className="flex items-start gap-3">
                      <svg className="mt-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium leading-relaxed">{success}</span>
                    </div>
                  </div>
                )}
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

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                      Email
                    </label>
                    <div className="group relative">
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
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3 pl-12 pr-4 text-slate-700 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                        placeholder="nama@email.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <div className="group relative">
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
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3 pl-12 pr-12 text-slate-700 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                        placeholder="Masukkan password"
                        required
                        autoComplete="current-password"
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
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-slate-600">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={rememberMe}
                        onChange={() => setRememberMe((prev) => !prev)}
                      />
                      <span>Ingat saya</span>
                    </label>
                    <Link href="/forgot-password" className="font-medium text-blue-600 transition hover:text-blue-700">
                      Lupa password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:from-blue-500 hover:to-purple-500 hover:shadow-blue-500/60 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Memproses...
                      </>
                    ) : (
                      'Masuk'
                    )}
                  </button>
                </form>

                <div className="mt-8 space-y-3 text-center text-sm text-slate-500">
                  <p>
                    Belum punya akun?{' '}
                    <Link href="/register" className="font-semibold text-blue-600 transition hover:text-blue-700">
                      Daftar di sini
                    </Link>
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push('/tenant-selection')}
                    className="text-slate-500 transition hover:text-blue-600"
                  >
                    Pilih tenant secara manual
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-600">
              © {new Date().getFullYear()} CLASS. All rights reserved.
            </p>
          </div>
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
            transform: translate3d(25px, -30px, 0) scale(1.05);
          }
          70% {
            transform: translate3d(-35px, 45px, 0) scale(0.95);
          }
        }
        @keyframes gradientShift {
          0% {
            transform: translateX(-12%);
            opacity: 0.7;
          }
          50% {
            transform: translateX(10%);
            opacity: 1;
          }
          100% {
            transform: translateX(-12%);
            opacity: 0.7;
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
          animation: float 15s ease-in-out infinite;
        }
        .animate-orb {
          animation: orbPulse 18s ease-in-out infinite;
        }
        .animate-orb-delayed {
          animation: orbPulse 22s ease-in-out infinite;
          animation-delay: 2.2s;
        }
        .animate-orb-alt {
          animation: orbPulse 20s ease-in-out infinite;
          animation-delay: 4s;
        }
        .animate-gradient {
          animation: gradientShift 16s ease-in-out infinite;
        }
        .animate-section {
          animation: sectionReveal 0.85s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
      `}</style>
    </div>
  );
}

