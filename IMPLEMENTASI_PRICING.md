# 🚀 IMPLEMENTASI PRICING STRUCTURE

**Tanggal:** 27 Januari 2025  
**Status:** ✅ **IMPLEMENTASI SELESAI**

---

## 📋 RINGKASAN IMPLEMENTASI

Pricing structure baru telah diimplementasikan dengan fitur:
1. ✅ **Billing Threshold (20 siswa)** - Penambahan < 20 siswa tidak ditagih
2. ✅ **Cross-Tier Exception** - Penambahan yang menyebabkan cross tier tetap ditagih
3. ✅ **Pricing Lock** - Harga locked berdasarkan tier awal subscription
4. ✅ **Auto-Downgrade** - Otomatis downgrade ke Free Forever jika < 50 siswa

---

## ✅ PERUBAHAN YANG DILAKUKAN

### **1. Database Entity Updates**

#### **TenantSubscription Entity** (`src/modules/subscription/entities/tenant-subscription.entity.ts`)
- ✅ Menambahkan field `lockedPricePerStudent` (DECIMAL 10,2)
- ✅ Field ini menyimpan harga locked per siswa saat subscription dibuat

### **2. Service Updates**

#### **SubscriptionService** (`src/modules/subscription/subscription.service.ts`)

**Method Baru:**
- ✅ `determineLockedPrice()` - Menentukan harga locked berdasarkan jumlah siswa
- ✅ `calculateBillingForStudentIncrease()` - Menghitung billing dengan rules baru
- ✅ `processStudentIncreaseBilling()` - Proses billing untuk penambahan siswa

**Method yang Diupdate:**
- ✅ `createSubscription()` - Set `lockedPricePerStudent` saat subscription dibuat
- ✅ `updateStudentCount()` - Implementasi logic billing baru dengan threshold dan cross-tier
- ✅ `changePlan()` - Update locked price saat change plan
- ✅ `calculateBillingAmount()` - Support locked price parameter
- ✅ `processThresholdBilling()` - Gunakan locked price

**Logic Billing:**
```typescript
// Threshold: 20 siswa
// Exception: Cross tier (45→51, 499→502)
// Pricing Lock: Gunakan locked price dari tier awal
```

### **3. Database Migration**

#### **Migration File** (`database/sql/pricing_update_migration.sql`)
- ✅ Menambahkan field `locked_price_per_student` ke `tenant_subscriptions`
- ✅ Update subscription plans dengan pricing baru:
  - Free Forever (0-49 siswa): Rp 0
  - Standard (51-500 siswa): Rp 5.000/siswa
  - Enterprise (501+ siswa): Rp 4.000/siswa
- ✅ Update existing subscriptions dengan plan dan locked price yang sesuai

---

## 🔄 CARA KERJA

### **1. Saat Subscription Dibuat**

```typescript
await subscriptionService.createSubscription(
  tenantId,
  planId,
  startDate,
  endDate,
  initialStudentCount // Jumlah siswa awal
);

// Otomatis:
// - Determine locked price berdasarkan initialStudentCount
// - Set lockedPricePerStudent
// - Calculate initial billing amount
```

**Contoh:**
- 100 siswa → Locked price: Rp 5.000 (tier 51-500)
- 600 siswa → Locked price: Rp 4.000 (tier 501+)

### **2. Saat Jumlah Siswa Berubah**

```typescript
await subscriptionService.updateStudentCount(tenantId, newStudentCount);
```

**Logic:**
1. Check jika < 50 siswa → Auto downgrade ke Free Forever
2. Calculate billing dengan rules:
   - Penambahan < 20 siswa: Tidak ditagih (kecuali cross tier)
   - Penambahan ≥ 20 siswa: Ditagih
   - Cross tier (45→51, 499→502): Tetap ditagih meskipun < 20
3. Gunakan locked price (bukan harga tier baru)

**Contoh Skenario:**

**Skenario 1: Penambahan Normal (< 20 siswa)**
```
Siswa: 100 → 115 (+15)
Status: TIDAK DITAGIH
```

**Skenario 2: Penambahan Normal (≥ 20 siswa)**
```
Siswa: 100 → 125 (+25)
Status: DITAGIH 25 × Rp 5.000 = Rp 125.000
```

