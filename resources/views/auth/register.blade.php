<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - CLASS</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            padding: 2rem 0;
        }
        .register-card {
            border: none;
            border-radius: 1rem;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 0.5rem;
            padding: 0.75rem 2rem;
        }
        .form-control {
            border-radius: 0.5rem;
            border: 1px solid #e9ecef;
            padding: 0.75rem 1rem;
        }
        .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
                <div class="card register-card">
                    <div class="card-body p-5">
                        <div class="text-center mb-4">
                            <i class="fas fa-graduation-cap fa-3x text-primary mb-3"></i>
                            <h3 class="fw-bold">Registrasi Instansi (Tenant)</h3>
                            <p class="text-muted">Daftarkan instansi/sekolah Anda untuk menggunakan CLASS</p>
                        </div>
                        
                        <form method="POST" action="{{ route('register') }}">
                            @csrf
                            @if ($errors->any())
                            <div class="alert alert-danger mb-3" role="alert">
                                <strong>Terjadi kesalahan:</strong>
                                <ul class="mb-0 mt-2">
                                    @foreach ($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                            @endif
                            
                            <div class="row g-3">
                                <div class="col-12">
                                    <div class="mb-3">
                                        <label for="npsn" class="form-label">NPSN</label>
                                        <div class="input-group">
                                            <span class="input-group-text">
                                                <i class="fas fa-hashtag"></i>
                                            </span>
                                            <input type="text" class="form-control @error('npsn') is-invalid @enderror" 
                                                   id="npsn" name="npsn" value="{{ old('npsn') }}" placeholder="misalnya 10816663" required>
                                        </div>
                                        @error('npsn')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row g-3">
                                <div class="col-12">
                                    <div class="mb-3">
                                        <label for="name" class="form-label">Nama Instansi</label>
                                        <div class="input-group">
                                            <span class="input-group-text">
                                                <i class="fas fa-building"></i>
                                            </span>
                                            <input type="text" class="form-control @error('name') is-invalid @enderror" 
                                                   id="name" name="name" value="{{ old('name') }}" placeholder="misalnya MTs Al-Falah Krui" required>
                                        </div>
                                        @error('name')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row g-3">
                                <div class="col-12">
                                    <div class="mb-3">
                                        <label for="type_tenant" class="form-label">Tipe</label>
                                        <div>
                                            <select class="form-select @error('type_tenant') is-invalid @enderror" id="type_tenant" name="type_tenant" required>
                                                <option value="">Pilih Tipe</option>
                                                <option value="Sekolah Umum" {{ old('type_tenant') == 'Sekolah Umum' ? 'selected' : '' }}>Sekolah umum</option>
                                                <option value="Madrasah" {{ old('type_tenant') == 'Madrasah' ? 'selected' : '' }}>Madrasah</option>
                                            </select>
                                        </div>
                                        @error('type_tenant')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>
                            <div class="row g-3">
                                <div class="col-12">
                                    <div class="mb-3">
                                        <label for="status" class="form-label">Status</label>
                                        <div>
                                            <select class="form-select @error('status') is-invalid @enderror" id="status" name="status" required>
                                                <option value="">Pilih Status</option>
                                                <option value="Negeri" {{ old('status') == 'Negeri' ? 'selected' : '' }}>Negeri</option>
                                                <option value="Swasta" {{ old('status') == 'Swasta' ? 'selected' : '' }}>Swasta</option>
                                            </select>
                                        </div>
                                        @error('status')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>
                            <div class="row g-3">
                                <div class="col-12">
                                    <div class="mb-3">
                                        <label for="jenjang" class="form-label">Jenjang</label>
                                        <div>
                                            <select class="form-select @error('jenjang') is-invalid @enderror" id="jenjang" name="jenjang" required>
                                                <option value="">Pilih Jenjang</option>
                                                <optgroup label="SD/MI">
                                                    <option value="SD" {{ old('jenjang') == 'SD' ? 'selected' : '' }}>SD</option>
                                                    <option value="MI" {{ old('jenjang') == 'MI' ? 'selected' : '' }}>MI</option>
                                                </optgroup>
                                                <optgroup label="SMP/MTs">
                                                    <option value="SMP" {{ old('jenjang') == 'SMP' ? 'selected' : '' }}>SMP</option>
                                                    <option value="MTs" {{ old('jenjang') == 'MTs' ? 'selected' : '' }}>MTs</option>
                                                </optgroup>
                                                <optgroup label="SMA/MA/SMK">
                                                    <option value="SMA" {{ old('jenjang') == 'SMA' ? 'selected' : '' }}>SMA</option>
                                                    <option value="MA" {{ old('jenjang') == 'MA' ? 'selected' : '' }}>MA</option>
                                                    <option value="SMK" {{ old('jenjang') == 'SMK' ? 'selected' : '' }}>SMK</option>
                                                </optgroup>
                                            </select>
                                        </div>
                                        @error('jenjang')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row g-3">
                                <div class="col-12">
                                    <div class="mb-3">
                                        <label for="email" class="form-label">Email Instansi</label>
                                        <div class="input-group">
                                            <span class="input-group-text">
                                                <i class="fas fa-envelope"></i>
                                            </span>
                                            <input type="email" class="form-control @error('email') is-invalid @enderror" 
                                                   id="email" name="email" value="{{ old('email') }}" required>
                                        </div>
                                        @error('email')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>
                            <div class="row g-3">
                                <div class="col-12">
                                    <div class="mb-3">
                                        <label for="pic_name" class="form-label">Nama PIC</label>
                                        <div class="input-group">
                                            <span class="input-group-text">
                                                <i class="fas fa-user"></i>
                                            </span>
                                            <input type="text" class="form-control @error('pic_name') is-invalid @enderror" 
                                                   id="pic_name" name="pic_name" value="{{ old('pic_name') }}" required>
                                        </div>
                                        @error('pic_name')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row g-3">
                                <div class="col-12">
                                    <div class="mb-3">
                                        <label for="pic_phone" class="form-label">No WA PIC</label>
                                        <div class="input-group">
                                            <span class="input-group-text">
                                                <i class="fas fa-phone"></i>
                                            </span>
                                            <input type="tel" class="form-control @error('pic_phone') is-invalid @enderror" 
                                                   id="pic_phone" name="pic_phone" value="{{ old('pic_phone') }}" required>
                                        </div>
                                        @error('pic_phone')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>
                            <div class="row g-3">
                                <div class="col-12">
                                    <div class="mb-3">
                                        <label for="password" class="form-label">Password Akun Admin</label>
                                        <div class="input-group">
                                            <span class="input-group-text">
                                                <i class="fas fa-lock"></i>
                                            </span>
                                            <input type="password" class="form-control @error('password') is-invalid @enderror" 
                                                   id="password" name="password" required>
                                        </div>
                                        @error('password')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="row g-3">
                                <div class="col-12">
                                    <div class="mb-3">
                                        <label for="password_confirmation" class="form-label">Konfirmasi Password</label>
                                        <div class="input-group">
                                            <span class="input-group-text">
                                                <i class="fas fa-lock"></i>
                                            </span>
                                            <input type="password" class="form-control" id="password_confirmation" name="password_confirmation" required>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-user-plus me-2"></i>
                                    Daftar Instansi
                                </button>
                            </div>
                        </form>
                        
                        <div class="text-center mt-4">
                            <p class="text-muted">
                                Sudah terdaftar? 
                                <a href="{{ route('login') }}" class="text-decoration-none">Login di sini</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
