import { Card } from "./Card";
import { CardPile } from "./CardPile";
import { Game } from "./Game";
import { Player } from "./Player";

// interface used for choosing
export interface ChooseCardsFromListParams {
  prompt: string;
  minCards?: number;
  maxCards?: number;
  cardList: Array<Card>;
  sourceCard: Card; // the card that is causing the choice. Passed so that AI can be extended to switch on this
}

export interface BooleanChoiceParams {
  prompt: string;
  defaultChoice: boolean;
  sourceCard: Card;
}

export interface PlayerInput {
  chooseActionToPlay(player: Player, game: Game): Promise<Card | undefined>;
  chooseTreasureToPlay(player: Player, game: Game): Promise<Array<Card> | undefined>;
  chooseCardToBuy(player: Player, game: Game): Promise<CardPile | undefined>;
  chooseCardsFromList(player: Player, game: Game, params: ChooseCardsFromListParams): Promise<Array<Card>>;
  booleanChoice(player: Player, game: Game, params: BooleanChoiceParams): Promise<boolean>;
}
