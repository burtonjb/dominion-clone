import { Card, CardType } from "../../domain/objects/Card";
import { CardPile } from "../../domain/objects/CardPile";
import { BooleanChoice, CardsFromPlayerChoice, ChooseCardFromSupply } from "../../domain/objects/Choice";
import { Game } from "../../domain/objects/Game";
import { Player } from "../../domain/objects/Player";
import {
  BooleanChoiceParams,
  ChooseCardFromSupplyParams,
  ChooseCardsFromListParams,
  PlayerInput,
} from "../../domain/objects/PlayerInput";
import { question } from "../../util/PromiseExtensions";
import * as BasicCards from "../cards/Basic";

export class HumanPlayerInput implements PlayerInput {
  async choosePileFromSupply(
    player: Player,
    game: Game,
    params: ChooseCardFromSupplyParams
  ): Promise<CardPile | undefined> {
    const input = new ChooseCardFromSupply(params.prompt, game.supply, params.filter);
    const selected = await input.getChoice();
    return selected;
  }

  async booleanChoice(player: Player, game: Game, params: BooleanChoiceParams): Promise<boolean> {
    const input = new BooleanChoice("Trash a copper from your hand for +3 copper", true);
    return await input.getChoice();
  }

  async chooseCardsFromList(player: Player, game: Game, params: ChooseCardsFromListParams): Promise<Array<Card>> {
    const input = new CardsFromPlayerChoice(params.prompt, player, params.cardList);
    const selectedCards = await input.getChoice();
    return selectedCards;
  }

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
        return undefined;
      } else {
        // multi-match case or I guess they tried to play a treasure - though treasures shouldn't appear in the prompt
        console.log(`Unknown input: ${input}`); // TODO: handle unknowns or handle trying to play cards that cannot be played now
      }
    }
  }

  async chooseTreasureToPlay(player: Player, game: Game): Promise<Array<Card> | undefined> {
    const gameScreen = game.ui;
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
        return [matchingCard];
      } else if (input.toLowerCase() == "all") {
        // play all coppers, silvers, golds
        const m = player.hand.filter(
          (c) => c.name == BasicCards.Copper.name || c.name == BasicCards.Silver.name || c.name == BasicCards.Gold.name
        );
        return m;
      } else if (input.toLowerCase() == "end") {
        return undefined;
      } else {
        console.log(`Unknown input: ${input}`); // TODO: handle unknowns or handle trying to play cards that cannot be played now
      }
    }
  }

  async chooseCardToBuy(player: Player, game: Game): Promise<CardPile | undefined> {
    const gameScreen = game.ui;
    while (true) {
      gameScreen?.render();
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
        return matchingPile;
      } else if (input == "end") {
        return undefined;
      } else {
        console.log(`Unknown input: ${input}`); // TODO: handle unknowns or handle trying to play cards that cannot be played now
      }
    }
  }
}
