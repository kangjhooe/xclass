const mysql = require('mysql2/promise');

async function createUsersTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'class'
  });

  try {
    console.log('🔍 Membuat tabel users...\n');
    
    // Create tenants table first if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`tenants\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`npsn\` varchar(255) DEFAULT NULL,
        \`is_active\` tinyint(1) NOT NULL DEFAULT '1',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabel tenants berhasil dibuat atau sudah ada!');
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`phone\` varchar(255) DEFAULT NULL,
        \`role\` enum('super_admin','admin_tenant','teacher','student','staff') NOT NULL DEFAULT 'staff',
        \`instansi_id\` int DEFAULT NULL,
        \`is_active\` tinyint(1) NOT NULL DEFAULT '1',
        \`last_login_at\` datetime DEFAULT NULL,
        \`remember_token\` varchar(255) DEFAULT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`),
        KEY \`FK_users_instansi_id\` (\`instansi_id\`),
        CONSTRAINT \`FK_users_instansi_id\` FOREIGN KEY (\`instansi_id\`) REFERENCES \`tenants\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Tabel users berhasil dibuat!\n');
    
    // Check if admin user exists
    const [users] = await connection.query(
      'SELECT id, name, email, role, is_active FROM users WHERE email = ?',
      ['admin@class.app']
    );
    
    if (users.length === 0) {
      console.log('📝 Membuat user admin...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('password', 10);
      
      await connection.query(
        `INSERT INTO users (name, email, password, role, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        ['Super Admin', 'admin@class.app', hashedPassword, 'super_admin', true]
      );
      
      console.log('✅ User admin berhasil dibuat!');
      console.log('   Email: admin@class.app');
      console.log('   Password: password');
      console.log('   Role: super_admin\n');
    } else {
      const user = users[0];
      console.log('✅ User admin sudah ada:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Is Active: ${user.is_active}\n`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await connection.end();
  }
}

createUsersTable();

