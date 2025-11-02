const { Command, Flags } = require('@oclif/core');
const chalk = require('chalk');
const { loadConfig, getDbConfig } = require('../../utils/config');
const MigrationRunner = require('../../utils/migration-runner');
const path = require('path');

class MigrationStatusCommand extends Command {
  static description = 'Show the status of all migrations';

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
    const { flags } = await this.parse(MigrationStatusCommand);
    
    try {
      const config = await loadConfig();
      const dbConfig = await getDbConfig(flags.env);
      const migrationsPath = path.resolve(process.cwd(), config.paths.migrations);

      const runner = new MigrationRunner(dbConfig, migrationsPath);
      await runner.initialize();

      const status = await runner.getStatus();

      if (status.length === 0) {
        this.log(chalk.yellow('No migrations found.'));
        await runner.close();
        return;
      }

      this.log(chalk.cyan('Migration Status:'));
      this.log('');

      const executedCount = status.filter(s => s.executed).length;
      const pendingCount = status.length - executedCount;

      for (const migration of status) {
        const icon = migration.executed ? chalk.green('✓') : chalk.yellow('○');
        const statusText = migration.executed ? chalk.green('executed') : chalk.yellow('pending');
        this.log(`  ${icon} ${migration.name} ${statusText}`);
      }

      this.log('');
      this.log(chalk.cyan(`Summary: ${executedCount} executed, ${pendingCount} pending`));

      await runner.close();
    } catch (error) {
      this.error(error.message);
    }
  }
}

module.exports = MigrationStatusCommand;
