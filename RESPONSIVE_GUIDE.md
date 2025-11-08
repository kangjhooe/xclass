# Panduan Responsivitas Aplikasi

Aplikasi telah ditingkatkan untuk lebih responsif dan kompatibel dengan berbagai device termasuk smartphone dan tablet.

## Fitur yang Telah Ditingkatkan

### 1. Layout Responsif
- **Sidebar**: Otomatis tersembunyi di mobile/tablet dan dapat dibuka dengan tombol menu
- **Overlay**: Sidebar overlay untuk pengalaman mobile yang lebih baik
- **Breakpoints**: 
  - Mobile: < 576px
  - Tablet: 576px - 768px
  - Desktop: > 768px
  - Large Desktop: > 992px

### 2. Tabel Responsif
Untuk membuat tabel responsif, gunakan wrapper class `table-responsive-wrapper`:

```html
<div class="table-responsive-wrapper">
    <table class="table table-modern">
        <thead>
            <tr>
                <th>Kolom 1</th>
                <th>Kolom 2</th>
                <th>Kolom 3</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td data-label="Kolom 1">Data 1</td>
                <td data-label="Kolom 2">Data 2</td>
                <td data-label="Kolom 3">Data 3</td>
            </tr>
        </tbody>
    </table>
</div>
```

**Catatan**: Pastikan setiap `<td>` memiliki atribut `data-label` yang sesuai dengan header kolom untuk tampilan mobile yang optimal.

### 3. Form Responsif
- Input form otomatis menyesuaikan ukuran di mobile
- Font size 16px untuk mencegah zoom otomatis di iOS
- Button full-width di mobile untuk kemudahan penggunaan

### 4. Button Responsif
- Button otomatis menjadi full-width di mobile
- Button group menjadi vertikal di mobile
- Exception: Button di card header tetap inline

### 5. Utility Classes

#### Hide/Show berdasarkan device:
- `.d-mobile-none` - Sembunyikan di mobile
- `.d-mobile-only` - Tampilkan hanya di mobile
- `.d-tablet-none` - Sembunyikan di tablet
- `.d-tablet-only` - Tampilkan hanya di tablet

#### Flex utilities:
- `.flex-mobile-column` - Flex column di mobile
- `.flex-mobile-wrap` - Flex wrap di mobile

### 6. Spacing Responsif
Padding dan margin otomatis menyesuaikan di mobile:
- `.p-4` menjadi lebih kecil di mobile
- `.mb-4`, `.mt-4` menyesuaikan ukuran

### 7. Typography Responsif
Ukuran font heading otomatis menyesuaikan di mobile untuk keterbacaan yang lebih baik.

## Cara Menggunakan

### 1. Tabel Responsif
```html
<div class="table-responsive-wrapper">
    <table class="table">
        <!-- Pastikan setiap td memiliki data-label -->
        <td data-label="Nama Kolom">Value</td>
    </table>
</div>
```

### 2. Button di Mobile
Button otomatis menjadi full-width di mobile. Jika ingin tetap inline, gunakan:
```html
<div class="card-header">
    <button class="btn btn-primary">Tetap Inline</button>
</div>
```

### 3. Grid Layout
Untuk memaksa single column di mobile:
```html
<div class="row mobile-single-col">
    <div class="col-md-6">Konten</div>
</div>
```

## File CSS

File CSS responsif berada di:
- `resources/css/responsive.css` (source)
- `public/css/responsive.css` (compiled)

File ini otomatis di-load di semua layout:
- `layouts/admin-simple.blade.php`
- `layouts/admin.blade.php`
- `layouts/tenant.blade.php`
- `layouts/app.blade.php`

## Testing

Untuk menguji responsivitas:
1. Buka aplikasi di browser
2. Gunakan Developer Tools (F12)
3. Aktifkan Device Toolbar (Ctrl+Shift+M)
4. Pilih berbagai device:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1920px)

## Catatan Penting

1. **Tabel**: Pastikan selalu menggunakan `data-label` pada setiap `<td>` untuk tampilan mobile yang optimal
2. **Sidebar**: Sidebar otomatis tersembunyi di mobile/tablet dan muncul dengan overlay
3. **Touch Targets**: Semua button dan link memiliki ukuran minimal 44x44px untuk kemudahan touch
4. **Font Size**: Input form menggunakan font size 16px untuk mencegah zoom otomatis di iOS

## Perbaikan yang Dilakukan

1. ✅ Media queries komprehensif untuk semua breakpoint
2. ✅ Sidebar responsif dengan overlay
3. ✅ Tabel responsif dengan card view di mobile
4. ✅ Form input responsif
5. ✅ Button responsif
6. ✅ Navbar responsif
7. ✅ Spacing dan padding responsif
8. ✅ Typography responsif
9. ✅ Modal responsif
10. ✅ Pagination responsif

