const fs = require('fs-extra');
const path = require('path');
const { Connection, Repository } = require('normaljs');

/**
 * SeedRunner handles running and tracking seeds
 */
class SeedRunner {
  constructor(dbConfig, seedersPath) {
    this.dbConfig = dbConfig;
    this.seedersPath = seedersPath;
    this.connection = null;
    this.repository = null;
    this.knex = null;
  }

  async initialize() {
    // Create connection and repository
    this.connection = new Connection(this.dbConfig);
    this.knex = this.connection.instance;
    this.repository = new Repository(this.connection);

    // Ensure seeders table exists
    await this.ensureSeedersTable();
  }

  async ensureSeedersTable() {
    const hasTable = await this.knex.schema.hasTable('seeders');
    if (!hasTable) {
      await this.knex.schema.createTable('seeders', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.timestamp('executed_at').defaultTo(this.knex.fn.now());
      });
    }
  }

  async getSeedFiles() {
    if (!await fs.pathExists(this.seedersPath)) {
      return [];
    }

    const files = await fs.readdir(this.seedersPath);
    return files
      .filter(f => f.endsWith('.js'))
      .sort();
  }

  async getExecutedSeeds() {
    const results = await this.knex('seeders')
      .select('name')
      .orderBy('name', 'asc');
    return results.map(r => r.name);
  }

  async getPendingSeeds() {
    const allFiles = await this.getSeedFiles();
    const executed = await this.getExecutedSeeds();
    return allFiles.filter(f => !executed.includes(f));
  }

  async runSeed(fileName) {
    const filePath = path.join(this.seedersPath, fileName);
    const seed = require(filePath);

    if (!seed.up) {
      throw new Error(`Seed ${fileName} does not have an 'up' method`);
    }

    // Run the seed
    await seed.up(this.repository, this.knex);

    // Record it as executed
    await this.knex('seeders').insert({
      name: fileName,
      executed_at: new Date(),
    });
  }

  async undoSeed(fileName) {
    const filePath = path.join(this.seedersPath, fileName);
    const seed = require(filePath);

    if (!seed.down) {
      throw new Error(`Seed ${fileName} does not have a 'down' method`);
    }

    // Run the down seed
    await seed.down(this.repository, this.knex);

    // Remove from seeders table
    await this.knex('seeders').where({ name: fileName }).del();
  }

  async runAllSeeds() {
    const pending = await this.getPendingSeeds();
    
    for (const seed of pending) {
      await this.runSeed(seed);
    }
    
    return pending;
  }

  async undoAllSeeds() {
    const executed = await this.getExecutedSeeds();
    
    // Undo in reverse order
    for (let i = executed.length - 1; i >= 0; i--) {
      await this.undoSeed(executed[i]);
    }
    
    return executed;
  }

  async close() {
    if (this.connection) {
      await this.connection.destroy();
    }
  }
}

module.exports = SeedRunner;
