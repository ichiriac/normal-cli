const { Command, Flags } = require('@oclif/core');
const chalk = require('chalk');
const { loadConfig, getDbConfig } = require('../../utils/config');
const SeedRunner = require('../../utils/seed-runner');
const path = require('path');

class SeedUndoCommand extends Command {
  static description = 'Undo the last seed or all seeds';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --all',
    '<%= config.bin %> <%= command.id %> --env production',
  ];

  static flags = {
    env: Flags.string({
      char: 'e',
      description: 'Environment to use',
      default: 'development',
    }),
    all: Flags.boolean({
      char: 'a',
      description: 'Undo all seeds',
      default: false,
    }),
  };

  async run() {
    const { flags } = await this.parse(SeedUndoCommand);
    
    try {
      const config = await loadConfig();
      const dbConfig = await getDbConfig(flags.env);
      const seedersPath = path.resolve(process.cwd(), config.paths.seeders);

      this.log(chalk.cyan(flags.all ? 'Undoing all seeds...' : 'Undoing last seed...'));
      this.log('');

      const runner = new SeedRunner(dbConfig, seedersPath);
      await runner.initialize();

      const executed = await runner.getExecutedSeeds();

      if (executed.length === 0) {
        this.log(chalk.yellow('No seeds to undo.'));
        await runner.close();
        return;
      }

      if (flags.all) {
        this.log(chalk.cyan(`Undoing ${executed.length} seed(s)...`));
        for (let i = executed.length - 1; i >= 0; i--) {
          const seed = executed[i];
          try {
            this.log(chalk.cyan(`Undoing: ${seed}`));
            await runner.undoSeed(seed);
            this.log(chalk.green(`✓ Successfully undone: ${seed}`));
          } catch (error) {
            this.log(chalk.red(`✗ Failed to undo: ${seed}`));
            this.error(error.message);
          }
        }
      } else {
        const lastSeed = executed[executed.length - 1];
        this.log(chalk.cyan(`Undoing: ${lastSeed}`));
        try {
          await runner.undoSeed(lastSeed);
          this.log(chalk.green(`✓ Successfully undone: ${lastSeed}`));
        } catch (error) {
          this.log(chalk.red(`✗ Failed to undo: ${lastSeed}`));
          this.error(error.message);
        }
      }

      await runner.close();
    } catch (error) {
      this.error(error.message);
    }
  }
}

module.exports = SeedUndoCommand;
