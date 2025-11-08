# CARA KERJA THRESHOLD-BASED BILLING

**Tanggal:** {{ date('d-m-Y') }}  
**Sistem:** Subscription Management dengan Threshold-Based Billing

---

## 📋 KONSEP DASAR

Sistem billing menggunakan model **per siswa per tahun** dengan **threshold-based billing** untuk menghindari tagihan kecil yang merepotkan.

---

## 🎯 STRUKTUR PRICING

### Paket Subscription

```
BASIC (Gratis)
├── 0 - 99 siswa
├── Rp 0 per siswa per tahun
└── Threshold: Tidak ada (gratis)

PRO
├── 100 - 299 siswa
├── Rp 2.000 per siswa per tahun
└── Threshold: 20 siswa

GOLD
├── 300 - 499 siswa
├── Rp 1.500 per siswa per tahun
└── Threshold: 25 siswa

PLATINUM
├── 500+ siswa
├── Rp 1.000 per siswa per tahun
└── Threshold: 30 siswa
```

---

## 🔄 CARA KERJA THRESHOLD-BASED BILLING

### 1. **Penambahan Siswa Kecil (< Threshold)**

**Contoh:**
- Tenant Pro dengan 150 siswa
- Tambah 5 siswa → Total: 155 siswa
- Threshold Pro: 20 siswa
- Penambahan: 5 siswa (< 20)

**Hasil:**
- ✅ **TIDAK ditagih langsung**
- ✅ Penambahan dicatat sebagai **pending increase**
- ✅ Biaya akan **digabungkan ke billing tahun berikutnya**
- ✅ Tenant **tidak kaget** dengan tagihan kecil

**Notifikasi ke Tenant:**
```
"Penambahan 5 siswa telah dicatat. 
Biaya akan digabungkan ke billing tahun berikutnya.
Saat ini: 150 siswa (billing) + 5 siswa (pending) = 155 siswa total."
```

---

### 2. **Penambahan Siswa Besar (≥ Threshold)**

**Contoh:**
- Tenant Pro dengan 150 siswa
- Tambah 25 siswa → Total: 175 siswa
- Threshold Pro: 20 siswa
- Penambahan: 25 siswa (≥ 20)

**Hasil:**
- ✅ **DITAGIH langsung** (threshold tercapai)
- ✅ Tagihan tambahan dibuat
- ✅ Pending increase direset ke 0
- ✅ Biaya digabungkan ke billing tahun berikutnya

**Notifikasi ke Tenant:**
```
"Penambahan 25 siswa telah melewati threshold (20 siswa).
Tagihan tambahan sebesar Rp 50.000 (25 × Rp 2.000) telah dibuat.
Tagihan ini akan digabungkan ke billing tahun berikutnya."
```

---

### 3. **Perubahan Tier (Naik Tier)**

**Contoh:**
- Tenant Pro dengan 299 siswa
- Tambah 2 siswa → Total: 301 siswa
- Melewati batas Pro (299) → Upgrade ke Gold

**Hasil:**
- ✅ **Tier berubah** ke Gold
- ✅ Pending increase direset ke 0
- ✅ Biaya baru dihitung berdasarkan tier Gold
- ✅ Biaya baru berlaku pada billing berikutnya

**Notifikasi ke Tenant:**
```
"Jumlah siswa telah melewati batas tier Pro.
Subscription telah diupgrade ke Gold.
Biaya baru (Rp 1.500/siswa) akan berlaku pada billing berikutnya."
```

---

## 📊 CONTOH PERHITUNGAN

### Skenario 1: Penambahan Kecil (Tidak Ditagih)

```
Awal: 150 siswa (Pro)
Billing saat ini: 150 × Rp 2.000 = Rp 300.000/tahun

Tambah: 5 siswa
Total: 155 siswa
Pending increase: 5 siswa
Threshold: 20 siswa

Status: Belum mencapai threshold
Aksi: Tidak ditagih, pending untuk tahun berikutnya

Billing tahun ini: Rp 300.000 (tidak berubah)
Billing tahun depan: 155 × Rp 2.000 = Rp 310.000
```

