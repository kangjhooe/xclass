const mysql = require('mysql2/promise');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function fixPermission() {
  console.log('🔧 Fixing MariaDB Permission...\n');
  console.log('⚠️  This script will grant privileges to root user.\n');

  const config = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
  };

  let connection;
  
  try {
    // Try to connect without database first
    console.log('1️⃣ Connecting to MySQL server...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected!\n');

    // Check current privileges
    console.log('2️⃣ Checking current privileges...');
    const [users] = await connection.query(
      "SELECT User, Host FROM mysql.user WHERE User = 'root'"
    );
    
    console.log('📋 Current root users:');
    users.forEach(user => {
      console.log(`   - ${user.User}@${user.Host}`);
    });
    console.log('');

    // Grant privileges
    console.log('3️⃣ Granting privileges...');
    
    try {
      await connection.query(`
        GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' IDENTIFIED BY '' WITH GRANT OPTION
      `);
      console.log('   ✅ Granted privileges to root@localhost');
    } catch (err) {
      if (err.code === 'ER_CANNOT_USER') {
        // User might already exist, try without IDENTIFIED BY
        await connection.query(`
          GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION
        `);
        console.log('   ✅ Updated privileges for root@localhost');
      } else {
        console.log(`   ⚠️  Warning: ${err.message}`);
      }
    }

    try {
      await connection.query(`
        GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1' IDENTIFIED BY '' WITH GRANT OPTION
      `);
      console.log('   ✅ Granted privileges to root@127.0.0.1');
    } catch (err) {
      if (err.code === 'ER_CANNOT_USER') {
        await connection.query(`
          GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1' WITH GRANT OPTION
        `);
        console.log('   ✅ Updated privileges for root@127.0.0.1');
      } else {
        console.log(`   ⚠️  Warning: ${err.message}`);
      }
    }

    // Flush privileges
    console.log('\n4️⃣ Flushing privileges...');
    await connection.query('FLUSH PRIVILEGES');
    console.log('✅ Privileges flushed!\n');

    console.log('✅✅✅ Permission fix completed!\n');
    console.log('💡 Next steps:');
    console.log('   1. Test connection: node test-db-connection.js');
    console.log('   2. If database not exists: node create-xclass-database.js');
    console.log('   3. Run backend: npm run start:dev\n');

  } catch (error) {
    console.error('\n❌❌❌ Failed to fix permission!\n');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solution:');
      console.error('   1. Make sure XAMPP MySQL service is running');
      console.error('   2. Open XAMPP Control Panel');
      console.error('   3. Click "Start" on MySQL service\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Solution:');
      console.error('   You need to fix permission manually via phpMyAdmin:');
      console.error('   1. Open http://localhost/phpmyadmin');
      console.error('   2. Go to SQL tab');
      console.error('   3. Run the queries from fix-mariadb-permission.md\n');
    } else {
      console.error('\n💡 Try fixing manually via phpMyAdmin (see fix-mariadb-permission.md)\n');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
    rl.close();
  }
}

// Try to connect and fix
fixPermission().catch(err => {
  console.error('Unexpected error:', err);
  rl.close();
  process.exit(1);
});

