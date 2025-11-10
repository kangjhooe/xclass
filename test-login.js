const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function testLogin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'class'
  });

  try {
    console.log('🔍 Memeriksa user admin@class.app...\n');
    
    // Check if user exists
    const [users] = await connection.execute(
      'SELECT id, name, email, role, is_active, password FROM users WHERE email = ?',
      ['admin@class.app']
    );

    if (users.length === 0) {
      console.log('❌ User tidak ditemukan!');
      console.log('📝 Membuat user admin...\n');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('password', 10);
      
      // Create super admin user
      await connection.execute(
        `INSERT INTO users (name, email, password, role, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        ['Super Admin', 'admin@class.app', hashedPassword, 'super_admin', true]
      );
      
      console.log('✅ User berhasil dibuat!');
    } else {
      const user = users[0];
      console.log('✅ User ditemukan:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Is Active: ${user.is_active}`);
      console.log(`   Password Hash: ${user.password ? user.password.substring(0, 20) + '...' : 'NULL'}`);
      
      // Test password
      if (user.password) {
        const isPasswordHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
        console.log(`   Password Type: ${isPasswordHashed ? 'Hashed (bcrypt)' : 'Plain text'}`);
        
        if (isPasswordHashed) {
          const isValid = await bcrypt.compare('password', user.password);
          console.log(`   Password Test: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
        } else {
          const isValid = user.password === 'password';
          console.log(`   Password Test: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
        }
      } else {
        console.log('   ⚠️  Password NULL - perlu diupdate!');
        const hashedPassword = await bcrypt.hash('password', 10);
        await connection.execute(
          'UPDATE users SET password = ? WHERE email = ?',
          [hashedPassword, 'admin@class.app']
        );
        console.log('   ✅ Password berhasil diupdate!');
      }
      
      // Check if user is active
      if (!user.is_active) {
        console.log('\n⚠️  User tidak aktif! Mengaktifkan...');
        await connection.execute(
          'UPDATE users SET is_active = 1 WHERE email = ?',
          ['admin@class.app']
        );
        console.log('✅ User berhasil diaktifkan!');
      }
    }
    
    console.log('\n📋 Data Login:');
    console.log('   Email: admin@class.app');
    console.log('   Password: password');
    console.log('   Role: super_admin');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await connection.end();
  }
}

testLogin();

