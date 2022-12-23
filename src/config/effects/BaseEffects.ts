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
  public readonly prompt: string;

  constructor(params: GainMoneyParams) {
    this.params = params;
    this.prompt = `Money +${params.amount}`;
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
  public readonly prompt: string;

  constructor(params: GainActionsParams) {
    this.params = params;
    this.prompt = `Actions +${params.amount}`;
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
  public readonly prompt: string;

  constructor(params: DrawCardsParams) {
    this.params = params;
    this.prompt = `Cards +${params.amount}`;
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
  public readonly prompt: string;

  constructor(params: GainBuysParams) {
    this.params = params;
    this.prompt = `Buys +${params.amount}`;
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
  public readonly prompt: string;

  constructor(params: GainCardParams) {
    this.params = params;
    const formattedLocation = params.toLocation ? `to ${params.toLocation}` : "";
    this.prompt = `Gain ${params.name} ${formattedLocation}`;
  }

  async effect(source: Card, player: Player, game: Game) {
    game.gainCardByName(this.params.name, player, false, this.params.toLocation);
  }
}
