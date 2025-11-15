const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
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
    multipleStatements: true, // Allow multiple statements
  };

  console.log('🚀 Running Semester Migration...\n');
  console.log('Database Configuration:');
  console.log(`  Host: ${config.host}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  User: ${config.user}`);
  console.log(`  Password: ${config.password ? '***' : '(empty)'}`);
  console.log(`  Database: ${config.database}\n`);

  let connection;

  try {
    // Connect to database
    console.log('1️⃣ Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database successfully!\n');

    // Read SQL file
    console.log('2️⃣ Reading migration file...');
    const sqlFilePath = path.join(__dirname, 'database', 'sql', 'add_semester_to_academic_years.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Migration file not found: ${sqlFilePath}`);
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('✅ Migration file loaded!\n');

    console.log('3️⃣ Executing migration SQL...\n');

    // Execute SQL directly (not as prepared statement)
    // This handles SET, PREPARE, EXECUTE statements
    try {
      await connection.query(sqlContent);
      console.log('✅ Migration SQL executed successfully!\n');
    } catch (error) {
      // If column already exists, that's okay
      if (error.code === 'ER_DUP_FIELDNAME' || error.message.includes('already exists')) {
        console.log('⚠️  Column already exists (this is normal, continuing...)\n');
      } else {
        throw error;
      }
    }

    // Verify migration
    console.log('\n4️⃣ Verifying migration...');
    const [rows] = await connection.query(
      `SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'academic_years'
      AND COLUMN_NAME = 'currentSemesterType'`,
      [config.database]
    );

    if (rows.length > 0) {
      console.log('✅ Migration verified successfully!');
      console.log('\nColumn Details:');
      console.log(`  Name: ${rows[0].COLUMN_NAME}`);
      console.log(`  Type: ${rows[0].COLUMN_TYPE}`);
      console.log(`  Nullable: ${rows[0].IS_NULLABLE}`);
      console.log(`  Default: ${rows[0].COLUMN_DEFAULT}`);
    } else {
      console.log('⚠️  Warning: Column not found after migration');
    }

    // Check existing records
    console.log('\n5️⃣ Checking existing records...');
    const [records] = await connection.query(
      'SELECT COUNT(*) as total, currentSemesterType FROM academic_years GROUP BY currentSemesterType'
    );
    
    if (records.length > 0) {
      console.log('Current semester distribution:');
      records.forEach(record => {
        console.log(`  ${record.currentSemesterType}: ${record.total} records`);
      });
    } else {
      console.log('  No records found in academic_years table');
    }

    console.log('\n✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solution: Make sure MySQL/MariaDB is running');
      console.error('   - Open XAMPP Control Panel');
      console.error('   - Start MySQL service');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Solution: Check your database credentials in .env file');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Solution: Database does not exist. Run: node create-xclass-database.js');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run migration
runMigration().catch(console.error);

