const fs = require('fs');
const path = require('path');

/**
 * Script untuk mengaktifkan TypeORM synchronize sementara untuk development
 * Ini akan membuat semua tabel otomatis berdasarkan entities
 * 
 * PERINGATAN: Hanya untuk development! Jangan gunakan di production!
 */

const appModulePath = path.join(__dirname, 'src', 'app.module.ts');

try {
  console.log('📝 Membaca file app.module.ts...\n');
  let content = fs.readFileSync(appModulePath, 'utf8');
  
  // Check if synchronize is already true
  if (content.includes('synchronize: true')) {
    console.log('✅ TypeORM synchronize sudah aktif!\n');
    console.log('💡 Tabel akan dibuat otomatis saat aplikasi dijalankan.\n');
    process.exit(0);
  }
  
  // Replace synchronize: false with synchronize: true
  const oldPattern = /synchronize:\s*false/g;
  const newContent = content.replace(oldPattern, 'synchronize: true');
  
  if (content === newContent) {
    console.log('⚠️  Tidak menemukan "synchronize: false" di file.');
    console.log('💡 Mungkin sudah diubah atau format berbeda.\n');
    process.exit(1);
  }
  
  // Backup original file
  const backupPath = appModulePath + '.backup';
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup dibuat: ${backupPath}\n`);
  
  // Write new content
  fs.writeFileSync(appModulePath, newContent);
  console.log('✅ TypeORM synchronize berhasil diaktifkan!\n');
  console.log('⚠️  PERINGATAN: Ini hanya untuk development!\n');
  console.log('💡 Sekarang jalankan: npm run dev');
  console.log('💡 TypeORM akan otomatis membuat semua tabel berdasarkan entities.\n');
  console.log('💡 Untuk mematikan lagi, jalankan: node disable-typeorm-sync.js\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

