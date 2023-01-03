import { Card } from "./Card";
import { Game } from "./Game";
import { CardLocation, Player } from "./Player";
import * as BaseCards from "../../config/cards/Base";
import * as SeasideCards from "../../config/cards/Seaside";

// function that returns a modifier on the cost of a card - e.g. -1$, -2$ if its an action
// They are applied at a game level as they affect other players' cards' costs
// and are cleared at the end of the turn
export type CostModifier = (card: Card) => number;

export type CardEffect = (card: Card, activePlayer: Player, game: Game) => Promise<void>;

export interface CardEffectConfig {
  prompt: string;
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
  //FIXME: lighthouse is hacked in too as part of attack immunity.
  if (target.cardsSetAside.map((c) => c.name).includes(SeasideCards.Lighthouse.name)) {
    return;
  }

  await effect();
}

export enum DurationTiming {
  START_OF_TURN = "StartOfTurn",
}

type DurationFunction = (player: Player, game: Game) => Promise<boolean>;

export class DurationEffect {
  public hasRemaining: boolean;

  constructor(public readonly timing: DurationTiming, private readonly internalEffect: DurationFunction) {
    this.hasRemaining = true;
  }

  public async effect(player: Player, game: Game) {
    this.hasRemaining = await this.internalEffect(player, game);
  }
}

export type OnGainCardEffect = (
  gainedCard: Card,
  gainer: Player,
  game: Game,
  wasBought: boolean,
  toLocation?: CardLocation
) => Promise<void>;

export class OnGainCardTrigger {
  constructor(public readonly cleanAtEndOfTurn: boolean, private internalEffect: OnGainCardEffect) {}

  async effect(card: Card, gainer: Player, game: Game, wasBought: boolean, toLocation?: CardLocation) {
    await this.internalEffect(card, gainer, game, wasBought, toLocation);
  }
}

export class OnPlayCardTrigger {
  constructor(public readonly cleanAtEndOfTurn: boolean, private internalEffect: CardEffect) {}
  async effect(card: Card, player: Player, game: Game) {
    await this.internalEffect(card, player, game);
  }
}
