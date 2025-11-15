# ✅ CHECKLIST IMPLEMENTASI STORAGE QUOTA & UPGRADE

**Tanggal:** 27 Januari 2025  
**Status:** Implementasi Selesai - Siap untuk Testing & Deployment

---

## 📋 LANGKAH SELANJUTNYA

### **1. Database Migration** ⚠️ PENTING

#### **A. Backup Database Terlebih Dahulu**
```bash
# Backup database sebelum migration
mysqldump -u username -p database_name > backup_before_storage_quota.sql
```

#### **B. Jalankan Migration**
```bash
# Jalankan migration SQL
mysql -u username -p database_name < database/sql/storage_quota_migration.sql
```

#### **C. Verifikasi Migration**
```sql
-- Cek apakah kolom sudah ditambahkan
DESCRIBE subscription_plans;
DESCRIBE tenants;
DESCRIBE storage_upgrades;

-- Cek apakah data sudah ter-update
SELECT id, name, storage_limit_gb FROM subscription_plans;
SELECT id, name, storage_usage_bytes, storage_limit_bytes FROM tenants LIMIT 5;
```

---

### **2. Restart Aplikasi Backend**

```bash
# Stop aplikasi NestJS
# (Ctrl+C atau kill process)

# Restart aplikasi
npm run start:dev
# atau untuk production
npm run build
npm run start:prod
```

**Verifikasi:**
- ✅ Aplikasi berjalan tanpa error
- ✅ Tidak ada error di console tentang missing entities
- ✅ API endpoints bisa diakses

---

### **3. Testing Manual - Backend API**

#### **A. Test Storage Quota Info**
```bash
# Get quota info (ganti dengan token dan tenant ID yang valid)
curl -X GET "http://localhost:3000/api/tenants/1/storage/quota" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "usageBytes": 0,
    "limitBytes": 10737418240,
    "usageGB": 0,
    "limitGB": 10,
    "availableGB": 10,
    "usagePercent": 0,
    "baseLimitGB": 10,
    "upgradeGB": 0,
    "isWarning": false,
    "isCritical": false,
    "isFull": false,
    "canUpload": true
  }
}
```

#### **B. Test Get Upgrade Packages**
```bash
curl -X GET "http://localhost:3000/api/tenants/1/storage/quota/packages" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    { "gb": 25, "price": 100000, "pricePerGB": 4000 },
    { "gb": 50, "price": 180000, "pricePerGB": 3600 },
    { "gb": 100, "price": 300000, "pricePerGB": 3000 },
    { "gb": 250, "price": 600000, "pricePerGB": 2400 }
  ]
}
```

#### **C. Test Create Storage Upgrade**
```bash
curl -X POST "http://localhost:3000/api/tenants/1/storage/quota/upgrade" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "upgradeType": "package",
    "additionalGB": 25
  }'
```

#### **D. Test Upload File dengan Quota Check**
```bash
curl -X POST "http://localhost:3000/api/tenants/1/storage/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-file.pdf"
```

**Test Cases:**
- ✅ Upload file kecil (berhasil)
- ✅ Upload file besar yang melebihi quota (harus gagal dengan error message)
- ✅ Upload file saat quota penuh (harus gagal)

---

### **4. Testing Manual - Frontend UI**

#### **A. Akses Halaman Storage**
1. Login ke aplikasi
2. Pilih tenant
3. Navigate ke halaman Storage (`/[tenant]/storage`)

**Verifikasi:**
- ✅ Storage quota card muncul
- ✅ Progress bar menampilkan usage
- ✅ Tombol "Upgrade Storage" terlihat

#### **B. Test Upgrade Storage Modal**
1. Klik tombol "Upgrade Storage"
2. Pilih tipe upgrade (Paket atau Custom)
3. Pilih paket atau input custom GB
4. Verifikasi ringkasan harga
5. Klik "Upgrade Sekarang"

