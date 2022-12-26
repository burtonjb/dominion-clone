import { Card, CardType } from "../../domain/objects/Card";
import { CardEffectConfig } from "../../domain/objects/CardEffect";
import { CardPile } from "../../domain/objects/CardPile";
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
import { shuffleArray } from "../../util/ArrayExtensions";
import * as BasicCards from "../cards/Basic";

// AI that plays big money (poorly)
// You can extend this class if you want to override some of the behavior
export class BigMoneyAiInput implements PlayerInput {
  async chooseInteger(player: Player, game: Game, params: ChooseIntegerParams): Promise<number> {
    return params.defaultValue;
  }

  async chooseEffectFromList(
    player: Player,
    game: Game,
    params: ChooseEffectFromListParams
  ): Promise<CardEffectConfig[]> {
    if (params.minChoices) return params.choices.slice(0, params.minChoices);
    else if (params.maxChoices) return params.choices.slice(0, params.maxChoices);
    else return params.choices.slice();
  }

  async choosePileFromSupply(
    player: Player,
    game: Game,
    params: ChooseCardFromSupplyParams
  ): Promise<CardPile | undefined> {
    const viablePiles = game.supply.nonEmptyPiles().filter((p) => (params.filter ? params.filter(p) : true));
    shuffleArray(viablePiles, game.random);
    return viablePiles[0];
  }

  async chooseBoolean(player: Player, game: Game, params: ChooseBooleanParams): Promise<boolean> {
    return params.defaultChoice;
  }

  async chooseCardsFromList(player: Player, game: Game, params: ChooseCardsFromListParams): Promise<Array<Card>> {
    if (params.minCards) return params.cardList.slice(0, params.minCards);
    else if (params.maxCards) return params.cardList.slice(0, params.maxCards);
    else return params.cardList;
  }

  // chooses a random (the first) action from the AI's hand to play. Should work with basic terminal draw + BM strats
  async chooseActionToPlay(player: Player, game: Game): Promise<Card | undefined> {
    const actions = player.hand.filter((c) => c.types.includes(CardType.ACTION));
    return actions[0];
  }

  async chooseTreasureToPlay(player: Player, game: Game): Promise<Array<Card> | undefined> {
    return player.hand.filter((c) => c.types.includes(CardType.TREASURE));
  }

  async chooseCardToBuy(player: Player, game: Game): Promise<CardPile | undefined> {
    return game.supply.nonEmptyPiles().find((c) => c.name == BasicCards.Copper.name);

    // Temporarily testing blockade

    // if (player.money >= 8) return game.supply.nonEmptyPiles().find((c) => c.name == BasicCards.Province.name);
    // else if (player.money >= 6) return game.supply.nonEmptyPiles().find((c) => c.name == BasicCards.Gold.name);
    // else if (player.money >= 5) return game.supply.nonEmptyPiles().find((c) => c.name == BasicCards.Duchy.name);
    // else if (player.money >= 3) return game.supply.nonEmptyPiles().find((c) => c.name == BasicCards.Silver.name);

    // else return undefined;
  }
}
