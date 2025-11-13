const mysql = require('mysql2/promise');

async function insertTeachersData() {
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

    // Data 5 guru lengkap
    const teachers = [
      {
        name: 'Dr. Ahmad Hidayat, S.Pd., M.Pd.',
        email: 'ahmad.hidayat@school.sch.id',
        phone: '081234567890',
        employeeNumber: 'EMP001',
        nip: '196501151990031001',
        nik: '3201011501650001',
        nuptk: '1234567890123456',
        gender: 'Laki-laki',
        birthDate: '1965-01-15',
        birthPlace: 'Jakarta',
        address: 'Jl. Pendidikan No. 123, Jakarta Selatan',
        education: 'S2 - Magister Pendidikan',
        specialization: 'Matematika',
        isActive: true,
        instansiId: instansiId
      },
      {
        name: 'Siti Nurhaliza, S.Pd.',
        email: 'siti.nurhaliza@school.sch.id',
        phone: '081234567891',
        employeeNumber: 'EMP002',
        nip: '197203201995032002',
        nik: '3201012003720002',
        nuptk: '1234567890123457',
        gender: 'Perempuan',
        birthDate: '1972-03-20',
        birthPlace: 'Bandung',
        address: 'Jl. Merdeka No. 45, Bandung',
        education: 'S1 - Sarjana Pendidikan',
        specialization: 'Bahasa Indonesia',
        isActive: true,
        instansiId: instansiId
      },
      {
        name: 'Budi Santoso, S.Pd., M.Kom.',
        email: 'budi.santoso@school.sch.id',
        phone: '081234567892',
        employeeNumber: 'EMP003',
        nip: '198004101998031003',
        nik: '3201011004800003',
        nuptk: '1234567890123458',
        gender: 'Laki-laki',
        birthDate: '1980-04-10',
        birthPlace: 'Surabaya',
        address: 'Jl. Teknologi No. 78, Surabaya',
        education: 'S2 - Magister Komputer',
        specialization: 'Teknologi Informasi',
        isActive: true,
        instansiId: instansiId
      },
      {
        name: 'Dewi Sartika, S.Pd., M.Pd.',
        email: 'dewi.sartika@school.sch.id',
        phone: '081234567893',
        employeeNumber: 'EMP004',
        nip: '198511251999032004',
        nik: '3201012511850004',
        nuptk: '1234567890123459',
        gender: 'Perempuan',
        birthDate: '1985-11-25',
        birthPlace: 'Yogyakarta',
        address: 'Jl. Pendidikan No. 56, Yogyakarta',
        education: 'S2 - Magister Pendidikan',
        specialization: 'Bahasa Inggris',
        isActive: true,
        instansiId: instansiId
      },
      {
        name: 'Rizki Pratama, S.Pd., M.Si.',
        email: 'rizki.pratama@school.sch.id',
        phone: '081234567894',
        employeeNumber: 'EMP005',
        nip: '199002151999031005',
        nik: '3201011502900005',
        nuptk: '1234567890123460',
        gender: 'Laki-laki',
        birthDate: '1990-02-15',
        birthPlace: 'Medan',
        address: 'Jl. Ilmu Pengetahuan No. 90, Medan',
        education: 'S2 - Magister Sains',
        specialization: 'Fisika',
        isActive: true,
        instansiId: instansiId
      }
    ];

    console.log('📝 Memasukkan data 5 guru...\n');

    for (const teacher of teachers) {
      // Cek apakah guru sudah ada (berdasarkan NIK atau NIP)
      const [existing] = await connection.query(
        'SELECT id, name FROM teachers WHERE (nik = ? OR nip = ?) AND instansiId = ?',
        [teacher.nik, teacher.nip, instansiId]
      );

      if (existing.length > 0) {
        console.log(`⚠️  Guru "${teacher.name}" sudah ada (ID: ${existing[0].id}). Dilewati.\n`);
        continue;
      }

      // Insert guru baru
      const [result] = await connection.query(
        `INSERT INTO teachers (
          name, email, phone, employeeNumber, nip, nik, nuptk, 
          gender, birthDate, birthPlace, address, education, 
          specialization, isActive, instansiId, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          teacher.name,
          teacher.email,
          teacher.phone,
          teacher.employeeNumber,
          teacher.nip,
          teacher.nik,
          teacher.nuptk,
          teacher.gender,
          teacher.birthDate,
          teacher.birthPlace,
          teacher.address,
          teacher.education,
          teacher.specialization,
          teacher.isActive ? 1 : 0,
          teacher.instansiId
        ]
      );

      console.log(`✅ Guru "${teacher.name}" berhasil ditambahkan (ID: ${result.insertId})`);
      console.log(`   Email: ${teacher.email}`);
      console.log(`   NIP: ${teacher.nip}`);
      console.log(`   Spesialisasi: ${teacher.specialization}\n`);
    }

    // Tampilkan ringkasan
    const [allTeachers] = await connection.query(
      'SELECT COUNT(*) as total FROM teachers WHERE instansiId = ?',
      [instansiId]
    );

    console.log('✅ Selesai!');
    console.log(`📊 Total guru di instansi ini: ${allTeachers[0].total} orang\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️  Tidak bisa terhubung ke MySQL server.');
      console.error('💡 Pastikan MySQL/XAMPP sudah berjalan.\n');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('⚠️  Tabel teachers belum ada.');
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

insertTeachersData();

