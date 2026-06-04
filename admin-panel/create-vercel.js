const fs = require('fs');
const path = require('path');

const config = {
  buildCommand: "npm run build:prod",
  outputDirectory: "build",
  devCommand: "npm run dev",
  installCommand: "npm install --legacy-peer-deps",
  framework: "create-react-app",
  nodeVersion: "18.x",
  rewrites: [
    {
      source: "/(.*)",
      destination: "/index.html"
    }
  ]
};

// Write with absolutely NO BOM
fs.writeFileSync(
  path.join(process.cwd(), 'vercel.json'),
  JSON.stringify(config, null, 2),
  'utf8'
);

console.log('vercel.json created successfully!');
console.log('First 20 bytes:', 
  fs.readFileSync('vercel.json').slice(0, 20)
);
