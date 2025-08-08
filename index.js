#!/usr/bin/env node

// Production entry point
// This file ensures the server starts correctly in deployment environments

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the actual server file
const serverPath = path.join(__dirname, 'src', 'server', 'index.js');

console.log('🚀 Starting ProofJobs server...');
console.log('📁 Server path:', serverPath);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', process.env.PORT || 8080);

// Start the server
const serverProcess = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env
});

serverProcess.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  console.log(`⚠️  Server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  serverProcess.kill('SIGTERM');
});
