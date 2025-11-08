@extends('layouts.tenant')

@section('title', 'Edit Event')
@section('page-title', 'Edit Event')

@include('components.tenant-modern-styles')

@section('content')
<!-- Page Header -->
<div class="page-header-modern fade-in-up">
    <div class="row align-items-center">
        <div class="col-md-8">
            <h2>
                <i class="fas fa-calendar-edit me-3"></i>
                Edit Event: {{ $event->title }}
            </h2>
            <p>Edit informasi event</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="{{ tenant_route('tenant.events.index') }}" class="btn btn-modern" style="background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(10px);">
                <i class="fas fa-arrow-left me-2"></i> Kembali
            </a>
        </div>
    </div>
</div>

<div class="card-modern fade-in-up fade-in-up-delay-5">
    <div class="card-header">
        <h5>
            <i class="fas fa-edit me-2 text-primary"></i>
            Form Edit Event
        </h5>
    </div>
    <div class="card-body">
        @if ($errors->any())
            <div class="alert alert-danger alert-dismissible fade show" role="alert" style="border-radius: 12px; border: none;">
                <ul class="mb-0">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif

        <form action="{{ tenant_route('tenant.events.update', $event->id) }}" method="POST">
            @csrf
            @method('PUT')
            
            <div class="row">
                <div class="col-md-8">
                    <div class="mb-4">
                        <label for="title" class="form-label fw-semibold">Judul Event <span class="text-danger">*</span></label>
                        <input type="text" class="form-control @error('title') is-invalid @enderror" 
                               id="title" name="title" value="{{ old('title', $event->title) }}" required
                               placeholder="Masukkan judul event">
                        @error('title')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="mb-4">
                        <label for="description" class="form-label fw-semibold">Deskripsi</label>
                        <textarea class="form-control @error('description') is-invalid @enderror" 
                                  id="description" name="description" rows="4"
                                  placeholder="Masukkan deskripsi event">{{ old('description', $event->description) }}</textarea>
                        @error('description')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="row mb-4">
                        <div class="col-md-6">
                            <label for="type" class="form-label fw-semibold">Jenis Event <span class="text-danger">*</span></label>
                            <select class="form-select @error('type') is-invalid @enderror" 
                                    id="type" name="type" required>
                                <option value="">Pilih Jenis Event</option>
                                <option value="academic" {{ old('type', $event->type) == 'academic' ? 'selected' : '' }}>Akademik</option>
                                <option value="sports" {{ old('type', $event->type) == 'sports' ? 'selected' : '' }}>Olahraga</option>
                                <option value="cultural" {{ old('type', $event->type) == 'cultural' ? 'selected' : '' }}>Budaya</option>
                                <option value="other" {{ old('type', $event->type) == 'other' ? 'selected' : '' }}>Lainnya</option>
                            </select>
                            @error('type')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        <div class="col-md-6">
                            <label for="location" class="form-label fw-semibold">Lokasi</label>
                            <input type="text" class="form-control @error('location') is-invalid @enderror" 
                                   id="location" name="location" value="{{ old('location', $event->location) }}"
                                   placeholder="Masukkan lokasi event">
                            @error('location')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="row mb-4">
                        <div class="col-md-6">
                            <label for="start_date" class="form-label fw-semibold">Tanggal Mulai <span class="text-danger">*</span></label>
                            <input type="datetime-local" class="form-control @error('start_date') is-invalid @enderror" 
                                   id="start_date" name="start_date" 
                                   value="{{ old('start_date', \Carbon\Carbon::parse($event->start_date)->format('Y-m-d\TH:i')) }}" required>
                            @error('start_date')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        <div class="col-md-6">
                            <label for="end_date" class="form-label fw-semibold">Tanggal Selesai <span class="text-danger">*</span></label>
                            <input type="datetime-local" class="form-control @error('end_date') is-invalid @enderror" 
                                   id="end_date" name="end_date" 
                                   value="{{ old('end_date', \Carbon\Carbon::parse($event->end_date)->format('Y-m-d\TH:i')) }}" required>
                            @error('end_date')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="row mb-4">
                        <div class="col-md-6">
                            <label for="class_room_id" class="form-label fw-semibold">Kelas</label>
                            <select class="form-select @error('class_room_id') is-invalid @enderror" 
                                    id="class_room_id" name="class_room_id">
                                <option value="">Pilih Kelas</option>
                                @foreach($classRooms as $classRoom)
                                    <option value="{{ $classRoom->id }}" 
                                            {{ old('class_room_id', $event->class_room_id) == $classRoom->id ? 'selected' : '' }}>
                                        {{ $classRoom->name }}
                                    </option>
                                @endforeach
                            </select>
                            @error('class_room_id')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="is_all_day" name="is_all_day" 
                                   value="1" {{ old('is_all_day', $event->is_all_day) ? 'checked' : '' }}>
                            <label class="form-check-label" for="is_all_day">
                                Sepanjang Hari
                            </label>
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="is_recurring" name="is_recurring" 
                                   value="1" {{ old('is_recurring', $event->is_recurring) ? 'checked' : '' }}>
                            <label class="form-check-label" for="is_recurring">
                                Event Berulang
                            </label>
                        </div>
                    </div>

                    <div id="recurring-options" style="display: {{ old('is_recurring', $event->is_recurring) ? 'block' : 'none' }};">
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <label for="recurring_type" class="form-label fw-semibold">Jenis Pengulangan</label>
                                <select class="form-select @error('recurring_type') is-invalid @enderror" 
                                        id="recurring_type" name="recurring_type">
                                    <option value="">Pilih Jenis Pengulangan</option>
                                    <option value="daily" {{ old('recurring_type', $event->recurring_type) == 'daily' ? 'selected' : '' }}>Harian</option>
                                    <option value="weekly" {{ old('recurring_type', $event->recurring_type) == 'weekly' ? 'selected' : '' }}>Mingguan</option>
                                    <option value="monthly" {{ old('recurring_type', $event->recurring_type) == 'monthly' ? 'selected' : '' }}>Bulanan</option>
                                    <option value="yearly" {{ old('recurring_type', $event->recurring_type) == 'yearly' ? 'selected' : '' }}>Tahunan</option>
                                </select>
                                @error('recurring_type')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            <div class="col-md-6">
                                <label for="recurring_end_date" class="form-label fw-semibold">Tanggal Berakhir Pengulangan</label>
                                <input type="date" class="form-control @error('recurring_end_date') is-invalid @enderror" 
                                       id="recurring_end_date" name="recurring_end_date" 
                                       value="{{ old('recurring_end_date', $event->recurring_end_date ? \Carbon\Carbon::parse($event->recurring_end_date)->format('Y-m-d') : '') }}">
                                @error('recurring_end_date')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card-modern" style="background: #f9fafb;">
                        <div class="card-header">
                            <h6 class="mb-0">
                                <i class="fas fa-users me-2 text-primary"></i>
                                Peserta Event
                            </h6>
                        </div>
                        <div class="card-body" style="max-height: 400px; overflow-y: auto;">
                            @foreach($students as $student)
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" 
                                           id="student_{{ $student->id }}" name="student_ids[]" 
                                           value="{{ $student->id }}" 
                                           {{ in_array($student->id, old('student_ids', $event->students->pluck('id')->toArray())) ? 'checked' : '' }}>
                                    <label class="form-check-label" for="student_{{ $student->id }}">
                                        {{ $student->name }} <small class="text-muted">({{ $student->student_number }})</small>
                                    </label>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>

            <div class="d-flex gap-2 mt-4">
                <a href="{{ tenant_route('tenant.events.index') }}" class="btn btn-modern btn-secondary">
                    <i class="fas fa-times me-2"></i>
                    Batal
                </a>
                <button type="submit" class="btn btn-modern btn-primary">
                    <i class="fas fa-save me-2"></i>
                    Simpan Perubahan
                </button>
            </div>
        </form>
    </div>
</div>
@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const isRecurringCheckbox = document.getElementById('is_recurring');
    const recurringOptions = document.getElementById('recurring-options');
    
    isRecurringCheckbox.addEventListener('change', function() {
        if (this.checked) {
            recurringOptions.style.display = 'block';
        } else {
            recurringOptions.style.display = 'none';
        }
    });
});
</script>
@endpush
