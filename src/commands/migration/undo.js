const { Command, Flags } = require('@oclif/core');
const chalk = require('chalk');
const { loadConfig, getDbConfig } = require('../../utils/config');
const MigrationRunner = require('../../utils/migration-runner');
const path = require('path');

class MigrationUndoCommand extends Command {
  static description = 'Undo the last migration';

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
    const { flags } = await this.parse(MigrationUndoCommand);
    
    try {
      const config = await loadConfig();
      const dbConfig = await getDbConfig(flags.env);
      const migrationsPath = path.resolve(process.cwd(), config.paths.migrations);

      this.log(chalk.cyan('Undoing last migration...'));
      this.log('');

      const runner = new MigrationRunner(dbConfig, migrationsPath);
      await runner.initialize();

      const executed = await runner.getExecutedMigrations();

      if (executed.length === 0) {
        this.log(chalk.yellow('No migrations to undo.'));
        await runner.close();
        return;
      }

      const lastMigration = executed[executed.length - 1];

      this.log(chalk.cyan(`Undoing: ${lastMigration}`));
      try {
        await runner.undoMigration(lastMigration);
        this.log(chalk.green(`✓ Successfully undone: ${lastMigration}`));
      } catch (error) {
        this.log(chalk.red(`✗ Failed to undo: ${lastMigration}`));
        this.error(error.message);
      }

      await runner.close();
    } catch (error) {
      this.error(error.message);
    }
  }
}

module.exports = MigrationUndoCommand;
