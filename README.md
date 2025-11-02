# Normal CLI

The official command-line interface for [Normal ORM](https://github.com/ichiriac/normal). Similar to Sequelize CLI but designed specifically for Normal ORM projects.

Normal CLI helps you:
- Initialize new projects with proper structure
- Generate models with migrations
- Create and run database migrations
- Seed your database with initial data
- Manage your database schema

## Installation

```bash
npm install -g normal-cli
```

Or use it directly with npx:

```bash
npx normal-cli init
```

## Quick Start

1. **Initialize a new project:**

```bash
normal-cli init
```

This creates the following structure:
```
.
├── config/
│   └── database.js       # Database configuration
├── models/
│   └── index.js          # Models index
├── migrations/           # Migration files
├── seeders/              # Seed files
└── .normalrc.json        # CLI configuration
```

2. **Configure your database** in `config/database.js`

3. **Generate a model:**

```bash
normal-cli model:generate --name User --attributes firstname:string,lastname:string,email:string
```

4. **Create a migration:**

```bash
normal-cli migration:create --name create-users-table
```

5. **Run migrations:**

```bash
normal-cli migration:run
```

## Commands

### Init

Initialize a new Normal CLI project with the recommended directory structure.

```bash
normal-cli init [--force]
```

**Options:**
- `-f, --force`: Overwrite existing files

### Model Commands

#### model:generate

Generate a new model file.

```bash
normal-cli model:generate --name <ModelName> [--attributes <attr:type,...>] [--table <tableName>]
```

**Options:**
- `-n, --name`: Name of the model (required)
- `-a, --attributes`: Comma-separated attributes (e.g., `firstname:string,age:integer`)
- `-t, --table`: Custom table name (defaults to pluralized lowercase model name)

**Examples:**
```bash
normal-cli model:generate --name User --attributes firstname:string,lastname:string,email:string

normal-cli model:generate --name Post --attributes title:string,content:text,author_id:reference --table blog_posts
```

**Supported field types:**
- `string`, `text`
- `integer`, `int`, `float`, `decimal`
- `boolean`, `bool`
- `date`, `datetime`, `timestamp`
- `json`
- `reference` (for foreign keys)
- `enum`

### Migration Commands

#### migration:create

Create a new migration file.

```bash
normal-cli migration:create --name <migration-name>
```

**Options:**
- `-n, --name`: Name of the migration (required)

**Example:**
```bash
normal-cli migration:create --name create-users-table
```

#### migration:run

Run all pending migrations.

```bash
normal-cli migration:run [--env <environment>]
```

**Options:**
- `-e, --env`: Environment to use (default: development)

**Example:**
```bash
normal-cli migration:run
normal-cli migration:run --env production
```

#### migration:undo

Undo the last executed migration.

```bash
normal-cli migration:undo [--env <environment>]
```

**Options:**
- `-e, --env`: Environment to use (default: development)

**Example:**
```bash
normal-cli migration:undo
```

#### migration:status

Show the status of all migrations (executed vs pending).

```bash
normal-cli migration:status [--env <environment>]
```

**Options:**
- `-e, --env`: Environment to use (default: development)

**Example:**
```bash
normal-cli migration:status
```

### Seed Commands

#### seed:generate

Create a new seed file.

```bash
normal-cli seed:generate --name <seed-name>
```

**Options:**
- `-n, --name`: Name of the seed (required)

**Example:**
```bash
normal-cli seed:generate --name demo-users
```

#### seed:run

Run all pending seed files.

```bash
normal-cli seed:run [--env <environment>]
```

**Options:**
- `-e, --env`: Environment to use (default: development)

**Example:**
```bash
normal-cli seed:run
```

#### seed:undo

Undo the last seed or all seeds.

```bash
normal-cli seed:undo [--env <environment>] [--all]
```

**Options:**
- `-e, --env`: Environment to use (default: development)
- `-a, --all`: Undo all seeds

**Examples:**
```bash
normal-cli seed:undo              # Undo last seed
normal-cli seed:undo --all        # Undo all seeds
```

## Configuration

### .normalrc.json

The CLI configuration file that defines paths for models, migrations, and seeders.

```json
{
  "paths": {
    "models": "./models",
    "migrations": "./migrations",
    "seeders": "./seeders",
    "config": "./config"
  },
  "config": "./config/database.js"
}
```

### config/database.js

Database configuration file supporting multiple environments.

```javascript
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    },
    useNullAsDefault: true,
  },
  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10
    },
  },
};
```

## Migration Example

After creating a migration with `migration:create`, edit it to define your schema changes:

```javascript
module.exports = {
  async up(repo, knex) {
    // Register your models
    const User = require('../models/user');
    repo.register({ User });
    
    // Sync the schema
    await repo.sync({ force: false });
  },

  async down(repo, knex) {
    // Drop the table
    await knex.schema.dropTable('users');
  },
};
```

## Seed Example

After creating a seed with `seed:generate`, edit it to define your seed data:

```javascript
module.exports = {
  async up(repo, knex) {
    const User = require('../models/user');
    repo.register({ User });
    
    const Users = repo.get('User');
    
    await Users.create({
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
    });
    
    await Users.create({
      firstname: 'Jane',
      lastname: 'Smith',
      email: 'jane@example.com',
    });
  },

  async down(repo, knex) {
    await knex('users').del();
  },
};
```

## Supported Databases

Normal CLI supports all databases that Normal ORM supports (via Knex):

- PostgreSQL
- MySQL
- MariaDB
- SQLite3
- Oracle
- Microsoft SQL Server
- CockroachDB
- Amazon Redshift

## Help

Get help for any command:

```bash
normal-cli help
normal-cli help migration:run
```

## License

MIT

## Related Projects

- [Normal ORM](https://github.com/ichiriac/normal) - The ORM this CLI is built for
- [Sequelize CLI](https://github.com/sequelize/cli) - Inspiration for this project