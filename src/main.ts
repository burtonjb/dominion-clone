import { createGame } from "./di/CreateGame";
import { CardType } from "./domain/objects/Card";
import { Game, TurnPhase } from "./domain/objects/Game";
import * as BasicCards from "./config/cards/Basic";
import { question } from "./util/PromiseExtensions";

async function main() {
  const game = createGame(2, new Date().getTime());
  while (!game.isGameFinished()) {
    if (game.currentPhase == TurnPhase.ACTION) {
      game.currentPhase = TurnPhase.BUY; // no-op the action phase for now since I don't have actions
    } else if (game.currentPhase == TurnPhase.BUY) {
      await handleBuyPhase(game);
    } else if (game.currentPhase == TurnPhase.CLEAN_UP) {
      handleCleanUpPhase(game);
    }
  }
  console.dir(game.calculateWinners(), { depth: 3 });
}

// The buy phase is broken up into two parts:
// 1. playing treasures
// 2. and then actually buying cards
async function handleBuyPhase(game: Game) {
  const activePlayer = game.getActivePlayer();
  console.log(activePlayer.infoString());
  let donePlayingTreasures = !activePlayer.hand.some((card) => card.types.includes(CardType.TREASURE)); //skip this if there's no treasures
  while (!donePlayingTreasures) {
    const input = await question(
      `Play a treasure from your hand: ${activePlayer.hand.map((c) => c.name)}, or 'end' to end\n> `
    );
    const inputMatch = new RegExp("^" + input + ".*", "i"); // matcher for options that start with the input
    const matchingCards = activePlayer.hand
      .filter((c) => c.types.includes(CardType.TREASURE))
      .filter((card) => card.name.match(inputMatch));
    const singleMatch = new Set(matchingCards.map((c) => c.name)).size == 1;
    if (input.length > 0 && singleMatch) {
      const matchingCard = matchingCards[0];
      game.playCard(matchingCard, activePlayer);
    } else if (input.toLowerCase() == "all") {
      // play all coppers, silvers, golds
      const m = activePlayer.hand.filter(
        (c) => c.name == BasicCards.Copper.name || c.name == BasicCards.Silver.name || c.name == BasicCards.Gold.name
      );
      m.forEach((c) => game.playCard(c, activePlayer));
    } else if (input.toLowerCase() == "end") {
      donePlayingTreasures = true;
    } else {
      console.log(`Unknown input: ${input}`); // TODO: handle unknowns or handle trying to play cards that cannot be played now
    }
    // End the treasure playing phase if there's no treasures left (to speed up game-play)
    donePlayingTreasures =
      donePlayingTreasures || !activePlayer.hand.some((card) => card.types.includes(CardType.TREASURE));
    console.log(activePlayer.infoString());
  }
  let doneBuying = activePlayer.buys <= 0;
  while (!doneBuying) {
    const input = await question(
      `Buy a treasure from the supply: ${game.supply.allPiles().map((p) => p.name)}, or 'end' to end.\n> `
    );
    const inputMatch = new RegExp("^" + input + ".*", "i"); // matcher for options that start with the input
    const matchingCards = game.supply
      .allPiles()
      .filter((p) => p.cards.length > 0)
      .filter((p) => p.cards[0].cost <= activePlayer.money)
      .filter((p) => p.name.match(inputMatch));
    const singleMatch = new Set(matchingCards.map((c) => c.name)).size == 1;
    if (input.length > 0 && singleMatch) {
      const matchingCard = matchingCards[0];
      game.buyCard(matchingCard, activePlayer);
    } else if (input == "end") {
      doneBuying = true;
    } else {
      console.log(`Unknown input: ${input}`); // TODO: handle unknowns or handle trying to play cards that cannot be played now
    }
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
