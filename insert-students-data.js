const mysql = require('mysql2/promise');

async function insertStudentsData() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'class',
  };

  let connection;
  
  try {
    console.log('🔌 Menghubungkan ke database...\n');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Terhubung ke database!\n');

    // Cek apakah ada tenant/instansi
    console.log('🔍 Mencari tenant/instansi...\n');
    const [tenants] = await connection.query(
      'SELECT id, npsn, name FROM tenants LIMIT 1'
    );

    let instansiId;
    if (tenants.length === 0) {
      console.log('⚠️  Tidak ada tenant ditemukan. Membuat tenant default...\n');
      const [result] = await connection.query(
        `INSERT INTO tenants (npsn, name, isActive, createdAt, updatedAt) 
         VALUES (?, ?, ?, NOW(), NOW())`,
        ['00000001', 'Sekolah Default', 1]
      );
      instansiId = result.insertId;
      console.log(`✅ Tenant default dibuat dengan ID: ${instansiId}\n`);
    } else {
      instansiId = tenants[0].id;
      console.log(`✅ Menggunakan tenant: ${tenants[0].name} (ID: ${instansiId}, NPSN: ${tenants[0].npsn})\n`);
    }

    // Data 5 siswa lengkap
    const students = [
      {
        name: 'Ahmad Fauzi',
        email: 'ahmad.fauzi@school.sch.id',
        phone: '081234567895',
        studentNumber: 'STU001',
        nisn: '0012345678',
        nik: '3201010102050001',
        gender: 'Laki-laki',
        birthDate: '2005-01-01',
        birthPlace: 'Jakarta',
        address: 'Jl. Pendidikan No. 10, Jakarta Selatan',
        religion: 'Islam',
        parentName: 'Budi Fauzi',
        parentPhone: '081234567896',
        parentEmail: 'budi.fauzi@email.com',
        isActive: true,
        instansiId: instansiId
      },
      {
        name: 'Siti Aisyah',
        email: 'siti.aisyah@school.sch.id',
        phone: '081234567897',
        studentNumber: 'STU002',
        nisn: '0012345679',
        nik: '3201010203050002',
        gender: 'Perempuan',
        birthDate: '2005-03-02',
        birthPlace: 'Bandung',
        address: 'Jl. Merdeka No. 20, Bandung',
        religion: 'Islam',
        parentName: 'Ahmad Aisyah',
        parentPhone: '081234567898',
        parentEmail: 'ahmad.aisyah@email.com',
        isActive: true,
        instansiId: instansiId
      },
      {
        name: 'Budi Pratama',
        email: 'budi.pratama@school.sch.id',
        phone: '081234567899',
        studentNumber: 'STU003',
        nisn: '0012345680',
        nik: '3201010304050003',
        gender: 'Laki-laki',
        birthDate: '2005-04-03',
        birthPlace: 'Surabaya',
        address: 'Jl. Teknologi No. 30, Surabaya',
        religion: 'Islam',
        parentName: 'Siti Pratama',
        parentPhone: '081234567900',
        parentEmail: 'siti.pratama@email.com',
        isActive: true,
        instansiId: instansiId
      },
      {
        name: 'Dewi Lestari',
        email: 'dewi.lestari@school.sch.id',
        phone: '081234567901',
        studentNumber: 'STU004',
        nisn: '0012345681',
        nik: '3201010405050004',
        gender: 'Perempuan',
        birthDate: '2005-05-04',
        birthPlace: 'Yogyakarta',
        address: 'Jl. Pendidikan No. 40, Yogyakarta',
        religion: 'Islam',
        parentName: 'Budi Lestari',
        parentPhone: '081234567902',
        parentEmail: 'budi.lestari@email.com',
        isActive: true,
        instansiId: instansiId
      },
      {
        name: 'Rizki Maulana',
        email: 'rizki.maulana@school.sch.id',
        phone: '081234567903',
        studentNumber: 'STU005',
        nisn: '0012345682',
        nik: '3201010506050005',
        gender: 'Laki-laki',
        birthDate: '2005-06-05',
        birthPlace: 'Medan',
        address: 'Jl. Ilmu Pengetahuan No. 50, Medan',
        religion: 'Islam',
        parentName: 'Siti Maulana',
        parentPhone: '081234567904',
        parentEmail: 'siti.maulana@email.com',
        isActive: true,
        instansiId: instansiId
      }
    ];

    console.log('📝 Memasukkan data 5 siswa...\n');

    for (const student of students) {
      // Cek apakah siswa sudah ada (berdasarkan NISN atau NIK)
      const [existing] = await connection.query(
        'SELECT id, name FROM students WHERE (nisn = ? OR nik = ?) AND instansiId = ?',
        [student.nisn, student.nik, instansiId]
      );

      if (existing.length > 0) {
        console.log(`⚠️  Siswa "${student.name}" sudah ada (ID: ${existing[0].id}). Dilewati.\n`);
        continue;
      }

      // Insert siswa baru
      const [result] = await connection.query(
        `INSERT INTO students (
          name, email, phone, studentNumber, nisn, nik, 
          gender, birthDate, birthPlace, address, religion,
          parentName, parentPhone, parentEmail, isActive, instansiId, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          student.name,
          student.email,
          student.phone,
          student.studentNumber,
          student.nisn,
          student.nik,
          student.gender,
          student.birthDate,
          student.birthPlace,
          student.address,
          student.religion,
          student.parentName,
          student.parentPhone,
          student.parentEmail,
          student.isActive ? 1 : 0,
          student.instansiId
        ]
      );

      console.log(`✅ Siswa "${student.name}" berhasil ditambahkan (ID: ${result.insertId})`);
      console.log(`   Email: ${student.email}`);
      console.log(`   NISN: ${student.nisn}`);
      console.log(`   NIS: ${student.studentNumber}\n`);
    }

    // Tampilkan ringkasan
    const [allStudents] = await connection.query(
      'SELECT COUNT(*) as total FROM students WHERE instansiId = ?',
      [instansiId]
    );

    console.log('✅ Selesai!');
    console.log(`📊 Total siswa di instansi ini: ${allStudents[0].total} orang\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️  Tidak bisa terhubung ke MySQL server.');
      console.error('💡 Pastikan MySQL/XAMPP sudah berjalan.\n');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('⚠️  Tabel students belum ada.');
      console.error('💡 Pastikan aplikasi sudah dijalankan untuk membuat tabel.\n');
    } else {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

insertStudentsData();

