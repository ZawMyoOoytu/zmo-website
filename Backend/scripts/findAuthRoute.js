// backend/scripts/findAuthRoute.js
const fs = require('fs');
const path = require('path');

console.log('🔍 Finding and Checking Auth Route');
console.log('===================================\n');

const routesPath = path.join(__dirname, '..', 'routes');
console.log('Routes directory:', routesPath);

if (!fs.existsSync(routesPath)) {
  console.log('❌ routes directory not found!');
  process.exit(1);
}

const files = fs.readdirSync(routesPath);
console.log('Files in routes directory:');
files.forEach(file => {
  console.log('  -', file);
});

// Look for files that might contain auth routes
const authFiles = files.filter(file => 
  file.includes('auth') || 
  file.includes('Auth') || 
  file.includes('admin') ||
  file.includes('user')
);

console.log('\n🔐 Potential auth route files:');
authFiles.forEach(file => {
  const filePath = path.join(routesPath, file);
  console.log('\n📄 File:', file);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it contains login route
    if (content.includes('login') || content.includes('Login')) {
      console.log('✅ Contains login route');
      
      // Show the login route section
      const lines = content.split('\n');
      let inLoginRoute = false;
      let loginRouteLines = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('login') || line.includes('Login')) {
          inLoginRoute = true;
        }
        
        if (inLoginRoute) {
          loginRouteLines.push(line);
          // Stop after 10 lines of the route
          if (loginRouteLines.length > 10 || line.includes('}') || line.includes('res.json')) {
            break;
          }
        }
      }
      
      console.log('   Route code preview:');
      loginRouteLines.forEach(line => {
        console.log('   ', line.trim());
      });
    } else {
      console.log('❌ No login route found');
    }
    
  } catch (error) {
    console.log('❌ Error reading file:', error.message);
  }
});

console.log('\n💡 Next steps:');
console.log('1. Identify which file contains the login route');
console.log('2. Check for syntax errors in that file');
console.log('3. Make sure the route is properly exported');
console.log('4. Ensure the route is mounted in server.js');