const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  // Force use 127.0.0.1 instead of localhost to avoid MariaDB permission issues
  let dbHost = process.env.DB_HOST || '127.0.0.1';
  if (dbHost === 'localhost') {
    dbHost = '127.0.0.1';
    console.log('⚠️  Converting localhost to 127.0.0.1 to avoid MariaDB connection issues\n');
  }

  const config = {
    host: dbHost,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'xclass',
  };

  console.log('🔍 Testing Database Connection...\n');
  console.log('Configuration:');
  console.log(`  Host: ${config.host}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  User: ${config.user}`);
  console.log(`  Password: ${config.password ? '***' : '(empty)'}`);
  console.log(`  Database: ${config.database}\n`);

  let connection;
  
  try {
    // Test connection without database first
    console.log('1️⃣ Testing connection to MySQL server...');
    const serverConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
    });
    console.log('✅ Connected to MySQL server!\n');
    
    // Check if database exists
    console.log(`2️⃣ Checking if database '${config.database}' exists...`);
    const [databases] = await serverConnection.query('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === config.database);
    
    if (dbExists) {
      console.log(`✅ Database '${config.database}' exists!\n`);
    } else {
      console.log(`❌ Database '${config.database}' does NOT exist!\n`);
      console.log('💡 Available databases:');
      databases.forEach(db => console.log(`   - ${db.Database}`));
      console.log('\n💡 To create database, run: node create-xclass-database.js\n');
      await serverConnection.end();
      return;
    }
    
    await serverConnection.end();
    
    // Test connection with database
    console.log(`3️⃣ Testing connection to database '${config.database}'...`);
    connection = await mysql.createConnection(config);
    console.log(`✅ Connected to database '${config.database}'!\n`);
    
    // Check tables
    console.log('4️⃣ Checking tables...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Found ${tables.length} table(s)\n`);
    
    if (tables.length > 0) {
      console.log('📋 Tables:');
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
      console.log('');
    } else {
      console.log('⚠️  No tables found. TypeORM will create them on startup.\n');
    }
    
    // Test query
    console.log('5️⃣ Testing simple query...');
    const [result] = await connection.query('SELECT 1 as test');
    console.log('✅ Query successful!\n');
    
    console.log('✅✅✅ All tests passed! Database connection is working.\n');
    console.log('💡 If backend still has errors, check:');
    console.log('   1. TypeORM entity files');
    console.log('   2. Application logs for specific errors');
    console.log('   3. Port 3000 is not already in use\n');
    
  } catch (error) {
    console.error('\n❌❌❌ Connection failed!\n');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solution:');
      console.error('   1. Make sure XAMPP MySQL service is running');
      console.error('   2. Open XAMPP Control Panel');
      console.error('   3. Click "Start" on MySQL service\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Solution:');
      console.error('   1. Check DB_USERNAME and DB_PASSWORD in .env file');
      console.error('   2. Default XAMPP: username=root, password=(empty)\n');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Solution:');
      console.error(`   1. Database '${config.database}' does not exist`);
      console.error('   2. Run: node create-xclass-database.js\n');
    } else {
      console.error('\n💡 Check your .env file configuration\n');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection();

