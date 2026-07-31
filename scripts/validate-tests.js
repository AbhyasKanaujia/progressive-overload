const fs = require('fs');
const path = require('path');

const SOURCE_DIRS = ['app', 'db', 'hooks', 'store', 'types'];
const TEST_DIRS = ['__tests__'];

function getFiles(dir, ext, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      getFiles(fullPath, ext, files);
    } else if (item.name.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  return files;
}

function getTestFiles() {
  const tests = new Set();
  for (const dir of TEST_DIRS) {
    if (fs.existsSync(dir)) {
      const files = getFiles(dir, '.test.ts').concat(getFiles(dir, '.test.tsx'));
      for (const f of files) {
        tests.add(path.basename(f, path.extname(f)).replace(/\.test$/, ''));
      }
    }
  }
  return tests;
}

function getSourceFiles() {
  const files = [];
  for (const dir of SOURCE_DIRS) {
    if (fs.existsSync(dir)) {
      const items = getFiles(dir, '.ts').concat(getFiles(dir, '.tsx'));
      for (const f of items) {
        const base = path.basename(f, path.extname(f));
        if (!base.endsWith('.test') && base !== 'index') {
          files.push(base);
        }
      }
    }
  }
  return files;
}

const testFiles = getTestFiles();
const sourceFiles = getSourceFiles();
const missing = sourceFiles.filter((f) => !testFiles.has(f));

if (missing.length > 0) {
  console.error(`Missing tests for: ${missing.join(', ')}`);
  process.exit(1);
}

if (sourceFiles.length === 0) {
  console.log('No source files found yet. Skipping test validation.');
} else {
  console.log('All source files have corresponding tests.');
}
