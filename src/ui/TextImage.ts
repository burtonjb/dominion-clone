import { XTermColor } from "./Colors";
import { TextCharacter } from "./TextCharacter";

/*
A 2D image built out of text information. 
Each "Pixel" maintains the position, string, and color information associated with it

Each image can be drawn onto a screen
*/
export class TextImage {
  private buffer: Array<Array<TextCharacter | undefined>>;

  constructor(public readonly columns: number, public readonly rows: number) {
    this.buffer = new Array(this.columns).fill(undefined).map((v) => new Array(this.rows).fill(undefined));
  }

  size(): [number, number] {
    return [this.columns, this.rows];
  }

  get(column: number, row: number): TextCharacter | undefined {
    return this.buffer[column][row];
  }

  set(column: number, row: number, c: TextCharacter | undefined) {
    this.buffer[column][row] = c;
  }

  // Copies another text image onto this image
  drawImage(topLeftColumn: number, topLeftRow: number, image: TextImage) {
    for (let i = 0; i < this.columns; i++) {
      for (let j = 0; j < this.rows; j++) {
        this.set(i + topLeftColumn, j + topLeftRow, image.get(i, j));
      }
    }
  }

  // returns a copy of this image
  copy(): TextImage {
    const out = new TextImage(this.columns, this.rows);
    out.drawImage(0, 0, this);
    return out;
  }
}

class TextImageFactory {
  fromString(s: string, fgColor?: XTermColor, bgColor?: XTermColor): TextImage {
    const out = new TextImage(s.length, 1);
    for (let i = 0; i < s.length; i++) {
      out.set(i, 0, new TextCharacter(s[i], fgColor, bgColor));
    }
    return out;
  }
}

const textImageFactory = new TextImageFactory();

export { textImageFactory };
