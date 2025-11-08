@extends('layouts.app')

@section('title', 'Pendaftaran PPDB/SPMB')

@section('content')
<div id="ppdb-registration">
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h3 class="card-title mb-0">
                            <i class="fas fa-user-graduate me-2"></i>
                            Pendaftaran PPDB/SPMB
                        </h3>
                    </div>
                    <div class="card-body">
                        @if(session('success'))
                            <div class="alert alert-success alert-dismissible fade show" role="alert">
                                {{ session('success') }}
                                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        @endif

                        @if($errors->any())
                            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                <ul class="mb-0">
                                    @foreach($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        @endif

                        @guest
                            <div class="alert alert-info d-flex align-items-center" role="alert">
                                <i class="fas fa-info-circle me-2"></i>
                                Silakan buat akun atau login untuk melanjutkan pendaftaran PPDB.
                            </div>
                            <div class="d-flex gap-2 mb-4">
                                <a href="{{ route('register') }}" class="btn btn-primary">
                                    <i class="fas fa-user-plus me-1"></i> Daftar Akun PPDB
                                </a>
                                <a href="{{ route('login') }}" class="btn btn-outline-primary">
                                    <i class="fas fa-sign-in-alt me-1"></i> Masuk PPDB
                                </a>
                            </div>
                        @endguest

                        @auth
                        <div class="mb-3">
                            <a href="{{ route('ppdb.wizard.index') }}" class="btn btn-success">
                                <i class="fas fa-magic me-1"></i> Mulai Wizard PPDB
                            </a>
                        </div>
                        <form @submit.prevent="submitForm" enctype="multipart/form-data">
                            <div class="row">
                                <!-- Data Pribadi -->
                                <div class="col-md-6">
                                    <h5 class="text-primary mb-3">
                                        <i class="fas fa-user me-2"></i>Data Pribadi
                                    </h5>
                                    
                                    <div class="mb-3">
                                        <label for="full_name" class="form-label">Nama Lengkap <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="full_name" name="full_name" v-model="form.full_name" required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="email" class="form-label">Email</label>
                                        <input type="email" class="form-control" id="email" name="email" v-model="form.email">
                                    </div>

                                    <div class="mb-3">
                                        <label for="phone" class="form-label">No. Telepon <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="phone" name="phone" v-model="form.phone" required>
                                    </div>

                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label for="birth_date" class="form-label">Tanggal Lahir <span class="text-danger">*</span></label>
                                                <input type="date" class="form-control" id="birth_date" name="birth_date" v-model="form.birth_date" required>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label for="birth_place" class="form-label">Tempat Lahir <span class="text-danger">*</span></label>
                                                <input type="text" class="form-control" id="birth_place" name="birth_place" v-model="form.birth_place" required>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label">Jenis Kelamin <span class="text-danger">*</span></label>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="gender" id="gender_l" value="L" v-model="form.gender" required>
                                            <label class="form-check-label" for="gender_l">Laki-laki</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="gender" id="gender_p" value="P" v-model="form.gender" required>
                                            <label class="form-check-label" for="gender_p">Perempuan</label>
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label for="address" class="form-label">Alamat Lengkap <span class="text-danger">*</span></label>
                                        <textarea class="form-control" id="address" name="address" rows="3" v-model="form.address" required></textarea>
                                    </div>
                                </div>

                                <!-- Data Sekolah & Orang Tua -->
                                <div class="col-md-6">
                                    <h5 class="text-primary mb-3">
                                        <i class="fas fa-school me-2"></i>Data Sekolah & Orang Tua
                                    </h5>

                                    <div class="mb-3">
                                        <label for="previous_school" class="form-label">Asal Sekolah <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="previous_school" name="previous_school" v-model="form.previous_school" required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="previous_school_address" class="form-label">Alamat Sekolah <span class="text-danger">*</span></label>
                                        <textarea class="form-control" id="previous_school_address" name="previous_school_address" rows="2" v-model="form.previous_school_address" required></textarea>
                                    </div>

                                    <div class="mb-3">
                                        <label for="major_choice" class="form-label">Pilihan Jurusan <span class="text-danger">*</span></label>
                                        <select class="form-select" id="major_choice" name="major_choice" v-model="form.major_choice" required>
                                            <option value="">Pilih Jurusan</option>
                                            <option value="IPA">IPA</option>
                                            <option value="IPS">IPS</option>
                                            <option value="Bahasa">Bahasa</option>
                                            <option value="Agama">Agama</option>
                                        </select>
                                    </div>

                                    <div class="mb-3">
                                        <label for="parent_name" class="form-label">Nama Orang Tua <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="parent_name" name="parent_name" v-model="form.parent_name" required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="parent_phone" class="form-label">No. Telepon Orang Tua <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="parent_phone" name="parent_phone" v-model="form.parent_phone" required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="parent_occupation" class="form-label">Pekerjaan Orang Tua <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="parent_occupation" name="parent_occupation" v-model="form.parent_occupation" required>
                                    </div>
                                </div>
                            </div>

                            <!-- Upload Berkas -->
                            <div class="row mt-4">
                                <div class="col-12">
                                    <h5 class="text-primary mb-3">
                                        <i class="fas fa-upload me-2"></i>Upload Berkas
                                    </h5>
                                </div>
                                
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="photo" class="form-label">Foto 3x4 <span class="text-danger">*</span></label>
                                        <input type="file" class="form-control" id="photo" name="photo" accept="image/*" @change="handleFileChange('photo', $event)" required>
                                        <div class="form-text">Format: JPG, PNG. Maksimal 2MB</div>
                                    </div>
                                </div>

                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="ijazah" class="form-label">Ijazah/SKHUN <span class="text-danger">*</span></label>
                                        <input type="file" class="form-control" id="ijazah" name="ijazah" accept=".pdf,.jpg,.jpeg,.png" @change="handleFileChange('ijazah', $event)" required>
                                        <div class="form-text">Format: PDF, JPG, PNG. Maksimal 5MB</div>
                                    </div>
                                </div>

                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="kk" class="form-label">Kartu Keluarga <span class="text-danger">*</span></label>
                                        <input type="file" class="form-control" id="kk" name="kk" accept=".pdf,.jpg,.jpeg,.png" @change="handleFileChange('kk', $event)" required>
                                        <div class="form-text">Format: PDF, JPG, PNG. Maksimal 5MB</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Tombol Submit -->
                            <div class="row mt-4">
                                <div class="col-12">
                                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                        <a href="{{ route('public.ppdb.announcement') }}" class="btn btn-outline-secondary me-md-2">
                                            <i class="fas fa-bullhorn me-2"></i>Cek Pengumuman
                                        </a>
                                        <button type="submit" class="btn btn-primary" :disabled="loading">
                                            <i class="fas fa-paper-plane me-2" v-if="!loading"></i>
                                            <span class="spinner-border spinner-border-sm me-2" v-if="loading"></span>
                                            <span v-if="!loading">Daftar Sekarang</span>
                                            <span v-if="loading">Mengirim...</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                        @endauth
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
const { createApp } = Vue;

createApp({
    data() {
        return {
            loading: false,
            form: {
                full_name: '',
                email: '',
                phone: '',
                birth_date: '',
                birth_place: '',
                gender: '',
                address: '',
                previous_school: '',
                previous_school_address: '',
                major_choice: '',
                parent_name: '',
                parent_phone: '',
                parent_occupation: '',
                photo: null,
                ijazah: null,
                kk: null
            }
        }
    },
    methods: {
        handleFileChange(field, event) {
            this.form[field] = event.target.files[0];
        },
        async submitForm() {
            this.loading = true;
            
            const formData = new FormData();
            Object.keys(this.form).forEach(key => {
                if (this.form[key] !== null && this.form[key] !== '') {
                    formData.append(key, this.form[key]);
                }
            });

            try {
                const response = await fetch('{{ route("public.ppdb.store") }}', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    window.location.href = result.redirect_url;
                } else {
                    const error = await response.json();
                    alert('Terjadi kesalahan: ' + (error.message || 'Silakan coba lagi'));
                }
            } catch (error) {
                alert('Terjadi kesalahan: ' + error.message);
            } finally {
                this.loading = false;
            }
        }
    }
}).mount('#ppdb-registration');
</script>
@endsection
