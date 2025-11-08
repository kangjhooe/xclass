# Analisis Masalah Route Model Binding dengan Multi-Tenant

## Masalah Utama

Controller `TeacherController::show(Teacher $teacher)` menerima **string** padahal seharusnya menerima **instance Teacher**.

## Urutan Eksekusi (dari Stack Trace)

```
Line 17: SubstituteBindings           ← DIPANGGIL PERTAMA
Line 11: TenantMiddleware              ← DIPANGGIL KEDUA  
Line 9:  TenantModelBindingMiddleware   ← DIPANGGIL KETIGA
Line 0:  Controller                     ← DIPANGGIL TERAKHIR
```

## Apa yang Terjadi?

### Step 1: SubstituteBindings (Line 17)
- `SubstituteBindings` dijalankan **SEBELUM** `TenantMiddleware`
- Saat melihat type hint `Teacher $teacher` di controller, Laravel memanggil `Route::bind('teacher')`
- **Masalah:** Pada saat ini, tenant **BELUM tersedia** karena `TenantMiddleware` belum dijalankan
- `Route::bind` kita mencoba mengambil tenant dari route parameter `{tenant}`
- Tapi route parameter `{tenant}` masih berupa **string NPSN**, belum object Tenant
- `Route::bind` mencoba resolve tenant dari string NPSN, tapi mungkin gagal
- Akhirnya `Route::bind` melewatkan **string NIK** ke controller

### Step 2: TenantMiddleware (Line 11)
- `TenantMiddleware` dijalankan dan set tenant ke `TenantService`
- Tapi sudah terlambat, Laravel sudah melakukan dependency injection

### Step 3: TenantModelBindingMiddleware (Line 9)
- Middleware kita mencoba mengubah parameter string menjadi object
- Middleware berhasil mengubah parameter di route menjadi object (terlihat di Route Parameters)
- **Tapi Laravel sudah melakukan dependency injection berdasarkan type hint SEBELUM middleware kita**
- Controller tetap menerima string yang sudah di-inject sebelumnya

## Kenapa Route Parameters Menunjukkan Object?

Karena middleware kita berhasil mengubah parameter **setelah** Laravel melakukan dependency injection. Tapi Laravel sudah mengambil nilai parameter **sebelum** middleware kita mengubahnya.

## Root Cause

**`SubstituteBindings` dijalankan SEBELUM `TenantMiddleware`, sehingga:**
1. Tenant belum tersedia saat `Route::bind` dipanggil
2. `Route::bind` tidak bisa melakukan query dengan `instansi_id`
3. `Route::bind` melewatkan string ke controller
4. Laravel melakukan dependency injection dengan string tersebut
5. Middleware kita tidak bisa mengubah parameter yang sudah di-inject

## Solusi yang Diperlukan

1. **Pastikan `Route::bind` dapat mengambil tenant dari route parameter string NPSN** dan resolve menjadi object Tenant
2. **Atau ubah urutan middleware** agar `SubstituteBindings` dijalankan SETELAH `TenantMiddleware`
3. **Atau gunakan pendekatan lain** yang tidak bergantung pada urutan middleware


