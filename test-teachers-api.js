const axios = require('axios');

async function testTeachersAPI() {
  const API_URL = 'http://localhost:3000/api';
  
  try {
    console.log('🔍 Testing Teachers API...\n');
    
    // Test 1: Get tenant by NPSN
    console.log('1. Testing get tenant by NPSN 10816663...');
    try {
      const tenantResponse = await axios.get(`${API_URL}/tenants/resolve/10816663`);
      console.log('✅ Tenant found:', JSON.stringify(tenantResponse.data, null, 2));
      const tenantId = tenantResponse.data.id;
      console.log(`   Tenant ID: ${tenantId}\n`);
      
      // Test 2: Get teachers (without auth - should fail or work depending on setup)
      console.log('2. Testing get teachers without auth...');
      try {
        const teachersResponse = await axios.get(`${API_URL}/tenants/${tenantId}/teachers`);
        console.log('✅ Teachers response (without auth):', JSON.stringify(teachersResponse.data, null, 2));
        console.log(`   Total teachers: ${teachersResponse.data?.total || teachersResponse.data?.length || 0}\n`);
      } catch (error) {
        if (error.response) {
          console.log(`❌ Error ${error.response.status}: ${error.response.statusText}`);
          console.log('   Response:', JSON.stringify(error.response.data, null, 2));
        } else {
          console.log('❌ Network error:', error.message);
        }
        console.log('   (This is expected if auth is required)\n');
      }
      
      // Test 3: Direct database check
      console.log('3. Checking database directly...');
      const mysql = require('mysql2/promise');
      const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'class'
      });
      
      const [teachers] = await conn.query(
        'SELECT id, name, email, instansiId FROM teachers WHERE instansiId = ?',
        [tenantId]
      );
      
      console.log(`✅ Found ${teachers.length} teachers in database:`);
      teachers.forEach(teacher => {
        console.log(`   - ${teacher.name} (ID: ${teacher.id}, Email: ${teacher.email})`);
      });
      
      await conn.end();
      
    } catch (error) {
      console.error('❌ Error getting tenant:', error.message);
      if (error.response) {
        console.error('   Response:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️  Backend tidak berjalan di http://localhost:3000');
      console.error('💡 Pastikan backend NestJS sudah dijalankan.\n');
    }
  }
}

testTeachersAPI();

