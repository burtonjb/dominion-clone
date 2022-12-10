import { Card } from "../../domain/objects/Card";
import { BasicCardEffectConfig } from "../../domain/objects/CardEffect";
import { Game } from "../../domain/objects/Game";
import { CardLocation, Player } from "../../domain/objects/Player";
import { doNTimes } from "../../util/ArrayExtensions";

export interface GainMoneyParams {
  amount: number;
}

export class GainMoney implements BasicCardEffectConfig<GainMoneyParams> {
  public readonly type = "GainMoney";
  public params: GainMoneyParams;

  constructor(params: GainMoneyParams) {
    this.params = params;
  }

  async effect(card: Card, player: Player, game: Game) {
    player.money += this.params.amount;
    game.eventLog.publishEvent({
      type: "GainMoney",
      card: card,
      player: player,
      amount: this.params.amount,
    });
  }
}

export interface GainActionsParams {
  amount: number;
}

export class GainActions implements BasicCardEffectConfig<GainActionsParams> {
  public readonly type = "GainActions";
  public params: GainActionsParams;

  constructor(params: GainMoneyParams) {
    this.params = params;
  }

  async effect(card: Card, player: Player, game: Game) {
    player.actions += this.params.amount;
    game.eventLog.publishEvent({ type: "GainActions", card: card, player: player, amount: this.params.amount });
  }
}

export interface DrawCardsParams {
  amount: number;
}
export class DrawCards implements BasicCardEffectConfig<DrawCardsParams> {
  public readonly type = "DrawCards";
  public params: DrawCardsParams;

  constructor(params: DrawCardsParams) {
    this.params = params;
  }

  async effect(card: Card, player: Player, game: Game) {
    doNTimes(this.params.amount, () => {
      player.drawCard();
    });
    game.eventLog.publishEvent({ type: "DrawCard", player: player, card: card });
  }
}

export interface GainBuysParams {
  amount: number;
}
export class GainBuys implements BasicCardEffectConfig<GainBuysParams> {
  public readonly type = "GainActions";
  public params: GainBuysParams;

  constructor(params: GainBuysParams) {
    this.params = params;
  }

  async effect(card: Card, player: Player, game: Game) {
    player.buys += this.params.amount;
    game.eventLog.publishEvent({
      type: "GainBuys",
      card: card,
      player: player,
      amount: this.params.amount,
    });
  }
}

export interface GainCardParams {
  name: string;
  toLocation?: CardLocation;
}
export class GainCard implements BasicCardEffectConfig<GainCardParams> {
  public readonly type = "GainCard";
  public params: GainCardParams;

  constructor(params: GainCardParams) {
    this.params = params;
  }

  async effect(source: Card, player: Player, game: Game) {
    game.gainCardByName(this.params.name, player, false);
  }
}
