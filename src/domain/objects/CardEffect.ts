import { Card } from "./Card";
import { Game } from "./Game";
import { Player } from "./Player";
import * as BaseCard from "../../config/cards/Base";

export type CardEffect = (card: Card, activePlayer: Player, game: Game) => Promise<void>;

export interface CardEffectConfig {
  prompt?: string;
  effect: CardEffect;
}

export interface BasicCardEffectConfig<T> extends CardEffectConfig {
  type: string;
  params: T;
}

export async function attack(card: Card, target: Player, game: Game, effect: () => Promise<void>) {
  // The effect will just use values from its containing closure (kinda hack, but easier to write)
  //FIXME: eventually change this to hack/check for moat, but instead use a reaction (but I don't really like moat, so I'm not going to try too hard)
  if (target.hand.map((c) => c.name).includes(BaseCard.Moat.name)) return;
  await effect();
}
