// backend/scripts/checkAuthSyntax.js
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Auth Route Syntax');
console.log('=============================\n');

const authFilePath = path.join(__dirname, '..', 'routes', 'auth.js');

try {
  console.log('Reading auth.js file...');
  const content = fs.readFileSync(authFilePath, 'utf8');
  
  // Try to require the file to check for syntax errors
  console.log('Testing syntax by requiring the file...');
  delete require.cache[require.resolve(authFilePath)];
  const authRoute = require(authFilePath);
  
  console.log('✅ Syntax is correct!');
  console.log('File loaded successfully');
  
  // Check if it's properly exported as a router
  if (authRoute && typeof authRoute === 'function') {
    console.log('✅ Properly exported as Express router');
  } else {
    console.log('❌ Not properly exported as Express router');
  }
  
} catch (error) {
  console.log('❌ SYNTAX ERROR FOUND:');
  console.log('Error:', error.message);
  
  if (error.message.includes('Unexpected token')) {
    console.log('\n💡 This is a JavaScript syntax error:');
    console.log('• Check for missing brackets, parentheses, or commas');
    console.log('• Check for missing semicolons');
    console.log('• Check for incorrect variable declarations');
  }
  
  if (error.message.includes('is not a function')) {
    console.log('\n💡 Function error:');
    console.log('• Check if all required modules are imported');
    console.log('• Check if methods exist on objects');
  }
  
  // Show the problematic area
  console.log('\n🔧 To fix:');
  console.log('1. Replace your entire auth.js file with the working code below');
  console.log('2. Or find and fix the specific syntax error');
}