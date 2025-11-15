/**
 * Simple logger utility
 */
export class Logger {
  constructor(private verbose: boolean = false) {}

  info(message: string, ...args: any[]): void {
    if (this.verbose) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (this.verbose) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }
}

export const logger = new Logger(process.env.VERBOSE === 'true');
