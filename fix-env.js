const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

// Default .env content
const defaultEnv = `# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=xclass

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Application
NODE_ENV=development
PORT=3000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001
`;

function fixEnvFile() {
  console.log('🔧 Fixing .env file...\n');

  let envContent = '';
  let needsFix = false;
  const fixes = [];

  // Read existing .env if exists
  if (fs.existsSync(envPath)) {
    console.log('📄 Reading existing .env file...\n');
    envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check and fix issues
    const lines = envContent.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const originalLine = line;
      
      // Fix localhost to 127.0.0.1
      if (line.includes('DB_HOST=localhost') || line.includes('DB_HOST=localhost')) {
        line = line.replace(/DB_HOST\s*=\s*localhost/i, 'DB_HOST=127.0.0.1');
        needsFix = true;
        fixes.push('Changed DB_HOST from localhost to 127.0.0.1');
      }
      
      // Fix database name from 'class' to 'xclass'
      if (line.match(/DB_DATABASE\s*=\s*class\s*$/i) && !line.includes('xclass')) {
        line = line.replace(/DB_DATABASE\s*=\s*class\s*$/i, 'DB_DATABASE=xclass');
        needsFix = true;
        fixes.push('Changed DB_DATABASE from class to xclass');
      }
      
      newLines.push(line);
    }
    
    envContent = newLines.join('\n');
  } else {
    console.log('📄 .env file not found, creating new one...\n');
    envContent = defaultEnv;
    needsFix = true;
    fixes.push('Created new .env file with default configuration');
  }

  // Ensure all required variables exist
  const requiredVars = {
    'DB_HOST': '127.0.0.1',
    'DB_PORT': '3306',
    'DB_USERNAME': 'root',
    'DB_PASSWORD': '',
    'DB_DATABASE': 'xclass',
    'JWT_SECRET': 'your-secret-key-change-this-in-production',
    'JWT_EXPIRES_IN': '24h',
    'NODE_ENV': 'development',
    'PORT': '3000',
    'FRONTEND_URL': 'http://localhost:3001',
  };

  for (const [varName, defaultValue] of Object.entries(requiredVars)) {
    const regex = new RegExp(`^${varName}\\s*=`, 'm');
    if (!regex.test(envContent)) {
      envContent += `\n${varName}=${defaultValue}`;
      needsFix = true;
      fixes.push(`Added missing ${varName}`);
    }
  }

  // Remove duplicates and ensure correct values
  const lines = envContent.split('\n');
  const seen = new Set();
  const cleanedLines = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      cleanedLines.push(line);
      continue;
    }
    
    const match = trimmed.match(/^([A-Z_]+)\s*=/);
    if (match) {
      const varName = match[1];
      if (seen.has(varName)) {
        // Skip duplicate
        continue;
      }
      seen.add(varName);
      
      // Fix values
      if (varName === 'DB_HOST' && !trimmed.includes('127.0.0.1')) {
        cleanedLines.push('DB_HOST=127.0.0.1');
        needsFix = true;
      } else if (varName === 'DB_DATABASE' && !trimmed.includes('xclass')) {
        cleanedLines.push('DB_DATABASE=xclass');
        needsFix = true;
      } else {
        cleanedLines.push(line);
      }
    } else {
      cleanedLines.push(line);
    }
  }
  
  envContent = cleanedLines.join('\n');
  
  // Final check: ensure DB_HOST is 127.0.0.1
  if (!envContent.includes('DB_HOST=127.0.0.1')) {
    envContent = 'DB_HOST=127.0.0.1\n' + envContent;
    needsFix = true;
    fixes.push('Added DB_HOST=127.0.0.1');
  }

  // Final check: ensure DB_DATABASE is xclass
  if (!envContent.includes('DB_DATABASE=xclass')) {
    envContent = envContent.replace(/(DB_DATABASE\s*=\s*.*)/i, 'DB_DATABASE=xclass');
    if (!envContent.includes('DB_DATABASE=xclass')) {
      envContent += '\nDB_DATABASE=xclass';
    }
    needsFix = true;
    fixes.push('Ensured DB_DATABASE is xclass');
  }

  if (needsFix) {
    // Backup existing .env
    if (fs.existsSync(envPath)) {
      const backupPath = envPath + '.backup';
      fs.copyFileSync(envPath, backupPath);
      console.log(`💾 Backup created: ${backupPath}\n`);
    }

    // Write fixed .env
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file fixed!\n');
    console.log('📋 Changes made:');
    fixes.forEach(fix => console.log(`   - ${fix}`));
    console.log('\n📄 Updated .env content:');
    console.log('─'.repeat(50));
    console.log(envContent);
    console.log('─'.repeat(50));
  } else {
    console.log('✅ .env file is already correct!\n');
    console.log('📄 Current .env content:');
    console.log('─'.repeat(50));
    console.log(envContent);
    console.log('─'.repeat(50));
  }

  console.log('\n💡 Next steps:');
  console.log('   1. Run: node test-db-connection.js');
  console.log('   2. If database not exists, run: node create-xclass-database.js');
  console.log('   3. Run: npm run start:dev\n');
}

fixEnvFile();

