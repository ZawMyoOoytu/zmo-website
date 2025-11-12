// backend/scripts/setupEnv.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

const setupEnvFile = async () => {
  console.log('🔧 .env File Setup Wizard');
  console.log('=========================\n');

  console.log('We need to create a .env file with your MongoDB Atlas connection details.\n');

  console.log('To get your connection string:');
  console.log('1. Go to: https://cloud.mongodb.com');
  console.log('2. Click your project → Database');
  console.log('3. Click "Connect" on your cluster');
  console.log('4. Click "Connect your application"');
  console.log('5. Copy the connection string\n');

  const connectionString = await askQuestion('📝 Paste your MongoDB connection string: ');
  
  // Extract and validate the connection string
  if (!connectionString.includes('mongodb+srv://')) {
    console.log('❌ Invalid connection string. It should start with mongodb+srv://');
    rl.close();
    return;
  }

  // Generate a random JWT secret
  const jwtSecret = require('crypto').randomBytes(64).toString('hex');

  // Create .env content
  const envContent = `# MongoDB Atlas Connection
MONGODB_URI=${connectionString}

# JWT Secret (for authentication)
JWT_SECRET=${jwtSecret}

# Server Port
PORT=5000

# Environment
NODE_ENV=development

# CORS Origins (frontend URLs)
CLIENT_URL=http://localhost:3000
`;

  // Write to .env file
  const envPath = path.join(__dirname, '..', '.env');
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ .env file created successfully!');
  console.log('📍 Location:', envPath);
  console.log('\n📋 Contents:');
  console.log('--------------');
  console.log(envContent);
  console.log('--------------');

  console.log('\n🔒 Security Note:');
  console.log('• Keep your .env file secure and never commit it to version control');
  console.log('• Add .env to your .gitignore file');
  console.log('• Your JWT secret has been auto-generated for security');

  rl.close();
};

setupEnvFile();