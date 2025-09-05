# cueCLI Features

## 🚀 Execution-First Design

### The Core Philosophy
cueCLI treats every prompt as a **living command** ready to execute, not dead text to copy. This fundamental shift makes your workflow more intentional and powerful.

### How It Works
```
╔═══════════════════════════════════════════════════════════╗
║ PROMPT READY FOR EXECUTION                               ║
╚═══════════════════════════════════════════════════════════╝

  Name:    your-prompt
  Status:  ● Ready
  Metrics: 42 lines • 1,337 chars

  ┌─ Preview ───────────────────────────────────────────────┐
  │ [Smart 8-line preview of your prompt]                    │
  └──────────────────────────────────────────────────────────┘

  ▶ Execute prompt? (y/n)
```

Every command (`get`, `add`, `edit`) flows through this consistent interface, making cueCLI feel like a command launcher, not a text manager.

## Core Features

### 1. Intelligent Execution Flow
- **Automatic clipboard copy** - Happens silently in background
- **Execution presentation** - Clean interface for every prompt
- **Smart preview** - Shows first 4 and last 3 lines for long prompts
- **Safety confirmation** - Always asks before execution
- **Consistent experience** - Same interface across all commands

### 2. Prompt Management
- Store unlimited prompts locally
- Version control for each prompt
- Automatic backup before modifications
- Tag-based organization
- Search and filter capabilities

### 3. Variable Substitution
- Support for `{{VARIABLE}}` and `${VARIABLE}` syntax
- Dynamic value replacement at runtime
- Variable detection and validation
- Multi-variable support
- Works seamlessly with execution flow

### 4. Data Sanitization
- Automatic detection of sensitive data
- Configurable sanitization rules
- Protects before execution
- Support for:
  - API keys and tokens
  - Passwords and credentials
  - SSH private keys
  - Credit card numbers
  - Email addresses
  - URLs with embedded credentials

### 5. Flexible Output Modes
When you need specific behavior:
```bash
cuecli get prompt --stdout     # Direct terminal output
cuecli get prompt --pipe       # Clean piping
cuecli get prompt --file out.sh # Save to file
cuecli get prompt --execute     # Skip interface, run immediately
```

### 6. Import/Export
- JSON format for easy sharing
- Markdown export for documentation
- Bulk operations support
- Merge strategies for conflicts
- Sanitization during export

## Command Behaviors

### `get` Command
- **Default**: Shows execution interface
- **With flags**: Respects specific output modes
- **Always**: Copies to clipboard silently

### `add` Command
- Saves new prompt
- Immediately presents for execution
- Perfect for test-and-iterate workflow

### `edit` Command  
- Opens in editor
- After save: presents for execution
- Natural edit-test cycle

## Advanced Features

### 1. Template System
- Reusable prompt templates
- Variable placeholders
- Default values support
- Template inheritance
- Execution-ready templates

### 2. Shell Integration
- Direct shell execution
- Cross-platform support
- Exit code reporting
- Output streaming
- Process control

### 3. Clipboard Integration
- Automatic clipboard copy
- Multi-platform support
- Silent operation
- Fallback mechanisms

### 4. Configuration
- Environment variables support
- Custom config directory
- Editor preferences
- Logging levels
- Execution preferences

## The cueCLI Difference

Traditional prompt managers:
```
Retrieve → Copy → Switch Context → Paste → Execute
```

cueCLI workflow:
```
Retrieve → Review → Execute (or just paste - it's already copied)
```

This isn't just about saving steps - it's about treating prompts as **actionable commands** from the moment you retrieve them.

## Support the Project

Your support and feedback drive the evolution of cueCLI. If you find it useful, please consider supporting its development.

## Design Principles

1. **Every prompt is executable** - Default mindset
2. **Safety first** - Always confirm before execution  
3. **Zero friction** - Clipboard copy is automatic
4. **Respect intent** - Flags override defaults
5. **Consistent experience** - Same interface everywhere

## Feature Requests

To request a new feature, please [open an issue](https://github.com/cuecli/cueCLI/issues) on GitHub.