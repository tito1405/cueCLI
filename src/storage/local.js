import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const getConfigDir = () => process.env.CUECLI_CONFIG_DIR || path.join(os.homedir(), '.cuecli');
const getPromptsFile = () => path.join(getConfigDir(), 'prompts.json');
const getBackupDir = () => path.join(getConfigDir(), 'backups');

export class LocalStorage {
  constructor() {
    this.ensureConfigDir();
  }

  ensureConfigDir() {
    fs.ensureDirSync(getConfigDir());
    fs.ensureDirSync(getBackupDir());
    
    // Initialize prompts file if it doesn't exist
    if (!fs.existsSync(getPromptsFile())) {
      this.initializeStorage();
    }
  }

  initializeStorage() {
    const initialData = {
      prompts: {},
      config: {
        defaultEditor: process.env.EDITOR || 'code',
        syncEnabled: false,
        apiKey: null,
        createdAt: new Date().toISOString()
      }
    };
    fs.writeJsonSync(getPromptsFile(), initialData, { spaces: 2 });
  }

  // Read all data
  read() {
    try {
      return fs.readJsonSync(getPromptsFile());
    } catch (error) {
      console.error('Error reading prompts file:', error.message);
      this.initializeStorage();
      return fs.readJsonSync(getPromptsFile());
    }
  }

  // Write all data
  write(data) {
    // Create backup before writing
    this.createBackup();
    fs.writeJsonSync(getPromptsFile(), data, { spaces: 2 });
  }

  // Get all prompts
  getAllPrompts() {
    const data = this.read();
    return data.prompts || {};
  }

  // Get a specific prompt
  getPrompt(name) {
    const prompts = this.getAllPrompts();
    return prompts[name] || null;
  }

  // Add or update a prompt
  setPrompt(name, promptData) {
    const data = this.read();
    const now = new Date().toISOString();
    
    if (!data.prompts) {
      data.prompts = {};
    }

    // Check if prompt exists to determine version
    const existingPrompt = data.prompts[name];
    const version = existingPrompt ? (existingPrompt.version || 0) + 1 : 1;

    data.prompts[name] = {
      ...promptData,
      name,
      created: existingPrompt?.created || now,
      modified: now,
      version
    };

    this.write(data);
    return data.prompts[name];
  }

  // Delete a prompt
  deletePrompt(name) {
    const data = this.read();
    if (data.prompts && data.prompts[name]) {
      delete data.prompts[name];
      this.write(data);
      return true;
    }
    return false;
  }

  // Get config
  getConfig() {
    const data = this.read();
    return data.config || {};
  }

  // Update config
  updateConfig(updates) {
    const data = this.read();
    data.config = {
      ...data.config,
      ...updates
    };
    this.write(data);
    return data.config;
  }

  // Create backup
  createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(getBackupDir(), `prompts-${timestamp}.json`);
      fs.copySync(getPromptsFile(), backupFile);
      
      // Keep only last 10 backups
      this.cleanupBackups();
    } catch (error) {
      console.warn('Failed to create backup:', error.message);
    }
  }

  // Cleanup old backups
  cleanupBackups() {
    try {
      const files = fs.readdirSync(getBackupDir())
        .filter(f => f.startsWith('prompts-') && f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(getBackupDir(), f),
          time: fs.statSync(path.join(getBackupDir(), f)).mtime
        }))
        .sort((a, b) => b.time - a.time);

      // Keep only the 10 most recent backups
      files.slice(10).forEach(file => {
        fs.removeSync(file.path);
      });
    } catch (error) {
      console.warn('Failed to cleanup backups:', error.message);
    }
  }

  // Check if prompt exists
  promptExists(name) {
    const prompts = this.getAllPrompts();
    return name in prompts;
  }

  // Filter prompts by tags
  getPromptsByTags(tags) {
    const prompts = this.getAllPrompts();
    if (!tags || tags.length === 0) {
      return prompts;
    }

    const filtered = {};
    for (const [name, prompt] of Object.entries(prompts)) {
      if (prompt.tags && prompt.tags.some(tag => tags.includes(tag))) {
        filtered[name] = prompt;
      }
    }
    return filtered;
  }
}

export default new LocalStorage();