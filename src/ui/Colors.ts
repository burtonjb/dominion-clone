import fs from "node:fs";

export interface XTermColor {
  readonly colorId: number;
  readonly hexString: string;
  readonly rgb: { r: number; g: number; b: number };
  readonly hsl: { h: number; s: number; l: number };
  readonly name: string;
}

let xtermConfigFilePath = "./src/ui/data/XtermColors.json";
if (process.env["COLORS_FILE_PATH"]) {
  xtermConfigFilePath = process.env["COLORS_FILE_PATH"];
}

const colorsFileContent = fs.readFileSync(xtermConfigFilePath, { encoding: "utf8" });
const COLORS_DATA = JSON.parse(colorsFileContent) as Array<XTermColor>;

export class XTermColors {
  data = COLORS_DATA.slice();
  map: Map<string, XTermColor>;

  constructor() {
    this.map = new Map();
    this.data.forEach((d) => {
      this.map.set(d.name, d);
    });
  }

  get(index: number): XTermColor {
    if (index < 0 || index > this.data.length) throw new Error("Unsupported color index");
    return this.data[index];
  }

  getByName(name: string): XTermColor | undefined {
    return this.map.get(name);
  }

  fromRGB(r: number, g: number, b: number): XTermColor {
    const colorDistances = this.data.map((d) => (d.rgb.r - r) ** 2 + (d.rgb.g - g) ** 2 + (d.rgb.b - b) ** 2);
    const minDistance = Math.min(...colorDistances);
    const index = colorDistances.indexOf(minDistance);
    return this.get(index);
  }
}

const xtermColors = new XTermColors();

export { xtermColors };
