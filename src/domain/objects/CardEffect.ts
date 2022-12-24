import { Card } from "./Card";
import { Game } from "./Game";
import { Player } from "./Player";
import * as BaseCards from "../../config/cards/Base";

// function that returns a modifier on the cost of a card - e.g. -1$, -2$ if its an action
export type CostModifier = (card: Card) => number;

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
  if (target.hand.map((c) => c.name).includes(BaseCards.Moat.name)) {
    game.revealCards(
      target.hand.filter((c) => c.name == BaseCards.Moat.name),
      target
    );
    return;
  }
  await effect();
}
