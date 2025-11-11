const fs = require('fs');
const path = require('path');

/**
 * Script untuk menonaktifkan TypeORM synchronize
 * Gunakan ini setelah tabel sudah dibuat atau untuk production
 */

const appModulePath = path.join(__dirname, 'src', 'app.module.ts');

try {
  console.log('📝 Membaca file app.module.ts...\n');
  let content = fs.readFileSync(appModulePath, 'utf8');
  
  // Check if synchronize is already false
  if (content.includes('synchronize: false')) {
    console.log('✅ TypeORM synchronize sudah nonaktif!\n');
    process.exit(0);
  }
  
  // Replace synchronize: true with synchronize: false
  const oldPattern = /synchronize:\s*true/g;
  const newContent = content.replace(oldPattern, 'synchronize: false');
  
  if (content === newContent) {
    console.log('⚠️  Tidak menemukan "synchronize: true" di file.');
    console.log('💡 Mungkin sudah diubah atau format berbeda.\n');
    process.exit(1);
  }
  
  // Write new content
  fs.writeFileSync(appModulePath, newContent);
  console.log('✅ TypeORM synchronize berhasil dinonaktifkan!\n');
  console.log('💡 Sekarang TypeORM tidak akan mengubah schema database.\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

