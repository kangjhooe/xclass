@extends('layouts.app')

@section('title', 'PPDB - Data Siswa')

@section('content')
<div class="container py-4" id="ppdb-step-1">
    <div class="row mb-3">
        <div class="col-12 d-flex align-items-center justify-content-between">
            <h3 class="mb-0"><i class="fas fa-user me-2"></i>Langkah 1: Data Siswa</h3>
            <a href="{{ route('ppdb.wizard.index') }}" class="btn btn-outline-secondary btn-sm">Kembali</a>
        </div>
    </div>

    <div class="alert alert-info" v-if="savedAt">
        Tersimpan otomatis: @{{ savedAt }}
    </div>

    <div class="card">
        <div class="card-body">
            <form @submit.prevent>
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">NISN</label>
                            <input type="text" class="form-control" v-model="form.nisn">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">NIK</label>
                            <input type="text" class="form-control" v-model="form.nik">
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label class="form-label">Jenis Kelamin</label>
                            <select class="form-select" v-model="form.gender">
                                <option value="">- Pilih -</option>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label class="form-label">Golongan Darah</label>
                            <select class="form-select" v-model="form.blood_type">
                                <option value="">- Pilih -</option>
                                <option>A</option>
                                <option>B</option>
                                <option>O</option>
                                <option>AB</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label class="form-label">Pilihan Jurusan</label>
                            <select class="form-select" v-model="form.major_choice" @change="queueSave">
                                <option value="">- Pilih -</option>
                                @if(isset($config) && $config && is_array($config->available_majors))
                                    @foreach($config->available_majors as $mj)
                                        <option value="{{ $mj }}">{{ $mj }}</option>
                                    @endforeach
                                @endif
                            </select>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12">
                        <div class="mb-3">
                            <label class="form-label">Alamat (Dusun/Jalan)</label>
                            <input type="text" class="form-control" v-model="form.address_street">
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-3">
                        <div class="mb-3">
                            <label class="form-label">Provinsi</label>
                            <select class="form-select" v-model="region.province" @change="onProvinceChange">
                                <option value="">- Pilih -</option>
                                <option v-for="p in provinces" :key="p.code" :value="p.code">@{{ p.name }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="mb-3">
                            <label class="form-label">Kab/Kota</label>
                            <select class="form-select" v-model="region.regency" @change="onRegencyChange" :disabled="!regencies.length">
                                <option value="">- Pilih -</option>
                                <option v-for="r in regencies" :key="r.code" :value="r.code">@{{ r.name }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="mb-3">
                            <label class="form-label">Kecamatan</label>
                            <select class="form-select" v-model="region.district" @change="onDistrictChange" :disabled="!districts.length">
                                <option value="">- Pilih -</option>
                                <option v-for="d in districts" :key="d.code" :value="d.code">@{{ d.name }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="mb-3">
                            <label class="form-label">Desa/Kelurahan</label>
                            <select class="form-select" v-model="region.village" @change="applyRegion" :disabled="!villages.length">
                                <option value="">- Pilih -</option>
                                <option v-for="v in villages" :key="v.code" :value="v.code">@{{ v.name }}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">No. KK</label>
                            <input type="text" class="form-control" v-model="form.kk_number">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">No. Kartu (KIP/PKH/KIS)</label>
                            <input type="text" class="form-control" v-model="form.social_card_number">
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">Sekolah Asal - Nama</label>
                            <input type="text" class="form-control" v-model="form.previous_school_name">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">Sekolah Asal - NPSN</label>
                            <input type="text" class="form-control" v-model="form.previous_school_npsn">
                        </div>
                    </div>
                    <div class="col-md-12">
                        <div class="mb-3">
                            <label class="form-label">Alamat Sekolah Asal</label>
                            <input type="text" class="form-control" v-model="form.previous_school_address">
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label class="form-label">Nomor HP</label>
                            <input type="text" class="form-control" v-model="form.phone">
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label class="form-label">Hobi</label>
                            <input type="text" class="form-control" v-model="form.hobby">
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label class="form-label">Cita-cita</label>
                            <input type="text" class="form-control" v-model="form.ambition">
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4">
                        <div class="mb-3">
                            <label class="form-label">Jalur Pendaftaran</label>
                            <select class="form-select" v-model="form.registration_path" @change="queueSave">
                                <option value="">- Pilih -</option>
                                @if(isset($config) && $config && is_array($config->admission_paths))
                                    @foreach($config->admission_paths as $jp)
                                        <option value="{{ $jp }}">{{ $jp }}</option>
                                    @endforeach
                                @endif
                            </select>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-3">
                        <div class="mb-3">
                            <label class="form-label">Tinggi Badan (cm)</label>
                            <input type="number" class="form-control" v-model.number="form.height_cm">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="mb-3">
                            <label class="form-label">Berat Badan (kg)</label>
                            <input type="number" class="form-control" v-model.number="form.weight_kg">
                        </div>
                    </div>
                </div>

                <div class="d-flex justify-content-end">
                    <a href="{{ route('ppdb.wizard.index') }}" class="btn btn-success">
                        Lanjut
                    </a>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
const { createApp } = Vue;

createApp({
    data() {
        return {
            form: {
                nisn: '', nik: '', gender: '', blood_type: '',
                address_street: '', address_village: '', address_sub_district: '', address_district: '', address_city: '', address_province: '',
                kk_number: '', social_card_number: '',
                previous_school_name: '', previous_school_address: '', previous_school_npsn: '',
                phone: '', hobby: '', ambition: '', height_cm: null, weight_kg: null,
                major_choice: '', registration_path: '',
            },
            region: { province: '', regency: '', district: '', village: '' },
            provinces: [], regencies: [], districts: [], villages: [],
            savedAt: null,
            debounceTimer: null,
        };
    },
    mounted() {
        this.fetchData();
        this.fetchProvinces();
    },
    watch: {
        form: {
            handler() {
                this.queueSave();
            },
            deep: true
        }
    },
    methods: {
        async fetchData() {
            const res = await fetch('{{ route('ppdb.wizard.profile.get', ['application' => request('application_id')]) }}');
            if (res.ok) {
                const data = await res.json();
                if (data.profile) {
                    Object.assign(this.form, data.profile);
                    // try map region names (if already saved as names)
                }
                if (data.application) {
                    if (data.application.major_choice) this.form.major_choice = data.application.major_choice;
                    if (data.application.registration_path) this.form.registration_path = data.application.registration_path;
                }
            }
        },
        async fetchProvinces() {
            const res = await fetch('{{ route('geo.provinces') }}');
            if (res.ok) this.provinces = await res.json();
        },
        async onProvinceChange() {
            this.regencies = []; this.districts = []; this.villages = [];
            this.region.regency=''; this.region.district=''; this.region.village='';
            if (!this.region.province) return;
            const res = await fetch(`{{ url('geo/regencies') }}/${this.region.province}`);
            if (res.ok) this.regencies = await res.json();
            this.applyRegion();
        },
        async onRegencyChange() {
            this.districts = []; this.villages = []; this.region.district=''; this.region.village='';
            if (!this.region.regency) return;
            const res = await fetch(`{{ url('geo/districts') }}/${this.region.province}/${this.region.regency}`);
            if (res.ok) this.districts = await res.json();
            this.applyRegion();
        },
        async onDistrictChange() {
            this.villages = []; this.region.village='';
            if (!this.region.district) return;
            const res = await fetch(`{{ url('geo/villages') }}/${this.region.province}/${this.region.regency}/${this.region.district}`);
            if (res.ok) this.villages = await res.json();
            this.applyRegion();
        },
        applyRegion() {
            const p = this.provinces.find(x=>x.code===this.region.province);
            const r = this.regencies.find(x=>x.code===this.region.regency);
            const d = this.districts.find(x=>x.code===this.region.district);
            const v = this.villages.find(x=>x.code===this.region.village);
            this.form.address_province = p ? p.name : '';
            this.form.address_city = r ? r.name : '';
            this.form.address_district = d ? d.name : '';
            this.form.address_sub_district = d ? d.name : '';
            this.form.address_village = v ? v.name : '';
            this.queueSave();
        },
        queueSave() {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => this.save(), 800);
        },
        async save() {
            const formData = new FormData();
            Object.keys(this.form).forEach(k => {
                if (this.form[k] !== null && this.form[k] !== '') {
                    formData.append(k, this.form[k]);
                }
            });
            const res = await fetch('{{ route('ppdb.wizard.profile.saveStep', ['application' => request('application_id'), 'step' => 1]) }}', {
                method: 'POST',
                body: formData,
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') }
            });
            if (res.ok) {
                this.savedAt = new Date().toLocaleString('id-ID');
            }
        }
    }
}).mount('#ppdb-step-1');
</script>
@endsection


