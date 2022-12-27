import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
const rl = readline.createInterface({ input, output });

// FIXME: question shouldn't take in a prompt anymore - its being handled by the game screen
export const question = (prompt: string) =>
  new Promise<string>((resolve) =>
    rl.question(prompt, (input) => {
      // rl.close()
      resolve(input);
    })
  );

export { rl };
