import { TextCharacter } from "./TextCharacter";

/*
A screen represents the terminal as a bitmap-like surface so that you can effectively draw characters 
onto the screen. They should usually have a back-buffer and then a call to 'draw' will draw the whole 
screen onto the display. 
*/
export interface Screen {
  // clears all characters on the screen and resets the cursor position to 0, 0
  clear(): void;

  // returns the cursor position in (columns, rows)
  getCursor(): [number, number];

  // sets the cursor position to (column, row)
  setCursor(column: number, row: number): void;

  // returns the size of the terminal in (columns, rows)
  getSize(): [number, number];

  // sets a character to the screen
  setCharacter(column: number, row: number, c: string | TextCharacter): void;

  // draws the contents of the back buffer to the actual screen
  draw(): void;
}

/*
A basic screen wrapping the nodejs tty functions
*/
export class BaseTerminalScreen implements Screen {
  private stdout: NodeJS.WriteStream;

  constructor() {
    this.stdout = process.stdout;
  }

  clear(): void {
    this.setCursor(0, 0);
    this.stdout.clearScreenDown();
  }

  getCursor(): [number, number] {
    throw new Error("Method not implemented.");
  }

  setCursor(column: number, row: number): void {
    this.stdout.cursorTo(column, row);
  }

  getSize(): [number, number] {
    return [this.stdout.columns, this.stdout.rows];
  }

  setCharacter(column: number, row: number, c: string | TextCharacter): void {
    if (c instanceof TextCharacter) {
      c = c.format();
    }
    this.setCursor(column, row);
    this.stdout.write(c);
  }

  draw(): void {
    // no back-buffer, will do nothing since setCharacter will immediately write
  }

  // See https://nodejs.org/docs/latest-v16.x/api/tty.html#writestreamgetcolordepthenv for how it works
  getSupportedColors(): number {
    return this.stdout.getColorDepth();
  }
}
