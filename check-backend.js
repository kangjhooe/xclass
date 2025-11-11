const http = require('http');

async function checkBackend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/api', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ running: true, status: res.statusCode, data });
      });
    });

    req.on('error', (err) => {
      resolve({ running: false, error: err.message });
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ running: false, error: 'Connection timeout' });
    });
  });
}

async function main() {
  console.log('🔍 Memeriksa status backend...\n');
  const result = await checkBackend();

  if (result.running) {
    console.log('✅ Backend berjalan di http://localhost:3000');
    console.log(`   Status: ${result.status}`);
    if (result.data) {
      try {
        const json = JSON.parse(result.data);
        console.log(`   Message: ${json.message || 'OK'}`);
      } catch (e) {
        // Not JSON
      }
    }
  } else {
    console.log('❌ Backend TIDAK berjalan!');
    console.log(`   Error: ${result.error}`);
    console.log('\n💡 Solusi:');
    console.log('   1. Buka terminal baru');
    console.log('   2. Pastikan Anda berada di direktori project');
    console.log('   3. Jalankan: npm run start:dev');
    console.log('   4. Tunggu sampai muncul: "Application is running on: http://localhost:3000"');
    console.log('\n📝 Atau jika menggunakan yarn:');
    console.log('   yarn start:dev');
  }
}

main();

