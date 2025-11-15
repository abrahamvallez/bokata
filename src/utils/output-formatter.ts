import { OutputFormat } from '../types';

/**
 * Output Formatter Utility
 * Formats agent outputs in different formats (Markdown or JSON)
 */
export class OutputFormatter {
  /**
   * Format data based on the specified output format
   * @param data The data to format (can be any type)
   * @param format The desired output format
   * @param pretty Whether to prettify JSON output
   * @returns Formatted string
   */
  static format(data: any, format: OutputFormat = OutputFormat.MARKDOWN, pretty: boolean = true): string {
    switch (format) {
      case OutputFormat.JSON:
        return this.formatJSON(data, pretty);
      case OutputFormat.MARKDOWN:
      default:
        return this.formatMarkdown(data);
    }
  }

  /**
   * Format data as JSON
   * @param data The data to format
   * @param pretty Whether to prettify the output
   * @returns JSON string
   */
  private static formatJSON(data: any, pretty: boolean = true): string {
    if (typeof data === 'string') {
      // Try to parse if it's already a JSON string
      try {
        const parsed = JSON.parse(data);
        return pretty ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed);
      } catch {
        // If it's not valid JSON, wrap it in an object
        return pretty
          ? JSON.stringify({ output: data }, null, 2)
          : JSON.stringify({ output: data });
      }
    }

    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  }

  /**
   * Format data as Markdown
   * @param data The data to format
   * @returns Markdown string
   */
  private static formatMarkdown(data: any): string {
    if (typeof data === 'string') {
      return data;
    }

    // If it's an object, convert to a readable markdown format
    if (typeof data === 'object') {
      return this.objectToMarkdown(data);
    }

    return String(data);
  }

  /**
   * Convert an object to markdown format
   * @param obj The object to convert
   * @param level The heading level (for nested objects)
   * @returns Markdown string
   */
  private static objectToMarkdown(obj: any, level: number = 1): string {
    if (!obj || typeof obj !== 'object') {
      return String(obj);
    }

    let markdown = '';
    const headingPrefix = '#'.repeat(Math.min(level, 6)) + ' ';

    for (const [key, value] of Object.entries(obj)) {
      const formattedKey = this.formatKey(key);

      if (Array.isArray(value)) {
        markdown += `${headingPrefix}${formattedKey}\n\n`;
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            markdown += `${index + 1}. ${this.objectToMarkdown(item, level + 1)}\n`;
          } else {
            markdown += `- ${item}\n`;
          }
        });
        markdown += '\n';
      } else if (value && typeof value === 'object') {
        markdown += `${headingPrefix}${formattedKey}\n\n`;
        markdown += this.objectToMarkdown(value, level + 1) + '\n';
      } else {
        markdown += `**${formattedKey}:** ${value}\n\n`;
      }
    }

    return markdown;
  }

  /**
   * Format a camelCase or snake_case key to Title Case
   * @param key The key to format
   * @returns Formatted key
   */
  private static formatKey(key: string): string {
    // Convert camelCase or snake_case to Title Case
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Detect if a string is JSON
   * @param str The string to check
   * @returns True if the string is valid JSON
   */
  static isJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
}
