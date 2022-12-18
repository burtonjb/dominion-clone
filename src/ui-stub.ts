import { xtermColors } from "./ui/Colors";
import { BaseTerminalScreen } from "./ui/Screen";
import { TextCharacter } from "./ui/TextCharacter";

async function main() {
  const screen = new BaseTerminalScreen();
  screen.clear();
  const [x, y] = screen.getSize();
  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      const char = ((i + j) % 10) + "";
      const t = new TextCharacter(char, xtermColors.get((i + j) % 255));
      screen.setCharacter(i, j, t);
    }
  }
}

main();
