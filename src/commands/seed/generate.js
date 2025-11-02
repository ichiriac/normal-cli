const { Command, Flags } = require('@oclif/core');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { loadConfig, getTimestamp } = require('../../utils/config');

class SeedGenerateCommand extends Command {
  static description = 'Create a new seed file';

  static examples = [
    '<%= config.bin %> <%= command.id %> --name demo-users',
    '<%= config.bin %> <%= command.id %> --name initial-data',
  ];

  static flags = {
    name: Flags.string({
      char: 'n',
      description: 'Name of the seed',
      required: true,
    }),
  };

  async run() {
    const { flags } = await this.parse(SeedGenerateCommand);
    const config = await loadConfig();
    const seedersPath = path.resolve(process.cwd(), config.paths.seeders);

    await fs.ensureDir(seedersPath);

    const timestamp = getTimestamp();
    const fileName = `${timestamp}-${flags.name}.js`;
    const filePath = path.join(seedersPath, fileName);

    const templatePath = path.join(__dirname, '../../templates/seed.js');
    const template = await fs.readFile(templatePath, 'utf-8');

    await fs.writeFile(filePath, template);

    this.log(chalk.green(`✓ Seed file created: ${fileName}`));
    this.log(chalk.cyan(`  Path: ${filePath}`));
    this.log('');
    this.log(chalk.cyan('Next steps:'));
    this.log('  1. Edit the seed file to add your seed data');
    this.log('  2. Run the seeds with: normal-cli seed:run');
  }
}

module.exports = SeedGenerateCommand;
