// Produces build/icon.ico for electron-builder (Windows .exe / installer icon).
// Assumes you have created a **real** Windows .ico file at assets/icon.ico.
// (Not a PNG renamed to .ico — use an icon tool to export a proper .ico.)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const buildDir = path.join(root, 'build');
const src = path.join(root, 'assets', 'icon.ico');
const dest = path.join(buildDir, 'icon.ico');

if (!fs.existsSync(src)) {
  console.error('scripts/copy-build-icon.cjs: assets/icon.ico not found. Please create a valid Windows .ico and place it there.');
  process.exit(1);
}

fs.mkdirSync(buildDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log('Copied assets/icon.ico → build/icon.ico for electron-builder');
