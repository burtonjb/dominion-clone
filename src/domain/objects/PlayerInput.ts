import { question } from "../../util/PromiseExtensions";
import { Card, CardType } from "./Card";
import { Game } from "./Game";
import { Player } from "./Player";
import * as BasicCards from "../../config/cards/Basic"
import { CardPile } from "./CardPile";

export interface PlayerInput {
  chooseActionToPlay(player: Player, game: Game): Promise<Card | undefined>;
  chooseTreasureToPlay(player: Player, game: Game): Promise<Array<Card> | undefined>;
  chooseCardToBuy(player: Player, game: Game): Promise<CardPile | undefined>;
}

export class HumanPlayerInput implements PlayerInput {
  async chooseActionToPlay(player: Player, game: Game): Promise<Card | undefined> {
    const gameScreen = game.ui;
    while (true) {
        gameScreen?.renderPrompt(
        `Play an action from your hand: ${player.hand
            .filter((c) => c.types.includes(CardType.ACTION))
            .map((c) => gameScreen.formatCardName(c))}, or 'end' to end\n> `
        );
        const input = await question("");

        const inputMatch = new RegExp("^" + input + ".*", "i"); // matcher for options that start with the input
        const matchingCards = player.hand
        .filter((c) => c.types.includes(CardType.ACTION))
        .filter((card) => card.name.match(inputMatch));
        const singleMatch = new Set(matchingCards.map((c) => c.name)).size == 1;

        if (input.length > 0 && singleMatch) {
        const matchingCard = matchingCards[0];
        return matchingCard;
        } else if (input.toLowerCase() == "end" || player.actions <= 0) {
            return undefined
        } else {
            // multi-match case or I guess they tried to play a treasure - though treasures shouldn't appear in the prompt
            console.log(`Unknown input: ${input}`); // TODO: handle unknowns or handle trying to play cards that cannot be played now
        }
    }
  }

  async chooseTreasureToPlay(player: Player, game: Game): Promise<Array<Card> | undefined> {
    const gameScreen = game.ui
    while (true) {
    gameScreen?.render();
    gameScreen?.renderPrompt(
      `Play a treasure from your hand: ${player.hand
        .filter((c) => c.types.includes(CardType.TREASURE))
        .map((c) => gameScreen.formatCardName(c))}, or 'end' to end\n> `
    );
    const input = await question("");

    const inputMatch = new RegExp("^" + input + ".*", "i"); // matcher for options that start with the input
    const matchingCards = player.hand
      .filter((c) => c.types.includes(CardType.TREASURE))
      .filter((card) => card.name.match(inputMatch));
    const singleMatch = new Set(matchingCards.map((c) => c.name)).size == 1;

    if (input.length > 0 && singleMatch) {
      const matchingCard = matchingCards[0];
      return [matchingCard]
    } else if (input.toLowerCase() == "all") {
      // play all coppers, silvers, golds
      const m = player.hand.filter(
        (c) => c.name == BasicCards.Copper.name || c.name == BasicCards.Silver.name || c.name == BasicCards.Gold.name
      );
      return m
    } else if (input.toLowerCase() == "end") {
      return undefined;
    } else {
      console.log(`Unknown input: ${input}`); // TODO: handle unknowns or handle trying to play cards that cannot be played now
    }
    }
  }

  async chooseCardToBuy(player: Player, game: Game): Promise<CardPile | undefined> {
    const gameScreen = game.ui
    while (true) {
    gameScreen?.render()
    gameScreen?.renderPrompt(
        `Buy a card from the supply: ${game.supply
          .allPiles()
          .filter((p) => p.cards.length > 0 && p.cards[0].calculateCost(game) <= player.money)
          .map((p) => gameScreen.formatCardName(p.cards[0]))}, or 'end' to end.\n> `
      );
      const input = await question("");
  
      const inputMatch = new RegExp("^" + input + ".*", "i"); // matcher for options that start with the input
      const matchingPiles = game.supply
        .allPiles()
        .filter((p) => p.cards.length > 0)
        .filter((p) => p.cards[0].calculateCost(game) <= player.money)
        .filter((p) => p.name.match(inputMatch));
      const singleMatch = new Set(matchingPiles.map((c) => c.name)).size == 1;
  
      if (input.length > 0 && singleMatch) {
        const matchingPile = matchingPiles[0];
        return matchingPile
      } else if (input == "end") {
        return undefined
      } else {
        console.log(`Unknown input: ${input}`); // TODO: handle unknowns or handle trying to play cards that cannot be played now
      }
    }
  }
}

export class AiPlayerInput implements PlayerInput {
  async chooseActionToPlay(player: Player, game: Game): Promise<Card | undefined> {
    return undefined;
  }

  async chooseTreasureToPlay(player: Player, game: Game): Promise<Array<Card> | undefined> {
    return player.hand.filter((c) => c.types.includes(CardType.TREASURE)); 
  }

  async chooseCardToBuy(player: Player, game: Game): Promise<CardPile | undefined> {
    if (player.money >= 8) return game.supply.pilesWithCards().find((c) => c.name == BasicCards.Province.name);
    else if (player.money >= 6) return game.supply.pilesWithCards().find((c) => c.name == BasicCards.Gold.name);
    else if (player.money >= 5) return game.supply.pilesWithCards().find((c) => c.name == BasicCards.Duchy.name);
    else if (player.money >= 3) return game.supply.pilesWithCards().find((c) => c.name == BasicCards.Silver.name);
    else return undefined;
  }
}
