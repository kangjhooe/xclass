@extends('layouts.app')

@section('title', 'PPDB - Upload Berkas')

@section('content')
<div class="container py-4" id="ppdb-step-4">
    <div class="row mb-3">
        <div class="col-12 d-flex align-items-center justify-content-between">
            <h3 class="mb-0"><i class="fas fa-file-upload me-2"></i>Langkah 4: Upload Berkas</h3>
            <a href="{{ route('ppdb.wizard.index') }}" class="btn btn-outline-secondary btn-sm">Kembali</a>
        </div>
    </div>

    <div class="alert alert-info" v-if="savedAt">
        Tersimpan: @{{ savedAt }}
    </div>

    <div class="card">
        <div class="card-body">
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label">Foto 3x4</label>
                    <input type="file" class="form-control" accept="image/*" @change="uploadOne('photo', $event)">
                    <div class="mt-2" v-if="preview.photo">
                        <img :src="preview.photo" class="img-fluid rounded border" style="max-height: 180px;">
                    </div>
                    <div class="mt-2" v-else-if="paths.photo_path">
                        <img src="{{ Storage::url('') }}@{{ paths.photo_path }}" class="img-fluid rounded border" style="max-height: 180px;">
                    </div>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Ijazah/SKHUN</label>
                    <input type="file" class="form-control" accept=".pdf,.jpg,.jpeg,.png" @change="uploadOne('ijazah', $event)">
                    <div class="mt-2 text-muted small" v-if="paths.ijazah_path">Tersimpan: @{{ fileName(paths.ijazah_path) }}</div>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Kartu Keluarga</label>
                    <input type="file" class="form-control" accept=".pdf,.jpg,.jpeg,.png" @change="uploadOne('kk', $event)">
                    <div class="mt-2 text-muted small" v-if="paths.kk_path">Tersimpan: @{{ fileName(paths.kk_path) }}</div>
                </div>
            </div>

            <hr>

            <div class="mb-3">
                <label class="form-label">Dokumen Pendukung (opsional, bisa lebih dari satu)</label>
                <input type="file" class="form-control" multiple accept=".pdf,.jpg,.jpeg,.png" @change="uploadMany($event)">
                <ul class="small mt-2" v-if="Array.isArray(paths.documents) && paths.documents.length">
                    <li v-for="(doc, idx) in paths.documents" :key="idx">@{{ fileName(doc) }}</li>
                </ul>
            </div>

            <div class="d-flex justify-content-between">
                <a href="{{ route('ppdb.wizard.index') }}?go=step3&application_id={{ request('application_id') }}" class="btn btn-outline-secondary">Sebelumnya</a>
                <a href="{{ route('ppdb.wizard.index') }}" class="btn btn-success">Selesai</a>
            </div>
        </div>
    </div>
</div>

<script>
const { createApp } = Vue;

createApp({
    data() {
        return {
            savedAt: null,
            preview: { photo: null },
            paths: { photo_path: null, ijazah_path: null, kk_path: null, documents: [] },
        };
    },
    mounted() { this.fetchExisting(); },
    methods: {
        fileName(path) { return path ? path.split('/').pop() : ''; },
        async fetchExisting() {
            const res = await fetch('{{ route('ppdb.wizard.profile.get', ['application' => request('application_id')]) }}');
            if (res.ok) {
                const data = await res.json();
                // load existing from application via dedicated endpoint later; here we rely on immediate response after upload
            }
        },
        async uploadOne(field, event) {
            const file = event.target.files[0]; if (!file) return;
            const formData = new FormData(); formData.append(field, file);
            await this.postUpload(formData);
            if (field === 'photo') this.preview.photo = URL.createObjectURL(file);
        },
        async uploadMany(event) {
            const files = event.target.files; if (!files || files.length === 0) return;
            const formData = new FormData();
            Array.from(files).forEach(f => formData.append('documents[]', f));
            await this.postUpload(formData);
        },
        async postUpload(formData) {
            const res = await fetch('{{ route('ppdb.wizard.profile.upload', ['application' => request('application_id')]) }}', {
                method: 'POST', body: formData,
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') }
            });
            if (res.ok) {
                const data = await res.json();
                this.paths.photo_path = data.photo_path;
                this.paths.ijazah_path = data.ijazah_path;
                this.paths.kk_path = data.kk_path;
                this.paths.documents = data.documents || [];
                this.savedAt = new Date().toLocaleString('id-ID');
            } else {
                alert('Gagal mengunggah berkas.');
            }
        },
    }
}).mount('#ppdb-step-4');
</script>
@endsection


