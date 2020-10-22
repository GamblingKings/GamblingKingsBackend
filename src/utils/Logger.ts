export class Logger {
  static SEPARATOR = '- '.repeat(30);

  static createLogTitle(filename: string): void {
    // eslint-disable-next-line no-console
    console.log(`\n\n${this.SEPARATOR} Running ${filename} function ${this.SEPARATOR}`);
  }
}
