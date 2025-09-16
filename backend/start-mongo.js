// start-mongo.js
import { spawn } from 'child_process';

const dbPath = 'C:\\mongodb\\data\\rs1';
const replSet = 'rs0';
const port = '27017';

console.log('Starting MongoDB...');
const mongod = spawn('mongod', [
  '--dbpath', dbPath,
  '--replSet', replSet,
  '--port', port
], { stdio: 'inherit' });

// Kill mongod when the process exits
process.on('exit', () => {
  console.log('🛑 Stopping MongoDB...');
  mongod.kill();
});

process.on('SIGINT', () => process.exit());
process.on('SIGTERM', () => process.exit());
