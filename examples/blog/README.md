# Blog Example

This example demonstrates how to use Normal CLI to build a simple blog application with users, posts, and comments.

## Setup

1. Initialize the project:
   ```bash
   normal-cli init
   ```

2. Generate models:
   ```bash
   normal-cli model:generate --name User --attributes name:string,email:string,password:string
   normal-cli model:generate --name Post --attributes title:string,content:text,author_id:reference
   normal-cli model:generate --name Comment --attributes content:text,author_id:reference,post_id:reference
   ```

3. Create migrations:
   ```bash
   normal-cli migration:create --name create-users-table
   normal-cli migration:create --name create-posts-table
   normal-cli migration:create --name create-comments-table
   ```

4. Edit the migration files to define your schema (see examples below)

5. Run migrations:
   ```bash
   normal-cli migration:run
   ```

6. Create seed data:
   ```bash
   normal-cli seed:generate --name demo-users
   normal-cli seed:generate --name demo-posts
   ```

7. Edit seed files and run them:
   ```bash
   normal-cli seed:run
   ```

## Example Migration

File: `migrations/YYYYMMDDHHMMSS-create-posts-table.js`

```javascript
module.exports = {
  async up(repo, knex) {
    await knex.schema.createTable('posts', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.text('content').notNullable();
      table.integer('author_id').unsigned().notNullable();
      table.foreign('author_id').references('id').inTable('users');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  },

  async down(repo, knex) {
    await knex.schema.dropTable('posts');
  },
};
```

## Example Seed

File: `seeders/YYYYMMDDHHMMSS-demo-posts.js`

```javascript
module.exports = {
  async up(repo, knex) {
    const User = require('../models/user');
    const Post = require('../models/post');
    
    repo.register({ User, Post });
    
    // Get a user
    const Users = repo.get('User');
    const user = await Users.where({ email: 'john@example.com' }).first();
    
    // Create posts
    const Posts = repo.get('Post');
    await Posts.create({
      title: 'My First Post',
      content: 'This is the content of my first blog post.',
      author_id: user.id,
    });
    
    await Posts.create({
      title: 'Another Great Post',
      content: 'More amazing content here!',
      author_id: user.id,
    });
  },

  async down(repo, knex) {
    await knex('posts').del();
  },
};
```

## Using the Models

Once your migrations are run, you can use the models in your application:

```javascript
const { Connection, Repository } = require('normaljs');
const User = require('./models/user');
const Post = require('./models/post');
const Comment = require('./models/comment');

// Create connection
const db = new Connection({
  client: 'sqlite3',
  connection: { filename: './dev.sqlite3' },
  useNullAsDefault: true,
});

// Create repository and register models
const repo = new Repository(db);
repo.register({ User, Post, Comment });

// Use the models
async function example() {
  const Users = repo.get('User');
  const Posts = repo.get('Post');
  
  // Get all posts
  const posts = await Posts.all();
  
  // Create a new post
  const user = await Users.where({ email: 'john@example.com' }).first();
  const post = await Posts.create({
    title: 'New Post',
    content: 'Content here',
    author_id: user.id,
  });
  
  console.log('Created post:', post);
}

example();
```

## Commands Reference

- `normal-cli init` - Initialize project structure
- `normal-cli model:generate` - Generate a model
- `normal-cli migration:create` - Create a migration
- `normal-cli migration:run` - Run migrations
- `normal-cli migration:undo` - Undo last migration
- `normal-cli migration:status` - Show migration status
- `normal-cli seed:generate` - Create a seed file
- `normal-cli seed:run` - Run seeds
- `normal-cli seed:undo` - Undo seeds
