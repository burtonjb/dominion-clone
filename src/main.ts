import { createGame } from "./di/CreateGame";

function main() {
  const game = createGame(2, 1337);
  console.log(game);
}

main();
