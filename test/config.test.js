const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  loadConfig,
  getDbConfig,
  ensureDir,
  getTimestamp,
} = require('../src/utils/config');

describe('src/utils/config', () => {
  let tmpDir;
  let origCwd;

  beforeEach(() => {
    origCwd = process.cwd();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'normal-cli-test-'));
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(origCwd);
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {
      // ignore
    }
  });

  test('loadConfig returns default when no config files present', async () => {
    const cfg = await loadConfig();
    expect(cfg).toBeDefined();
    expect(cfg).toHaveProperty('paths');
    expect(cfg.config).toBe('./config/database.js');
  });

  test('getTimestamp returns a 14-digit numeric string', () => {
    const ts = getTimestamp();
    expect(ts).toMatch(/^\d{14}$/);
  });

  test('ensureDir creates nested directories', async () => {
    const dir = path.join(process.cwd(), 'a', 'b', 'c');
    await ensureDir(dir);
    expect(fs.existsSync(dir)).toBe(true);
  });

  test('getDbConfig throws when no database config file exists', async () => {
    await expect(getDbConfig()).rejects.toThrow(/Database configuration file not found/);
  });
});
