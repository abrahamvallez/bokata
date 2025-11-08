import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * Prompt loader - loads exact prompts from markdown files
 */
export class PromptLoader {
  private static promptsDir = path.join(__dirname, '../../agents/bokata-slicer');

  /**
   * Load a prompt file with its frontmatter
   */
  static loadPrompt(promptName: string): {
    content: string;
    metadata: {
      name?: string;
      description?: string;
      model?: string;
      color?: string;
    };
  } {
    const promptPath = path.join(this.promptsDir, `${promptName}.md`);

    if (!fs.existsSync(promptPath)) {
      throw new Error(`Prompt file not found: ${promptPath}`);
    }

    const fileContent = fs.readFileSync(promptPath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      content: content.trim(),
      metadata: data as any
    };
  }

  /**
   * Load all available prompts
   */
  static loadAllPrompts(): Map<string, { content: string; metadata: any }> {
    const prompts = new Map();

    if (!fs.existsSync(this.promptsDir)) {
      throw new Error(`Prompts directory not found: ${this.promptsDir}`);
    }

    const files = fs.readdirSync(this.promptsDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const name = file.replace('.md', '');
      try {
        const prompt = this.loadPrompt(name);
        prompts.set(name, prompt);
      } catch (error) {
        console.warn(`Failed to load prompt ${name}:`, error);
      }
    }

    return prompts;
  }

  /**
   * Get list of available prompt names
   */
  static getAvailablePrompts(): string[] {
    if (!fs.existsSync(this.promptsDir)) {
      return [];
    }

    return fs
      .readdirSync(this.promptsDir)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''));
  }
}
