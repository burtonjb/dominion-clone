import { createGame } from "./di/CreateGame";
import { CardType } from "./domain/objects/Card";
import { Game, TurnPhase } from "./domain/objects/Game";
import { GameScreen } from "./ui/GameScreen";
import { BaseTerminalScreen } from "./ui/Terminal";
import { AiPlayerInput, HumanPlayerInput } from "./domain/objects/PlayerInput";
import { logger } from "./util/Logger";

process.on("SIGINT", () => {
  // TODO: add some logging on exit
  process.exit(0);
});

async function main() {
  const game = createGame(2, new Date().getTime());
  // TODO: better way to set this up
  game.players[0].playerInput = new HumanPlayerInput();
  game.players[0].name = "human";
  game.players[1].playerInput = new AiPlayerInput();
  game.players[1].name = "AI";

  // log all info for game start (kingdom, seed, cards, starting hands)
  logger.info(`Creating kingdom ${game.supply.allPiles().map((p) => p.name)}`);

  const showDebugInfoInUi = process.argv.some((arg) => arg.toUpperCase() == "DEBUG");

  const gameScreen = new GameScreen(new BaseTerminalScreen(), game, showDebugInfoInUi);
  game.ui = gameScreen;

  while (!game.isGameFinished()) {
    gameScreen.render();

    if (game.currentPhase == TurnPhase.ACTION) {
      await handleActionPhase(game, gameScreen);
    } else if (game.currentPhase == TurnPhase.BUY) {
      await handleBuyPhase(game, gameScreen);
    } else if (game.currentPhase == TurnPhase.CLEAN_UP) {
      handleCleanUpPhase(game);
    }
  }
  // log all info for game end (winners, player score + cards)
  logger.info(`Winners: ${game.calculateWinners().map((p) => p.name)}`);
}

async function handleActionPhase(game: Game, gameScreen: GameScreen) {
  const activePlayer = game.getActivePlayer();

  gameScreen.render();

  let donePlayingActions = !activePlayer.hand.some((card) => card.types.includes(CardType.ACTION));
  let actionsRemaining = activePlayer.actions > 0;

  while (!donePlayingActions && actionsRemaining) {
    gameScreen.render();
    const cardToPlay = await activePlayer.playerInput.chooseActionToPlay(activePlayer, game);
    activePlayer.actions -= 1;
    if (cardToPlay == undefined) break;
    if (!cardToPlay.types.includes(CardType.ACTION)) {
      logger.error("player input returned a non-action card for playing in the action phase");
      break;
    }
    await game.playCard(cardToPlay, activePlayer);

    donePlayingActions = donePlayingActions || !activePlayer.hand.some((card) => card.types.includes(CardType.ACTION));
    actionsRemaining = activePlayer.actions > 0;
  }
  game.currentPhase = TurnPhase.BUY;
}

// The buy phase is broken up into two parts:
// 1. playing treasures
// 2. and then actually buying cards
async function handleBuyPhase(game: Game, gameScreen: GameScreen) {
  const activePlayer = game.getActivePlayer();

  gameScreen.render();

  let donePlayingTreasures = !activePlayer.hand.some((card) => card.types.includes(CardType.TREASURE)); //skip this if there's no treasures
  while (!donePlayingTreasures) {
    gameScreen.render();
    const cardsToPlay = await activePlayer.playerInput.chooseTreasureToPlay(activePlayer, game);
    if (cardsToPlay == undefined || cardsToPlay.length == 0) break;
    for (const cardToPlay of cardsToPlay) {
      if (!cardToPlay.types.includes(CardType.TREASURE)) {
        logger.error("player input returned a non-treasure card for playing in the buy phase");
        break;
      }
      await game.playCard(cardToPlay, activePlayer);
    }
    // End the treasure playing phase if there's no treasures left (to speed up game-play)
    donePlayingTreasures =
      donePlayingTreasures || !activePlayer.hand.some((card) => card.types.includes(CardType.TREASURE));
  }

  gameScreen.render();

  let doneBuying = activePlayer.buys <= 0;

  while (!doneBuying) {
    gameScreen.render();

    const pileToBuy = await activePlayer.playerInput.chooseCardToBuy(activePlayer, game);
    if (pileToBuy == undefined) break;
    if (pileToBuy.cards.length == 0 || pileToBuy.cards[0].calculateCost(game) > activePlayer.money) {
      logger.error("player input a non-buyable pile");
      break;
    }

    game.buyCard(pileToBuy, activePlayer);

    doneBuying = doneBuying || activePlayer.buys <= 0;
  }
  game.currentPhase = TurnPhase.CLEAN_UP;
}

function handleCleanUpPhase(game: Game) {
  game.eventLog.publishEvent({ type: "Cleanup", player: game.getActivePlayer(), turn: game.getActivePlayer().turns });
  game.cleanUp();
  game.currentPhase = TurnPhase.ACTION;
}

main();
