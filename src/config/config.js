import fs from 'fs-extra';
import path from 'path';
import os from 'os';

// Configuration class for managing cueCli settings
export class Config {
  constructor() {
    // Default configuration paths
    this.paths = {
      configDir: process.env.CUECLI_CONFIG_DIR || path.join(os.homedir(), '.cuecli'),
      promptsFile: 'prompts.json',
      configFile: 'config.json',
      backupDir: 'backups',
      templatesDir: 'templates',
      pluginsDir: 'plugins'
    };

    // Default configuration values
    this.defaults = {
      version: '1.0.0',
      editor: process.env.EDITOR || process.env.VISUAL || 'code',
      theme: 'auto', // auto, light, dark
      output: {
        format: 'pretty', // pretty, json, plain
        colors: true,
        timestamps: false
      },
      sync: {
        enabled: false,
        provider: null, // github, gitlab, custom
        url: null,
        branch: 'main',
        autoSync: false
      },
      backup: {
        enabled: true,
        maxBackups: 10,
        autoBackup: true
      },
      plugins: {
        enabled: false,
        autoLoad: true,
        directory: null
      },
      telemetry: {
        enabled: false,
        anonymousId: null
      },
      experimental: {
        aiSuggestions: false,
        smartTemplates: false,
        promptChaining: false
      }
    };

    this.config = null;
    this.init();
  }

  // Initialize configuration
  init() {
    this.ensureDirectories();
    this.loadConfig();
  }

  // Ensure all required directories exist
  ensureDirectories() {
    const fullPaths = {
      configDir: this.paths.configDir,
      backupDir: path.join(this.paths.configDir, this.paths.backupDir),
      templatesDir: path.join(this.paths.configDir, this.paths.templatesDir),
      pluginsDir: path.join(this.paths.configDir, this.paths.pluginsDir)
    };

    Object.values(fullPaths).forEach(dir => {
      fs.ensureDirSync(dir);
    });
  }

  // Load configuration from file
  loadConfig() {
    const configPath = this.getConfigPath();
    
    if (fs.existsSync(configPath)) {
      try {
        const fileConfig = fs.readJsonSync(configPath);
        this.config = this.mergeConfig(this.defaults, fileConfig);
      } catch (error) {
        console.warn('Failed to load config, using defaults:', error.message);
        this.config = { ...this.defaults };
      }
    } else {
      this.config = { ...this.defaults };
      this.saveConfig();
    }
  }

  // Save configuration to file
  saveConfig() {
    const configPath = this.getConfigPath();
    try {
      fs.writeJsonSync(configPath, this.config, { spaces: 2 });
    } catch (error) {
      console.error('Failed to save config:', error.message);
    }
  }

  // Merge configurations with deep merge
  mergeConfig(defaults, overrides) {
    const merged = { ...defaults };
    
    for (const key in overrides) {
      if (Object.prototype.hasOwnProperty.call(overrides, key)) {
        if (typeof overrides[key] === 'object' && !Array.isArray(overrides[key]) && overrides[key] !== null) {
          merged[key] = this.mergeConfig(defaults[key] || {}, overrides[key]);
        } else {
          merged[key] = overrides[key];
        }
      }
    }
    
    return merged;
  }

  // Get configuration value
  get(path, defaultValue = null) {
    const keys = path.split('.');
    let value = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  // Set configuration value
  set(path, value) {
    const keys = path.split('.');
    let target = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in target) || typeof target[key] !== 'object') {
        target[key] = {};
      }
      target = target[key];
    }
    
    target[keys[keys.length - 1]] = value;
    this.saveConfig();
  }

  // Reset configuration to defaults
  reset() {
    this.config = { ...this.defaults };
    this.saveConfig();
  }

  // Get full path for a file in config directory
  getPath(file) {
    return path.join(this.paths.configDir, file);
  }

  // Get config file path
  getConfigPath() {
    return path.join(this.paths.configDir, this.paths.configFile);
  }

  // Get prompts file path
  getPromptsPath() {
    return path.join(this.paths.configDir, this.paths.promptsFile);
  }

  // Get backup directory path
  getBackupPath() {
    return path.join(this.paths.configDir, this.paths.backupDir);
  }

  // Validate configuration
  validate() {
    const errors = [];

    // Check sync configuration
    if (this.config.sync.enabled) {
      if (!this.config.sync.provider) {
        errors.push('Sync provider is required when sync is enabled');
      }
      if (!this.config.sync.url && this.config.sync.provider === 'custom') {
        errors.push('Sync URL is required for custom provider');
      }
    }

    // Check plugin configuration
    if (this.config.plugins.enabled && !this.config.plugins.directory) {
      this.config.plugins.directory = path.join(this.paths.configDir, this.paths.pluginsDir);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Export configuration (for debugging/sharing)
  export() {
    return {
      ...this.config,
      paths: this.paths,
      configLocation: this.getConfigPath()
    };
  }

  // Import configuration
  import(configData) {
    try {
      this.config = this.mergeConfig(this.defaults, configData);
      this.saveConfig();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export default new Config();