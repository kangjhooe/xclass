const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createSuperAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'class'
  });

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Check if user already exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@class.app']
    );

    if (existing.length > 0) {
      console.log('Super admin sudah ada!');
      console.log('Email: admin@class.app');
      console.log('Password: password');
      await connection.end();
      return;
    }

    // Create super admin user
    await connection.execute(
      `INSERT INTO users (name, email, password, role, isActive, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      ['Super Admin', 'admin@class.app', hashedPassword, 'super_admin', true]
    );

    console.log('✅ Super admin berhasil dibuat!');
    console.log('Email: admin@class.app');
    console.log('Password: password');
    console.log('Role: super_admin');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createSuperAdmin();

