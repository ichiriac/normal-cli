const { Command, Flags } = require('@oclif/core');
const chalk = require('chalk');
const { loadConfig, getDbConfig } = require('../../utils/config');
const SeedRunner = require('../../utils/seed-runner');
const path = require('path');

class SeedRunCommand extends Command {
  static description = 'Run all pending seed files';

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
    const { flags } = await this.parse(SeedRunCommand);
    
    try {
      const config = await loadConfig();
      const dbConfig = await getDbConfig(flags.env);
      const seedersPath = path.resolve(process.cwd(), config.paths.seeders);

      this.log(chalk.cyan('Running seeds...'));
      this.log('');

      const runner = new SeedRunner(dbConfig, seedersPath);
      await runner.initialize();

      const pending = await runner.getPendingSeeds();

      if (pending.length === 0) {
        this.log(chalk.yellow('No pending seeds.'));
        await runner.close();
        return;
      }

      this.log(chalk.cyan(`Found ${pending.length} pending seed(s):`));
      for (const seed of pending) {
        this.log(`  - ${seed}`);
      }
      this.log('');

      for (const seed of pending) {
        try {
          this.log(chalk.cyan(`Running: ${seed}`));
          await runner.runSeed(seed);
          this.log(chalk.green(`✓ Completed: ${seed}`));
        } catch (error) {
          this.log(chalk.red(`✗ Failed: ${seed}`));
          this.error(error.message);
        }
      }

      this.log('');
      this.log(chalk.green('✓ All seeds completed successfully!'));

      await runner.close();
    } catch (error) {
      this.error(error.message);
    }
  }
}

module.exports = SeedRunCommand;