---

### Skenario 2: Penambahan Besar (Ditagih)

```
Awal: 150 siswa (Pro)
Billing saat ini: 150 × Rp 2.000 = Rp 300.000/tahun

Tambah: 25 siswa
Total: 175 siswa
Pending increase: 25 siswa
Threshold: 20 siswa

Status: Threshold tercapai (25 ≥ 20)
Aksi: Tagih tambahan Rp 50.000 (25 × Rp 2.000)

Billing tahun ini: Rp 300.000 + Rp 50.000 = Rp 350.000
Billing tahun depan: 175 × Rp 2.000 = Rp 350.000
```

---

### Skenario 3: Naik Tier

```
Awal: 299 siswa (Pro)
Billing saat ini: 299 × Rp 2.000 = Rp 598.000/tahun

Tambah: 2 siswa
Total: 301 siswa
Tier baru: Gold (300-499 siswa)

Status: Tier berubah
Aksi: Upgrade ke Gold, reset pending

Billing tahun ini: Rp 598.000 (tidak berubah)
Billing tahun depan: 301 × Rp 1.500 = Rp 451.500
```

---

## 🔔 NOTIFIKASI KE TENANT

### Informasi yang Harus Disampaikan:

1. **Saat Penambahan Kecil (< Threshold)**
   - Jumlah siswa baru
   - Pending increase saat ini
   - Sisa menuju threshold
   - Informasi bahwa biaya akan digabungkan ke tahun berikutnya

2. **Saat Threshold Tercapai**
   - Jumlah penambahan
   - Threshold yang tercapai
   - Biaya tambahan yang akan ditagih
   - Kapan tagihan akan berlaku

3. **Saat Naik Tier**
   - Tier baru
   - Harga per siswa baru
   - Kapan biaya baru berlaku

---

## 📝 DASHBOARD TENANT

Dashboard tenant harus menampilkan:

1. **Ringkasan Billing**
   - Plan saat ini
   - Jumlah siswa saat ini
   - Jumlah siswa saat billing terakhir
   - Pending increase
   - Threshold yang berlaku

2. **Status Threshold**
   - Progress bar menuju threshold
   - Sisa siswa menuju threshold
   - Informasi jelas tentang kapan akan ditagih

3. **Estimasi Billing Berikutnya**
   - Jumlah siswa (termasuk pending)
   - Biaya estimasi
   - Tanggal billing berikutnya

---

## ✅ KEUNTUNGAN SISTEM INI

1. **Tenant Tidak Kaget**
   - Tidak ada tagihan kecil yang tiba-tiba
   - Informasi jelas dan transparan

2. **Administrasi Lebih Mudah**
   - Tidak perlu proses tagihan kecil-kecilan
   - Tagihan digabungkan ke periode berikutnya

3. **Fleksibel**
   - Tetap fair untuk penambahan besar
   - Threshold dapat disesuaikan per plan

4. **Transparan**
   - Semua informasi tersedia di dashboard
   - Notifikasi jelas dan tepat waktu

---

## 🔧 IMPLEMENTASI TEKNIS

### Database Fields:

- `student_count_at_billing`: Jumlah siswa saat billing terakhir
- `current_student_count`: Jumlah siswa saat ini
- `pending_student_increase`: Penambahan siswa yang belum ditagih
- `billing_threshold`: Threshold untuk plan (dari subscription_plan)

### Logic Flow:

1. Update `current_student_count`
2. Hitung `pending_increase = current - student_count_at_billing`
3. Check threshold:
   - Jika `pending_increase >= threshold` → Tagih
   - Jika `pending_increase < threshold` → Pending
4. Check tier change:
   - Jika tier berubah → Reset pending, update plan
5. Update `next_billing_amount` dengan pending

---

**Dibuat oleh:** AI Assistant  
**Tanggal:** {{ date('d-m-Y H:i:s') }}

