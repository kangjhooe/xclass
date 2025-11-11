const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function checkTenantAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'class',
  });

  try {
    console.log('🔍 Memeriksa admin tenant untuk NPSN 10816663...\n');
    
    // Cek tenant
    const [tenants] = await connection.query(
      'SELECT id, npsn, name FROM tenants WHERE npsn = ?',
      ['10816663']
    );

    if (tenants.length === 0) {
      console.log('❌ Tenant dengan NPSN 10816663 tidak ditemukan!');
      return;
    }

    const tenant = tenants[0];
    console.log(`✅ Tenant ditemukan:`);
    console.log(`   ID: ${tenant.id}`);
    console.log(`   NPSN: ${tenant.npsn}`);
    console.log(`   Name: ${tenant.name}\n`);

    // Cek user admin
    const [users] = await connection.query(
      `SELECT id, name, email, role, instansi_id, instansiId, isActive, password 
       FROM users 
       WHERE (instansi_id = ? OR instansiId = ?) AND role = ?`,
      [tenant.id, tenant.id, 'admin_tenant']
    );

    if (users.length === 0) {
      console.log('❌ Admin user tidak ditemukan!');
      console.log('💡 Jalankan: node create-tenant-admin.js\n');
      return;
    }

    const user = users[0];
    console.log(`✅ Admin user ditemukan:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Instansi ID: ${user.instansi_id || user.instansiId}`);
    console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
    
    // Cek password
    const isPasswordHashed = user.password && 
      (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
    console.log(`   Password Hashed: ${isPasswordHashed ? 'Yes' : 'No'}`);
    
    if (!isPasswordHashed) {
      console.log('\n⚠️  Password tidak di-hash! Memperbaiki...');
      const hashedPassword = await bcrypt.hash('password', 10);
      await connection.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, user.id]
      );
      console.log('✅ Password berhasil di-hash!\n');
    } else {
      // Test password
      const isValid = await bcrypt.compare('password', user.password);
      console.log(`   Password Valid: ${isValid ? 'Yes' : 'No'}`);
      if (!isValid) {
        console.log('\n⚠️  Password tidak valid! Memperbaiki...');
        const hashedPassword = await bcrypt.hash('password', 10);
        await connection.query(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, user.id]
        );
        console.log('✅ Password berhasil diperbaiki!\n');
      }
    }

    // Pastikan user aktif
    if (!user.isActive) {
      console.log('\n⚠️  User tidak aktif! Mengaktifkan...');
      await connection.query(
        'UPDATE users SET isActive = 1 WHERE id = ?',
        [user.id]
      );
      console.log('✅ User berhasil diaktifkan!\n');
    }

    // Pastikan instansiId terisi
    if (!user.instansiId && user.instansi_id) {
      console.log('\n⚠️  Memperbaiki instansiId...');
      await connection.query(
        'UPDATE users SET instansiId = ? WHERE id = ?',
        [user.instansi_id, user.id]
      );
      console.log('✅ instansiId berhasil diperbaiki!\n');
    } else if (!user.instansi_id && user.instansiId) {
      console.log('\n⚠️  Memperbaiki instansi_id...');
      await connection.query(
        'UPDATE users SET instansi_id = ? WHERE id = ?',
        [user.instansiId, user.id]
      );
      console.log('✅ instansi_id berhasil diperbaiki!\n');
    }


    console.log('📋 Data Login:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: password`);
    console.log(`   URL: http://localhost:3001/login`);
    console.log(`   Redirect: http://localhost:3001/${tenant.npsn}/dashboard\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await connection.end();
  }
}

checkTenantAdmin();

