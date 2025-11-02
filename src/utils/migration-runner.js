const fs = require('fs-extra');
const path = require('path');
const { Connection, Repository } = require('normaljs');

/**
 * MigrationRunner handles running and tracking migrations
 */
class MigrationRunner {
  constructor(dbConfig, migrationsPath) {
    this.dbConfig = dbConfig;
    this.migrationsPath = migrationsPath;
    this.connection = null;
    this.repository = null;
    this.knex = null;
  }

  async initialize() {
    // Create connection and repository
    this.connection = new Connection(this.dbConfig);
    this.knex = this.connection.instance;
    this.repository = new Repository(this.connection);

    // Ensure migrations table exists
    await this.ensureMigrationsTable();
  }

  async ensureMigrationsTable() {
    const hasTable = await this.knex.schema.hasTable('migrations');
    if (!hasTable) {
      await this.knex.schema.createTable('migrations', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.timestamp('executed_at').defaultTo(this.knex.fn.now());
      });
    }
  }

  async getMigrationFiles() {
    if (!await fs.pathExists(this.migrationsPath)) {
      return [];
    }

    const files = await fs.readdir(this.migrationsPath);
    return files
      .filter(f => f.endsWith('.js'))
      .sort();
  }

  async getExecutedMigrations() {
    const results = await this.knex('migrations')
      .select('name')
      .orderBy('name', 'asc');
    return results.map(r => r.name);
  }

  async getPendingMigrations() {
    const allFiles = await this.getMigrationFiles();
    const executed = await this.getExecutedMigrations();
    return allFiles.filter(f => !executed.includes(f));
  }

  async runMigration(fileName) {
    const filePath = path.join(this.migrationsPath, fileName);
    // Note: Migration files should be from trusted sources only as they execute arbitrary code
    const migration = require(filePath);

    if (!migration.up) {
      throw new Error(`Migration ${fileName} does not have an 'up' method`);
    }

    // Run the migration
    await migration.up(this.repository, this.knex);

    // Record it as executed
    await this.knex('migrations').insert({
      name: fileName,
      executed_at: new Date(),
    });
  }

  async undoMigration(fileName) {
    const filePath = path.join(this.migrationsPath, fileName);
    // Note: Migration files should be from trusted sources only as they execute arbitrary code
    const migration = require(filePath);

    if (!migration.down) {
      throw new Error(`Migration ${fileName} does not have a 'down' method`);
    }

    // Run the down migration
    await migration.down(this.repository, this.knex);

    // Remove from migrations table
    await this.knex('migrations').where({ name: fileName }).del();
  }

  async getStatus() {
    const allFiles = await this.getMigrationFiles();
    const executed = await this.getExecutedMigrations();

    return allFiles.map(file => ({
      name: file,
      executed: executed.includes(file),
    }));
  }

  async close() {
    if (this.connection) {
      await this.connection.destroy();
    }
  }
}

module.exports = MigrationRunner;
