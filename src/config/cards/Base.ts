import { cardConfigRegistry } from "../../di/configservice/CardConfigRegistry";
import { Card, CardParams, CardType, DominionExpansion } from "../../domain/objects/Card";
import { BooleanOption, ChooseCards } from "../../domain/objects/Choice";
import { Game } from "../../domain/objects/Game";
import { CardLocation, Player } from "../../domain/objects/Player";
import { DrawCards, GainActions, GainBuys, GainCard, GainMoney } from "../effects/BaseEffects";
import * as BasicCards from "./Basic";

const Cellar: CardParams = {
  name: "Cellar",
  types: [CardType.ACTION],
  cost: 2,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    new GainActions({ amount: 1 }),
    // active player chooses any cards from hand. For each card, discard it, then draw a card
    {
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const input = new ChooseCards(activePlayer, game, activePlayer.hand);
        while (!input.isDone()) {
          await input.loop();
        }
        const selectedCards = input.getSelected();

        selectedCards.forEach((card) => {
          game.discardCard(card, activePlayer);
          activePlayer.drawCard();
        });
      },
    },
  ],
};

const Chapel: CardParams = {
  name: "Chapel",
  types: [CardType.ACTION],
  cost: 2,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    {
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        // Choose up to 4 cards from hand to trash
        const input = new ChooseCards(activePlayer, game, activePlayer.hand, { maxCards: 4 });
        while (!input.isDone()) {
          await input.loop();
        }
        const selectedCards = input.getSelected();

        selectedCards.forEach((card) => {
          game.trashCard(card, activePlayer);
        });
      },
    },
  ],
};

const Moat: CardParams = {
  name: "Moat",
  types: [CardType.ACTION, CardType.REACTION],
  cost: 2,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [new DrawCards({ amount: 2 })],
  // TODO: reaction effects
};

const Harbinger: CardParams = {
  name: "Harbinger",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 1 }),
    new GainActions({ amount: 1 }),
    {
      // choose a card from the discard pile. Put it on top of your deck
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        if (activePlayer.discardPile.length == 0) return; // skip if the player's discard is empty

        const input = new ChooseCards(activePlayer, game, activePlayer.discardPile, { maxCards: 1 });
        while (!input.isDone()) {
          await input.loop();
        }
        const selectedCards = input.getSelected();

        selectedCards.forEach((card) => {
          activePlayer.removeCard(card);
          activePlayer.drawPile.unshift(card);
        });
      },
    },
  ],
};
const Merchant: CardParams = {
  name: "Merchant",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 1 }),
    new GainActions({ amount: 1 }),
    // TODO: add the triggered effect from the money gaining
  ],
};
const Vassal: CardParams = {
  name: "Vassal",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    new GainMoney({ amount: 2 }),
    {
      // Discard the top card of your deck (which can cause a reshuffle).
      // If it's an action card, you may play it (which doesn't use an action)
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        // const tCard = player.getTopCard() -- have to check for reshuffle
        const topCard = activePlayer.topNCards(1);
        if (topCard.length == 0) return; // just return if there's no cards in draw/discard piles
        game.discardCard(topCard[0], activePlayer);
        if (!topCard[0].types.includes(CardType.ACTION)) return; // exit early if the top card is not an action
        const input = new BooleanOption(activePlayer, game);
        const selected = await input.loop();
        if (selected) {
          // play card (without using an action)
        }
      },
    },
  ],
};
const Village: CardParams = {
  name: "Village",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [new GainActions({ amount: 2 }), new DrawCards({ amount: 1 })],
};
const Workshop: CardParams = {
  name: "Workshop",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Bureaucrat: CardParams = {
  name: "Bureaucrat",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    new GainCard({ name: BasicCards.Silver.name, toLocation: CardLocation.TOP_OF_DECK }),
    // TODO: the attack part of the card
  ],
};
const Gardens: CardParams = {
  name: "Gardens",
  types: [CardType.VICTORY],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  calculateVictoryPoints: (player: Player, game: Game) => {
    return Math.floor(player.allCards().length / 10);
  },
};
const Militia: CardParams = {
  name: "Militia",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Moneylender: CardParams = {
  name: "Moneylender",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Poacher: CardParams = {
  name: "Poacher",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Remodel: CardParams = {
  name: "Remodel",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Smithy: CardParams = {
  name: "Smithy",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [new DrawCards({ amount: 2 })],
};
const ThroneRoom: CardParams = {
  name: "Throne Room",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Bandit: CardParams = {
  name: "Bandit",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const CouncilRoom: CardParams = {
  name: "Council Room",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 4 }),
    new GainBuys({ amount: 1 }),
    {
      prompt: "Each other player draws a card",
      effect: async (card: Card, player: Player, game: Game) => {
        game.players.forEach((p) => {
          if (p != player) {
            p.drawCard();
          }
        });
      },
    },
  ],
};
const Festival: CardParams = {
  name: "Festival",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [new GainActions({ amount: 2 }), new GainBuys({ amount: 1 }), new GainMoney({ amount: 2 })],
};
const Laboratory: CardParams = {
  name: "Laboratory",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [new DrawCards({ amount: 2 }), new GainActions({ amount: 1 })],
};
const Library: CardParams = {
  name: "Library",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Market: CardParams = {
  name: "Market",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 1 }),
    new GainActions({ amount: 1 }),
    new GainBuys({ amount: 1 }),
    new GainMoney({ amount: 1 }),
  ],
};
const Mine: CardParams = {
  name: "Mine",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Sentry: CardParams = {
  name: "Sentry",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Witch: CardParams = {
  name: "Witch",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Artisan: CardParams = {
  name: "Artisan",
  types: [CardType.ACTION],
  cost: 6,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};

cardConfigRegistry.registerAll(
  Cellar,
  Chapel,
  Moat,
  Harbinger,
  Merchant,
  Vassal,
  Village,
  Workshop,
  Bureaucrat,
  Gardens,
  Militia,
  Moneylender,
  Poacher,
  Remodel,
  Smithy,
  ThroneRoom,
  Bandit,
  CouncilRoom,
  Festival,
  Laboratory,
  Library,
  Market,
  Mine,
  Sentry,
  Witch,
  Artisan
);

export {
  Cellar,
  Chapel,
  Moat,
  Harbinger,
  Merchant,
  Vassal,
  Village,
  Workshop,
  Bureaucrat,
  Gardens,
  Militia,
  Moneylender,
  Poacher,
  Remodel,
  Smithy,
  ThroneRoom,
  Bandit,
  CouncilRoom,
  Festival,
  Laboratory,
  Library,
  Market,
  Mine,
  Sentry,
  Witch,
  Artisan,
};
