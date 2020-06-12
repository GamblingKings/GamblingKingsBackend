export class Logger {
  static SEPARATOR = '- '.repeat(30);

  static createLogTitle(filename: string): void {
    console.log(`\n\n${this.SEPARATOR} Running ${filename} function ${this.SEPARATOR}`);
  }
}
