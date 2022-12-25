import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
const rl = readline.createInterface({ input, output });

// TODO: fix this, figure out what's wrong with promisify and use that instead
export const question = (prompt: string) =>
  new Promise<string>((resolve) =>
    rl.question(prompt, (input) => {
      // rl.close()
      resolve(input);
    })
  );

export { rl };
