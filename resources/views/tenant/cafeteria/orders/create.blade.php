@extends('layouts.tenant')

@section('title', 'Tambah Pesanan')
@section('page-title', 'Tambah Pesanan Kafetaria')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-plus-circle me-2"></i>
                        Form Tambah Pesanan
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

                    <form action="{{ tenant_route('cafeteria.orders.store') }}" method="POST" id="orderForm">
                        @csrf
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="student_id" class="form-label">Siswa <span class="text-danger">*</span></label>
                                    <select class="form-select @error('student_id') is-invalid @enderror" 
                                            id="student_id" name="student_id" required>
                                        <option value="">Pilih Siswa</option>
                                        @foreach($students as $student)
                                            <option value="{{ $student->id }}" {{ old('student_id') == $student->id ? 'selected' : '' }}>
                                                {{ $student->name }} ({{ $student->student_number }})
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('student_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="mb-4">
                            <h6>Pilih Menu</h6>
                            <div class="row" id="menuItems">
                                @foreach($menuItems as $menuItem)
                                <div class="col-md-4 mb-3">
                                    <div class="card">
                                        <div class="card-body">
                                            @if($menuItem->image)
                                                <img src="{{ asset($menuItem->image) }}" class="card-img-top mb-2" 
                                                     style="height: 150px; object-fit: cover;" alt="{{ $menuItem->name }}">
                                            @endif
                                            <h6 class="card-title">{{ $menuItem->name }}</h6>
                                            <p class="card-text text-muted small">{{ $menuItem->description }}</p>
                                            <div class="d-flex justify-content-between align-items-center">
                                                <span class="fw-bold text-primary">Rp {{ number_format($menuItem->price, 0, ',', '.') }}</span>
                                                <div class="input-group" style="width: 100px;">
                                                    <button type="button" class="btn btn-outline-secondary btn-sm" 
                                                            onclick="decreaseQuantity('{{ $menuItem->id }}')">-</button>
                                                    <input type="number" class="form-control form-control-sm text-center" 
                                                           id="quantity_{{ $menuItem->id }}" name="menu_items[{{ $menuItem->id }}][quantity]" 
                                                           value="0" min="0" max="{{ $menuItem->stock ?? 999 }}" 
                                                           onchange="updateTotal()">
                                                    <button type="button" class="btn btn-outline-secondary btn-sm" 
                                                            onclick="increaseQuantity('{{ $menuItem->id }}')">+</button>
                                                </div>
                                            </div>
                                            <input type="hidden" name="menu_items[{{ $menuItem->id }}][id]" value="{{ $menuItem->id }}">
                                        </div>
                                    </div>
                                </div>
                                @endforeach
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="notes" class="form-label">Catatan</label>
                            <textarea class="form-control @error('notes') is-invalid @enderror" 
                                      id="notes" name="notes" rows="3" 
                                      placeholder="Catatan tambahan untuk pesanan">{{ old('notes') }}</textarea>
                            @error('notes')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="card bg-light">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <h6>Total Pesanan</h6>
                                        <div id="orderSummary">
                                            <p class="mb-1">Jumlah Item: <span id="totalItems">0</span></p>
                                            <p class="mb-0">Total Harga: <span id="totalPrice" class="fw-bold text-primary">Rp 0</span></p>
                                        </div>
                                    </div>
                                    <div class="col-md-6 text-end">
                                        <button type="submit" class="btn btn-primary btn-lg" id="submitBtn" disabled>
                                            <i class="fas fa-shopping-cart me-1"></i>
                                            Buat Pesanan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end gap-2 mt-3">
                            <a href="{{ tenant_route('cafeteria.orders') }}" class="btn btn-secondary">
                                <i class="fas fa-times me-1"></i>
                                Batal
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function increaseQuantity(menuId) {
    const input = document.getElementById('quantity_' + menuId);
    const max = parseInt(input.getAttribute('max'));
    const current = parseInt(input.value);
    
    if (current < max) {
        input.value = current + 1;
        updateTotal();
    }
}

function decreaseQuantity(menuId) {
    const input = document.getElementById('quantity_' + menuId);
    const current = parseInt(input.value);
    
    if (current > 0) {
        input.value = current - 1;
        updateTotal();
    }
}

function updateTotal() {
    let totalItems = 0;
    let totalPrice = 0;
    
    // Get all quantity inputs
    const quantityInputs = document.querySelectorAll('input[name*="[quantity]"]');
    
    quantityInputs.forEach(input => {
        const quantity = parseInt(input.value) || 0;
        totalItems += quantity;
        
        // Get price from the card
        const card = input.closest('.card');
        const priceText = card.querySelector('.fw-bold.text-primary').textContent;
        const price = parseInt(priceText.replace(/[^\d]/g, ''));
        totalPrice += price * quantity;
    });
    
    // Update display
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalPrice').textContent = 'Rp ' + totalPrice.toLocaleString('id-ID');
    
    // Enable/disable submit button
    const submitBtn = document.getElementById('submitBtn');
    if (totalItems > 0) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateTotal();
});
</script>
@endsection
