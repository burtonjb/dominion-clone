import { cardConfigRegistry } from "../../di/configservice/CardConfigRegistry";
import { Card, CardParams, CardType, DominionExpansion } from "../../domain/objects/Card";
import { attack, OnGainCardTrigger } from "../../domain/objects/CardEffect";
import { Game } from "../../domain/objects/Game";
import { CardLocation, CardPosition, Player } from "../../domain/objects/Player";
import { GainParams } from "../../domain/objects/Reaction";
import { DrawToHandsize, TrashCardsFromHand } from "../effects/AdvancedEffects";
import { DrawCards, GainActions, GainBuys, GainMoney, GainVictoryTokens } from "../effects/BaseEffects";

const Anvil: CardParams = {
  name: "Anvil",
  types: [CardType.TREASURE],
  cost: 3,
  expansion: DominionExpansion.PROSPERITY,
  kingdomCard: true,
  playEffects: [
    new GainMoney({ amount: 1 }),
    {
      prompt: "You may discard a treasure to gain a card costing up to 4$",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const choice = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose a treasure from your hand to discard",
          minCards: 0,
          maxCards: 1,
          cardList: activePlayer.hand.filter((c) => c.types.includes(CardType.TREASURE)),
          sourceCard: card,
        });
        if (choice.length == 0) return;
        game.discardCard(choice[0], activePlayer);

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

const Watchtower: CardParams = {
  name: "Watchtower",
  types: [CardType.ACTION, CardType.REACTION],
  cost: 3,
  expansion: DominionExpansion.PROSPERITY,
  kingdomCard: true,
  playEffects: [new DrawToHandsize({ handsize: 6 })],
  reactionEffects: {
    onGainCardEffects: [
      async (owningPlayer: Player, cardWithEffect: Card, game: Game, gainParams: GainParams) => {
        if (owningPlayer != gainParams.gainedPlayer) return; // return early if it wasn't you that gain the card

        const shouldTrash = await owningPlayer.playerInput.chooseBoolean(owningPlayer, game, {
          prompt: `(Watchtower) Trash the gained card? ${gainParams.gainedCard.name}`,
          defaultChoice: false,
          sourceCard: cardWithEffect,
        });
        if (shouldTrash) {
          game.revealCards([cardWithEffect], owningPlayer);
          game.trashCard(gainParams.gainedCard, owningPlayer);
          return;
        }

        const shouldTopDeck = await owningPlayer.playerInput.chooseBoolean(owningPlayer, game, {
          prompt: `(Watchtower) Topdeck the gained card? ${gainParams.gainedCard.name}`,
          defaultChoice: false,
          sourceCard: cardWithEffect,
        });
        if (shouldTopDeck) {
          game.revealCards([cardWithEffect], owningPlayer);
          owningPlayer.removeCard(gainParams.gainedCard); // don't have a good way to look up the location of the card
          owningPlayer.drawPile.unshift(gainParams.gainedCard);
          game.eventLog.publishEvent({ type: "TopDeckCard", card: gainParams.gainedCard, player: owningPlayer });
        }
      },
    ],
  },
};

const Bishop: CardParams = {
  name: "Bishop",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.PROSPERITY,
  kingdomCard: true,
  playEffects: [
    new GainMoney({ amount: 1 }),
    new GainVictoryTokens({ amount: 1 }),
    {
      prompt:
        "Trash a card from your hand. +1VP per 2$ it costs (round down). Each other player may trash a card from their hand",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const toTrash = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Trash a card from your hand. +1VP per 2$ it costs",
          cardList: activePlayer.hand,
          sourceCard: card,
          minCards: 1,
          maxCards: 1,
        });
        if (toTrash.length > 0) {
          const victoryTokensToGain = Math.floor(toTrash[0].calculateCost(game) / 2);
          await new GainVictoryTokens({ amount: victoryTokensToGain }).effect(card, activePlayer, game);
          game.trashCard(toTrash[0], activePlayer);
        }

        for (const otherPlayer of game.otherPlayers()) {
          const toTrash = await otherPlayer.playerInput.chooseCardsFromList(otherPlayer, game, {
            prompt: "Trash a card from your hand?",
            cardList: otherPlayer.hand,
            sourceCard: card,
            minCards: 0,
            maxCards: 1,
          });
          if (toTrash.length > 0) {
            game.trashCard(toTrash[0], otherPlayer);
          }
        }
      },
    },
  ],
};

