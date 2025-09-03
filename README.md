# cueCli - AI Prompt Management CLI

A powerful, blazing-fast command-line tool for managing, organizing, and reusing AI prompts across different chat sessions. Built for developers who want to maintain consistency and efficiency in their AI interactions.

## Features

- **Prompt Storage**: Save and organize reusable prompts locally
- **Variable Substitution**: Use dynamic variables in prompts for flexibility
- **Tag-based Organization**: Categorize prompts with tags for easy discovery
- **Clipboard Integration**: Quick copy-to-clipboard functionality
- **Backup System**: Automatic backups of your prompt library
- **Extensible Architecture**: Plugin support for custom functionality
- **Cross-platform**: Works on macOS, Linux, and Windows
- **Blazing Fast**: Commands execute in <100ms

## Installation

### Via npm (recommended)

```bash
npm install -g cuecli
```

### From source

```bash
git clone https://github.com/alexkisin/cuecli
cd cuecli
npm install
npm link
```

## Quick Start

```bash
# Add a prompt
cuecli add my-project --from-file README.md

# Get a prompt (copies to clipboard)
cuecli get my-project

# List all prompts
cuecli list

# Get with variable substitution
cuecli get my-project --vars PROJECT_PATH=/Users/alex/project API_KEY=sk-123
```

## Core Commands

### `cuecli get <name>`
Copy a prompt to your clipboard, ready to paste into Claude.

Options:
- `--vars KEY=value...` - Substitute template variables
- `--stdout` - Output to terminal instead of clipboard

### `cuecli list`
Display all saved prompts with metadata.

Options:
- `--tags <tags...>` - Filter by tags
- `--json` - Output as JSON

### `cuecli add <name>`
Create a new prompt.

Options:
- `--from-file <path>` - Import from file
- `--from-clipboard` - Import from clipboard
- `--tags <tags...>` - Add tags for organization

## Template Variables

Use `{{VARIABLE}}` or `${VARIABLE}` syntax in your prompts:

```markdown
Project: {{PROJECT_NAME}}
Path: {{PROJECT_PATH}}
Environment: ${ENV}
```

Then substitute when retrieving:
```bash
cuecli get my-template --vars PROJECT_NAME="CueSesh" PROJECT_PATH=/Users/alex/cuesesh ENV=production
```

## Storage

Prompts are stored in `~/.cuecli/prompts.json` with automatic backups.

## Performance

- Commands execute in <100ms
- Zero network dependencies
- Minimal resource usage
- Works completely offline

## Examples

### Save CueSesh Context
```bash
# Add from file
cuecli add cuesesh --from-file ./CUESESH_CONTEXT.md --tags react redux audio

# Use in Claude
cuecli get cuesesh
# Paste into Claude chat
```

### Create Reusable Templates
```bash
# Create a debug template
echo "Debug {{SERVICE}} at {{TIMESTAMP}} with log level {{LEVEL}}" | cuecli add debug-template --from-clipboard

# Use with variables
cuecli get debug-template --vars SERVICE=auth TIMESTAMP="2024-09-01" LEVEL=verbose
```

## Configuration

cueCli stores configuration and prompts in `~/.cuecli/`:

```
~/.cuecli/
├── config.json       # Global configuration
├── prompts.json      # Your prompt library
├── backups/          # Automatic backups
├── templates/        # Prompt templates
└── plugins/          # Custom plugins
```

### Environment Variables

- `CUECLI_CONFIG_DIR`: Override default config directory
- `EDITOR`: Default editor for prompt editing
- `LOG_LEVEL`: Set logging level (ERROR, WARN, INFO, DEBUG, TRACE)
- `NO_COLOR`: Disable colored output

## Development

### Setup

```bash
git clone https://github.com/alexkisin/cuecli
cd cuecli
npm install
```

### Testing

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Roadmap

- [ ] Cloud sync support (GitHub, GitLab, custom)
- [ ] AI-powered prompt suggestions
- [ ] Prompt chaining and workflows
- [ ] Interactive prompt builder
- [ ] VSCode extension
- [ ] Web dashboard
- [ ] Team collaboration features
- [ ] Prompt marketplace

## Contributing

Contributions welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

## License

MIT © Alex Kisin

## Support

- **Documentation**: [https://cuecli.com/docs](https://cuecli.com/docs)
- **Issues**: [GitHub Issues](https://github.com/alexkisin/cuecli/issues)
- **Discussions**: [GitHub Discussions](https://github.com/alexkisin/cuecli/discussions)
- **Website**: [cuecli.com](https://cuecli.com)

## Acknowledgments

Built with:
- [Commander.js](https://github.com/tj/commander.js/) - CLI framework
- [Chalk](https://github.com/chalk/chalk) - Terminal styling
- [Clipboardy](https://github.com/sindresorhus/clipboardy) - Clipboard access
- [fs-extra](https://github.com/jprichardson/node-fs-extra) - File system utilities

## Author

Created by Alex Kisin

---

**Star this repo** if you find it helpful!