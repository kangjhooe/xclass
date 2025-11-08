@extends('layouts.tenant')

@section('title', 'Copy Data dari Tahun Pelajaran Sebelumnya')
@section('page-title', 'Copy Data dari Tahun Pelajaran Sebelumnya')

@section('content')
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-copy me-2"></i>
                    Copy Data ke Tahun Pelajaran: <strong>{{ $academicYear->year_name }}</strong>
                </h5>
            </div>
            <div class="card-body">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>Informasi:</strong>
                    <ul class="mb-0 mt-2">
                        <li><strong>Data yang bisa di-copy:</strong> Kelas, Jadwal Pelajaran</li>
                        <li><strong>Data yang TIDAK perlu di-copy:</strong> Sarana Prasarana/Inventory (tetap sama setiap tahun)</li>
                        <li>Data dari tahun pelajaran sebelumnya akan tetap aman dan tidak terhapus.</li>
                    </ul>
                </div>

                <div class="row">
                    <!-- Copy Kelas -->
                    <div class="col-md-6 mb-4">
                        <div class="card border-primary">
                            <div class="card-header bg-primary text-white">
                                <h6 class="mb-0">
                                    <i class="fas fa-door-open me-2"></i>
                                    Copy Kelas
                                </h6>
                            </div>
                            <div class="card-body">
                                <p class="text-muted">
                                    Menyalin struktur kelas dari tahun pelajaran sebelumnya. 
                                    Biasanya digunakan untuk membuat kelas baru di tahun pelajaran baru.
                                </p>
                                
                                <form action="{{ tenant_route('tenant.academic-years.copy-classes', $academicYear) }}" 
                                      method="POST" 
                                      onsubmit="return confirm('Yakin ingin menyalin kelas dari tahun pelajaran yang dipilih?')">
                                    @csrf
                                    <div class="mb-3">
                                        <label class="form-label">Dari Tahun Pelajaran <span class="text-danger">*</span></label>
                                        <select name="from_academic_year_id" class="form-select" required>
                                            <option value="">Pilih Tahun Pelajaran</option>
                                            @foreach($academicYears as $ay)
                                                <option value="{{ $ay->id }}">{{ $ay->year_name }}</option>
                                            @endforeach
                                        </select>
                                    </div>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-copy me-2"></i>
                                        Copy Kelas
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <!-- Copy Jadwal -->
                    <div class="col-md-6 mb-4">
                        <div class="card border-success">
                            <div class="card-header bg-success text-white">
                                <h6 class="mb-0">
                                    <i class="fas fa-calendar-alt me-2"></i>
                                    Copy Jadwal Pelajaran
                                </h6>
                            </div>
                            <div class="card-body">
                                <p class="text-muted">
                                    Menyalin jadwal pelajaran dari tahun pelajaran sebelumnya. 
                                    Pastikan kelas untuk tahun pelajaran baru sudah dibuat terlebih dahulu.
                                </p>
                                
                                <form action="{{ tenant_route('tenant.academic-years.copy-schedules', $academicYear) }}" 
                                      method="POST"
                                      onsubmit="return confirm('Yakin ingin menyalin jadwal dari tahun pelajaran yang dipilih?')">
                                    @csrf
                                    <div class="mb-3">
                                        <label class="form-label">Dari Tahun Pelajaran <span class="text-danger">*</span></label>
                                        <select name="from_academic_year_id" id="fromAcademicYearSelect" 
                                                class="form-select" 
                                                required
                                                onchange="loadClassMapping(this.value)">
                                            <option value="">Pilih Tahun Pelajaran</option>
                                            @foreach($academicYears as $ay)
                                                <option value="{{ $ay->id }}">{{ $ay->year_name }}</option>
                                            @endforeach
                                        </select>
                                    </div>
                                    
                                    <div id="classMappingSection" style="display: none;">
                                        <label class="form-label">Mapping Kelas (Opsional)</label>
                                        <small class="text-muted d-block mb-2">
                                            Jika kelas di tahun baru berbeda, pilih mapping kelas yang sesuai.
                                            Jika dikosongkan, sistem akan menggunakan kelas dengan nama yang sama.
                                        </small>
                                        <div id="classMappingContainer">
                                            <!-- Class mapping will be loaded here -->
                                        </div>
                                    </div>
                                    
                                    <button type="submit" class="btn btn-success mt-3">
                                        <i class="fas fa-copy me-2"></i>
                                        Copy Jadwal
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-4">
                    <a href="{{ tenant_route('tenant.academic-years.show', $academicYear) }}" 
                       class="btn btn-secondary">
                        <i class="fas fa-arrow-left me-2"></i>
                        Kembali ke Detail Tahun Pelajaran
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function loadClassMapping(fromAcademicYearId) {
    if (!fromAcademicYearId) {
        document.getElementById('classMappingSection').style.display = 'none';
        return;
    }

    // Fetch classes from source academic year
    const url = '{{ tenant_route("tenant.academic-years.get-classes", ":id") }}'.replace(':id', fromAcademicYearId);
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('classMappingContainer');
            container.innerHTML = '';

            if (data.classes && data.classes.length > 0) {
                data.classes.forEach(sourceClass => {
                    const div = document.createElement('div');
                    div.className = 'mb-2';
                    
                    const label = document.createElement('label');
                    label.className = 'form-label small';
                    label.textContent = `${sourceClass.name} →`;
                    
                    const select = document.createElement('select');
                    select.name = `class_mapping[${sourceClass.id}]`;
                    select.className = 'form-select form-select-sm';
                    
                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = '(Gunakan kelas yang sama)';
                    select.appendChild(defaultOption);
                    
                    // Add target classes grouped by level
                    @foreach($targetClasses as $level => $classes)
                        if ('{{ $level }}' === sourceClass.level) {
                            const optgroup = document.createElement('optgroup');
                            optgroup.label = 'Kelas {{ $level }}';
                            @foreach($classes as $targetClass)
                                const option = document.createElement('option');
                                option.value = '{{ $targetClass->id }}';
                                option.textContent = '{{ $targetClass->name }}';
                                optgroup.appendChild(option);
                            @endforeach
                            select.appendChild(optgroup);
                        }
                    @endforeach
                    
                    div.appendChild(label);
                    div.appendChild(select);
                    container.appendChild(div);
                });
                
                document.getElementById('classMappingSection').style.display = 'block';
            } else {
                document.getElementById('classMappingSection').style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error loading class mapping:', error);
            document.getElementById('classMappingSection').style.display = 'none';
        });
}
</script>
@endsection

