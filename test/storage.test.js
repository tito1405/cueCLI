import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { LocalStorage } from '../src/storage/local.js';

describe('LocalStorage', () => {
  let storage;
  let testDir;

  before(() => {
    // Create test directory
    testDir = path.join(os.tmpdir(), 'cuecli-test-' + Date.now());
    process.env.CUECLI_CONFIG_DIR = testDir;
    
    // Create new storage instance
    storage = new LocalStorage();
  });

  after(() => {
    // Clean up test directory
    fs.removeSync(testDir);
    delete process.env.CUECLI_CONFIG_DIR;
  });

  describe('initialization', () => {
    it('should create config directory', () => {
      assert(fs.existsSync(testDir));
    });

    it('should create prompts file', () => {
      const promptsFile = path.join(testDir, 'prompts.json');
      assert(fs.existsSync(promptsFile));
    });

    it('should initialize with default data', () => {
      const data = storage.read();
      assert(data.prompts);
      assert(data.config);
      assert(data.config.createdAt);
    });
  });

  describe('prompt operations', () => {
    it('should add a new prompt', () => {
      const prompt = storage.setPrompt('test-prompt', {
        content: 'This is a test prompt',
        tags: ['test'],
        variables: ['VAR1']
      });

      assert.equal(prompt.name, 'test-prompt');
      assert.equal(prompt.content, 'This is a test prompt');
      assert.equal(prompt.version, 1);
      assert(prompt.created);
      assert(prompt.modified);
    });

    it('should get an existing prompt', () => {
      const prompt = storage.getPrompt('test-prompt');
      assert(prompt);
      assert.equal(prompt.content, 'This is a test prompt');
    });

    it('should return null for non-existent prompt', () => {
      const prompt = storage.getPrompt('non-existent');
      assert.equal(prompt, null);
    });

    it('should update an existing prompt', () => {
      const updated = storage.setPrompt('test-prompt', {
        content: 'Updated content',
        tags: ['test', 'updated']
      });

      assert.equal(updated.content, 'Updated content');
      assert.equal(updated.version, 2);
      assert.deepEqual(updated.tags, ['test', 'updated']);
    });

    it('should delete a prompt', () => {
      const result = storage.deletePrompt('test-prompt');
      assert(result);
      
      const prompt = storage.getPrompt('test-prompt');
      assert.equal(prompt, null);
    });

    it('should return false when deleting non-existent prompt', () => {
      const result = storage.deletePrompt('non-existent');
      assert(!result);
    });
  });

  describe('prompt filtering', () => {
    before(() => {
      // Add test prompts
      storage.setPrompt('prompt1', {
        content: 'Prompt 1',
        tags: ['code', 'review']
      });
      
      storage.setPrompt('prompt2', {
        content: 'Prompt 2',
        tags: ['debug', 'test']
      });
      
      storage.setPrompt('prompt3', {
        content: 'Prompt 3',
        tags: ['code', 'test']
      });
    });

    it('should get all prompts', () => {
      const prompts = storage.getAllPrompts();
      assert(Object.keys(prompts).length >= 3);
    });

    it('should filter prompts by tags', () => {
      const codePrompts = storage.getPromptsByTags(['code']);
      const keys = Object.keys(codePrompts);
      assert(keys.includes('prompt1'));
      assert(keys.includes('prompt3'));
      assert(!keys.includes('prompt2'));
    });

    it('should filter prompts by multiple tags', () => {
      const filtered = storage.getPromptsByTags(['test', 'review']);
      const keys = Object.keys(filtered);
      assert(keys.includes('prompt1'));
      assert(keys.includes('prompt2'));
      assert(keys.includes('prompt3'));
    });

    it('should return all prompts when no tags provided', () => {
      const prompts = storage.getPromptsByTags([]);
      assert(Object.keys(prompts).length >= 3);
    });
  });

  describe('config operations', () => {
    it('should get config', () => {
      const config = storage.getConfig();
      assert(config);
      assert(config.defaultEditor);
    });

    it('should update config', () => {
      const updated = storage.updateConfig({
        defaultEditor: 'vim',
        customField: 'test'
      });

      assert.equal(updated.defaultEditor, 'vim');
      assert.equal(updated.customField, 'test');
    });

    it('should persist config updates', () => {
      const config = storage.getConfig();
      assert.equal(config.defaultEditor, 'vim');
      assert.equal(config.customField, 'test');
    });
  });

  describe('backup operations', () => {
    it('should create backup', () => {
      storage.createBackup();
      const backupDir = path.join(testDir, 'backups');
      const files = fs.readdirSync(backupDir);
      const backupFiles = files.filter(f => f.startsWith('prompts-'));
      assert(backupFiles.length > 0);
    });

    it('should cleanup old backups', () => {
      // Create multiple backups
      for (let i = 0; i < 15; i++) {
        storage.createBackup();
      }

      storage.cleanupBackups();
      
      const backupDir = path.join(testDir, 'backups');
      const files = fs.readdirSync(backupDir);
      const backupFiles = files.filter(f => f.startsWith('prompts-'));
      
      // Should keep only 10 most recent
      assert(backupFiles.length <= 10);
    });
  });

  describe('existence checks', () => {
    before(() => {
      storage.setPrompt('exists', { content: 'This exists' });
    });

    it('should return true for existing prompt', () => {
      assert(storage.promptExists('exists'));
    });

    it('should return false for non-existing prompt', () => {
      assert(!storage.promptExists('does-not-exist'));
    });
  });

  describe('error handling', () => {
    it('should handle corrupted prompts file', () => {
      const promptsFile = path.join(testDir, 'prompts.json');
      fs.writeFileSync(promptsFile, 'invalid json');
      
      const data = storage.read();
      assert(data.prompts);
      assert(data.config);
    });
  });
});