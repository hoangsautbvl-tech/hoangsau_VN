const fs = require('fs');
const path = require('path');

const target = process.argv[2];

if (!target) {
  console.error('Usage: node scripts/hide-console.js <path-to-exe>');
  process.exit(1);
}

const exePath = path.resolve(target);
const buffer = fs.readFileSync(exePath);

if (buffer.toString('ascii', 0, 2) !== 'MZ') {
  throw new Error(`${exePath} is not a Windows executable.`);
}

const peOffset = buffer.readUInt32LE(0x3c);
if (buffer.toString('ascii', peOffset, peOffset + 4) !== 'PE\u0000\u0000') {
  throw new Error(`${exePath} does not contain a valid PE header.`);
}

const optionalHeaderOffset = peOffset + 24;
const subsystemOffset = optionalHeaderOffset + 0x44;
const currentSubsystem = buffer.readUInt16LE(subsystemOffset);

// 2 = Windows GUI, 3 = Windows console.
if (currentSubsystem !== 2) {
  buffer.writeUInt16LE(2, subsystemOffset);
  fs.writeFileSync(exePath, buffer);
}

console.log(`Updated ${exePath} to Windows GUI subsystem.`);
