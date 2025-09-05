import executor from './executor.js';
import { copyToClipboard } from '../utils/clipboard.js';

/**
 * Command Wrapper - Standardizes all command outputs
 * Philosophy: Every command output flows through execution presentation
 * This ensures consistency across the entire CLI experience
 */
export class CommandWrapper {
  /**
   * Wrap any command to follow execution-first pattern
   */
  static async wrap(commandFn, options = {}) {
    const {
      skipExecution = false,  // For commands that shouldn't offer execution
      autoExecute = false,    // For power users who always want to execute
    } = options;

    return async function wrappedCommand(...args) {
      // Run the original command logic
      const result = await commandFn.apply(this, args);
      
      // If command returns prompt content, present for execution
      if (result && result.content && result.name) {
        if (skipExecution) {
          // Just copy silently for non-executable contexts
          await copyToClipboard(result.content);
          return result;
        }
        
        if (autoExecute) {
          // Power user mode - execute immediately
          await executor.quickExecute(result.content, result.name);
        } else {
          // Standard flow - present for execution
          await executor.present(result.name, result.content, result.metadata || {});
        }
      }
      
      return result;
    };
  }

  /**
   * Transform a command to always offer execution
   */
  static executionFirst(name, content, metadata = {}) {
    return {
      name,
      content,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Handle command completion with execution option
   */
  static async complete(promptName, content, action = 'completed') {
    const metadata = {
      action,
      source: 'command',
      modified: action === 'edited'
    };
    
    await executor.present(promptName, content, metadata);
  }
}

export default CommandWrapper;