@extends('publicpage::layouts.master')

@section('title', 'Kontak')
@section('meta_description', 'Hubungi ' . (tenant('name') ?? 'kami') . ' - Informasi kontak dan formulir pesan')

@section('content')
<div class="row">
    <div class="col-12">
        <!-- Hero Section -->
        <div class="card border-0 shadow-sm mb-5" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div class="card-body text-white p-5">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <h1 class="display-4 fw-bold mb-3">Hubungi Kami</h1>
                        <p class="lead mb-4">
                            Ada pertanyaan atau butuh informasi? Tim kami siap membantu Anda.
                        </p>
                    </div>
                    <div class="col-lg-4 text-lg-end">
                        <i class="fas fa-envelope" style="font-size: 8rem; opacity: 0.3;"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-8">
                <!-- Contact Form -->
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header">
                        <h3 class="mb-0">
                            <i class="fas fa-paper-plane text-primary me-2"></i>
                            Kirim Pesan
                        </h3>
                    </div>
                    <div class="card-body">
                        <form id="contactForm">
                            @csrf
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="name" class="form-label">Nama Lengkap <span class="text-danger">*</span></label>
                                    <input type="text" 
                                           class="form-control" 
                                           id="name" 
                                           name="name" 
                                           required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
                                    <input type="email" 
                                           class="form-control" 
                                           id="email" 
                                           name="email" 
                                           required>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="phone" class="form-label">Telepon</label>
                                    <input type="tel" 
                                           class="form-control" 
                                           id="phone" 
                                           name="phone">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="subject" class="form-label">Subjek <span class="text-danger">*</span></label>
                                    <select class="form-select" id="subject" name="subject" required>
                                        <option value="">Pilih Subjek</option>
                                        <option value="informasi">Informasi Umum</option>
                                        <option value="pendaftaran">Pendaftaran</option>
                                        <option value="akademik">Akademik</option>
                                        <option value="administrasi">Administrasi</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="message" class="form-label">Pesan <span class="text-danger">*</span></label>
                                <textarea class="form-control" 
                                          id="message" 
                                          name="message" 
                                          rows="5" 
                                          placeholder="Tuliskan pesan Anda di sini..."
                                          required></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" 
                                           type="checkbox" 
                                           id="privacy" 
                                           name="privacy" 
                                           required>
                                    <label class="form-check-label" for="privacy">
                                        Saya setuju dengan <a href="#" class="text-primary">kebijakan privasi</a> <span class="text-danger">*</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary btn-lg">
                                    <i class="fas fa-paper-plane me-2"></i>
                                    Kirim Pesan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Contact Info -->
            <div class="col-lg-4">
                <!-- Contact Details -->
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-phone me-2"></i>
                            Informasi Kontak
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-4">
                            <div class="d-flex align-items-start">
                                <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                                     style="width: 40px; height: 40px;">
                                    <i class="fas fa-map-marker-alt text-white"></i>
                                </div>
                                <div>
                                    <h6 class="mb-1">Alamat</h6>
                                    <p class="text-muted mb-0">
                                        {{ tenant('address') ?? 'Jl. Contoh No. 123, Kota, Provinsi 12345' }}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <div class="d-flex align-items-start">
                                <div class="bg-success rounded-circle d-flex align-items-center justify-content-center me-3" 
                                     style="width: 40px; height: 40px;">
                                    <i class="fas fa-phone text-white"></i>
                                </div>
                                <div>
                                    <h6 class="mb-1">Telepon</h6>
                                    <p class="text-muted mb-0">
                                        <a href="tel:{{ tenant('phone') ?? '+621234567890' }}" class="text-decoration-none">
                                            {{ tenant('phone') ?? '+62 123 456 7890' }}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <div class="d-flex align-items-start">
                                <div class="bg-info rounded-circle d-flex align-items-center justify-content-center me-3" 
                                     style="width: 40px; height: 40px;">
                                    <i class="fas fa-envelope text-white"></i>
                                </div>
                                <div>
                                    <h6 class="mb-1">Email</h6>
                                    <p class="text-muted mb-0">
                                        <a href="mailto:{{ tenant('email') ?? 'info@example.com' }}" class="text-decoration-none">
                                            {{ tenant('email') ?? 'info@example.com' }}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <div class="d-flex align-items-start">
                                <div class="bg-warning rounded-circle d-flex align-items-center justify-content-center me-3" 
                                     style="width: 40px; height: 40px;">
                                    <i class="fas fa-clock text-white"></i>
                                </div>
                                <div>
                                    <h6 class="mb-1">Jam Operasional</h6>
                                    <p class="text-muted mb-0">
                                        Senin - Jumat: 08:00 - 16:00<br>
                                        Sabtu: 08:00 - 12:00<br>
                                        Minggu: Tutup
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Social Media -->
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-secondary text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-share-alt me-2"></i>
                            Media Sosial
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="d-grid gap-2">
                            <a href="#" class="btn btn-outline-primary">
                                <i class="fab fa-facebook me-2"></i>
                                Facebook
                            </a>
                            <a href="#" class="btn btn-outline-info">
                                <i class="fab fa-twitter me-2"></i>
                                Twitter
                            </a>
                            <a href="#" class="btn btn-outline-danger">
                                <i class="fab fa-instagram me-2"></i>
                                Instagram
                            </a>
                            <a href="#" class="btn btn-outline-success">
                                <i class="fab fa-whatsapp me-2"></i>
                                WhatsApp
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Map Placeholder -->
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-dark text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-map me-2"></i>
                            Lokasi
                        </h5>
                    </div>
                    <div class="card-body p-0">
                        <div class="bg-light d-flex align-items-center justify-content-center" 
                             style="height: 200px;">
                            <div class="text-center">
                                <i class="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
                                <p class="text-muted">Peta Lokasi</p>
                                <small class="text-muted">Integrasikan dengan Google Maps</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    // Contact form submission
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Mengirim...';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual AJAX call)
        setTimeout(() => {
            // Show success message
            alert('Pesan berhasil dikirim! Terima kasih telah menghubungi kami.');
            
            // Reset form
            this.reset();
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
    
    // Phone number formatting
    document.getElementById('phone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.startsWith('0')) {
                value = '62' + value.substring(1);
            } else if (!value.startsWith('62')) {
                value = '62' + value;
            }
        }
        e.target.value = value;
    });
</script>
@endpush