import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
const rl = readline.createInterface({ input, output });

// Make sure to call ui.renderPrompt() before this,
export const question = () =>
  new Promise<string>((resolve) =>
    rl.question("", (input) => {
      // rl.close()
      resolve(input);
    })
  );

export { rl };