**Verifikasi:**
- ✅ Modal terbuka dengan benar
- ✅ Paket upgrade ditampilkan
- ✅ Custom input berfungsi
- ✅ Ringkasan harga benar
- ✅ Upgrade berhasil dibuat (status PENDING)

#### **C. Test Warning Messages**
1. Upload file sampai quota mencapai 80%+
2. Verifikasi warning message muncul
3. Upload file sampai quota mencapai 90%+
4. Verifikasi critical warning muncul
5. Upload file sampai quota penuh
6. Verifikasi error message dan upload diblokir

---

### **5. Testing Auto Storage Limit Update**

#### **A. Test saat Subscription Dibuat**
1. Buat subscription baru dengan jumlah siswa tertentu
2. Verifikasi storage limit otomatis ter-set sesuai jumlah siswa:
   - 0-49 siswa → 10 GB
   - 50-500 siswa → 50 GB
   - 501+ siswa → 100 GB

#### **B. Test saat Student Count Berubah**
1. Update jumlah siswa di subscription
2. Verifikasi storage limit otomatis ter-update
3. Cek di database: `SELECT storage_limit_bytes FROM tenants WHERE id = ?`

---

### **6. Testing Storage Usage Tracking**

#### **A. Test Upload File**
1. Upload file
2. Verifikasi `storage_usage_bytes` di database ter-update
3. Cek di UI apakah usage ter-reflect

#### **B. Test Delete File**
1. Hapus file
2. Verifikasi `storage_usage_bytes` berkurang
3. Cek di UI apakah usage ter-update

#### **C. Test Recalculate Storage**
```typescript
// Bisa ditambahkan endpoint untuk recalculate manual jika diperlukan
// Atau langsung test via service
```

---

### **7. Testing Storage Upgrade Activation**

#### **A. Manual Activation (untuk testing)**
```sql
-- Update upgrade status ke ACTIVE setelah payment
UPDATE storage_upgrades 
SET status = 'active', is_paid = 1, paid_at = NOW() 
WHERE id = ?;
```

#### **B. Verifikasi Storage Limit Update**
1. Aktifkan upgrade
2. Verifikasi `storage_limit_bytes` di tenant ter-update
3. Cek di UI apakah quota limit bertambah

---

### **8. Integration dengan Payment System** (Jika ada)

Jika ada payment gateway:
1. Integrasikan storage upgrade dengan payment flow
2. Setelah payment berhasil, panggil `activateStorageUpgrade()`
3. Update storage limit otomatis

**Contoh Flow:**
```typescript
// Setelah payment berhasil
await storageQuotaService.activateStorageUpgrade(upgradeId, paymentNotes);
```

---

### **9. Monitoring & Logging**

#### **A. Tambahkan Logging**
- Log saat quota hampir penuh (80%, 90%)
- Log saat quota penuh
- Log saat upgrade dibuat/diaktifkan
- Log saat storage limit diupdate

#### **B. Monitoring Queries**
```sql
-- Query untuk monitoring storage usage
SELECT 
  t.id,
  t.name,
  t.storage_usage_bytes / 1024 / 1024 / 1024 AS usage_gb,
  t.storage_limit_bytes / 1024 / 1024 / 1024 AS limit_gb,
  (t.storage_usage_bytes / t.storage_limit_bytes * 100) AS usage_percent
FROM tenants t
WHERE t.storage_limit_bytes > 0
ORDER BY usage_percent DESC;
```

---

### **10. Dokumentasi untuk User**

#### **A. Update User Guide**
- Cara melihat storage quota
- Cara upgrade storage
- Penjelasan paket upgrade
- FAQ tentang storage quota

#### **B. Update Admin Guide**
- Cara monitor storage usage
- Cara activate upgrade setelah payment
- Cara troubleshoot storage issues

---

### **11. Performance Testing**

#### **A. Test dengan Banyak File**
1. Upload banyak file sekaligus
2. Verifikasi performance tidak menurun
3. Cek waktu response untuk quota check

