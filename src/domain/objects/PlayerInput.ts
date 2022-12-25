import { Card } from "./Card";
import { CardEffect, CardEffectConfig } from "./CardEffect";
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

export interface ChooseBooleanParams {
  prompt: string;
  defaultChoice: boolean;
  sourceCard: Card;
}

export interface ChooseCardFromSupplyParams {
  prompt: string;
  filter: (pile: CardPile) => boolean;
  sourceCard: Card;
}

export interface ChooseEffectFromListParams {
  prompt: string;
  minChoices?: number;
  maxChoices?: number;
  choices: Array<CardEffectConfig>;
  sourceCard: Card;
}

export interface ChooseIntegerParams {
  prompt: string;
  defaultValue: number;
  minValue: number;
  maxValue: number;
}

export interface PlayerInput {
  chooseActionToPlay(player: Player, game: Game): Promise<Card | undefined>;
  chooseTreasureToPlay(player: Player, game: Game): Promise<Array<Card> | undefined>;
  chooseCardToBuy(player: Player, game: Game): Promise<CardPile | undefined>;
  chooseCardsFromList(player: Player, game: Game, params: ChooseCardsFromListParams): Promise<Array<Card>>;
  choosePileFromSupply(player: Player, game: Game, params: ChooseCardFromSupplyParams): Promise<CardPile | undefined>;
  chooseBoolean(player: Player, game: Game, params: ChooseBooleanParams): Promise<boolean>;
  chooseEffectFromList(
    player: Player,
    game: Game,
    params: ChooseEffectFromListParams
  ): Promise<Array<CardEffectConfig>>;
  chooseInteger(player: Player, game: Game, params: ChooseIntegerParams): Promise<number>;
}
