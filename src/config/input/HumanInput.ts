import { Card, CardType } from "../../domain/objects/Card";
import { CardPile } from "../../domain/objects/CardPile";
import {
  BooleanChoice,
  CardsFromPlayerChoice,
  ChooseCardFromSupply,
  ChooseEffectChoice,
  IntegerChoice,
} from "../../ui/Choice";
import { Game } from "../../domain/objects/Game";
import { Player } from "../../domain/objects/Player";
import {
  ChooseBooleanParams,
  ChooseCardFromSupplyParams,
  ChooseCardsFromListParams,
  ChooseEffectFromListParams,
  ChooseIntegerParams,
  PlayerInput,
} from "../../domain/objects/PlayerInput";
import { question } from "../../util/PromiseExtensions";
import * as BasicCards from "../cards/Basic";
import { CardEffectConfig } from "../../domain/objects/CardEffect";
import { matchInput } from "../../util/MatchInput";

export class HumanPlayerInput implements PlayerInput {
  async chooseInteger(player: Player, game: Game, params: ChooseIntegerParams): Promise<number> {
    const input = new IntegerChoice(params.prompt, game, params.defaultValue, params.minValue, params.maxValue);
    return await input.getChoice();
  }

  async chooseEffectFromList(
    player: Player,
    game: Game,
    params: ChooseEffectFromListParams
  ): Promise<CardEffectConfig[]> {
    const input = new ChooseEffectChoice(params.prompt, game, player, params.choices, {
      minChoices: params.minChoices,
      maxChoices: params.maxChoices,
    });
    return (await input.getChoice()).slice();
  }
  async choosePileFromSupply(
    player: Player,
    game: Game,
    params: ChooseCardFromSupplyParams
  ): Promise<CardPile | undefined> {
    const input = new ChooseCardFromSupply(params.prompt, game.supply, game, params.filter);
    const selected = await input.getChoice();
    return selected;
  }

  async chooseBoolean(player: Player, game: Game, params: ChooseBooleanParams): Promise<boolean> {
    const input = new BooleanChoice(params.prompt, game, params.defaultChoice);
    return await input.getChoice();
  }

  async chooseCardsFromList(player: Player, game: Game, params: ChooseCardsFromListParams): Promise<Array<Card>> {
    const input = new CardsFromPlayerChoice(params.prompt, player, params.cardList, game, {
      minCards: params.minCards,
      maxCards: params.maxCards,
    });
    const selectedCards = await input.getChoice();
    return selectedCards.slice();
  }

  async chooseActionToPlay(player: Player, game: Game): Promise<Card | undefined> {
    const gameScreen = game.ui;
    while (true) {
      gameScreen?.renderPrompt(
        `Play an action from your hand: ${player.hand
          .filter((c) => c.types.includes(CardType.ACTION))
          .map((c) => gameScreen.formatCardName(c))}, or 'end' to end\n> `
      );
      const input = await question();

      const actionCards: Array<[string, Card]> = player.hand
        .filter((c) => c.types.includes(CardType.ACTION))
        .map((c) => [c.name, c]);

      const matchingInput = matchInput<Card>(input, actionCards);

      if (input.toLowerCase() == "end" || player.actions <= 0) {
        return undefined;
      } else if (matchingInput) {
        return matchingInput;
      } else {
        // either no matches or multi-match
        console.warn(`Unknown input: ${input}`); // TODO: split out messaging for different error conditions
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
          .map((c) => gameScreen.formatCardName(c))}, or 'all' to play all basic treasures or 'end' to end\n> `
      );
      const input = await question();

      const treasureCards: Array<[string, Card]> = player.hand
        .filter((c) => c.types.includes(CardType.TREASURE))
        .map((c) => [c.name, c]);

      const matchingInput = matchInput<Card>(input, treasureCards);

      if (input.toLowerCase() == "end") {
        return undefined;
      } else if (input.toLowerCase() == "all") {
        // play all coppers, silvers, golds, or plats
        const m = player.hand.filter(
          (c) =>
            c.name == BasicCards.Copper.name ||
            c.name == BasicCards.Silver.name ||
            c.name == BasicCards.Gold.name ||
            c.name == BasicCards.Platinum.name
        );
        return m;
      } else if (input.length > 0 && matchingInput) {
        return [matchingInput];
      } else {
        console.warn(`Unknown input: ${input}`); // TODO: split out messaging for different error conditions
      }
    }
  }

  async chooseCardToBuy(player: Player, game: Game): Promise<CardPile | undefined> {
    const gameScreen = game.ui;
    while (true) {
      gameScreen?.render();
      const applicablePiles = game.supply
        .allPiles()
        .filter((p) => p.cards.length > 0)
        .filter((p) => p.cards[0].calculateCost(game) <= player.money)
        .filter((p) => p.cards[0].canBuy(player, game));

      gameScreen?.renderPrompt(
        `Buy a card from the supply: ${applicablePiles.map((p) =>
          gameScreen.formatCardName(p.cards[0])
        )}, or 'end' to end.\n> `
      );

      const input = await question();
      const selectedPile = matchInput(
        input,
        applicablePiles.map((p) => [p.cards[0].name, p])
      );

      if (input == "end") {
        return undefined;
      } else if (input.length > 0 && selectedPile) {
        return selectedPile;
      } else {
        console.warn(`Unknown input: ${input}`); // TODO: split out messaging for different error conditions
      }
    }
  }
}
