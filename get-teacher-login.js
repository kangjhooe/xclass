const mysql = require('mysql2/promise');

async function getTeacherLogin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'class'
  });

  try {
    // Cari tenant dengan NPSN 10816663
    const [tenants] = await connection.query(
      'SELECT id, npsn, name FROM tenants WHERE npsn = ?',
      ['10816663']
    );

    if (tenants.length === 0) {
      console.log('❌ Tenant dengan NPSN 10816663 tidak ditemukan!');
      return;
    }

    const tenant = tenants[0];
    console.log(`\n✅ Tenant ditemukan: ${tenant.name} (ID: ${tenant.id}, NPSN: ${tenant.npsn})\n`);

    // Ambil data guru
    const [teachers] = await connection.query(
      `SELECT id, name, nik, nip, nuptk, email, employeeNumber, specialization, instansiId 
       FROM teachers 
       WHERE instansiId = ? AND isActive = 1 
       ORDER BY name 
       LIMIT 20`,
      [tenant.id]
    );

    if (teachers.length === 0) {
      console.log('❌ Tidak ada guru aktif untuk tenant ini!');
      console.log('\n💡 Membuat data guru sample untuk tenant 10816663...\n');
      
      // Buat data guru sample
      const sampleTeachers = [
        {
          name: 'Dr. Ahmad Hidayat, S.Pd., M.Pd.',
          email: 'ahmad.hidayat@teacher.school.id',
          phone: '081234568101',
          employeeNumber: 'G001',
          nip: '196501151990031001',
          nik: '3201011501650001',
          nuptk: '1234567890123456',
          gender: 'male',
          birthDate: '1965-01-15',
          birthPlace: 'Bandar Lampung',
          address: 'Jl. Pendidikan No. 123, Bandar Lampung',
          education: 'S2 - Magister Pendidikan',
          specialization: 'Matematika',
          isActive: true,
          instansiId: tenant.id
        },
        {
          name: 'Siti Nurhaliza, S.Pd.',
          email: 'siti.nurhaliza@teacher.school.id',
          phone: '081234568102',
          employeeNumber: 'G002',
          nip: '197203201995032002',
          nik: '3201012003720002',
          nuptk: '1234567890123457',
          gender: 'female',
          birthDate: '1972-03-20',
          birthPlace: 'Bandar Lampung',
          address: 'Jl. Merdeka No. 45, Bandar Lampung',
          education: 'S1 - Sarjana Pendidikan',
          specialization: 'Bahasa Indonesia',
          isActive: true,
          instansiId: tenant.id
        },
        {
          name: 'Budi Santoso, S.Pd., M.Kom.',
          email: 'budi.santoso@teacher.school.id',
          phone: '081234568103',
          employeeNumber: 'G003',
          nip: '198004101998031003',
          nik: '3201011004800003',
          nuptk: '1234567890123458',
          gender: 'male',
          birthDate: '1980-04-10',
          birthPlace: 'Bandar Lampung',
          address: 'Jl. Teknologi No. 78, Bandar Lampung',
          education: 'S2 - Magister Komputer',
          specialization: 'Teknologi Informasi',
          isActive: true,
          instansiId: tenant.id
        },
        {
          name: 'Dewi Sartika, S.Pd., M.Pd.',
          email: 'dewi.sartika@teacher.school.id',
          phone: '081234568104',
          employeeNumber: 'G004',
          nip: '198511251999032004',
          nik: '3201012511850004',
          nuptk: '1234567890123459',
          gender: 'female',
          birthDate: '1985-11-25',
          birthPlace: 'Bandar Lampung',
          address: 'Jl. Pendidikan No. 56, Bandar Lampung',
          education: 'S2 - Magister Pendidikan',
          specialization: 'Bahasa Inggris',
          isActive: true,
          instansiId: tenant.id
        },
        {
          name: 'Rizki Pratama, S.Pd., M.Si.',
          email: 'rizki.pratama@teacher.school.id',
          phone: '081234568105',
          employeeNumber: 'G005',
          nip: '199002151999031005',
          nik: '3201011502900005',
          nuptk: '1234567890123460',
          gender: 'male',
          birthDate: '1990-02-15',
          birthPlace: 'Bandar Lampung',
          address: 'Jl. Ilmu Pengetahuan No. 90, Bandar Lampung',
          education: 'S2 - Magister Sains',
          specialization: 'Fisika',
          isActive: true,
          instansiId: tenant.id
        }
      ];

      for (const teacher of sampleTeachers) {
        // Cek apakah sudah ada
        const [existing] = await connection.query(
          'SELECT id FROM teachers WHERE nik = ? AND instansiId = ?',
          [teacher.nik, tenant.id]
        );

        if (existing.length === 0) {
          await connection.query(
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
          console.log(`✅ Guru "${teacher.name}" berhasil ditambahkan`);
        }
      }

      // Ambil ulang data guru
      const [newTeachers] = await connection.query(
        `SELECT id, name, nik, nip, nuptk, email, employeeNumber, specialization, instansiId 
         FROM teachers 
         WHERE instansiId = ? AND isActive = 1 
         ORDER BY name 
         LIMIT 20`,
        [tenant.id]
      );
      teachers.push(...newTeachers);
    }

    if (teachers.length === 0) {
      console.log('❌ Tidak ada guru untuk ditampilkan!');
      return;
    }

    console.log('='.repeat(80));
    console.log('DATA LOGIN GURU - TENANT 10816663');
    console.log('='.repeat(80));
    console.log(`\nLink Login: http://localhost:3000/login (atau sesuai URL aplikasi Anda)\n`);
    console.log('Cara Login:');
    console.log('1. Pilih "Guru (NIK)" pada halaman login');
    console.log('2. Masukkan NIK (16 digit)');
    console.log('3. Masukkan Password (default: NIK itu sendiri untuk login pertama kali)\n');
    console.log('='.repeat(80));
    console.log('\nDaftar Guru:\n');

    teachers.forEach((teacher, index) => {
      console.log(`${index + 1}. ${teacher.name}`);
      console.log(`   NIK: ${teacher.nik || 'Tidak ada'}`);
      console.log(`   Password Default: ${teacher.nik || 'Tidak ada'} (sama dengan NIK)`);
      console.log(`   NIP: ${teacher.nip || 'Tidak ada'}`);
      console.log(`   NUPTK: ${teacher.nuptk || 'Tidak ada'}`);
      console.log(`   Email: ${teacher.email || 'Tidak ada'}`);
      console.log(`   Spesialisasi: ${teacher.specialization || 'Tidak ada'}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log(`\nTotal: ${teachers.length} guru aktif\n`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

getTeacherLogin();

