import { createGame } from "./di/CreateGame";
import { CardType } from "./domain/objects/Card";
import { Game, TurnPhase } from "./domain/objects/Game";
import { GameScreen } from "./ui/GameScreen";
import { BaseTerminalScreen } from "./ui/Terminal";
import { logger } from "./util/Logger";
import { BigMoneyAiInput } from "./config/input/BaseAiInput";
import { HumanPlayerInput } from "./config/input/HumanInput";
import { rl } from "./util/PromiseExtensions";

async function main() {
  const game = createGame(2, false, new Date().getTime());
  // TODO: better way to set this up
  game.players[0].playerInput = new HumanPlayerInput();
  game.players[0].name = "P1";
  game.players[1].playerInput = new BigMoneyAiInput();
  game.players[1].name = "P2";

  // log all info for game start (kingdom, seed, cards, starting hands)
  logger.info(`Creating kingdom ${game.supply.allPiles().map((p) => p.name)}`);

  const showDebugInfoInUi = process.argv.some((arg) => arg.toUpperCase() == "DEBUG");

  const gameScreen = new GameScreen(new BaseTerminalScreen(), game, showDebugInfoInUi);
  game.ui = gameScreen; // you can leave this unset and then it won't display anything - and leaving it off will speed up bot v bot gameplay

  let isGameFinished = false;
  while (!isGameFinished) {
    game.ui?.render();

    if (game.currentPhase == TurnPhase.ACTION) {
      await handleActionPhase(game);
    } else if (game.currentPhase == TurnPhase.BUY) {
      await handleBuyPhase(game);
    } else if (game.currentPhase == TurnPhase.CLEAN_UP) {
      isGameFinished = await handleCleanUpPhase(game);
    }
  }
  game.ui?.render();

  logger.info(`Winners: ${game.calculateWinners().map((p) => p.name)}`);
  for (const player of game.players) {
    logger.info(gameScreen.formatPlayerOverview(player));
    logger.info(`${player.allCards().map((c) => c.name)}`);
  }
  rl.close();
}

async function handleActionPhase(game: Game) {
  const activePlayer = game.getActivePlayer();

  game.ui?.render();

  let donePlayingActions = !activePlayer.hand.some((card) => card.types.includes(CardType.ACTION));
  let actionsRemaining = activePlayer.actions > 0;

  while (!donePlayingActions && actionsRemaining) {
    game.ui?.render();
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
async function handleBuyPhase(game: Game) {
  const activePlayer = game.getActivePlayer();

  game.ui?.render();

  let donePlayingTreasures = !activePlayer.hand.some((card) => card.types.includes(CardType.TREASURE)); //skip this if there's no treasures
  while (!donePlayingTreasures) {
    game.ui?.render();
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

  game.ui?.render();

  let doneBuying = activePlayer.buys <= 0;

  while (!doneBuying) {
    game.ui?.render();

    const pileToBuy = await activePlayer.playerInput.chooseCardToBuy(activePlayer, game);
    if (pileToBuy == undefined) break;
    if (
      pileToBuy.cards.length == 0 ||
      pileToBuy.cards[0].calculateCost(game) > activePlayer.money ||
      !pileToBuy.cards[0].canBuy(activePlayer, game)
    ) {
      logger.error("player input a non-buyable pile");
      break;
    }

    await game.buyCard(pileToBuy, activePlayer);

    doneBuying = doneBuying || activePlayer.buys <= 0;
  }
  game.currentPhase = TurnPhase.CLEAN_UP;
}

async function handleCleanUpPhase(game: Game) {
  game.eventLog.publishEvent({ type: "Cleanup", player: game.getActivePlayer(), turn: game.getActivePlayer().turns });
  await game.cleanUp();
  if (game.isGameFinished()) {
    return true;
  }
  game.currentPhase = TurnPhase.ACTION;
  return false;
}

main();
