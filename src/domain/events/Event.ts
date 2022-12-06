import { Card } from "../objects/Card";
import { Player } from "../objects/Player";

export type Event = PlayCardEvent | GainMoneyEvent | GainCardEvent | DiscardCardEvent;

export interface BaseEvent {
  readonly type: string;
  readonly player: Player; //what player was affected by the event
  timestamp?: number;
}

export interface PlayCardEvent extends BaseEvent {
  readonly type: "PlayCardEvent";
  readonly card: Card;
}

export interface GainMoneyEvent extends BaseEvent {
  readonly type: "GainMoneyEvent";
  readonly source: Event;
  readonly amount: number;
}

export interface GainCardEvent extends BaseEvent {
  readonly type: "GainCardEvent";
  readonly card: Card;
  readonly wasBought: boolean;
}

export interface DiscardCardEvent extends BaseEvent {
  readonly type: "DiscardCardEvent";
  readonly card: Card;
}
