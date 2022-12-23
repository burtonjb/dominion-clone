import { createGame } from "./di/CreateGame";
import { CardType } from "./domain/objects/Card";
import { Game, TurnPhase } from "./domain/objects/Game";
import { question } from "./util/PromiseExtensions";
import { GameScreen } from "./ui/GameScreen";
import { BaseTerminalScreen } from "./ui/Terminal";
import { AiPlayerInput } from "./domain/objects/PlayerInput";

async function main() {
  const game = createGame(1, new Date().getTime());

  const showDebugInfoInUi = process.argv.some((arg) => arg.toUpperCase() == "DEBUG");

  const gameScreen = new GameScreen(new BaseTerminalScreen(), game, showDebugInfoInUi);
  // game.ui = gameScreen;
  game.getActivePlayer().playerInput = new AiPlayerInput()

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
  console.dir(game.calculateWinners(), { depth: 3 });
}

async function handleActionPhase(game: Game, gameScreen: GameScreen) {
  const activePlayer = game.getActivePlayer();

  gameScreen.render();

  let donePlayingActions = !activePlayer.hand.some((card) => card.types.includes(CardType.ACTION));
  let actionsRemaining = activePlayer.actions > 0;

  while (!donePlayingActions && actionsRemaining) {
    gameScreen.render()
    const cardToPlay = await activePlayer.playerInput.chooseActionToPlay(activePlayer, game)
    activePlayer.actions -= 1
    if (cardToPlay == undefined) break;
    if (!cardToPlay.types.includes(CardType.ACTION)) {
      console.error("player input returned a non-action card for playing in the action phase")
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
    gameScreen.render()
    const cardsToPlay = await activePlayer.playerInput.chooseTreasureToPlay(activePlayer, game);
    if (cardsToPlay == undefined || cardsToPlay.length == 0) break
    for (const cardToPlay of cardsToPlay) {
        if (!cardToPlay.types.includes(CardType.TREASURE)) {
        console.error("player input returned a non-treasure card for playing in the buy phase")
        break
      }
      await game.playCard(cardToPlay, activePlayer)
    }
    // End the treasure playing phase if there's no treasures left (to speed up game-play)
    donePlayingTreasures =
      donePlayingTreasures || !activePlayer.hand.some((card) => card.types.includes(CardType.TREASURE));
  }

  gameScreen.render()

  let doneBuying = activePlayer.buys <= 0;

  while (!doneBuying) {
    gameScreen.render();
    
    const pileToBuy = await activePlayer.playerInput.chooseCardToBuy(activePlayer, game)
    if (pileToBuy == undefined) break;
    if (pileToBuy.cards.length == 0 || pileToBuy.cards[0].calculateCost(game) > activePlayer.money) {
      console.error("player input a non-buyable pile")
      break;
    }

    game.buyCard(pileToBuy, activePlayer);

    doneBuying = doneBuying || activePlayer.buys <= 0;
  }
  game.currentPhase = TurnPhase.CLEAN_UP;
}

function handleCleanUpPhase(game: Game) {
  console.log("Cleaning up player: " + game.activePlayerIndex);
  game.cleanUp();
  game.currentPhase = TurnPhase.ACTION;
}

main();
