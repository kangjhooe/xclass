const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createTenantAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'class',
  });

  try {
    console.log('🔍 Mencari tenant dengan NPSN 10816663...\n');
    const [tenants] = await connection.query(
      'SELECT id, npsn, name FROM tenants WHERE npsn = ?',
      ['10816663']
    );

    if (tenants.length === 0) {
      console.log('❌ Tenant dengan NPSN 10816663 tidak ditemukan!');
      return;
    }

    const tenant = tenants[0];
    console.log(`✅ Tenant ditemukan: ${tenant.name} (ID: ${tenant.id})\n`);

    // Check if admin user already exists
    const [existingUsers] = await connection.query(
      'SELECT id, email, role FROM users WHERE instansiId = ? AND role = ?',
      [tenant.id, 'admin_tenant']
    );

    if (existingUsers.length > 0) {
      console.log('✅ Admin user sudah ada:');
      console.table(existingUsers);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password', 10);

    // Create admin user
    const [result] = await connection.query(
      `INSERT INTO users (name, email, password, role, instansiId, isActive, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        'Admin MTs Sample School',
        'admin@mts-sample.sch.id',
        hashedPassword,
        'admin_tenant',
        tenant.id,
        1
      ]
    );

    console.log('✅ Admin user berhasil dibuat!');
    console.log(`   ID: ${result.insertId}`);
    console.log(`   Name: Admin MTs Sample School`);
    console.log(`   Email: admin@mts-sample.sch.id`);
    console.log(`   Password: password`);
    console.log(`   Role: admin_tenant`);
    console.log(`   Tenant: ${tenant.name} (${tenant.npsn})\n`);
    console.log('🔗 Login URL: http://localhost:3001/10816663/login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await connection.end();
  }
}

createTenantAdmin();

