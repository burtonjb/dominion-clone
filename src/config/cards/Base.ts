import { cardConfigRegistry } from "../../di/configservice/CardConfigRegistry";
import { Card, CardParams, CardType, DominionExpansion } from "../../domain/objects/Card";
import { attack, CardEffect } from "../../domain/objects/CardEffect";
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
        const source = card; // create a reference to the merchant as I use it later
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
      prompt: "Discard the top card from your draw pile. If its an action you may play it",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const topCard = activePlayer.topNCards(1);
        if (topCard.length == 0) return; // just return if there's no cards in draw/discard piles
        game.discardCard(topCard[0], activePlayer);
        if (!topCard[0].types.includes(CardType.ACTION)) return; // exit early if the top card is not an action

        const choice = await activePlayer.playerInput.chooseBoolean(activePlayer, game, {
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
        const selected = await activePlayer.playerInput.choosePileFromSupply(activePlayer, game, {
          prompt: "Choose a card to gain costing 4 or less",
          filter: (pile) => pile.cards.length > 0 && pile.cards[0].calculateCost(game) <= 4,
          sourceCard: card,
        });

        if (!selected) return; // return early in cases like there's no piles costing 4 or less (unlikely, but could happen)

        await game.gainCardFromSupply(selected, activePlayer, false);
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
      prompt: "Each other player topdecks a victory card from hand (or reveals they can't)",
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
            const selected = await activePlayer.playerInput.chooseCardsFromList(otherPlayer, game, {
              prompt: "Choose victory card to topdeck",
              cardList: victoryCardsInHand,
              minCards: 1,
              maxCards: 1,
              sourceCard: card,
            });

            for (const card of selected) {
              otherPlayer.transferCard(card, otherPlayer.hand, otherPlayer.drawPile, CardPosition.TOP);
            }
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
  text: "Worth 1 VP per 10 cards you have (round down)",
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
      prompt: "Each other player discards down to 3 cards in hand",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const otherPlayers = game.otherPlayers();
        for (const otherPlayer of otherPlayers) {
          await attack(card, otherPlayer, game, async () => {
            const handSize = otherPlayer.hand.length;
            const numToDiscard = handSize - 3;
            if (numToDiscard <= 0) return;

            const toDiscard = await otherPlayer.playerInput.chooseCardsFromList(otherPlayer, game, {
              prompt: `Choose ${numToDiscard} cards to discard`,
              cardList: otherPlayer.hand,
              sourceCard: card,
              minCards: numToDiscard,
              maxCards: numToDiscard,
            });

            for (const card of toDiscard) {
              game.discardCard(card, otherPlayer);
            }
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
        const copper = activePlayer.hand.find((c) => c.name == BasicCards.Copper.name);
        if (copper == undefined) return; // just return early if no coppers in hand

        const selected = await activePlayer.playerInput.chooseBoolean(activePlayer, game, {
          prompt: "Trash a copper from hand for +3$?",
          defaultChoice: true,
          sourceCard: card,
        });

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
      prompt: "Discard a card from hand for each empty pile",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const numberOfEmptyPiles = game.supply.emptyPiles().length;
        if (numberOfEmptyPiles == 0) return; // return early if nothing's empty

        const selected = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose cards to discard",
          minCards: numberOfEmptyPiles,
          maxCards: numberOfEmptyPiles,
          cardList: activePlayer.hand,
          sourceCard: card,
        });

        for (const card of selected) {
          game.discardCard(card, activePlayer);
        }
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
    {
      prompt: "Trash a card from your hand. Gain one costing up to 2 more",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selected = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose a card from your hand to trash",
          cardList: activePlayer.hand,
          minCards: 1,
          maxCards: 1,
          sourceCard: card,
        });

        if (selected.length == 0) return; // return early - in cases like there's no cards in hand so something

        game.trashCard(selected[0], activePlayer);

        const gainPile = await activePlayer.playerInput.choosePileFromSupply(activePlayer, game, {
          prompt: `Choose a card costing up to ${selected[0].calculateCost(game) + 2}`,
          filter: (pile) =>
            pile.cards.length > 0 && pile.cards[0].calculateCost(game) <= selected[0].calculateCost(game) + 2,
          sourceCard: card,
        });

        if (!gainPile) return; // return early if no options

        await game.gainCardFromSupply(gainPile, activePlayer, false);
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
      prompt: "You may play an action card from your hand twice",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selected = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose an action card from your hand to play twice",
          cardList: activePlayer.hand.filter((card) => card.types.includes(CardType.ACTION)),
          sourceCard: card,
          maxCards: 1,
        });

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
      prompt:
        " Each other player reveals the top 2 cards of their deck, trashes a revealed Treasure other than Copper, and discards the rest",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const otherPlayers = game.otherPlayers();
        for (const otherPlayer of otherPlayers) {
          attack(card, otherPlayer, game, async () => {
            const top2 = otherPlayer.topNCards(2);
            game.revealCards(top2, otherPlayer);
            const treasures = top2
              .filter((c) => c.types.includes(CardType.TREASURE))
              .filter((c) => c.name != BasicCards.Copper.name);
            const other = top2.filter((c) => !top2.includes(c));
            if (treasures.length > 0) {
              const selected = await otherPlayer.playerInput.chooseCardsFromList(otherPlayer, game, {
                prompt: "Choose a card to trash",
                cardList: treasures,
                sourceCard: card,
                minCards: 1,
                maxCards: 1,
              });

              if (selected.length == 0) return;

              game.trashCard(selected[0], otherPlayer);
            }
            for (const card of other) {
              game.discardCard(card, otherPlayer);
            }
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
      prompt:
        "Draw until you have 7 cards in hand, skipping any Action cards you choose to; set those aside, discarding them afterwards.",
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
            const choice = await activePlayer.playerInput.chooseBoolean(activePlayer, game, {
              prompt: `Put action: ${topCard[0].name} into hand?`,
              defaultChoice: true,
              sourceCard: card,
            });

            if (choice) {
              activePlayer.drawCard();
            } else {
              const toSetAside = activePlayer.drawPile.shift()!;
              actions.push(toSetAside);
            }
          }
        }

        for (const card of actions) {
          game.discardCard(card, activePlayer);
        }
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
    {
      prompt: "Trash a treasure from your hand. Gain a treasure to your hand costing up to 3$ than it.",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selected = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose a treasure from your hand to trash",
          cardList: activePlayer.hand.filter((card) => card.types.includes(CardType.TREASURE)),
          sourceCard: card,
          minCards: 1,
          maxCards: 1,
        });

        if (selected.length == 0) return;

        game.trashCard(selected[0], activePlayer);

        const gainPile = await activePlayer.playerInput.choosePileFromSupply(activePlayer, game, {
          prompt: `Choose a treasure to gain costing up to ${selected[0].calculateCost(game) + 3}`,
          filter: (pile) =>
            pile.cards.length > 0 &&
            pile.cards[0].types.includes(CardType.TREASURE) &&
            pile.cards[0].calculateCost(game) <= selected[0].calculateCost(game) + 3,
          sourceCard: card,
        });

        if (!gainPile) return; // return early if no choices

        await game.gainCardFromSupply(gainPile, activePlayer, false, CardLocation.HAND);
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
      prompt:
        "Look at the top 2 cards of your deck. Trash and/or discard any number of them. Put the rest back on top in any order.",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const top2 = activePlayer.topNCards(2);
        const toTrash = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose up to 2 cards to trash",
          cardList: top2,
          sourceCard: card,
          minCards: 0,
          maxCards: 2,
        });

        for (const card of toTrash) {
          game.trashCard(card, activePlayer);
        }

        const remaining = top2.filter((c) => !toTrash.includes(c));
        if (remaining.length <= 0) return; // return early if both cards trashed

        const toDiscard = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose up to 2 card(s) to discard",
          cardList: remaining,
          sourceCard: card,
          minCards: 0,
          maxCards: 2,
        });
        for (const card of toDiscard) {
          game.discardCard(card, activePlayer);
        }

        const afterDiscard = remaining.filter((c) => !toDiscard.includes(c));

        if (afterDiscard.length == 2) {
          // only provide the swap prompt if both cards are left
          const shouldSwap = await activePlayer.playerInput.chooseBoolean(activePlayer, game, {
            prompt: "Swap the top two cards?",
            defaultChoice: false,
            sourceCard: card,
          });
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
      prompt: "Each other player gains a curse",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const otherPlayers = game.otherPlayers();
        for (const otherPlayer of otherPlayers) {
          await attack(card, otherPlayer, game, async () => {
            await game.gainCardByName(BasicCards.Curse.name, otherPlayer, false);
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
        const pile = await activePlayer.playerInput.choosePileFromSupply(activePlayer, game, {
          prompt: "Choose a card costing up to 5",
          filter: (pile) => pile.cards.length > 0 && pile.cards[0].calculateCost(game) <= 5,
          sourceCard: card,
        });

        if (!pile) return;

        await game.gainCardFromSupply(pile, activePlayer, false, CardLocation.HAND);
      },
    },
    {
      prompt: "Put a card from your hand onto your deck",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selected = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose a card from your hand to topdeck",
          cardList: activePlayer.hand,
          minCards: 1,
          maxCards: 1,
          sourceCard: card,
        });
        if (selected.length == 0) return;

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
