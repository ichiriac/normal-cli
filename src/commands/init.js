const { Command, Flags } = require('@oclif/core');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class InitCommand extends Command {
  static description = 'Initialize a new Normal CLI project';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --force',
  ];

  static flags = {
    force: Flags.boolean({
      char: 'f',
      description: 'Overwrite existing files',
      default: false,
    }),
  };

  async run() {
    const { flags } = await this.parse(InitCommand);
    const cwd = process.cwd();

    this.log(chalk.cyan('Initializing Normal CLI project...'));

    // Create directory structure
    const directories = [
      'config',
      'models',
      'migrations',
      'seeders',
    ];

    for (const dir of directories) {
      const dirPath = path.join(cwd, dir);
      if (await fs.pathExists(dirPath) && !flags.force) {
        this.log(chalk.yellow(`  Directory ${dir}/ already exists, skipping...`));
      } else {
        await fs.ensureDir(dirPath);
        this.log(chalk.green(`  Created ${dir}/`));
      }
    }

    // Create .normalrc.json config file
    const configFile = path.join(cwd, '.normalrc.json');
    if (await fs.pathExists(configFile) && !flags.force) {
      this.log(chalk.yellow('  .normalrc.json already exists, skipping...'));
    } else {
      const config = {
        paths: {
          models: './models',
          migrations: './migrations',
          seeders: './seeders',
          config: './config',
        },
        config: './config/database.js',
      };
      await fs.writeJson(configFile, config, { spaces: 2 });
      this.log(chalk.green('  Created .normalrc.json'));
    }

    // Create database config file
    const dbConfigFile = path.join(cwd, 'config', 'database.js');
    if (await fs.pathExists(dbConfigFile) && !flags.force) {
      this.log(chalk.yellow('  config/database.js already exists, skipping...'));
    } else {
      const dbConfigContent = `module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    },
    useNullAsDefault: true,
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    },
    useNullAsDefault: true,
  },
  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'database',
      user: process.env.DB_USER || 'username',
      password: process.env.DB_PASSWORD || 'password',
    },
    pool: {
      min: 2,
      max: 10
    },
  },
};
`;
      await fs.writeFile(dbConfigFile, dbConfigContent);
      this.log(chalk.green('  Created config/database.js'));
    }

    // Create .gitignore if it doesn't exist
    const gitignoreFile = path.join(cwd, '.gitignore');
    const gitignoreAdditions = ['node_modules/', '*.sqlite3', '.env', '*.log'];
    
    if (await fs.pathExists(gitignoreFile)) {
      let gitignoreContent = await fs.readFile(gitignoreFile, 'utf-8');
      let added = false;
      
      for (const entry of gitignoreAdditions) {
        if (!gitignoreContent.includes(entry)) {
          gitignoreContent += `\n${entry}`;
          added = true;
        }
      }
      
      if (added) {
        await fs.writeFile(gitignoreFile, gitignoreContent);
        this.log(chalk.green('  Updated .gitignore'));
      }
    } else {
      await fs.writeFile(gitignoreFile, gitignoreAdditions.join('\n') + '\n');
      this.log(chalk.green('  Created .gitignore'));
    }

    // Create a sample model index file
    const modelsIndexFile = path.join(cwd, 'models', 'index.js');
    if (!await fs.pathExists(modelsIndexFile) || flags.force) {
      const modelsIndexContent = `/**
 * Models index file
 * Import and export all your models here
 */

// Example:
// const User = require('./user');
// const Post = require('./post');

module.exports = {
  // User,
  // Post,
};
`;
      await fs.writeFile(modelsIndexFile, modelsIndexContent);
      this.log(chalk.green('  Created models/index.js'));
    }

    // Create README
    const readmeFile = path.join(cwd, 'README.md');
    if (!await fs.pathExists(readmeFile) || flags.force) {
      const readmeContent = `# Normal CLI Project

This project was initialized with Normal CLI.

## Available Commands

- \`normal-cli init\` - Initialize a new project (already done!)
- \`normal-cli model:generate\` - Generate a new model
- \`normal-cli migration:create\` - Create a new migration
- \`normal-cli migration:run\` - Run pending migrations
- \`normal-cli migration:undo\` - Undo the last migration
- \`normal-cli migration:status\` - Show migration status
- \`normal-cli seed:generate\` - Create a new seed file
- \`normal-cli seed:run\` - Run seed files
- \`normal-cli seed:undo\` - Undo seed files

## Getting Started

1. Configure your database in \`config/database.js\`
2. Create models in the \`models/\` directory
3. Create migrations with \`normal-cli migration:create --name <migration-name>\`
4. Run migrations with \`normal-cli migration:run\`

## Documentation

For more information, visit: https://github.com/ichiriac/normal
`;
      await fs.writeFile(readmeFile, readmeContent);
      this.log(chalk.green('  Created README.md'));
    }

    this.log('');
    this.log(chalk.green('✓ Project initialized successfully!'));
    this.log('');
    this.log(chalk.cyan('Next steps:'));
    this.log('  1. Configure your database in config/database.js');
    this.log('  2. Create your first model with: normal-cli model:generate --name User');
    this.log('  3. Create a migration with: normal-cli migration:create --name create-users-table');
    this.log('  4. Run migrations with: normal-cli migration:run');
  }
}

module.exports = InitCommand;
