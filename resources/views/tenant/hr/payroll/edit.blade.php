@extends('layouts.tenant')

@section('title', 'Edit Penggajian')
@section('page-title', 'Edit Penggajian')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-edit me-2"></i>
                        Form Edit Penggajian
                    </h5>
                </div>
                <div class="card-body">
                    @if ($errors->any())
                        <div class="alert alert-danger">
                            <ul class="mb-0">
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    <form action="{{ tenant_route('hr.payroll.update', $payroll->id) }}" method="POST">
                        @csrf
                        @method('PUT')
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="employee_id" class="form-label">Karyawan <span class="text-danger">*</span></label>
                                    <select class="form-select @error('employee_id') is-invalid @enderror" 
                                            id="employee_id" name="employee_id" required>
                                        <option value="">Pilih Karyawan</option>
                                        @foreach($employees as $emp)
                                            <option value="{{ $emp['id'] }}" 
                                                    data-type="{{ $emp['type'] }}"
                                                    {{ old('employee_id', $payroll->employee_id) == $emp['id'] ? 'selected' : '' }}>
                                                {{ $emp['name'] }} ({{ $emp['number'] }}) - {{ ucfirst($emp['type']) }}
                                            </option>
                                        @endforeach
                                    </select>
                                    <input type="hidden" id="employee_type" name="employee_type" value="{{ old('employee_type', $payroll->employee_type ?? 'employee') }}">
                                    @error('employee_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                    @error('employee_type')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="payroll_date" class="form-label">Tanggal Penggajian <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control @error('payroll_date') is-invalid @enderror" 
                                           id="payroll_date" name="payroll_date" 
                                           value="{{ old('payroll_date', $payroll->payroll_date->format('Y-m-d')) }}" required>
                                    @error('payroll_date')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label for="basic_salary" class="form-label">Gaji Pokok <span class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text">Rp</span>
                                        <input type="number" class="form-control @error('basic_salary') is-invalid @enderror" 
                                               id="basic_salary" name="basic_salary" 
                                               value="{{ old('basic_salary', $payroll->basic_salary) }}" 
                                               min="0" step="0.01" required>
                                        @error('basic_salary')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="notes" class="form-label">Catatan</label>
                                    <textarea class="form-control @error('notes') is-invalid @enderror" 
                                              id="notes" name="notes" rows="3" 
                                              placeholder="Catatan tambahan">{{ old('notes', $payroll->notes) }}</textarea>
                                    @error('notes')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="card">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Tunjangan</h6>
                                    </div>
                                    <div class="card-body">
                                        <div id="allowances">
                                            @if(old('allowances'))
                                                @foreach(old('allowances') as $index => $allowance)
                                                <div class="allowance-item mb-3">
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <input type="text" class="form-control" 
                                                                   name="allowances[{{ $index }}][name]" 
                                                                   placeholder="Nama Tunjangan"
                                                                   value="{{ $allowance['name'] }}">
                                                        </div>
                                                        <div class="col-md-4">
                                                            <div class="input-group">
                                                                <span class="input-group-text">Rp</span>
                                                                <input type="number" class="form-control" 
                                                                       name="allowances[{{ $index }}][amount]" 
                                                                       min="0" step="0.01"
                                                                       value="{{ $allowance['amount'] }}">
                                                            </div>
                                                        </div>
                                                        <div class="col-md-2">
                                                            <button type="button" class="btn btn-danger btn-sm" onclick="removeAllowance(this)">
                                                                <i class="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                @endforeach
                                            @else
                                                @foreach($payroll->allowances as $index => $allowance)
                                                <div class="allowance-item mb-3">
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <input type="text" class="form-control" 
                                                                   name="allowances[{{ $index }}][name]" 
                                                                   placeholder="Nama Tunjangan"
                                                                   value="{{ $allowance->name }}">
                                                        </div>
                                                        <div class="col-md-4">
                                                            <div class="input-group">
                                                                <span class="input-group-text">Rp</span>
                                                                <input type="number" class="form-control" 
                                                                       name="allowances[{{ $index }}][amount]" 
                                                                       min="0" step="0.01"
                                                                       value="{{ $allowance->amount }}">
                                                            </div>
                                                        </div>
                                                        <div class="col-md-2">
                                                            <button type="button" class="btn btn-danger btn-sm" onclick="removeAllowance(this)">
                                                                <i class="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                @endforeach
                                            @endif
                                        </div>
                                        <button type="button" class="btn btn-success btn-sm" onclick="addAllowance()">
                                            <i class="fas fa-plus me-1"></i>
                                            Tambah Tunjangan
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="card">
                                    <div class="card-header">
                                        <h6 class="card-title mb-0">Potongan</h6>
                                    </div>
                                    <div class="card-body">
                                        <div id="deductions">
                                            @if(old('deductions'))
                                                @foreach(old('deductions') as $index => $deduction)
                                                <div class="deduction-item mb-3">
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <input type="text" class="form-control" 
                                                                   name="deductions[{{ $index }}][name]" 
                                                                   placeholder="Nama Potongan"
                                                                   value="{{ $deduction['name'] }}">
                                                        </div>
                                                        <div class="col-md-4">
                                                            <div class="input-group">
                                                                <span class="input-group-text">Rp</span>
                                                                <input type="number" class="form-control" 
                                                                       name="deductions[{{ $index }}][amount]" 
                                                                       min="0" step="0.01"
                                                                       value="{{ $deduction['amount'] }}">
                                                            </div>
                                                        </div>
                                                        <div class="col-md-2">
                                                            <button type="button" class="btn btn-danger btn-sm" onclick="removeDeduction(this)">
                                                                <i class="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                @endforeach
                                            @else
                                                @foreach($payroll->deductions as $index => $deduction)
                                                <div class="deduction-item mb-3">
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <input type="text" class="form-control" 
                                                                   name="deductions[{{ $index }}][name]" 
                                                                   placeholder="Nama Potongan"
                                                                   value="{{ $deduction->name }}">
                                                        </div>
                                                        <div class="col-md-4">
                                                            <div class="input-group">
                                                                <span class="input-group-text">Rp</span>
                                                                <input type="number" class="form-control" 
                                                                       name="deductions[{{ $index }}][amount]" 
                                                                       min="0" step="0.01"
                                                                       value="{{ $deduction->amount }}">
                                                            </div>
                                                        </div>
                                                        <div class="col-md-2">
                                                            <button type="button" class="btn btn-danger btn-sm" onclick="removeDeduction(this)">
                                                                <i class="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                @endforeach
                                            @endif
                                        </div>
                                        <button type="button" class="btn btn-success btn-sm" onclick="addDeduction()">
                                            <i class="fas fa-plus me-1"></i>
                                            Tambah Potongan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end gap-2 mt-3">
                            <a href="{{ tenant_route('hr.payroll') }}" class="btn btn-secondary">
                                <i class="fas fa-times me-1"></i>
                                Batal
                            </a>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i>
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
let allowanceIndex = {{ old('allowances') ? count(old('allowances')) : $payroll->allowances->count() }};
let deductionIndex = {{ old('deductions') ? count(old('deductions')) : $payroll->deductions->count() }};

// Handle employee type change
document.getElementById('employee_id').addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    const employeeType = selectedOption.getAttribute('data-type') || 'employee';
    document.getElementById('employee_type').value = employeeType;
});

