import { GainActionsParams, GainBuysParams, GainMoneyParams } from "../../config/effects/BaseEffects";
import { Card } from "../objects/Card";
import { CardLocation, Player } from "../objects/Player";

export type Event =
  | PlayCardEvent
  | GainMoneyEvent
  | GainCardEvent
  | GainActionsEvent
  | DiscardCardEvent
  | GainBuysEvent
  | DrawCardEvent
  | RevealCardsEvent
  | TrashCardEvent;

export interface BaseEvent {
  readonly type: string;
  readonly player: Player; //what player was affected by the event
  timestamp?: number;
}

export interface PlayCardEvent extends BaseEvent {
  readonly type: "PlayCard";
  readonly card: Card;
}

export interface GainMoneyEvent extends BaseEvent, GainMoneyParams {
  readonly type: "GainMoney";
  readonly card: Card;
}

export interface GainActionsEvent extends BaseEvent, GainActionsParams {
  readonly type: "GainActions";
  readonly card: Card;
}

export interface GainBuysEvent extends BaseEvent, GainBuysParams {
  readonly type: "GainBuys";
  readonly card: Card;
}

export interface GainCardEvent extends BaseEvent {
  readonly type: "GainCard";
  readonly card: Card;
  readonly wasBought: boolean;
  readonly toLocation?: CardLocation;
}

export interface DiscardCardEvent extends BaseEvent {
  readonly type: "DiscardCard";
  readonly card: Card;
}

export interface DrawCardEvent extends BaseEvent {
  readonly type: "DrawCard";
  // FIXME: have a param for the source effect and a param for the card that will be drawn
  readonly card: Card;
}

export interface RevealCardsEvent extends BaseEvent {
  readonly type: "RevealCard";
  readonly cards: Array<Card>; // use an array of cards instead of a single card to lower log-spam
}

export interface TrashCardEvent extends BaseEvent {
  readonly type: "TrashCard";
  readonly card: Card;
}
