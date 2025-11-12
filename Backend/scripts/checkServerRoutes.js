// backend/scripts/checkServerRoutes.js
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Server.js Route Mounting');
console.log('====================================\n');

const serverPath = path.join(__dirname, '..', 'server.js');

try {
  const content = fs.readFileSync(serverPath, 'utf8');
  
  console.log('Checking server.js for auth route mounting...');
  
  if (content.includes("require('./routes/auth')")) {
    console.log('✅ Auth route required in server.js');
  } else {
    console.log('❌ Auth route not required in server.js');
  }
  
  if (content.includes("app.use('/api', authRoutes)") || content.includes("app.use('/api', require('./routes/auth')")) {
    console.log('✅ Auth route mounted in server.js');
  } else {
    console.log('❌ Auth route not mounted in server.js');
    console.log('\n💡 Add this to your server.js:');
    console.log("const authRoutes = require('./routes/auth');");
    console.log("app.use('/api', authRoutes);");
  }
  
} catch (error) {
  console.log('Error reading server.js:', error.message);
}