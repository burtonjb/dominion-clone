import { cardConfigRegistry } from "../../di/configservice/CardConfigRegistry";
import { Card, CardParams, CardType, DominionExpansion } from "../../domain/objects/Card";
import { attack, CardEffect } from "../../domain/objects/CardEffect";
import { CardPile } from "../../domain/objects/CardPile";
import { BooleanChoice, CardsFromPlayerChoice, ChooseCardFromSupply } from "../../domain/objects/Choice";
import { Game } from "../../domain/objects/Game";
import { CardLocation, CardPosition, Player } from "../../domain/objects/Player";
import { TrashCardsFromHand } from "../effects/AdvancedEffects";
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
    {
      prompt: "Choose any cards to discard from your hand. For each card discarded, draw a new one",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selectedCards = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose any cards to discard from your hand",
          cardList: activePlayer.hand,
          sourceCard: card,
        });

        for (const card of selectedCards) {
          game.discardCard(card, activePlayer), activePlayer.drawCard();
        }
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
  playEffects: [new TrashCardsFromHand({ minCards: 0, maxCards: 4 })],
};

const Moat: CardParams = {
  name: "Moat",
  types: [CardType.ACTION, CardType.REACTION],
  cost: 2,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [new DrawCards({ amount: 2 })],
  // TODO: reaction effects (I've hacked in the reaction for now)
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
      prompt: "You may choose a card from your discard pile to add to the top of your deck",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        if (activePlayer.discardPile.length == 0) return; // skip if the player's discard is empty

        const selectedCards = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "You may choose a card from your discard pile to add to the top of your deck",
          cardList: activePlayer.discardPile,
          maxCards: 1,
          sourceCard: card,
        });

        for (const card of selectedCards) {
          activePlayer.removeCard(card);
          activePlayer.drawPile.unshift(card);
        }
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
    {
      prompt: "The first time you play a silver this turn, gain $1",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const source = card; // create a reference to the merchant incase I need to use it later
        const gainMoneyOnFirstSilver: CardEffect = async (playedCard: Card, player: Player, game: Game) => {
          if (playedCard.name != BasicCards.Silver.name) return;
          //FIXME: this is slightly different than how merchant actually works, but I'm not going to create a generic "cards played" tracker yet
          if (activePlayer.cardsInPlay.filter((c) => c.name == BasicCards.Silver.name).length > 1) return;
          await new GainMoney({ amount: 1 }).effect(source, activePlayer, game);
        };
        activePlayer.onPlayCardTriggers.push(gainMoneyOnFirstSilver);
      },
    },
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
        const topCard = activePlayer.topNCards(1);
        if (topCard.length == 0) return; // just return if there's no cards in draw/discard piles
        game.discardCard(topCard[0], activePlayer);
        if (!topCard[0].types.includes(CardType.ACTION)) return; // exit early if the top card is not an action

        const choice = await activePlayer.playerInput.booleanChoice(activePlayer, game, {
          prompt: `You may play the action card discarded (${topCard[0].name})`,
          defaultChoice: true,
          sourceCard: card,
        });

        if (choice) {
          await game.playCard(topCard[0], activePlayer);
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
  playEffects: [
    {
      prompt: "Gain a card costing up to 4",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const input = new ChooseCardFromSupply(
          "Choose a card to gain costing 4 or less",
          game.supply,
          (pile) => pile.cards.length > 0 && pile.cards[0].calculateCost(game) <= 4
        );
        const selected = await input.getChoice();
        game.gainCardFromSupply(selected, activePlayer, false);
      },
    },
  ],
};
const Bureaucrat: CardParams = {
  name: "Bureaucrat",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    new GainCard({ name: BasicCards.Silver.name, toLocation: CardLocation.TOP_OF_DECK }),
    {
      // each other player reveals a victory card from their hand and top-decks it, or reveals their hand if they have no victory cards
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const otherPlayers = game.otherPlayers();
        for (const otherPlayer of otherPlayers) {
          await attack(card, otherPlayer, game, async () => {
            const victoryCardsInHand = otherPlayer.hand.filter((c) => c.types.includes(CardType.VICTORY));
            if (victoryCardsInHand.length == 0) {
              // if no victory cards, reveal on
              game.revealCards(otherPlayer.hand, otherPlayer);
              return;
            }
            const input = new CardsFromPlayerChoice("Choose victory card to topdeck", otherPlayer, victoryCardsInHand, {
              minCards: 1,
              maxCards: 1,
            });
            const selected = await input.getChoice();
            selected.forEach((c) => {
              otherPlayer.transferCard(c, otherPlayer.hand, otherPlayer.drawPile, CardPosition.TOP);
            });
          });
        }
      },
    },
  ],
};
const Gardens: CardParams = {
  name: "Gardens",
  types: [CardType.VICTORY],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  calculateVictoryPoints: (player: Player) => {
    return Math.floor(player.allCards().length / 10);
  },
};
const Militia: CardParams = {
  name: "Militia",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    new GainMoney({ amount: 2 }),
    {
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const otherPlayers = game.otherPlayers();
        for (const otherPlayer of otherPlayers) {
          await attack(card, otherPlayer, game, async () => {
            const handSize = otherPlayer.hand.length;
            const numToDiscard = handSize - 3;
            if (numToDiscard <= 0) return;
            const input = new CardsFromPlayerChoice("Choose cards to discard", otherPlayer, otherPlayer.hand, {
              minCards: numToDiscard,
              maxCards: numToDiscard,
            });
            const selected = await input.getChoice();
            selected.forEach((c) => game.discardCard(c, otherPlayer));
          });
        }
      },
    },
  ],
};
const Moneylender: CardParams = {
  name: "Moneylender",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    {
      prompt: "You may trash a copper from your hand for +3$",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const copper = activePlayer.hand.find((c) => (c.name = BasicCards.Copper.name));
        if (copper == undefined) return; // just return early if no coppers in hand

        const input = new BooleanChoice("Trash a copper from your hand for +3 copper", true);
        const selected = await input.getChoice();
        if (selected) {
          game.trashCard(copper, activePlayer);
          await new GainMoney({ amount: 3 }).effect(card, activePlayer, game);
        }
      },
    },
  ],
};
const Poacher: CardParams = {
  name: "Poacher",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 1 }),
    new GainActions({ amount: 1 }),
    new GainMoney({ amount: 1 }),
    {
      // discard a card for each empty pile in the supply
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const numberOfEmptyPiles = game.supply.emptyPiles().length;
        if (numberOfEmptyPiles == 0) return; // return early if nothing's empty
        const input = new CardsFromPlayerChoice("Choose cards to discard", activePlayer, activePlayer.hand, {
          minCards: numberOfEmptyPiles,
          maxCards: numberOfEmptyPiles,
        });
        const selected = await input.getChoice();
        selected.forEach((card) => {
          game.discardCard(card, activePlayer);
        });
      },
    },
  ],
};
const Remodel: CardParams = {
  name: "Remodel",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    // trash a card from your hand. Gain one costing up to 2 more than the trashed card
    {
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const input = new CardsFromPlayerChoice(
          "Choose a card from your hand to trash",
          activePlayer,
          activePlayer.hand,
          { minCards: 1, maxCards: 1 }
        );
        const selected = await input.getChoice();

        game.trashCard(selected[0], activePlayer);

        const toGain = new ChooseCardFromSupply(
          `Choose a card costing up to ${selected[0].calculateCost(game) + 2}`,
          game.supply,
          (pile) => pile.cards.length > 0 && pile.cards[0].calculateCost(game) <= selected[0].calculateCost(game) + 2
        );
        const gainPile = await toGain.getChoice();
        game.gainCardFromSupply(gainPile, activePlayer, false);
      },
    },
  ],
};
const Smithy: CardParams = {
  name: "Smithy",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [new DrawCards({ amount: 3 })],
};
const ThroneRoom: CardParams = {
  name: "Throne Room",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    {
      // play a card from your hand twice (it doesn't take additional actions)
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const input = new CardsFromPlayerChoice(
          "Choose an action card from your hand to play twice",
          activePlayer,
          activePlayer.hand.filter((card) => card.types.includes(CardType.ACTION)),
          { maxCards: 1 }
        );
        const selected = await input.getChoice();
        if (selected.length > 0) {
          await game.playCard(selected[0], activePlayer);
          await game.playCard(selected[0], activePlayer);
        }
      },
    },
  ],
};
const Bandit: CardParams = {
  name: "Bandit",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    new GainCard({ name: BasicCards.Gold.name }),
    {
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const otherPlayers = game.otherPlayers();
        for (const otherPlayer of otherPlayers) {
          attack(card, otherPlayer, game, async () => {
            const top2 = otherPlayer.topNCards(2);
            game.revealCards(top2, otherPlayer);
            const treasures = top2.filter((c) => c.name != BasicCards.Copper.name);
            const other = top2.filter((c) => !top2.includes(c));
            if (treasures.length > 0) {
              const input = new CardsFromPlayerChoice(
                "Choose an action card from your hand to play twice",
                otherPlayer,
                treasures,
                { minCards: 1, maxCards: 1 }
              );
              const selected = await input.getChoice();
              game.trashCard(selected[0], otherPlayer);
            }
            other.forEach((c) => game.discardCard(c, otherPlayer));
          });
        }
      },
    },
  ],
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
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const otherPlayers = game.players.filter((p) => p != activePlayer);
        otherPlayers.forEach((p) => p.drawCard());
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
  playEffects: [
    {
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const actions: Array<Card> = [];
        while (
          activePlayer.hand.length < 7 &&
          (activePlayer.drawPile.length > 0 || activePlayer.discardPile.length > 0)
        ) {
          const topCard = activePlayer.topNCards(1);
          if (!topCard[0].types.includes(CardType.ACTION)) {
            activePlayer.drawCard();
          } else {
            const input = new BooleanChoice(`Put action: ${topCard[0].name} into hand?`, true);
            const choice = await input.getChoice();
            if (choice) {
              activePlayer.drawCard();
            } else {
              const toSetAside = activePlayer.drawPile.shift()!;
              actions.unshift(toSetAside);
            }
          }
        }
        actions.forEach((c) => game.discardCard(c, activePlayer));
      },
    },
  ],
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
  playEffects: [
    // trash a treasure from your hand. Gain another treasure costing up to 3 more than the trashed card to your hand
    {
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const input = new CardsFromPlayerChoice(
          "Choose a treasure from your hand to trash",
          activePlayer,
          activePlayer.hand.filter((card) => card.types.includes(CardType.TREASURE)),
          { maxCards: 1 }
        );
        const selected = await input.getChoice();

        game.trashCard(selected[0], activePlayer);

        const toGain = new ChooseCardFromSupply(
          `Choose a treasure to gain costing up to ${selected[0].calculateCost(game) + 3}`,
          game.supply,
          (pile: CardPile) => {
            const pileLength = pile.cards.length;
            if (pileLength <= 0) return false; // return early if the pile is empty (so that later statements don't error)
            const pileCost = pile.cards[0].calculateCost(game);
            const pileIsTreasure = pile.cards[0].types.includes(CardType.TREASURE);
            const isApplicable = pileLength > 0 && pileCost <= selected[0].calculateCost(game) + 3 && pileIsTreasure;
            return isApplicable;
          }
        );
        const gainPile = await toGain.getChoice();
        game.gainCardFromSupply(gainPile, activePlayer, false, CardLocation.HAND);
      },
    },
  ],
};
const Sentry: CardParams = {
  name: "Sentry",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 1 }),
    new GainActions({ amount: 1 }),
    {
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const top2 = activePlayer.topNCards(2);
        const trashInput = new CardsFromPlayerChoice("Choose card(s) to trash", activePlayer, top2, {
          minCards: 0,
          maxCards: 2,
        });
        const toTrash = await trashInput.getChoice();
        toTrash.forEach((c) => game.trashCard(c, activePlayer));

        const remaining = top2.filter((c) => !toTrash.includes(c));
        if (remaining.length <= 0) return; // return early if both cards trashed

        const discardInput = new CardsFromPlayerChoice("Choose card(s) to discard", activePlayer, remaining);
        const toDiscard = await discardInput.getChoice();
        toDiscard.forEach((c) => game.discardCard(c, activePlayer));
        const afterDiscard = remaining.filter((c) => !toDiscard.includes(c));

        if (afterDiscard.length == 2) {
          // only provide the swap prompt if both cards are left
          const swapInput = new BooleanChoice(`Swap cards? ${afterDiscard.map((c) => c.name)}`, false);
          const shouldSwap = await swapInput.getChoice();
          if (shouldSwap) {
            // pop the top 2 cards from the draw pile
            const [c1, c2] = [activePlayer.drawPile.shift()!, activePlayer.drawPile.shift()!];
            // push them back in swapped order
            activePlayer.drawPile.unshift(c1);
            activePlayer.drawPile.unshift(c2);
          }
        }
      },
    },
  ],
};
const Witch: CardParams = {
  name: "Witch",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 2 }),
    {
      // each other player gains a curse
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const otherPlayers = game.otherPlayers();
        for (const otherPlayer of otherPlayers) {
          await attack(card, otherPlayer, game, async () => {
            game.gainCardByName(BasicCards.Curse.name, otherPlayer, false);
          });
        }
      },
    },
  ],
};
const Artisan: CardParams = {
  name: "Artisan",
  types: [CardType.ACTION],
  cost: 6,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  playEffects: [
    {
      prompt: "Gain a card to your hand costing up to 5",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const input = new ChooseCardFromSupply(
          `Choose a card costing up to 5`,
          game.supply,
          (pile) => pile.cards.length > 0 && pile.cards[0].calculateCost(game) <= 5
        );
        const pile = await input.getChoice();
        game.gainCardFromSupply(pile, activePlayer, false, CardLocation.HAND);
      },
    },
    {
      prompt: "Put a card from your hand onto your deck",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const input = new CardsFromPlayerChoice(
          "Choose a card from your hand to topdeck",
          activePlayer,
          activePlayer.hand,
          { minCards: 1, maxCards: 1 }
        );
        const selected = await input.getChoice();
        activePlayer.transferCard(selected[0], activePlayer.hand, activePlayer.drawPile, CardPosition.TOP);
      },
    },
  ],
};

export function register() {
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
}
register();

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
