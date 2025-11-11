const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importStudentsData() {
  // Read database config from .env or use defaults
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'class',
    multipleStatements: true,
  };

  let connection;
  
  try {
    console.log('🔌 Menghubungkan ke database...\n');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Terhubung ke database!\n');

    // Check if tenant with NPSN 10816663 exists
    console.log('🔍 Mencari tenant dengan NPSN 10816663...\n');
    let [tenants] = await connection.query(
      'SELECT id, npsn, name FROM tenants WHERE npsn = ?',
      ['10816663']
    );

    let tenant;
    if (tenants.length === 0) {
      console.log('⚠️  Tenant dengan NPSN 10816663 tidak ditemukan!');
      console.log('🔨 Membuat tenant baru...\n');
      
      // Create tenant
      const [result] = await connection.query(
        `INSERT INTO tenants (npsn, name, isActive, createdAt, updatedAt) 
         VALUES (?, ?, ?, NOW(), NOW())`,
        ['10816663', 'MTs Sample School', 1]
      );
      
      const insertId = result.insertId;
      [tenants] = await connection.query(
        'SELECT id, npsn, name FROM tenants WHERE id = ?',
        [insertId]
      );
      
      tenant = tenants[0];
      console.log(`✅ Tenant berhasil dibuat: ${tenant.name} (ID: ${tenant.id}, NPSN: ${tenant.npsn})\n`);
    } else {
      tenant = tenants[0];
      console.log(`✅ Tenant ditemukan: ${tenant.name} (ID: ${tenant.id}, NPSN: ${tenant.npsn})\n`);
    }

    // Create classes if they don't exist
    console.log('🔍 Memeriksa kelas...\n');
    const classNames = [
      'VII IPA 1', 'VII IPA 2', 'VII IPA 3', 'VII IPS 1', 'VII IPS 2',
      'VIII IPA 1', 'VIII IPA 2', 'VIII IPS 1', 'VIII IPS 2',
      'IX IPA 1', 'IX IPA 2', 'IX IPS 1', 'IX IPS 2'
    ];
    
    const [existingClasses] = await connection.query(
      'SELECT name FROM class_rooms WHERE instansiId = ?',
      [tenant.id]
    );
    
    const existingClassNames = existingClasses.map(c => c.name);
    const missingClasses = classNames.filter(name => !existingClassNames.includes(name));
    
    if (missingClasses.length > 0) {
      console.log(`🔨 Membuat ${missingClasses.length} kelas yang belum ada...\n`);
      for (const className of missingClasses) {
        try {
          await connection.query(
            `INSERT INTO class_rooms (name, instansiId, isActive, createdAt, updatedAt) 
             VALUES (?, ?, 1, NOW(), NOW())`,
            [className, tenant.id]
          );
          console.log(`✅ Kelas "${className}" berhasil dibuat`);
        } catch (error) {
          console.log(`⚠️  Gagal membuat kelas "${className}": ${error.message}`);
        }
      }
      console.log('');
    } else {
      console.log('✅ Semua kelas sudah ada.\n');
    }

    // Check if students already exist
    const [existingStudents] = await connection.query(
      'SELECT COUNT(*) as count FROM students WHERE instansiId = ?',
      [tenant.id]
    );

    if (existingStudents[0].count > 0) {
      console.log(`⚠️  Sudah ada ${existingStudents[0].count} siswa untuk tenant ini.`);
      console.log('💡 Ingin melanjutkan import? Data baru akan ditambahkan.\n');
    }

    // Read SQL file - use minimal version first
    let sqlPath = path.join(__dirname, 'database', 'sql', 'sample_students_10816663_batch2_minimal.sql');
    
    // Fallback to full version if minimal doesn't exist
    if (!fs.existsSync(sqlPath)) {
      sqlPath = path.join(__dirname, 'database', 'sql', 'sample_students_10816663.sql');
    }
    
    console.log(`📄 Membaca file SQL: ${sqlPath}\n`);
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`File SQL tidak ditemukan: ${sqlPath}`);
    }

    let sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Replace instansiId 10816663 with actual tenant ID in both INSERT values and SELECT subqueries
    sqlContent = sqlContent.replace(/instansiId\s*=\s*10816663/g, `instansiId = ${tenant.id}`);
    sqlContent = sqlContent.replace(/,\s*10816663\s*,/g, `, ${tenant.id},`);
    sqlContent = sqlContent.replace(/,\s*10816663\s*\)/g, `, ${tenant.id})`);
    
    console.log('🚀 Menjalankan import data siswa...\n');
    
    // Execute the entire SQL file as one statement (it uses multipleStatements: true)
    let imported = 0;
    let errors = 0;

    // First, delete any existing students with conflicting NISN from other tenants
    // Or better: update NISN to be NULL for conflicting entries, then insert
    console.log('🔍 Memeriksa konflik NISN...\n');
    const nisnList = sqlContent.match(/'(\d{10})'/g)?.map(m => m.replace(/'/g, '')) || [];
    if (nisnList.length > 0) {
      // Set NISN to NULL for students in other tenants that conflict
      const placeholders = nisnList.map(() => '?').join(',');
      await connection.query(
        `UPDATE students SET nisn = NULL WHERE nisn IN (${placeholders}) AND instansiId != ?`,
        [...nisnList, tenant.id]
      );
      console.log(`✅ Konflik NISN telah diselesaikan\n`);
    }
    
    // Use INSERT IGNORE to skip duplicates
    sqlContent = sqlContent.replace(/INSERT INTO/i, 'INSERT IGNORE INTO');
    
    // Execute the SQL directly
    try {
      const [result] = await connection.query(sqlContent);
      console.log(`✅ SQL berhasil dieksekusi!`);
      
      // Count how many were actually inserted
      const [countResult] = await connection.query(
        'SELECT COUNT(*) as count FROM students WHERE instansiId = ?',
        [tenant.id]
      );
      imported = countResult[0].count - (existingStudents[0]?.count || 0);
    } catch (error) {
      // If INSERT IGNORE doesn't work, try individual inserts
      console.log('⚠️  Mencoba metode alternatif...\n');
      
      // Extract individual value rows using a more robust method
      const valuesMatch = sqlContent.match(/VALUES\s*((?:\([^)]+\),?\s*)+);/is);
      if (valuesMatch) {
        const valuesText = valuesMatch[1];
        // Split by ),( but be careful with nested parentheses in SELECT statements
        const rows = [];
        let currentRow = '';
        let depth = 0;
        let inString = false;
        let stringChar = '';
        
        for (let i = 0; i < valuesText.length; i++) {
          const char = valuesText[i];
          const nextChar = valuesText[i + 1];
          
          if ((char === '"' || char === "'") && (i === 0 || valuesText[i - 1] !== '\\')) {
            if (!inString) {
              inString = true;
              stringChar = char;
            } else if (char === stringChar) {
              inString = false;
            }
          }
          
          if (!inString) {
            if (char === '(') depth++;
            if (char === ')') depth--;
            
            currentRow += char;
            
            if (depth === 0 && char === ')' && (nextChar === ',' || nextChar === ';' || !nextChar)) {
              rows.push(currentRow.trim());
              currentRow = '';
              if (nextChar === ',') i++; // Skip the comma
            }
          } else {
            currentRow += char;
          }
        }
        
        if (currentRow.trim()) rows.push(currentRow.trim());
        
        // Get column names
        const columnsMatch = sqlContent.match(/INSERT INTO[^(]+\(([^)]+)\)/i);
        const columns = columnsMatch ? columnsMatch[1].trim() : '';
        
        console.log(`📊 Menemukan ${rows.length} siswa untuk diimport...\n`);
        
        for (let i = 0; i < rows.length; i++) {
          let row = rows[i];
          // Replace tenant ID
          row = row.replace(/instansiId\s*=\s*10816663/g, `instansiId = ${tenant.id}`);
          row = row.replace(/,\s*10816663\s*,/g, `, ${tenant.id},`);
          row = row.replace(/,\s*10816663\s*\)/g, `, ${tenant.id})`);
          
          try {
            await connection.query(`INSERT IGNORE INTO students (${columns}) VALUES ${row}`);
            const [check] = await connection.query('SELECT ROW_COUNT() as affected');
            if (check[0].affected > 0) {
              imported++;
              if (imported % 10 === 0 || imported === rows.length) {
                console.log(`  ✅ Imported ${imported}/${rows.length} students...`);
              }
            }
          } catch (err) {
            if (err.code !== 'ER_DUP_ENTRY') {
              errors++;
            }
          }
        }
      } else {
        throw error;
      }
    }
    
    console.log(`\n✅ Import selesai!`);
    console.log(`📊 Imported: ${imported} statements`);
    if (errors > 0) {
      console.log(`⚠️  Errors: ${errors}`);
    }

    // Verify import
    const [students] = await connection.query(
      'SELECT COUNT(*) as count FROM students WHERE instansiId = ?',
      [tenant.id]
    );

    console.log(`\n📊 Total siswa untuk tenant ${tenant.name}: ${students[0].count}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

importStudentsData();

