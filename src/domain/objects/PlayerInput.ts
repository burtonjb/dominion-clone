import { question } from "../../util/PromiseExtensions";
import { Card, CardType } from "./Card";
import { Game } from "./Game";
import { Player } from "./Player";
import * as BasicCards from "../../config/cards/Basic";
import { CardPile } from "./CardPile";

export interface PlayerInput {
  chooseActionToPlay(player: Player, game: Game): Promise<Card | undefined>;
  chooseTreasureToPlay(player: Player, game: Game): Promise<Array<Card> | undefined>;
  chooseCardToBuy(player: Player, game: Game): Promise<CardPile | undefined>;
}