**Skenario 3: Cross Tier Free to Paid**
```
Siswa: 45 → 51 (+6)
Status: DITAGIH (meskipun < 20, karena cross tier)
Billing: 51 × Rp 5.000 = Rp 255.000
```

**Skenario 4: Cross Tier 500 (Pricing Lock)**
```
Siswa: 499 → 502 (+3)
Status: DITAGIH (meskipun < 20, karena cross tier)
Billing: 3 × Rp 5.000 = Rp 15.000 (pakai locked price, bukan Rp 4.000)
```

**Skenario 5: Auto Downgrade**
```
Siswa: 60 → 45 (-15)
Status: AUTO DOWNGRADE ke Free Forever
Billing: Rp 0
```

---

## 📊 PRICING STRUCTURE

| Tier | Jumlah Siswa | Harga/Siswa/Tahun | Billing Threshold |
|------|--------------|-------------------|-------------------|
| **Free Forever** | 0-49 | Rp 0 | - |
| **Standard** | 51-500 | Rp 5.000 | 20 siswa |
| **Enterprise** | 501+ | Rp 4.000 | 20 siswa |

---

## 🗄️ DATABASE CHANGES

### **New Field:**
```sql
ALTER TABLE `tenant_subscriptions` 
ADD COLUMN `locked_price_per_student` DECIMAL(10,2) NULL;
```

### **Subscription Plans:**
- `free-forever`: 0-49 siswa, Rp 0
- `standard`: 51-500 siswa, Rp 5.000
- `enterprise`: 501+ siswa, Rp 4.000

---

## 🧪 TESTING SCENARIOS

### **Test Cases yang Perlu Diuji:**

1. ✅ **Create Subscription**
   - [ ] Create dengan 100 siswa → Locked price = Rp 5.000
   - [ ] Create dengan 600 siswa → Locked price = Rp 4.000
   - [ ] Create dengan 30 siswa → Auto Free Forever

2. ✅ **Update Student Count**
   - [ ] 100 → 115 (+15): Tidak ditagih
   - [ ] 100 → 125 (+25): Ditagih Rp 125.000
   - [ ] 45 → 51 (+6): Ditagih Rp 255.000 (cross tier)
   - [ ] 499 → 502 (+3): Ditagih Rp 15.000 (cross tier, locked price)
   - [ ] 60 → 45 (-15): Auto downgrade ke Free

3. ✅ **Pricing Lock**
   - [ ] 100 siswa (Rp 5.000) → 600 siswa: Tetap pakai Rp 5.000
   - [ ] 600 siswa (Rp 4.000) → 800 siswa: Tetap pakai Rp 4.000

---

## 🚀 LANGKAH DEPLOYMENT

### **1. Jalankan Migration**
```bash
# MySQL
mysql -u username -p database_name < database/sql/pricing_update_migration.sql
```

### **2. Restart Application**
```bash
# Restart NestJS application
npm run start:prod
```

### **3. Verify**
- Check field `locked_price_per_student` di database
- Test create subscription dengan berbagai jumlah siswa
- Test update student count dengan berbagai skenario

---

## 📝 NOTES

### **Important:**
- ✅ Locked price ditentukan saat subscription **pertama kali dibuat**
- ✅ Locked price tidak berubah meskipun siswa bertambah melewati tier
- ✅ Harga baru hanya berlaku untuk subscription **baru** atau **renewal**
- ✅ Billing threshold: 20 siswa (configurable)
- ✅ Cross-tier exception: Selalu ditagih meskipun < threshold

### **Future Enhancements:**
- [ ] Pro-rated billing untuk penambahan di tengah periode
- [ ] Email notification untuk billing events
- [ ] Dashboard untuk monitoring billing
- [ ] API endpoint untuk billing calculation

---

## ✅ CHECKLIST

- [x] Update TenantSubscription entity
- [x] Implementasi billing threshold logic
- [x] Implementasi cross-tier exception
- [x] Implementasi pricing lock
- [x] Update createSubscription method
- [x] Update updateStudentCount method
- [x] Create database migration
- [x] Update subscription plans
- [ ] Unit tests (TODO)
- [ ] Integration tests (TODO)
- [ ] Documentation update (DONE)

---

**Dibuat oleh:** AI Assistant  
**Tanggal:** 27 Januari 2025

