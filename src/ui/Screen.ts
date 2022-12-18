import { TextCharacter } from "./TextCharacter";
import { TextImage } from "./TextImage";

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

  // draws an image to the screen
  drawImage(topLeftColumn: number, topLeftRow: number, image: TextImage): void;

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
    return this.stdout.getWindowSize();
  }

  setCharacter(column: number, row: number, c: string | TextCharacter): void {
    if (c instanceof TextCharacter) {
      c = c.format();
    }
    this.setCursor(column, row);
    this.stdout.write(c);
  }

  drawImage(topLeftColumn: number, topLeftRow: number, image: TextImage): void {
    for (let i = 0; i < image.columns; i++) {
      for (let j = 0; j < image.rows; j++) {
        const c = image.get(i, j);
        if (!c) continue;
        this.setCharacter(i + topLeftColumn, j + topLeftRow, c);
      }
    }
  }

  draw(): void {
    // no back-buffer, will do nothing since setCharacter will immediately write
  }

  // See https://nodejs.org/docs/latest-v16.x/api/tty.html#writestreamgetcolordepthenv for how it works
  getSupportedColors(): number {
    return this.stdout.getColorDepth();
  }
}

/*
A screen that wraps a base screen with a back-buffer
*/
export class BufferedScreen implements Screen {
  private buffer: Array<Array<TextCharacter | undefined>>;
  private cursor: [number, number] = [0, 0];
  private columns: number;
  private rows: number;

  constructor(private readonly baseScreen: Screen, columns?: number, rows?: number) {
    this.columns = columns ? columns : this.baseScreen.getSize()[0];
    this.rows = rows ? rows : this.baseScreen.getSize()[1];
    this.buffer = new Array(this.columns).fill(undefined).map((v) => new Array(this.rows).fill(undefined));
  }

  clear(): void {
    this.cursor = [0, 0];
    this.buffer.forEach((column) => {
      column.forEach((row) => (row = undefined));
    });
    this.baseScreen.clear();
  }

  getCursor(): [number, number] {
    return this.cursor;
  }
  setCursor(column: number, row: number): void {
    this.cursor = [column, row];
  }
  getSize(): [number, number] {
    return [this.buffer.length, this.buffer[0].length];
  }
  setCharacter(column: number, row: number, c: TextCharacter): void {
    this.buffer[column][row] = c;
  }
  drawImage(topLeftColumn: number, topLeftRow: number, image: TextImage): void {
    for (let i = 0; i < image.columns; i++) {
      for (let j = 0; j < image.rows; j++) {
        const c = image.get(i, j);
        if (!c) continue;
        this.setCharacter(i + topLeftColumn, j + topLeftRow, c);
      }
    }
  }
  draw(): void {
    this.buffer.forEach((c, column) => {
      c.forEach((r, row) => {
        const c = this.buffer[column][row];
        if (c) this.baseScreen.setCharacter(column, row, c);
      });
    });
  }
}
