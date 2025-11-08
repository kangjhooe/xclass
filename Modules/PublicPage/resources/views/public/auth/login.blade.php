@extends('publicpage::layouts.app')

@section('title', 'Login - ' . $tenant->name)

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
            <div class="card shadow-lg border-0 mt-5">
                <div class="card-body p-5">
                    <div class="text-center mb-4">
                        <div class="mx-auto mb-3" style="width: 60px; height: 60px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-lock text-white" style="font-size: 24px;"></i>
                        </div>
                        <h2 class="h4 mb-2 text-dark">
                            Login ke {{ $tenant->name }}
                        </h2>
                        <p class="text-muted small">
                            Masuk ke dashboard sekolah Anda
                        </p>
                    </div>
                    
                    <form method="POST" action="{{ tenant_public_route('public.login') }}">
                        @csrf
                        
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input id="email" name="email" type="email" class="form-control @error('email') is-invalid @enderror" 
                                   placeholder="Alamat email" value="{{ old('email') }}" required autocomplete="email">
                            @error('email')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <input id="password" name="password" type="password" class="form-control @error('password') is-invalid @enderror" 
                                   placeholder="Password" required autocomplete="current-password">
                            @error('password')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3 form-check">
                            <input id="remember" name="remember" type="checkbox" class="form-check-input">
                            <label for="remember" class="form-check-label">
                                Ingat saya
                            </label>
                        </div>

                        <div class="d-grid mb-3">
                            <button type="submit" class="btn btn-primary btn-lg">
                                <i class="fas fa-sign-in-alt me-2"></i>
                                Masuk
                            </button>
                        </div>

                        <div class="text-center">
                            <a href="#" class="text-decoration-none small">
                                Lupa password?
                            </a>
                        </div>
                    </form>
                </div>
            </div>
            
            <div class="text-center mt-4">
                <a href="{{ route('tenant.public.home', ['tenant' => tenant('npsn')]) }}" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left me-2"></i>
                    Kembali ke halaman utama
                </a>
            </div>
        </div>
    </div>
</div>
@endsection
