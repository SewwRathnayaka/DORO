// fix-web-package.js
// Fixes the package.json in web directory after Expo export
// Removes the 'main' field that points to electron-main.js

const fs = require('fs');
const path = require('path');

const webPackageJsonPath = path.join(__dirname, 'web', 'package.json');

if (fs.existsSync(webPackageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(webPackageJsonPath, 'utf8'));
  
  // Remove the 'main' field if it exists
  if (packageJson.main) {
    delete packageJson.main;
  }
  
  // Write the fixed package.json back
  fs.writeFileSync(webPackageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Fixed web/package.json - removed main field');
} else {
  console.warn('web/package.json not found, skipping fix');
}
