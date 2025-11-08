@extends('layouts.app')

@section('title', 'PPDB - Data Keluarga')

@section('content')
<div class="container py-4" id="ppdb-step-2">
    <div class="row mb-3">
        <div class="col-12 d-flex align-items-center justify-content-between">
            <h3 class="mb-0"><i class="fas fa-users me-2"></i>Langkah 2: Data Keluarga</h3>
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
                    <div class="col-md-3">
                        <div class="mb-3">
                            <label class="form-label">Status dalam Keluarga (Anak ke-)</label>
                            <input type="number" min="1" class="form-control" v-model.number="form.family_child_order">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="mb-3">
                            <label class="form-label">Jumlah Saudara Kandung</label>
                            <input type="number" min="0" class="form-control" v-model.number="form.siblings_count">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="mb-3">
                            <label class="form-label">Jumlah Saudara Tiri</label>
                            <input type="number" min="0" class="form-control" v-model.number="form.step_siblings_count">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="mb-3">
                            <label class="form-label">Rata-rata Penghasilan Orang Tua/Bulan</label>
                            <input type="number" min="0" class="form-control" v-model.number="form.parent_income_avg">
                        </div>
                    </div>
                </div>

                <div class="d-flex justify-content-between">
                    <a href="{{ route('ppdb.wizard.index') }}?go=step1&application_id={{ request('application_id') }}" class="btn btn-outline-secondary">Sebelumnya</a>
                    <a href="{{ route('ppdb.wizard.index') }}?go=step3&application_id={{ request('application_id') }}" class="btn btn-success">Lanjut</a>
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
                family_child_order: null,
                siblings_count: null,
                step_siblings_count: null,
                parent_income_avg: null,
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
            if (res.ok) {
                const data = await res.json();
                if (data.profile) Object.assign(this.form, data.profile);
            }
        },
        queueSave() { clearTimeout(this.debounceTimer); this.debounceTimer = setTimeout(() => this.save(), 800); },
        async save() {
            const formData = new FormData();
            Object.keys(this.form).forEach(k => { if (this.form[k] !== null && this.form[k] !== '') formData.append(k, this.form[k]); });
            const res = await fetch('{{ route('ppdb.wizard.profile.saveStep', ['application' => request('application_id'), 'step' => 2]) }}', {
                method: 'POST', body: formData,
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') }
            });
            if (res.ok) this.savedAt = new Date().toLocaleString('id-ID');
        }
    }
}).mount('#ppdb-step-2');
</script>
@endsection


