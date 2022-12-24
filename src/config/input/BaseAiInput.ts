import { Card, CardType } from "../../domain/objects/Card";
import { CardPile } from "../../domain/objects/CardPile";
import { Game } from "../../domain/objects/Game";
import { Player } from "../../domain/objects/Player";
import {
  BooleanChoiceParams,
  ChooseCardFromSupplyParams,
  ChooseCardsFromListParams,
  PlayerInput,
} from "../../domain/objects/PlayerInput";
import { shuffleArray } from "../../util/ArrayExtensions";
import * as BasicCards from "../cards/Basic";

// AI that plays big money (poorly)
export class BigMoneyAiInput implements PlayerInput {
  async choosePileFromSupply(
    player: Player,
    game: Game,
    params: ChooseCardFromSupplyParams
  ): Promise<CardPile | undefined> {
    const viablePiles = game.supply.nonEmptyPiles().filter((p) => (params.filter ? params.filter(p) : true));
    shuffleArray(viablePiles, game.random);
    return viablePiles[0];
  }

  async booleanChoice(player: Player, game: Game, params: BooleanChoiceParams): Promise<boolean> {
    return params.defaultChoice;
  }
  async chooseCardsFromList(player: Player, game: Game, params: ChooseCardsFromListParams): Promise<Array<Card>> {
    // if its trashing - choose the most, worst cards from hand (if there's good cards, don't choose them)
    // if its keeping cards - choose the most, best cards from hand
    // if its something - pick the smallest, best card from hand
    // if its something else - pick the smallest, worst cards from hand

    // just return 0 to n cards from the card list.
    return params.cardList.slice(0, params.maxCards);
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
    if (player.money >= 8) return game.supply.nonEmptyPiles().find((c) => c.name == BasicCards.Province.name);
    else if (player.money >= 6) return game.supply.nonEmptyPiles().find((c) => c.name == BasicCards.Gold.name);
    else if (player.money >= 5) return game.supply.nonEmptyPiles().find((c) => c.name == BasicCards.Duchy.name);
    else if (player.money >= 3) return game.supply.nonEmptyPiles().find((c) => c.name == BasicCards.Silver.name);
    else return undefined;
  }
}
