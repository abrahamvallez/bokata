import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * Command loader - loads command definitions from markdown files
 */
export class CommandLoader {
  private static commandsDir = path.join(__dirname, '../../commands');

  /**
   * Load a command file
   */
  static loadCommand(commandName: string): {
    content: string;
    metadata: {
      description?: string;
    };
  } {
    const commandPath = path.join(this.commandsDir, `${commandName}.md`);

    if (!fs.existsSync(commandPath)) {
      throw new Error(`Command file not found: ${commandPath}`);
    }

    const fileContent = fs.readFileSync(commandPath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      content: content.trim(),
      metadata: data as any
    };
  }

  /**
   * Get list of available commands
   */
  static getAvailableCommands(): string[] {
    if (!fs.existsSync(this.commandsDir)) {
      return [];
    }

    return fs
      .readdirSync(this.commandsDir)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''));
  }
}
