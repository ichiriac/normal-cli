const { Command, Flags } = require('@oclif/core');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { loadConfig, getTimestamp } = require('../../utils/config');

class MigrationCreateCommand extends Command {
  static description = 'Create a new migration file';

  static examples = [
    '<%= config.bin %> <%= command.id %> --name create-users-table',
    '<%= config.bin %> <%= command.id %> --name add-email-to-users',
  ];

  static flags = {
    name: Flags.string({
      char: 'n',
      description: 'Name of the migration',
      required: true,
    }),
  };

  async run() {
    const { flags } = await this.parse(MigrationCreateCommand);
    const config = await loadConfig();
    const migrationsPath = path.resolve(process.cwd(), config.paths.migrations);

    await fs.ensureDir(migrationsPath);

    const timestamp = getTimestamp();
    const fileName = `${timestamp}-${flags.name}.js`;
    const filePath = path.join(migrationsPath, fileName);

    const templatePath = path.join(__dirname, '../../templates/migration.js');
    const template = await fs.readFile(templatePath, 'utf-8');

    await fs.writeFile(filePath, template);

    this.log(chalk.green(`✓ Migration created: ${fileName}`));
    this.log(chalk.cyan(`  Path: ${filePath}`));
    this.log('');
    this.log(chalk.cyan('Next steps:'));
    this.log('  1. Edit the migration file to add your migration logic');
    this.log('  2. Run the migration with: normal-cli migration:run');
  }
}

module.exports = MigrationCreateCommand;
