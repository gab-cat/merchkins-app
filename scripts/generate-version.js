#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get version from package.json
const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// Generate version info
const versionInfo = {
  version: packageJson.version,
  buildTimestamp: Date.now(),
  buildDate: new Date().toISOString(),
  gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.CI_COMMIT_SHA || 'unknown',
  environment: process.env.APP_ENV || process.env.NODE_ENV || 'development',
};

// Write to public/version.json
const outputPath = path.resolve(__dirname, '../public/version.json');
fs.writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2), 'utf-8');

console.log('✓ Generated version.json:', versionInfo.version, '- ', versionInfo.buildTimestamp);
