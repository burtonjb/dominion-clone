/*
A basic screen wrapping the nodejs tty functions
*/
export class BaseTerminalScreen {
  private outStream: NodeJS.WriteStream;

  constructor(stream?: NodeJS.WriteStream) {
    if (stream) {
      this.outStream = stream;
    } else {
      this.outStream = process.stdout;
    }
  }

  clear(): void {
    this.setCursor(0, 0);
    this.outStream.clearScreenDown();
  }

  clearLine(column: number, row: number): void {
    this.outStream.cursorTo(column, row);
    this.outStream.clearLine(0);
  }

  getCursor(): [number, number] {
    throw new Error("Method not implemented.");
  }

  setCursor(column: number, row: number): void {
    this.outStream.cursorTo(column, row);
  }

  getSize(): [number, number] {
    return this.outStream.getWindowSize();
  }

  putString(column: number, row: number, c: string): void {
    this.setCursor(column, row);
    this.outStream.write(c);
  }

  // See https://nodejs.org/docs/latest-v16.x/api/tty.html#writestreamgetcolordepthenv for how it works
  getSupportedColors(): number {
    return this.outStream.getColorDepth();
  }
}
