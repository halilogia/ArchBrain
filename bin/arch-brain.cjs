#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Electron paketinden executable path'ini al
let electronPath;
try {
  electronPath = require(path.join(__dirname, '..', 'node_modules', 'electron', 'index.js'));
} catch (e) {
  // Eğerrequire başarısız olursa (path yapısı farklıysa) direkt npx ile şansımızı deneriz
  electronPath = 'electron'; 
}

const appPath = path.join(__dirname, 'app-shell.cjs');
const args = [appPath, ...process.argv.slice(2)];

console.log(`🧠 ArchBrain başlatılıyor...`);

const proc = spawn(electronPath, args, { 
  stdio: 'inherit',
  env: {
    ...process.env,
    PROJECT_ROOT: process.cwd()
  }
});

proc.on('error', (err) => {
  console.error('❌ ArchBrain başlatılamadı. Lütfen electronun yüklü olduğundan emin olun.');
  console.error(err);
});

proc.on('close', (code) => process.exit(code));
