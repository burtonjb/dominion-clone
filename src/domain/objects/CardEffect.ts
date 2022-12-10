import { Card } from "./Card";
import { Game } from "./Game";
import { Player } from "./Player";

export type CardEffect = (card: Card, activePlayer: Player, game: Game) => Promise<void>;

export interface CardEffectConfig {
  prompt?: string;
  effect: CardEffect;
}

export interface BasicCardEffectConfig<T> extends CardEffectConfig {
  type: string;
  params: T;
}
