import * as BasicCards from "../cards/Basic";
import { Card, CardType } from "../../domain/objects/Card";
import { CardPile } from "../../domain/objects/CardPile";
import { Game } from "../../domain/objects/Game";
import { Player } from "../../domain/objects/Player";
import { PlayerInput } from "../../domain/objects/PlayerInput";

// AI that plays big money (poorly)
export class BigMoneyAiInput implements PlayerInput {
  async chooseActionToPlay(player: Player, game: Game): Promise<Card | undefined> {
    return undefined;
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
