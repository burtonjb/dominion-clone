import {
  GainActionsParams,
  GainBuysParams,
  GainMoneyParams,
  GainVictoryTokens,
} from "../../config/effects/BaseEffects";
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
  | TrashCardEvent
  | CleanUpEvent
  | TestEvent
  | CardSetAsideEvent
  | CardPutInHandEvent
  | ExtraTurnEvent
  | TopDeckCardEvent
  | GainVictoryTokensEvent;

export interface BaseEvent {
  readonly type: string;
  readonly player: Player; // what player did the event
  eventCounter?: number; // will be overridden by the event logger with a value
}

export interface TestEvent extends BaseEvent {
  readonly type: "TestEvent";
  readonly content: string;
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

export interface GainVictoryTokensEvent extends BaseEvent, GainBuysParams {
  readonly type: "GainVictoryTokens";
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

export interface CleanUpEvent extends BaseEvent {
  readonly type: "Cleanup";
  readonly turn: number;
}

export interface CardSetAsideEvent extends BaseEvent {
  readonly type: "CardSetAside";
  readonly card: Card;
}

export interface CardPutInHandEvent extends BaseEvent {
  readonly type: "CardPutInHand";
  readonly card: Card;
}

export interface ExtraTurnEvent extends BaseEvent {
  readonly type: "TakesAnExtraTurn";
}

export interface TopDeckCardEvent extends BaseEvent {
  readonly type: "TopDeckCard";
  readonly card: Card;
}

export function formatEvent(event: Event, includeDebugInfo = false): string {
  function formatCard(card: Card): string {
    if (includeDebugInfo) return `${card.name}(${card.id})`;
    else return `${card.name}`;
  }
  function formatPlayer(player: Player): string {
    return player.name;
  }

  const formattedOut = includeDebugInfo ? `${event.eventCounter}: ` : "";

  /*
   * I don't like this design but I wanted to try it out. 
   */
  switch (event.type) {
    case "TestEvent":
      return formattedOut + `${event.type} // ${(event as TestEvent).content}`;
    case "PlayCard":
      return formattedOut + `${formatPlayer(event.player)} plays ${formatCard((event as PlayCardEvent).card)}`;
    case "GainMoney":
      return formattedOut + `${formatPlayer(event.player)} gains ${(event as GainMoneyEvent).amount}$`;
    case "GainActions":
      return formattedOut + `${formatPlayer(event.player)} gains ${(event as GainActionsEvent).amount} actions`;
    case "GainBuys":
      return formattedOut + `${formatPlayer(event.player)} gains ${(event as GainBuysEvent).amount} buys`;
    case "GainCard":
      return (
        formattedOut +
        `${formatPlayer(event.player)} gains card ${formatCard((event as GainCardEvent).card)} to ${
          event.toLocation
        }. Bought?: ${event.wasBought}`
      );
    case "DiscardCard":
      return formattedOut + `${formatPlayer(event.player)} discards ${formatCard((event as DiscardCardEvent).card)}`;
    case "DrawCard":
      return formattedOut + `${formatPlayer(event.player)} draws ${formatCard((event as DrawCardEvent).card)}`;
    case "RevealCard":
      return (
        formattedOut +
        `${formatPlayer(event.player)} reveals ${(event as RevealCardsEvent).cards.map((c) => formatCard(c))}`
      );
    case "TrashCard":
      return formattedOut + `${formatPlayer(event.player)} trashes ${formatCard(event.card)}`;
    case "Cleanup":
      return formattedOut + `${formatPlayer(event.player)} cleans up their turn (${event.turn})`;
    case "CardSetAside":
      return formattedOut + `${formatPlayer(event.player)} sets aside ${formatCard(event.card)}`;
    case "CardPutInHand":
      return formattedOut + `${formatPlayer(event.player)} puts ${formatCard(event.card)} in hand`;
    case "TakesAnExtraTurn":
      return formattedOut + `${formatPlayer(event.player)} takes an extra turn`;
    case "TopDeckCard":
      return formattedOut + `${formatPlayer(event.player)} topdecks ${formatCard(event.card)}`;
    case "GainVictoryTokens":
      return formattedOut + `${formatPlayer(event.player)} gains ${event.amount} Victory Tokens`;
    default:
      return event["type"]; // should never occur (typescript determines type is "never")
  }
}
