@extends('layouts.tenant')

@section('title', 'Tambah Barang')
@section('page-title', 'Tambah Data Barang')

@section('content')
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Tambah Data Barang</h3>
                <div class="card-tools">
                    <a href="{{ tenant_route('inventory.items') }}" class="btn btn-secondary btn-sm">
                        <i class="fas fa-arrow-left"></i> Kembali
                    </a>
                </div>
            </div>
            <form action="{{ tenant_route('inventory.store-item') }}" method="POST">
                @csrf
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="name">Nama Barang <span class="text-danger">*</span></label>
                                <input type="text" name="name" id="name" class="form-control @error('name') is-invalid @enderror" 
                                       value="{{ old('name') }}" placeholder="Masukkan nama barang" required>
                                @error('name')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="category">Kategori <span class="text-danger">*</span></label>
                                <select name="category" id="category" class="form-control @error('category') is-invalid @enderror" required>
                                    <option value="">Pilih Kategori</option>
                                    <option value="Alat Tulis" {{ old('category') == 'Alat Tulis' ? 'selected' : '' }}>Alat Tulis</option>
                                    <option value="Elektronik" {{ old('category') == 'Elektronik' ? 'selected' : '' }}>Elektronik</option>
                                    <option value="Furnitur" {{ old('category') == 'Furnitur' ? 'selected' : '' }}>Furnitur</option>
                                    <option value="Peralatan Olahraga" {{ old('category') == 'Peralatan Olahraga' ? 'selected' : '' }}>Peralatan Olahraga</option>
                                    <option value="Peralatan Lab" {{ old('category') == 'Peralatan Lab' ? 'selected' : '' }}>Peralatan Lab</option>
                                    <option value="Peralatan Kantor" {{ old('category') == 'Peralatan Kantor' ? 'selected' : '' }}>Peralatan Kantor</option>
                                    <option value="Lainnya" {{ old('category') == 'Lainnya' ? 'selected' : '' }}>Lainnya</option>
                                </select>
                                @error('category')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="unit">Satuan <span class="text-danger">*</span></label>
                                <select name="unit" id="unit" class="form-control @error('unit') is-invalid @enderror" required>
                                    <option value="">Pilih Satuan</option>
                                    <option value="Pcs" {{ old('unit') == 'Pcs' ? 'selected' : '' }}>Pcs</option>
                                    <option value="Box" {{ old('unit') == 'Box' ? 'selected' : '' }}>Box</option>
                                    <option value="Set" {{ old('unit') == 'Set' ? 'selected' : '' }}>Set</option>
                                    <option value="Kg" {{ old('unit') == 'Kg' ? 'selected' : '' }}>Kg</option>
                                    <option value="Liter" {{ old('unit') == 'Liter' ? 'selected' : '' }}>Liter</option>
                                    <option value="Meter" {{ old('unit') == 'Meter' ? 'selected' : '' }}>Meter</option>
                                    <option value="Lainnya" {{ old('unit') == 'Lainnya' ? 'selected' : '' }}>Lainnya</option>
                                </select>
                                @error('unit')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="supplier">Supplier</label>
                                <input type="text" name="supplier" id="supplier" class="form-control @error('supplier') is-invalid @enderror" 
                                       value="{{ old('supplier') }}" placeholder="Masukkan nama supplier (opsional)">
                                @error('supplier')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="quantity">Stok Awal <span class="text-danger">*</span></label>
                                <input type="number" name="quantity" id="quantity" class="form-control @error('quantity') is-invalid @enderror" 
                                       value="{{ old('quantity', 0) }}" placeholder="Jumlah stok awal" min="0" required>
                                @error('quantity')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="min_quantity">Stok Minimum <span class="text-danger">*</span></label>
                                <input type="number" name="min_quantity" id="min_quantity" class="form-control @error('min_quantity') is-invalid @enderror" 
                                       value="{{ old('min_quantity', 0) }}" placeholder="Stok minimum" min="0" required>
                                @error('min_quantity')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="unit_price">Harga Satuan <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text">Rp</span>
                                    </div>
                                    <input type="number" name="unit_price" id="unit_price" class="form-control @error('unit_price') is-invalid @enderror" 
                                           value="{{ old('unit_price') }}" placeholder="Harga per satuan" min="0" step="0.01" required>
                                </div>
                                @error('unit_price')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="location">Lokasi Penyimpanan</label>
                                <input type="text" name="location" id="location" class="form-control @error('location') is-invalid @enderror" 
                                       value="{{ old('location') }}" placeholder="Masukkan lokasi penyimpanan (opsional)">
                                @error('location')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="description">Deskripsi</label>
                        <textarea name="description" id="description" class="form-control @error('description') is-invalid @enderror" 
                                  rows="3" placeholder="Masukkan deskripsi barang (opsional)">{{ old('description') }}</textarea>
                        @error('description')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="card-footer">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Simpan
                    </button>
                    <a href="{{ tenant_route('inventory.items') }}" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Batal
                    </a>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
$(document).ready(function() {
    // Set default min quantity to 0
    $('#quantity').change(function() {
        const quantity = parseInt($(this).val());
        const minQuantity = parseInt($('#min_quantity').val());
        if (quantity && !minQuantity) {
            $('#min_quantity').val(0);
        }
    });
});
</script>
@endpush
