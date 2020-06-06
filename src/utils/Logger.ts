export class Logger {
  static SEPARATOR = '- '.repeat(30);

  static getFileNameFromPath(pathToFile: string): string {
    const filename = pathToFile.includes('/') ? pathToFile.split('/').pop() : pathToFile.split('\\').pop();
    return filename as string;
  }

  static createLogTitle(pathToFile: string): void {
    const filename = Logger.getFileNameFromPath(pathToFile);
    console.log(`\n\n${this.SEPARATOR} Running ${filename} function ${this.SEPARATOR}`);
  }
}
