import { Card } from "./Card";
import { OnGainCardTrigger, OnPlayCardTrigger } from "./CardEffect";
import { Game } from "./Game";
import { CardLocation, Player } from "./Player";

export interface GainParams {
  gainedCard: Card;
  gainedPlayer: Player;
  wasBought: boolean;
  toLocation?: CardLocation;
}

/*
Reactions have there effects triggered in response to something else happening. 
There's probably a better way to implement them from a programming perspective (e.g. on gain/on trash effects could be reactions)
but I'm going to implement them so that they're the same as Dominion.

Though the reactions from Menagerie and onwards (including Pirate from Seaside 2nd) seem more consistent!
*/
export interface ReactionEffectsCardParams {
  onStartTurnEffects?: Array<void>; // TODO

  // triggered both on when the person having the card plays the card and when others play the card.
  // filter internally if its only on when others play the card
  onPlayerPlayCardEffects?: Array<OnPlayCardTrigger>;

  // triggered both on when the person having the card gains a card or when others gain a card
  // filter internally if its a "on other player gains" effect
  onGainCardEffects?: Array<
    (owningPlayer: Player, cardWithEffect: Card, game: Game, gainParams: GainParams) => Promise<void>
  >;
}
