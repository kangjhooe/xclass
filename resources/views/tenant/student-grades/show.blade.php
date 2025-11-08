@extends('layouts.tenant')

@section('title', 'Detail Nilai Siswa')
@section('page-title', 'Detail Nilai Siswa')

@section('content')
<div class="row">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-eye me-2"></i>
                    Detail Nilai Siswa
                </h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <table class="table table-bordered">
                            <tr>
                                <td width="30%" class="bg-light"><strong>Siswa</strong></td>
                                <td>{{ $studentGrade->student->name }}</td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Kelas</strong></td>
                                <td>{{ $studentGrade->student->classRoom->name ?? 'Tidak ada kelas' }}</td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Mata Pelajaran</strong></td>
                                <td>{{ $studentGrade->subject->name }}</td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Guru</strong></td>
                                <td>{{ $studentGrade->teacher->name }}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <table class="table table-bordered">
                            <tr>
                                <td width="30%" class="bg-light"><strong>Tahun Pelajaran</strong></td>
                                <td>{{ $studentGrade->academicYear->year_name }}</td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Semester</strong></td>
                                <td>{{ $studentGrade->semester }}</td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Jenis Penilaian</strong></td>
                                <td>
                                    <span class="badge bg-info">{{ $studentGrade->assignment_type_label }}</span>
                                </td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Nama Tugas</strong></td>
                                <td>{{ $studentGrade->assignment_name }}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <hr>
                
                <div class="row">
                    <div class="col-md-6">
                        <h6>Detail Nilai</h6>
                        <table class="table table-bordered">
                            <tr>
                                <td width="30%" class="bg-light"><strong>Nilai</strong></td>
                                <td>
                                    @if($studentGrade->score !== null)
                                        <strong>{{ number_format($studentGrade->score, 2) }}</strong>
                                        <small class="text-muted">/ {{ number_format($studentGrade->max_score, 2) }}</small>
                                    @else
                                        <span class="text-muted">-</span>
                                    @endif
                                </td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Persentase</strong></td>
                                <td>
                                    @if($studentGrade->percentage > 0)
                                        <strong>{{ number_format($studentGrade->percentage, 1) }}%</strong>
                                    @else
                                        <span class="text-muted">-</span>
                                    @endif
                                </td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Nilai Akhir</strong></td>
                                <td>
                                    @if($studentGrade->final_score !== null)
                                        <strong class="fs-5">{{ number_format($studentGrade->final_score, 2) }}</strong>
                                    @else
                                        <span class="text-muted">Belum dihitung</span>
                                    @endif
                                </td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Predikat</strong></td>
                                <td>
                                    @if($studentGrade->letter_grade)
                                        <span class="badge bg-{{ $studentGrade->letter_grade == 'A' ? 'success' : ($studentGrade->letter_grade == 'B' ? 'info' : ($studentGrade->letter_grade == 'C' ? 'warning' : ($studentGrade->letter_grade == 'D' ? 'secondary' : 'danger'))) }} fs-6">
                                            {{ $studentGrade->letter_grade }}
                                        </span>
                                    @else
                                        <span class="text-muted">-</span>
                                    @endif
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6>Status & Keterangan</h6>
                        <table class="table table-bordered">
                            <tr>
                                <td width="30%" class="bg-light"><strong>Status</strong></td>
                                <td>
                                    @if($studentGrade->is_passed)
                                        <span class="badge bg-success">Lulus</span>
                                    @else
                                        <span class="badge bg-danger">Tidak Lulus</span>
                                    @endif
                                </td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Bobot</strong></td>
                                <td>{{ number_format($studentGrade->weight * 100, 2) }}%</td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Keterangan</strong></td>
                                <td>{{ $studentGrade->notes ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td class="bg-light"><strong>Tanggal Input</strong></td>
                                <td>{{ \App\Helpers\DateHelper::formatIndonesian($studentGrade->created_at, true) }}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div class="d-flex justify-content-between mt-4">
                    <a href="{{ tenant_route('tenant.student-grades.index') }}" class="btn btn-secondary">
                        <i class="fas fa-arrow-left me-2"></i>
                        Kembali
                    </a>
                    <div>
                        <a href="{{ tenant_route('tenant.student-grades.edit', $studentGrade) }}" class="btn btn-warning">
                            <i class="fas fa-edit me-2"></i>
                            Edit
                        </a>
                        <form action="{{ tenant_route('tenant.student-grades.destroy', $studentGrade) }}" 
                              method="POST" class="d-inline"
                              onsubmit="return confirm('Hapus nilai ini?')">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn btn-danger">
                                <i class="fas fa-trash me-2"></i>
                                Hapus
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card">
            <div class="card-header">
                <h6 class="mb-0">
                    <i class="fas fa-chart-pie me-2"></i>
                    Ringkasan Nilai
                </h6>
            </div>
            <div class="card-body text-center">
                @if($studentGrade->final_score !== null)
                    <div class="mb-3">
                        <h3 class="text-primary">{{ number_format($studentGrade->final_score, 2) }}</h3>
                        <p class="mb-0">Nilai Akhir</p>
                    </div>
                    
                    <div class="mb-3">
                        <span class="badge bg-{{ $studentGrade->letter_grade == 'A' ? 'success' : ($studentGrade->letter_grade == 'B' ? 'info' : ($studentGrade->letter_grade == 'C' ? 'warning' : ($studentGrade->letter_grade == 'D' ? 'secondary' : 'danger'))) }} fs-4">
                            {{ $studentGrade->letter_grade }}
                        </span>
                        <p class="mb-0">Predikat</p>
                    </div>
                    
                    <div class="mb-3">
                        @if($studentGrade->is_passed)
                            <span class="badge bg-success fs-6">LULUS</span>
                        @else
                            <span class="badge bg-danger fs-6">TIDAK LULUS</span>
                        @endif
                        <p class="mb-0">Status</p>
                    </div>
                @else
                    <div class="text-muted">
                        <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                        <p>Nilai belum dihitung</p>
                    </div>
                @endif
            </div>
        </div>
        
        <div class="card mt-3">
            <div class="card-header">
                <h6 class="mb-0">
                    <i class="fas fa-info-circle me-2"></i>
                    Informasi Tambahan
                </h6>
            </div>
            <div class="card-body">
                <p class="mb-2">
                    <strong>KKM:</strong> 60
                </p>
                <p class="mb-2">
                    <strong>Bobot:</strong> {{ number_format($studentGrade->weight * 100, 2) }}%
                </p>
                <p class="mb-0">
                    <strong>Terakhir Diperbarui:</strong><br>
                    {{ \App\Helpers\DateHelper::formatIndonesian($studentGrade->updated_at, true) }}
                </p>
            </div>
        </div>
    </div>
</div>
@endsection
