import { BaseTerminalScreen } from "./ui/Terminal";
import { createGame } from "./di/CreateGame";
import { GameScreen } from "./ui/GameScreen";

// test method to test rendering the UI
async function main() {
  const screen = new BaseTerminalScreen();

  const game = createGame(2);

  const gameScreen = new GameScreen(screen, game);
  for (let i = 0; i < 100; i++) {
    game.eventLog.publishEvent({ type: `TestEvent`, content: `event_${i}`, player: game.getActivePlayer() });
  }

  gameScreen.render();
}

main();
