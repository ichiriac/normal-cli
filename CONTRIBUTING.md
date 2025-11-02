# Contributing to Normal CLI

Thank you for your interest in contributing to Normal CLI! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/normal-cli.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development

### Project Structure

```
normal-cli/
├── bin/                    # Entry point
│   └── run.js
├── src/
│   ├── commands/          # CLI commands
│   │   ├── init.js
│   │   ├── migration/
│   │   ├── model/
│   │   └── seed/
│   ├── templates/         # File templates
│   │   ├── migration.js
│   │   ├── model.js
│   │   └── seed.js
│   └── utils/            # Utilities
│       ├── config.js
│       ├── migration-runner.js
│       └── seed-runner.js
└── README.md
```

### Testing Your Changes

1. Create a test directory:
   ```bash
   mkdir /tmp/test-cli
   cd /tmp/test-cli
   ```

2. Test the init command:
   ```bash
   node /path/to/normal-cli/bin/run.js init
   ```

3. Test other commands as needed

### Adding New Commands

1. Create a new file in `src/commands/` or a subdirectory
2. Follow the OCLIF command structure
3. Export the command class
4. Add appropriate flags and examples
5. Test the command thoroughly

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add JSDoc comments for functions
- Follow the existing code style

## Submitting Changes

1. Ensure your code follows the project style
2. Test your changes thoroughly
3. Commit your changes with a clear message
4. Push to your fork
5. Create a pull request

### Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Include examples of usage if applicable
- Ensure all tests pass (when available)

## Reporting Issues

When reporting issues, please include:

- Node.js version
- Normal CLI version
- Database type and version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages (if any)

## Feature Requests

Feature requests are welcome! Please:

- Check if the feature already exists
- Describe the feature clearly
- Explain the use case
- Provide examples if possible

## Questions?

- Open an issue for questions
- Check existing issues and PRs
- Review the README for documentation

## License

By contributing to Normal CLI, you agree that your contributions will be licensed under the MIT License.
