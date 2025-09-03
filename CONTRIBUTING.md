# Contributing to cueCli

First off, thank you for considering contributing to cueCli! It's people like you that make cueCli such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept feedback gracefully

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and expected**
- **Include screenshots if relevant**
- **Include your environment details** (OS, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed enhancement**
- **Explain why this enhancement would be useful**
- **List any alternatives you've considered**

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Add tests** for any new functionality
4. **Ensure all tests pass** with `npm test`
5. **Update documentation** as needed
6. **Submit your pull request**

## Development Process

### Setup

```bash
# Clone your fork
git clone https://github.com/your-username/cuecli.git
cd cuecli

# Add upstream remote
git remote add upstream https://github.com/alexkisin/cuecli.git

# Install dependencies
npm install

# Create a feature branch
git checkout -b feature/your-feature-name
```

### Development Workflow

1. **Write code** following our style guide
2. **Write tests** for your changes
3. **Run tests** frequently during development
4. **Commit** with clear, descriptive messages
5. **Push** to your fork
6. **Create PR** with detailed description

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Format code
npm run format
```

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Maintenance tasks

Examples:
```
feat: add support for prompt templates
fix: resolve clipboard error on Windows
docs: update installation instructions
```

## Style Guide

### JavaScript Style

- **ES6+ features** preferred
- **2 spaces** for indentation
- **Single quotes** for strings
- **Semicolons** required
- **Trailing commas** in multi-line objects/arrays
- **Descriptive variable names**
- **JSDoc comments** for functions

Example:
```javascript
/**
 * Get a prompt by name
 * @param {string} name - The prompt name
 * @returns {Object|null} The prompt object or null
 */
export function getPrompt(name) {
  const prompts = loadPrompts();
  return prompts[name] || null;
}
```

### File Structure

```
src/
├── commands/       # CLI commands
├── storage/        # Storage implementations
├── utils/          # Utility functions
├── config/         # Configuration management
└── plugins/        # Plugin system
```

### Testing Standards

- Write tests for all new features
- Maintain test coverage above 80%
- Use descriptive test names
- Test edge cases and error conditions
- Mock external dependencies

## Project Structure

### Key Files

- `bin/cuecli.js` - CLI entry point
- `src/storage/local.js` - Local storage implementation
- `src/config/config.js` - Configuration management
- `src/utils/logger.js` - Logging utility
- `test/` - Test files

### Dependencies

Keep dependencies minimal. Before adding a new dependency:

1. Check if existing dependencies can solve the problem
2. Evaluate the dependency's maintenance status
3. Consider the impact on bundle size
4. Discuss in an issue if it's a major dependency

## Release Process

1. **Version bump** following semver
2. **Update CHANGELOG.md**
3. **Create release PR**
4. **Merge after review**
5. **Tag release**
6. **Publish to npm**

## Getting Help

- **Discord**: Join our community server
- **GitHub Discussions**: Ask questions and share ideas
- **Issues**: Report bugs or request features
- **Twitter**: Follow @cuecli for updates

## Recognition

Contributors are recognized in:

- README.md contributors section
- GitHub contributors page
- Release notes
- Project website

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue or reach out to the maintainers. We're here to help!

---

Thank you for contributing to cueCli! 🎉