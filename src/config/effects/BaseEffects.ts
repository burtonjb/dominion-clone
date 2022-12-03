import { CardEffect } from "../../model/CardEffect";
import { Kingdom } from "../../model/Kingdom";
import { Player } from "../../model/Player";

interface GainMoneyParams {
  amount: number;
}

class GainMoney implements CardEffect<GainMoneyParams> {
  public readonly type = "GainMoney";
  public params: GainMoneyParams;

  constructor(params: GainMoneyParams) {
    this.params = params;
  }

  effect(player: Player, kingdom: Kingdom) {
    player.money += this.params.amount;
  }
}

interface GainActionParams {
  amount: number;
}

class GainActions implements CardEffect<GainActionParams> {
  public readonly type = "GainActions";
  public params: GainActionParams;

  constructor(params: GainMoneyParams) {
    this.params = params;
  }

  effect(player: Player, kingdom: Kingdom) {
    player.actions += this.params.amount;
  }
}

interface DrawCardsParams {
  amount: number;
}
class DrawCards implements CardEffect<DrawCardsParams> {
  public readonly type = "DrawCards";
  public params: DrawCardsParams;

  constructor(params: DrawCardsParams) {
    this.params = params;
  }

  effect(player: Player, kingdom: Kingdom) {
    //FIXME: implement drawing and gaining cards
  }
}

interface GainBuysParams {
  amount: number;
}
class GainBuys implements CardEffect<GainBuysParams> {
  public readonly type = "GainActions";
  public params: GainBuysParams;

  constructor(params: GainBuysParams) {
    this.params = params;
  }

  effect(player: Player, kingdom: Kingdom) {
    player.buys += this.params.amount;
  }
}