// Set initial employee type
document.addEventListener('DOMContentLoaded', function() {
    const selectedOption = document.getElementById('employee_id').options[document.getElementById('employee_id').selectedIndex];
    if (selectedOption && selectedOption.value) {
        const employeeType = selectedOption.getAttribute('data-type') || '{{ $payroll->employee_type ?? 'employee' }}';
        document.getElementById('employee_type').value = employeeType;
    }
});

function addAllowance() {
    const container = document.getElementById('allowances');
    const newItem = document.createElement('div');
    newItem.className = 'allowance-item mb-3';
    newItem.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <input type="text" class="form-control" name="allowances[${allowanceIndex}][name]" placeholder="Nama Tunjangan">
            </div>
            <div class="col-md-4">
                <div class="input-group">
                    <span class="input-group-text">Rp</span>
                    <input type="number" class="form-control" name="allowances[${allowanceIndex}][amount]" min="0" step="0.01">
                </div>
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeAllowance(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(newItem);
    allowanceIndex++;
}

function removeAllowance(button) {
    button.closest('.allowance-item').remove();
}

function addDeduction() {
    const container = document.getElementById('deductions');
    const newItem = document.createElement('div');
    newItem.className = 'deduction-item mb-3';
    newItem.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <input type="text" class="form-control" name="deductions[${deductionIndex}][name]" placeholder="Nama Potongan">
            </div>
            <div class="col-md-4">
                <div class="input-group">
                    <span class="input-group-text">Rp</span>
                    <input type="number" class="form-control" name="deductions[${deductionIndex}][amount]" min="0" step="0.01">
                </div>
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeDeduction(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(newItem);
    deductionIndex++;
}

function removeDeduction(button) {
    button.closest('.deduction-item').remove();
}
</script>
@endsection