#### **B. Test Storage Usage Calculation**
1. Test dengan folder besar (ribuan file)
2. Verifikasi `calculateDirectorySize()` tidak timeout
3. Pertimbangkan caching jika perlu

---

### **12. Security Check**

#### **A. Authorization**
- ✅ Pastikan hanya tenant yang bersangkutan bisa akses quota mereka
- ✅ Pastikan upgrade hanya bisa dibuat untuk tenant sendiri
- ✅ Validasi tenant ID di semua endpoint

#### **B. Input Validation**
- ✅ Validasi file size sebelum upload
- ✅ Validasi upgrade GB (minimal 10 GB untuk custom)
- ✅ Validasi upgrade type

---

### **13. Error Handling & Edge Cases**

#### **Test Cases:**
- ✅ Tenant tanpa subscription (harus handle gracefully)
- ✅ Tenant dengan subscription expired
- ✅ Upload file saat quota penuh
- ✅ Upgrade dengan subscription yang akan segera berakhir
- ✅ Multiple upgrades aktif sekaligus
- ✅ Upgrade expired (perlu cleanup)

---

### **14. Cleanup & Maintenance**

#### **A. Scheduled Task untuk Cleanup**
```typescript
// Cleanup expired upgrades (jika diperlukan)
// Bisa ditambahkan cron job untuk:
// - Update status expired upgrades
// - Recalculate storage limits
// - Cleanup old storage usage data
```

#### **B. Database Maintenance**
- Monitor ukuran table `storage_upgrades`
- Pertimbangkan archiving untuk upgrade yang sudah expired
- Index optimization jika diperlukan

---

## 🎯 PRIORITAS TESTING

### **High Priority (Harus Test Sebelum Production):**
1. ✅ Database migration
2. ✅ Storage quota info endpoint
3. ✅ Upload file dengan quota check
4. ✅ Upgrade storage (create)
5. ✅ Storage limit auto-update saat subscription berubah
6. ✅ Warning messages (80%, 90%, 100%)

### **Medium Priority:**
1. ✅ Storage usage tracking (upload/delete)
2. ✅ Upgrade activation
3. ✅ Frontend UI semua fitur
4. ✅ Error handling

### **Low Priority (Nice to Have):**
1. Performance testing
2. Cleanup expired upgrades
3. Advanced monitoring

---

## 📝 NOTES

### **Yang Perlu Diperhatikan:**
1. **Storage Usage Calculation**: Method `calculateDirectorySize()` bisa lambat untuk folder besar. Pertimbangkan:
   - Caching hasil calculation
   - Background job untuk update usage
   - Incremental update (hanya update saat upload/delete)

2. **Upgrade Activation**: Saat ini masih manual. Jika ada payment gateway, perlu integrasi.

3. **Expired Upgrades**: Belum ada auto-cleanup untuk upgrade yang expired. Bisa ditambahkan scheduled task.

4. **Storage Limit Update**: Saat ini update otomatis saat subscription berubah. Pastikan tidak ada race condition.

---

## ✅ CHECKLIST FINAL

Sebelum deploy ke production, pastikan:

- [ ] Database migration sudah dijalankan dan verified
- [ ] Backend API semua endpoint tested
- [ ] Frontend UI semua fitur tested
- [ ] Storage quota check bekerja dengan benar
- [ ] Upload file diblokir saat quota penuh
- [ ] Warning messages muncul di UI
- [ ] Upgrade storage bisa dibuat
- [ ] Storage limit auto-update saat subscription berubah
- [ ] Storage usage tracking akurat
- [ ] Error handling sudah proper
- [ ] Security check passed
- [ ] Performance acceptable
- [ ] Dokumentasi sudah diupdate

---

**Status:** ✅ Implementasi Selesai - Siap untuk Testing

**Next Step:** Jalankan database migration dan mulai testing!

