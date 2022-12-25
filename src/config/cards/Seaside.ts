import { cardConfigRegistry } from "../../di/configservice/CardConfigRegistry";
import { BasicCards } from "../../di/RegisterConfig";
import { Card, CardParams, CardType, DominionExpansion } from "../../domain/objects/Card";
import { attack, DurationEffect, DurationTiming } from "../../domain/objects/CardEffect";
import { Game } from "../../domain/objects/Game";
import { CardLocation, CardPosition, Player } from "../../domain/objects/Player";
import { DiscardCardsFromHand } from "../effects/AdvancedEffects";
import { DrawCards, GainActions, GainBuys, GainCard, GainMoney } from "../effects/BaseEffects";

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

const Monkey: CardParams = {
  name: "Monkey",
  types: [CardType.ACTION, CardType.DURATION],
  cost: 3,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    //TODO
  ],
};

const SeaChart: CardParams = {
  name: "Sea Chart",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 1 }),
    new GainActions({ amount: 1 }),
    {
      prompt: "Reveal the top card of your deck. If you have a copy in play, put it into your hand",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const topCards = activePlayer.topNCards(1);
        game.revealCards(topCards, activePlayer);
        if (topCards.length == 0) return;

        const topCard = topCards[0];
        if (activePlayer.cardsInPlay.some((c) => c.name == topCard.name)) {
          activePlayer.transferCard(topCard, activePlayer.drawPile, activePlayer.hand, CardPosition.BOTTOM);
          game.eventLog.publishEvent({ type: "CardPutInHand", player: activePlayer, card: topCard });
        }
      },
    },
  ],
};

const Smugglers: CardParams = {
  name: "Smugglers",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    //TODO
  ],
};

const Warehouse: CardParams = {
  name: "Warehouse",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 3 }),
    new GainActions({ amount: 1 }),
    new DiscardCardsFromHand({ minCards: 3, maxCards: 3 }),
  ],
};

const Blockade: CardParams = {
  name: "Blockade",
  types: [CardType.ACTION, CardType.ATTACK, CardType.DURATION],
  cost: 4,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    {
      prompt:
        "Gain a card costing up to $4, setting it aside. At the start of your next turn, put it into your hand. While it's set aside, when another player gains a copy of it on their turn, they gain a Curse.",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        // TODO: add effect. Needs support for onGain effects
      },
    },
  ],
};

const Caravan: CardParams = {
  name: "Caravan",
  types: [CardType.ACTION, CardType.DURATION],
  cost: 4,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 1 }),
    new GainActions({ amount: 1 }),
    {
      prompt: "At the start of next turn, +1 cards",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const durationEffect = new DurationEffect(DurationTiming.START_OF_TURN, async (p: Player, g: Game) => {
          await new DrawCards({ amount: 1 }).effect(card, activePlayer, game);
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
  playEffects: [
    new GainMoney({ amount: 2 }),
    {
      prompt: "Each other player discards a copper from hand (or reveals they can't)",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        for (const otherPlayer of game.otherPlayers()) {
          await attack(card, otherPlayer, game, async () => {
            const coppers = otherPlayer.hand.filter((c) => c.name == BasicCards.Copper.name);

            if (coppers.length == 0) {
              // handle no coppers in hand case
              game.revealCards(otherPlayer.hand, otherPlayer);
              return;
            } else {
              // discard the copper from their hand
              game.discardCard(coppers[0], otherPlayer);
            }
          });
        }
      },
    },
  ],
};

const Island: CardParams = {
  name: "Island",
  types: [CardType.ACTION, CardType.VICTORY],
  cost: 4,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  victoryPoints: 2,
  playEffects: [
    {
      prompt: "Put this and another card from your hand onto your island mat",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selectedCards = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose a card to put onto your island mat",
          cardList: activePlayer.hand,
          sourceCard: card,
          minCards: 1,
          maxCards: 1,
        });

        activePlayer.transferCard(card, activePlayer.cardsInPlay, activePlayer.mats.island, CardPosition.BOTTOM);
        game.eventLog.publishEvent({ type: "CardSetAside", player: activePlayer, card: card });

        if (selectedCards.length == 0) return;
        const selectedCard = selectedCards[0];
        activePlayer.transferCard(
          selectedCard,
          activePlayer.cardsInPlay,
          activePlayer.mats.island,
          CardPosition.BOTTOM
        );
        game.eventLog.publishEvent({ type: "CardSetAside", player: activePlayer, card: selectedCard });
      },
    },
  ],
};

const Sailor: CardParams = {
  name: "Sailor",
  types: [CardType.ACTION, CardType.DURATION],
  cost: 4,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    //TODO:
  ],
};

const Salvager: CardParams = {
  name: "Salvager",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    new GainBuys({ amount: 1 }),
    {
      prompt: "Trash a card from your hand. +1$ for each $ it costs",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selected = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose a card from your hand to trash",
          cardList: activePlayer.hand,
          sourceCard: card,
          minCards: 1,
          maxCards: 1,
        });
        if (selected.length == 0) return;

        const toTrash = selected[0];
        game.trashCard(toTrash, activePlayer);
        await new GainMoney({ amount: toTrash.calculateCost(game) }).effect(card, activePlayer, game);
      },
    },
  ],
};

const TidePools: CardParams = {
  name: "Tide Pools",
  types: [CardType.ACTION, CardType.DURATION],
  cost: 4,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 3 }),
    new GainActions({ amount: 1 }),
    {
      prompt: "At the start of your next turn discard 2 cards",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const durationEffect = new DurationEffect(DurationTiming.START_OF_TURN, async (p: Player, g: Game) => {
          await new DiscardCardsFromHand({ minCards: 2, maxCards: 2 }).effect(card, activePlayer, game);
          return false;
        });
        card.durationEffects.push(durationEffect);
      },
    },
  ],
};

const TreasureMap: CardParams = {
  name: "Treasure Map",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    {
      prompt: "Trash this and a treasure map from your hand. If you do gain 4 Golds onto your deck",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        game.trashCard(card, activePlayer);

        const mapsInHand = activePlayer.hand.filter((c) => c.name == TreasureMap.name);
        if (mapsInHand.length == 0) return; // just trash this map and return (this is the rules in the FAQ)

        for (let i = 0; i < 4; i++) {
          await new GainCard({ name: BasicCards.Gold.name, toLocation: CardLocation.TOP_OF_DECK }).effect(
            card,
            activePlayer,
            game
          );
        }
      },
    },
  ],
};

export function register() {
  cardConfigRegistry.registerAll(
    Haven,
    Lighthouse,
    NativeVillage,
    Astrolabe,
    FishingVillage,
    Lookout,
    Monkey,
    SeaChart,
    Smugglers,
    Warehouse,
    Blockade,
    Caravan,
    Cutpurse,
    Island,
    Sailor,
    Salvager,
    TidePools,
    TreasureMap
  );
}
register();

export {
  Haven,
  Lighthouse,
  NativeVillage,
  Astrolabe,
  FishingVillage,
  Lookout,
  Monkey,
  SeaChart,
  Smugglers,
  Warehouse,
  Blockade,
  Caravan,
  Cutpurse,
  Island,
  Sailor,
  Salvager,
  TidePools,
  TreasureMap,
};