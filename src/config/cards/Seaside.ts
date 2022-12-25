import { cardConfigRegistry } from "../../di/configservice/CardConfigRegistry";
import { Card, CardParams, CardType, DominionExpansion } from "../../domain/objects/Card";
import { DurationEffect, DurationTiming } from "../../domain/objects/CardEffect";
import { Game } from "../../domain/objects/Game";
import { CardPosition, Player } from "../../domain/objects/Player";
import { DrawCards, GainActions, GainMoney } from "../effects/BaseEffects";

const Haven: CardParams = {
  name: "Haven",
  types: [CardType.ACTION, CardType.DURATION],
  cost: 2,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 1 }),
    new GainActions({ amount: 1 }),
    {
      // FIXME: Cards are actually supposed to be set aside under this, face down.
      prompt: "Set aside a card from your hand. At the start of your next turn put it into your hand",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const choice = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose a card from your hand to set aside",
          minCards: 1,
          maxCards: 1,
          cardList: activePlayer.hand,
          sourceCard: card,
        });
        if (choice.length == 0) return;
        const toSetAside = choice[0];

        activePlayer.transferCard(toSetAside, activePlayer.hand, activePlayer.cardsSetAside, CardPosition.TOP);
        game.eventLog.publishEvent({ type: "CardSetAside", player: activePlayer, card: toSetAside });

        const durationEffect = new DurationEffect(DurationTiming.START_OF_TURN, async (p: Player, g: Game) => {
          activePlayer.transferCard(toSetAside, activePlayer.cardsSetAside, activePlayer.hand, CardPosition.TOP);
          game.eventLog.publishEvent({ type: "CardPutInHand", player: activePlayer, card: toSetAside });
          return false;
        });
        card.durationEffects.push(durationEffect);
      },
    },
  ],
};

const Lighthouse: CardParams = {
  name: "Lighthouse",
  types: [CardType.ACTION, CardType.DURATION],
  cost: 2,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    new GainActions({ amount: 1 }),
    new GainMoney({ amount: 1 }),
    {
      prompt: "At the start of your next turn +1$. Until then you're immune to attacks",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const durationEffect = new DurationEffect(DurationTiming.START_OF_TURN, async (p: Player, g: Game) => {
          await new GainMoney({ amount: 1 }).effect(card, p, g);
          return false;
        });
        card.durationEffects.push(durationEffect);
      },
    },
  ],
};

const Cutpurse: CardParams = {
  name: "Cutpurse",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 4,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
};

export function register() {
  cardConfigRegistry.registerAll(Haven, Lighthouse);
}
register();

export { Haven, Lighthouse };
