@extends('layouts.app')

@section('title', 'Wizard PPDB')

@section('content')
<div class="container py-4">
    <div class="row mb-3">
        <div class="col-12 d-flex align-items-center justify-content-between">
            <h3 class="mb-0"><i class="fas fa-user-graduate me-2"></i>Wizard PPDB</h3>
            <a href="{{ route('home') }}" class="btn btn-outline-secondary btn-sm">Kembali</a>
        </div>
    </div>

    <div class="card">
        <div class="card-body">
            @if($application)
                <div class="alert alert-info d-flex align-items-center" role="alert">
                    <i class="fas fa-info-circle me-2"></i>
                    Anda memiliki pendaftaran dengan nomor <strong class="ms-1">{{ $application->registration_number }}</strong> (status: <strong>{{ $application->status_label }}</strong>).
                </div>
                @php($step = optional($application->profile)->wizard_step ?? 1)
                <div class="mb-3">
                    <div class="progress" style="height: 8px;">
                        <div class="progress-bar" role="progressbar" style="width: {{ min(100, ($step/4)*100) }}%"></div>
                    </div>
                    <small class="text-muted">Progress: Langkah {{ $step }} dari 4</small>
                </div>
            @else
                <div class="alert alert-warning d-flex align-items-center" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Anda belum memiliki pendaftaran. Silakan mulai dari langkah pertama.
                </div>
            @endif

            <ol class="list-group list-group-numbered">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-semibold">Langkah 1: Biodata</div>
                        <small class="text-muted">Data diri dan orang tua/wali</small>
                    </div>
                    <a href="{{ route('ppdb.wizard.index') }}?go=step1&application_id={{ $application->id ?? '' }}" class="btn btn-primary btn-sm">Mulai</a>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-semibold">Langkah 2: Data Keluarga</div>
                        <small class="text-muted">Status anak, saudara, penghasilan</small>
                    </div>
                    <a href="{{ route('ppdb.wizard.index') }}?go=step2&application_id={{ $application->id ?? '' }}" class="btn btn-primary btn-sm">Mulai</a>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-semibold">Langkah 3: Data Ayah/Ibu/Wali</div>
                        <small class="text-muted">Identitas orang tua dan wali</small>
                    </div>
                    <a href="{{ route('ppdb.wizard.index') }}?go=step3&application_id={{ $application->id ?? '' }}" class="btn btn-primary btn-sm">Mulai</a>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-semibold">Langkah 4: Upload Berkas</div>
                        <small class="text-muted">Foto, KK, Ijazah, dok. pendukung</small>
                    </div>
                    <a href="{{ route('ppdb.wizard.index') }}?go=step4&application_id={{ $application->id ?? '' }}" class="btn btn-primary btn-sm">Mulai</a>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-semibold">Langkah 4: Review & Submit</div>
                        <small class="text-muted">Kunci pengajuan Anda</small>
                    </div>
                    @if(($application->profile->wizard_step ?? 1) >= 3 && $application->status === 'pending')
                        <form method="POST" action="{{ route('ppdb.wizard.submit', ['application' => $application->id]) }}">
                            @csrf
                            <button type="submit" class="btn btn-success btn-sm">Kunci & Kirim</button>
                        </form>
                    @else
                        <button class="btn btn-success btn-sm" disabled>Review</button>
                    @endif
                </li>
            </ol>
        </div>
    </div>
</div>
@endsection