const Clerk: CardParams = {
  name: "Clerk",
  types: [CardType.ACTION, CardType.ATTACK, CardType.REACTION],
  cost: 4,
  expansion: DominionExpansion.PROSPERITY,
  kingdomCard: true,
  playEffects: [
    new GainMoney({ amount: 2 }),
    {
      prompt: "Each other player with 5 or more cards in hand puts 1 ontop of their deck",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        for (const otherPlayer of game.otherPlayers().filter((p) => p.hand.length >= 5)) {
          attack(card, otherPlayer, game, async () => {
            const toTopDeck = await otherPlayer.playerInput.chooseCardsFromList(otherPlayer, game, {
              prompt: "Choose a card to topdeck",
              cardList: otherPlayer.hand,
              sourceCard: card,
              minCards: 1,
              maxCards: 1,
            });
            if (toTopDeck.length == 0) return; //should not happen, filtering above already checked. But good practice to add this here

            otherPlayer.transferCard(toTopDeck[0], otherPlayer.hand, otherPlayer.drawPile, CardPosition.TOP);
            game.eventLog.publishEvent({ type: "TopDeckCard", card: toTopDeck[0], player: otherPlayer });
          });
        }
      },
    },
  ],
  reactionEffects: {
    onStartTurnEffects: [
      {
        prompt: "You may play this at the start of your turn",
        effect: async (card: Card, activePlayer: Player, game: Game) => {
          const shouldPlay = await activePlayer.playerInput.chooseBoolean(activePlayer, game, {
            prompt: "Play clerk from hand at start of turn?",
            defaultChoice: true,
            sourceCard: card,
          });
          if (shouldPlay) {
            game.playCard(card, activePlayer);
          }
        },
      },
    ],
  },
};

const Investment: CardParams = {
  name: "Investment",
  types: [CardType.TREASURE],
  cost: 4,
  expansion: DominionExpansion.PROSPERITY,
  kingdomCard: true,
  playEffects: [
    new TrashCardsFromHand({ minCards: 1, maxCards: 1 }),
    {
      prompt: "Choose 1: +1$ or trash this to reveal your hand and gain +1VP per differently named treasure",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const effect = await activePlayer.playerInput.chooseEffectFromList(activePlayer, game, {
          prompt: "Choose 1",
          choices: [
            new GainMoney({ amount: 1 }),
            {
              prompt: "Trash this to reveal your hand and gain +1VP per differently named treasure",
              effect: async (card: Card, player: Player, game: Game) => {
                if (!player.cardsInPlay.includes(card)) return; // exit if this is no longer in play - like if it was tiara'd
                game.trashCard(card, player);
                game.revealCards(player.hand, player);

                const treasureNames = player.hand.filter((c) => c.types.includes(CardType.TREASURE)).map((c) => c.name);
                const uniqueNames = new Set(treasureNames).size;

                await new GainVictoryTokens({ amount: uniqueNames }).effect(card, player, game);
              },
            },
          ],
          sourceCard: card,
          minChoices: 1,
          maxChoices: 1,
        });

        if (effect.length == 0) return;
        await effect[0].effect(card, activePlayer, game);
      },
    },
  ],
};

const Monument: CardParams = {
  name: "Monument",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.PROSPERITY,
  kingdomCard: true,
  playEffects: [new GainMoney({ amount: 2 }), new GainVictoryTokens({ amount: 1 })],
};

const Quarry: CardParams = {
  name: "Quarry",
  types: [CardType.TREASURE],
  cost: 4,
  expansion: DominionExpansion.PROSPERITY,
  kingdomCard: true,
  playEffects: [
    new GainMoney({ amount: 1 }),
    {
      prompt: "Actions cost 2$ less until end of turn",
      effect: async (card: Card, player: Player, game: Game) => {
        const reduceCostMod = (card: Card) => {
          if (card.types.includes(CardType.ACTION)) {
            return -2;
          } else {
            return 0;
          }
        };
        game.costModifiers.push(reduceCostMod);
      },
    },
  ],
};

const Tiara: CardParams = {
  name: "Tiara",
  types: [CardType.TREASURE],
  cost: 4,
  expansion: DominionExpansion.PROSPERITY,
  kingdomCard: true,
  playEffects: [
    new GainBuys({ amount: 1 }),
    {
      prompt: "This turn, when you gain a card you may topdeck it",
      effect: async (card: Card, player: Player, game: Game) => {
        const onGain = new OnGainCardTrigger(
          true,
          async (gainedCard: Card, gainer: Player, game: Game, wasBought: boolean, toLocation?: CardLocation) => {
            const shouldTopDeck = await player.playerInput.chooseBoolean(player, game, {
              prompt: `Topdeck the gained card? [${gainedCard.name}]`,
              defaultChoice: true,
              sourceCard: card,
            });

            if (shouldTopDeck) {
              player.removeCard(gainedCard); // don't have a good way to look up the location of the card. I'm also not sure on the interaction if the gained card goes somewhere else
              player.drawPile.unshift(gainedCard);
              game.eventLog.publishEvent({ type: "TopDeckCard", card: gainedCard, player: player });
            }
          }
        );

        player.onGainCardTriggers.push(onGain);
      },
    },
    {
      prompt: "You may play a treasure card twice from your hand",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selected = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose an action card from your hand to play twice",
          cardList: activePlayer.hand.filter((card) => card.types.includes(CardType.TREASURE)),
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

const WorkersVillage: CardParams = {
  name: "Worker's Village",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.PROSPERITY,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 1 }),
    new GainActions({amount: 2}),
    new GainBuys({amount: 1})
  ]
}

export function register() {
  cardConfigRegistry.registerAll(Anvil, Watchtower, Bishop, Clerk, Investment, Monument, Quarry, Tiara, WorkersVillage);
}
register();

export { Anvil, Watchtower, Bishop, Clerk, Investment, Monument, Quarry, Tiara, WorkersVillage };
