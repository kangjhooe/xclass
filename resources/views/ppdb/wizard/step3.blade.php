@extends('layouts.app')

@section('title', 'PPDB - Data Orang Tua/Wali')

@section('content')
<div class="container py-4" id="ppdb-step-3">
    <div class="row mb-3">
        <div class="col-12 d-flex align-items-center justify-content-between">
            <h3 class="mb-0"><i class="fas fa-user-friends me-2"></i>Langkah 3: Data Ayah/Ibu/Wali</h3>
            <a href="{{ route('ppdb.wizard.index') }}" class="btn btn-outline-secondary btn-sm">Kembali</a>
        </div>
    </div>

    <div class="alert alert-info" v-if="savedAt">
        Tersimpan otomatis: @{{ savedAt }}
    </div>

    <div class="card">
        <div class="card-body">
            <form @submit.prevent>
                <h5 class="text-primary">Data Ayah Kandung</h5>
                <div class="row">
                    <div class="col-md-3"><div class="mb-3"><label class="form-label">Status</label><input type="text" class="form-control" v-model="form.father_status" placeholder="Hidup/Wafat/Lainnya"></div></div>
                    <div class="col-md-3"><div class="mb-3"><label class="form-label">NIK Ayah</label><input type="text" class="form-control" v-model="form.father_nik"></div></div>
                    <div class="col-md-6"><div class="mb-3"><label class="form-label">Nama Ayah</label><input type="text" class="form-control" v-model="form.father_name"></div></div>
                    <div class="col-md-3"><div class="mb-3"><label class="form-label">Tempat Lahir</label><input type="text" class="form-control" v-model="form.father_birth_place"></div></div>
                    <div class="col-md-3"><div class="mb-3"><label class="form-label">Tanggal Lahir</label><input type="date" class="form-control" v-model="form.father_birth_date"></div></div>
                    <div class="col-md-3"><div class="mb-3"><label class="form-label">Pendidikan</label><input type="text" class="form-control" v-model="form.father_education"></div></div>
                    <div class="col-md-3"><div class="mb-3"><label class="form-label">Pekerjaan</label><input type="text" class="form-control" v-model="form.father_occupation"></div></div>
                </div>

                <hr>
                <h5 class="text-primary">Data Ibu Kandung</h5>
                <div class="row">
                    <div class="col-md-3"><div class="mb-3"><label class="form-label">Status</label><input type="text" class="form-control" v-model="form.mother_status" placeholder="Hidup/Wafat/Lainnya"></div></div>
                    <div class="col-md-3"><div class="mb-3"><label class="form-label">NIK Ibu</label><input type="text" class="form-control" v-model="form.mother_nik"></div></div>
                    <div class="col-md-6"><div class="mb-3"><label class="form-label">Nama Ibu</label><input type="text" class="form-control" v-model="form.mother_name"></div></div>
                    <div class="col-md-3"><div class="mb-3"><label class="form-label">Tempat Lahir</label><input type="text" class="form-control" v-model="form.mother_birth_place"></div></div>
                    <div class="col-md-3"><div class="mb-3"><label class="form-label">Tanggal Lahir</label><input type="date" class="form-control" v-model="form.mother_birth_date"></div></div>
                    <div class="col-md-3"><div class="mb-3"><label class="form-label">Pendidikan</label><input type="text" class="form-control" v-model="form.mother_education"></div></div>
                    <div class="col-md-3"><div class="mb-3"><label class="form-label">Pekerjaan</label><input type="text" class="form-control" v-model="form.mother_occupation"></div></div>
                </div>

                <hr>
                <h5 class="text-primary">Data Wali (opsional)</h5>
                <div class="row">
                    <div class="col-md-4"><div class="mb-3"><label class="form-label">Sumber Data</label>
                        <select class="form-select" v-model="form.guardian_relation_source">
                            <option value="">- Pilih -</option>
                            <option value="same_as_father">Sama dengan Ayah</option>
                            <option value="same_as_mother">Sama dengan Ibu</option>
                            <option value="custom">Wali Lain</option>
                        </select>
                    </div></div>
                    <div class="col-md-4"><div class="mb-3"><label class="form-label">NIK Wali</label><input type="text" class="form-control" v-model="form.guardian_nik"></div></div>
                    <div class="col-md-4"><div class="mb-3"><label class="form-label">Nama Wali</label><input type="text" class="form-control" v-model="form.guardian_name"></div></div>
                    <div class="col-md-4"><div class="mb-3"><label class="form-label">Tempat Lahir</label><input type="text" class="form-control" v-model="form.guardian_birth_place"></div></div>
                    <div class="col-md-4"><div class="mb-3"><label class="form-label">Tanggal Lahir</label><input type="date" class="form-control" v-model="form.guardian_birth_date"></div></div>
                    <div class="col-md-2"><div class="mb-3"><label class="form-label">Pendidikan</label><input type="text" class="form-control" v-model="form.guardian_education"></div></div>
                    <div class="col-md-2"><div class="mb-3"><label class="form-label">Pekerjaan</label><input type="text" class="form-control" v-model="form.guardian_occupation"></div></div>
                    <div class="col-md-4"><div class="mb-3"><label class="form-label">Penghasilan</label><input type="number" min="0" class="form-control" v-model.number="form.guardian_income"></div></div>
                </div>

                <div class="d-flex justify-content-between">
                    <a href="{{ route('ppdb.wizard.index') }}?go=step2&application_id={{ request('application_id') }}" class="btn btn-outline-secondary">Sebelumnya</a>
                    <a href="{{ route('ppdb.wizard.index') }}" class="btn btn-success">Selesai</a>
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
                father_status:'', father_nik:'', father_name:'', father_birth_place:'', father_birth_date:'', father_education:'', father_occupation:'',
                mother_status:'', mother_nik:'', mother_name:'', mother_birth_place:'', mother_birth_date:'', mother_education:'', mother_occupation:'',
                guardian_relation_source:'', guardian_nik:'', guardian_name:'', guardian_birth_place:'', guardian_birth_date:'', guardian_education:'', guardian_occupation:'', guardian_income:null,
            },
            savedAt: null,
            debounceTimer: null,
        };
    },
    mounted() { this.fetchData(); },
    watch: { form: { handler() { this.queueSave(); }, deep: true } },
    methods: {
        async fetchData() {
            const res = await fetch('{{ route('ppdb.wizard.profile.get', ['application' => request('application_id')]) }}');
            if (res.ok) { const data = await res.json(); if (data.profile) Object.assign(this.form, data.profile); }
        },
        queueSave() { clearTimeout(this.debounceTimer); this.debounceTimer = setTimeout(() => this.save(), 800); },
        async save() {
            const formData = new FormData();
            Object.keys(this.form).forEach(k => { if (this.form[k] !== null && this.form[k] !== '') formData.append(k, this.form[k]); });
            const res = await fetch('{{ route('ppdb.wizard.profile.saveStep', ['application' => request('application_id'), 'step' => 3]) }}', {
                method: 'POST', body: formData,
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') }
            });
            if (res.ok) this.savedAt = new Date().toLocaleString('id-ID');
        }
    }
}).mount('#ppdb-step-3');
</script>
@endsection


