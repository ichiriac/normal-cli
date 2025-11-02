const { Command, Flags } = require('@oclif/core');
const chalk = require('chalk');
const { loadConfig, getDbConfig } = require('../../utils/config');
const MigrationRunner = require('../../utils/migration-runner');
const path = require('path');

class MigrationRunCommand extends Command {
  static description = 'Run all pending migrations';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --env production',
  ];

  static flags = {
    env: Flags.string({
      char: 'e',
      description: 'Environment to use',
      default: 'development',
    }),
  };

  async run() {
    const { flags } = await this.parse(MigrationRunCommand);
    
    try {
      const config = await loadConfig();
      const dbConfig = await getDbConfig(flags.env);
      const migrationsPath = path.resolve(process.cwd(), config.paths.migrations);

      this.log(chalk.cyan('Running migrations...'));
      this.log('');

      const runner = new MigrationRunner(dbConfig, migrationsPath);
      await runner.initialize();

      const pending = await runner.getPendingMigrations();

      if (pending.length === 0) {
        this.log(chalk.yellow('No pending migrations.'));
        await runner.close();
        return;
      }

      this.log(chalk.cyan(`Found ${pending.length} pending migration(s):`));
      for (const migration of pending) {
        this.log(`  - ${migration}`);
      }
      this.log('');

      for (const migration of pending) {
        try {
          this.log(chalk.cyan(`Running: ${migration}`));
          await runner.runMigration(migration);
          this.log(chalk.green(`✓ Completed: ${migration}`));
        } catch (error) {
          this.log(chalk.red(`✗ Failed: ${migration}`));
          this.error(error.message);
        }
      }

      this.log('');
      this.log(chalk.green('✓ All migrations completed successfully!'));

      await runner.close();
    } catch (error) {
      this.error(error.message);
    }
  }
}

module.exports = MigrationRunCommand;
