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

type Callback<A> = (args: A) => void;

/*
Custom function for promisifying other functions.
utils.promisify assumes the function is of the form f(args, (err, res)),
but some functions don't have an error and this is breaking my code
*/
export function promisify<I, O>(f: (args: I, cb: Callback<O>) => void): (args: I) => Promise<O> {
  return (args: I) =>
    new Promise((resolve) => {
      f(args, (callbackArgs) => {
        resolve(callbackArgs);
      });
    });
}
