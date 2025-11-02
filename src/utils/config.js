const fs = require('fs-extra');
const path = require('path');

/**
 * Load the Normal CLI configuration
 * Looks for .normalrc, .normalrc.json, or normal.config.js
 */
async function loadConfig() {
  const cwd = process.cwd();
  
  // Try different config file names
  const configFiles = [
    '.normalrc.json',
    '.normalrc',
    'normal.config.js',
  ];
  
  for (const filename of configFiles) {
    const configPath = path.join(cwd, filename);
    if (await fs.pathExists(configPath)) {
      if (filename.endsWith('.js')) {
        return require(configPath);
      } else {
        return await fs.readJson(configPath);
      }
    }
  }
  
  // Default configuration
  return {
    'paths': {
      'models': './models',
      'migrations': './migrations',
      'seeders': './seeders',
      'config': './config'
    },
    'config': './config/database.js'
  };
}

/**
 * Get the database configuration
 */
async function getDbConfig(environment = 'development') {
  const config = await loadConfig();
  const configPath = path.resolve(process.cwd(), config.config || './config/database.js');
  
  if (await fs.pathExists(configPath)) {
    const dbConfig = require(configPath);
    return dbConfig[environment] || dbConfig;
  }
  
  throw new Error(`Database configuration file not found at ${configPath}`);
}

/**
 * Ensure a directory exists
 */
async function ensureDir(dirPath) {
  await fs.ensureDir(dirPath);
}

/**
 * Get timestamp for migration/seed file names
 */
function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

module.exports = {
  loadConfig,
  getDbConfig,
  ensureDir,
  getTimestamp,
};
