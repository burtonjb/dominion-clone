import { cardConfigRegistry } from "../../di/configservice/CardConfigRegistry";
import { Card, CardParams, CardType, DominionExpansion } from "../../domain/objects/Card";
import { DurationEffect, DurationTiming } from "../../domain/objects/CardEffect";
import { Game } from "../../domain/objects/Game";
import { CardPosition, Player } from "../../domain/objects/Player";
import { DrawCards, GainActions, GainBuys, GainMoney } from "../effects/BaseEffects";

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
          await new GainMoney({ amount: 1 }).effect(card, activePlayer, game);
          return false;
        });
        card.durationEffects.push(durationEffect);
      },
    },
  ],
};

const NativeVillage: CardParams = {
  name: "Native Village",
  types: [CardType.ACTION],
  cost: 2,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    new GainActions({ amount: 2 }),
    {
      prompt: "Choose 1: Put the top card of your deck onto your NV mat or put all cards on the NV into your hand",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const effects = await activePlayer.playerInput.chooseEffectFromList(activePlayer, game, {
          prompt: "Choose 1",
          choices: [
            {
              prompt: "Put the top card of your deck onto your NV mat.",
              effect: async (card: Card, activePlayer: Player, game: Game) => {
                const topCard = activePlayer.topNCards(1);
                if (topCard.length == 0) return;

                activePlayer.transferCard(
                  topCard[0],
                  activePlayer.drawPile,
                  activePlayer.mats.nativeVillage,
                  CardPosition.BOTTOM
                );
                game.eventLog.publishEvent({ type: "CardSetAside", player: activePlayer, card: topCard[0] });
              },
            },
            {
              prompt: `Move all cards on the NV into your hand. (Cards: ${activePlayer.mats.nativeVillage.map(
                (c) => c.name
              )})`,
              effect: async (card: Card, activePlayer: Player, game: Game) => {
                const cards = activePlayer.mats.nativeVillage.slice();

                for (const card of cards) {
                  activePlayer.transferCard(
                    card,
                    activePlayer.mats.nativeVillage,
                    activePlayer.hand,
                    CardPosition.BOTTOM
                  );
                  game.eventLog.publishEvent({ type: "CardPutInHand", player: activePlayer, card: card });
                }
              },
            },
          ],
          sourceCard: card,
          minChoices: 1,
          maxChoices: 1,
        });

        for (const effect of effects) {
          await effect.effect(card, activePlayer, game);
        }
      },
    },
  ],
};

const Astrolabe: CardParams = {
  name: "Astrolabe",
  types: [CardType.TREASURE, CardType.DURATION],
  cost: 3,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    new GainMoney({ amount: 1 }),
    new GainBuys({ amount: 1 }),
    {
      prompt: "Start of next turn gain +1$ and 1 buy",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const durationEffect = new DurationEffect(DurationTiming.START_OF_TURN, async (p: Player, g: Game) => {
          await new GainMoney({ amount: 1 }).effect(card, activePlayer, game);
          await new GainBuys({ amount: 1 }).effect(card, activePlayer, game);
          return false;
        });
        card.durationEffects.push(durationEffect);
      },
    },
  ],
};

const FishingVillage: CardParams = {
  name: "Fishing Village",
  types: [CardType.ACTION, CardType.DURATION],
  cost: 3,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    new GainActions({ amount: 2 }),
    new GainMoney({ amount: 1 }),
    {
      prompt: "Start of next turn gain +1$ and 1 action",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const durationEffect = new DurationEffect(DurationTiming.START_OF_TURN, async (p: Player, g: Game) => {
          await new GainMoney({ amount: 1 }).effect(card, activePlayer, game);
          await new GainActions({ amount: 1 }).effect(card, activePlayer, game);
          return false;
        });
        card.durationEffects.push(durationEffect);
      },
    },
  ],
};

const Lookout: CardParams = {
  name: "Lookout",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    new GainActions({ amount: 1 }),
    {
      prompt: "Look at the top 3 cards. Choose 1 to trash and 1 to discard",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const top3Cards = activePlayer.topNCards(3);
        const cardToTrash = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose a card to trash",
          minCards: 1,
          maxCards: 1,
          cardList: top3Cards,
          sourceCard: card,
        });
        if (cardToTrash.length == 0) return;
        game.trashCard(cardToTrash[0], activePlayer);

        const top2Cards = top3Cards.filter((c) => c != cardToTrash[0]);
        const cardToDiscard = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose a card to discard",
          minCards: 1,
          maxCards: 1,
          cardList: top2Cards,
          sourceCard: card,
        });
        if (cardToDiscard.length == 0) return;
        game.discardCard(cardToDiscard[0], activePlayer);
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
  playEffects: [],
};

export function register() {
  cardConfigRegistry.registerAll(Haven, Lighthouse, NativeVillage, Astrolabe, FishingVillage, Lookout);
}
register();

export { Haven, Lighthouse, NativeVillage, Astrolabe, FishingVillage, Lookout };
