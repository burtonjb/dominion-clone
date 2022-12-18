import { XTermColor } from "./Colors";

export class TextCharacter {
  // Technically this class is an XTermTextCharacter, but I don't expect to support other
  // console colors in the near future, so leaving it as is.
  constructor(
    public readonly s: string,
    public readonly foregroundColor?: XTermColor,
    public readonly backgroundColor?: XTermColor
  ) {}

  // Formats the character as a ANSI escaped string
  format(): string {
    let out = this.s;
    if (this.foregroundColor) {
      out = `\x1b[38;5;${this.foregroundColor.colorId}m${out}\x1b[0m`;
    }
    if (this.backgroundColor) {
      out = `\x1b[48;5;${this.backgroundColor.colorId}m${out}\x1b[0m`;
    }
    return out;
  }
}
