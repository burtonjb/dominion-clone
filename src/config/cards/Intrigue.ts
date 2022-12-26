import { cardConfigRegistry } from "../../di/configservice/CardConfigRegistry";
import { Card, CardParams, CardType, DominionExpansion } from "../../domain/objects/Card";
import { attack } from "../../domain/objects/CardEffect";
import { Game } from "../../domain/objects/Game";
import { CardLocation, CardPosition, Player } from "../../domain/objects/Player";
import { DrawCards, GainActions, GainBuys, GainCard, GainMoney } from "../effects/BaseEffects";
import * as BasicCards from "./Basic";
import { TrashCardsFromHand } from "../effects/AdvancedEffects";

const Courtyard: CardParams = {
  name: "Courtyard",
  types: [CardType.ACTION],
  cost: 2,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 3 }),
    {
      prompt: "Choose a card from your hand to topdeck",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selected = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose a card from your hand to topdeck",
          cardList: activePlayer.hand,
          minCards: 1,
          maxCards: 1,
          sourceCard: card,
        });

        if (selected.length > 0) {
          // You could get in the 0-length case if you have no other cards in hand and no cards in deck (through really silly trashing)
          activePlayer.transferCard(selected[0], activePlayer.hand, activePlayer.drawPile, CardPosition.TOP);
        }
      },
    },
  ],
};

const Lurker: CardParams = {
  name: "Lurker",
  types: [CardType.ACTION],
  cost: 2,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    new GainActions({ amount: 1 }),
    {
      prompt: "Choose 1: trash an action from the supply or gain an action from the trash",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selected = await activePlayer.playerInput.chooseEffectFromList(activePlayer, game, {
          prompt: "Choose 1",
          minChoices: 1,
          maxChoices: 1,
          choices: [
            {
              prompt: "Trash an action from the supply",
              effect: async (card: Card, activePlayer: Player, game: Game) => {
                const pile = await activePlayer.playerInput.choosePileFromSupply(activePlayer, game, {
                  prompt: `Trash an action from the supply`,
                  filter: (pile) => pile.cards.length > 0 && pile.cards[0].types.includes(CardType.ACTION),
                  sourceCard: card,
                });

                if (!pile) return;

                game.trashCardFromSupply(pile, activePlayer);
              },
            },
            {
              prompt:
                "Gain an action from the trash. [Available ${game.trash.filter((c) => c.types.includes(CardType.ACTION)).map(c => c.name)}]",
              effect: async (card: Card, activePlayer: Player, game: Game) => {
                const selected = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
                  prompt: `Gain an action from the trash.`,
                  cardList: game.trash.filter((c) => c.types.includes(CardType.ACTION)),
                  sourceCard: card,
                  minCards: 1,
                  maxCards: 1,
                });

                if (selected.length > 0) {
                  // remove the card from the supply and have the player gain it
                  const index = game.trash.indexOf(selected[0]);
                  game.trash.splice(index, 1);
                  await game.gainCard(selected[0], activePlayer, false, CardLocation.DISCARD);
                }
              },
            },
          ],
          sourceCard: card,
        });

        if (selected.length > 0) {
          await selected[0].effect(card, activePlayer, game);
        }
      },
    },
  ],
};

const Pawn: CardParams = {
  name: "Pawn",
  types: [CardType.ACTION],
  cost: 2,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    {
      prompt: "Choose 2: +1 card, +1 action, +1 money, +1 buy",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selected = await activePlayer.playerInput.chooseEffectFromList(activePlayer, game, {
          prompt: "Choose 2",
          choices: [
            new GainActions({ amount: 1 }),
            new GainMoney({ amount: 1 }),
            new DrawCards({ amount: 1 }),
            new GainBuys({ amount: 1 }),
          ],
          minChoices: 2,
          maxChoices: 2,
          sourceCard: card,
        });

        for (const choice of selected) {
          await choice.effect(card, activePlayer, game);
        }
      },
    },
  ],
};

const Masquerade: CardParams = {
  name: "Masquerade",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 2 }),
    {
      prompt: "Each player with cards in their hand passes one card to the player on their left (all at once).",
      effect: async (thisCard: Card, activePlayer: Player, game: Game) => {
        const allPlayersWithNonEmptyHands = game.players.filter((p) => p.hand.length > 0);
        if (allPlayersWithNonEmptyHands.length <= 1) return; // return early if no cards will be passed

        const promises = allPlayersWithNonEmptyHands.map((p) =>
          p.playerInput.chooseCardsFromList(p, game, {
            prompt: "Select 1 card to pass to the next player",
            cardList: p.hand,
            sourceCard: thisCard,
            minCards: 1,
            maxCards: 1,
          })
        );

        const selectedCards: Array<Array<Card>> = [];
        for (let i = 0; i < promises.length; i++) {
          selectedCards[i] = await promises[i];
        }

        // each player removes their selected card from their hand and then the next player is giving that card (does not trigger "gain" effects)
        for (let i = 0; i < allPlayersWithNonEmptyHands.length; i++) {
          const currentCard = selectedCards[i][0];
          const currentPlayer = allPlayersWithNonEmptyHands[i];
          const nextPlayer = allPlayersWithNonEmptyHands[(i + 1) % allPlayersWithNonEmptyHands.length];
          currentPlayer.removeCard(currentCard);
          nextPlayer.hand.push(currentCard);
          game.eventLog.publishEvent({ type: "CardPutInHand", player: nextPlayer, card: currentCard });
        }
      },
    },
    new TrashCardsFromHand({ minCards: 0, maxCards: 1 }),
  ],
};

const ShantyTown: CardParams = {
  name: "Shanty Town",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    new GainActions({ amount: 2 }),
    {
      prompt: "Reveal your hand. If you have no actions, draw 2 cards",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        game.revealCards(activePlayer.hand, activePlayer);
        if (activePlayer.hand.filter((c) => c.types.includes(CardType.ACTION)).length == 0) {
          await new DrawCards({ amount: 2 }).effect(card, activePlayer, game);
        }
      },
    },
  ],
};

const Steward: CardParams = {
  name: "Steward",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    {
      prompt: "Choose 1: +2 cards, or +2 money, or trash 2 cards from your hand",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selected = await activePlayer.playerInput.chooseEffectFromList(activePlayer, game, {
          prompt: "Choose 1",
          choices: [
            new DrawCards({ amount: 2 }),
            new GainMoney({ amount: 2 }),
            new TrashCardsFromHand({ minCards: 2, maxCards: 2 }),
          ],
          sourceCard: card,
          minChoices: 1,
          maxChoices: 1,
        });

        if (selected.length > 0) {
          await selected[0].effect(card, activePlayer, game);
        }
      },
    },
  ],
};

const Swindler: CardParams = {
  name: "Swindler",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 3,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    new GainMoney({ amount: 2 }),
    {
      prompt:
        "Each other player trashes the top card of their deck and gains a card with the same cost that you choose.",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const otherPlayers = game.otherPlayers();
        for (const otherPlayer of otherPlayers) {
          await attack(card, otherPlayer, game, async () => {
            const topCards = otherPlayer.topNCards(1);
            if (topCards.length == 0) return; // return early if no cards left to trash

            const topCard = topCards[0];
            game.trashCard(topCard, otherPlayer);

            const applicableCosts = game.supply
              .allPiles()
              .filter((p) => p.cards.length > 0 && p.cards[0].calculateCost(game) == topCard.calculateCost(game));
            if (applicableCosts.length == 0) return; // return early if there's no cards with a valid cost

            const gainPile = await activePlayer.playerInput.choosePileFromSupply(activePlayer, game, {
              prompt: `Swindled! Choose a card costing exactly ${topCard.calculateCost(game)} for ${
                otherPlayer.name
              } to gain`,
              sourceCard: card,
              filter: (pile) =>
                pile.cards.length > 0 && pile.cards[0].calculateCost(game) == topCard.calculateCost(game),
            });

            if (!gainPile) return;

            await game.gainCardFromSupply(gainPile, otherPlayer, false);
          });
        }
      },
    },
  ],
};

const WishingWell: CardParams = {
  name: "Wishing Well",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 1 }),
    new GainActions({ amount: 1 }),
    {
      prompt: "Name a card and then reveal the top card. If you named it, put it into your hand",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const input = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Name the top card of your deck",
          cardList: game.getAllUniqueCards(),
          sourceCard: card,
          minCards: 1,
          maxCards: 1,
        });
        if (input.length == 0) return;
        const named = input[0].name;

        const topCards = activePlayer.topNCards(1);
        if (topCards.length == 0) return; // return early if no cards

        const topCard = topCards[0];
        game.revealCards(topCards, activePlayer);
        if (topCard.name.toLowerCase() == named.toLowerCase()) {
          activePlayer.transferCard(topCard, activePlayer.drawPile, activePlayer.hand, CardPosition.TOP);
          // TODO: publish event for putting card in hand
        }
      },
    },
  ],
};

const Baron: CardParams = {
  name: "Baron",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    new GainBuys({ amount: 1 }),
    {
      prompt: "You may discard an Estate. If you do +4 money otherwise gain an estate",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        // handle case when no estate in hand - just gain an estate
        if (activePlayer.hand.filter((c) => c.name == BasicCards.Estate.name).length < 1) {
          await new GainCard({ name: BasicCards.Estate.name }).effect(card, activePlayer, game);
          return;
        }

        // otherwise allow the player to discard or not (assume +4$ is the better choice)
        const selected = await activePlayer.playerInput.chooseBoolean(activePlayer, game, {
          defaultChoice: true,
          sourceCard: card,
          prompt: "`Discard an estate for +4 $? Otherwise gain an estate`",
        });

        if (selected) {
          await new GainMoney({ amount: 4 }).effect(card, activePlayer, game);
          game.discardCard(activePlayer.hand.find((c) => c.name == BasicCards.Estate.name)!, activePlayer);
        } else {
          await new GainCard({ name: BasicCards.Estate.name }).effect(card, activePlayer, game);
        }
      },
    },
  ],
};

const Bridge: CardParams = {
  name: "Bridge",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    new GainBuys({ amount: 1 }),
    new GainMoney({ amount: 1 }),
    {
      prompt: "Reduce the cost of all cards buy -1$ until end of turn",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const reduceCostMod = (card: Card) => -1;
        game.costModifiers.push(reduceCostMod);
      },
    },
  ],
};

const Conspirator: CardParams = {
  name: "Conspirator",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    new GainMoney({ amount: 2 }),
    {
      prompt: "If you have 3 or more Actions this turn (counting this), +1 Card and +1 Action.",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        // This is a little different than how it works in actual dominion - this counts the number of cards in play,
        // but in real dominion it counts the number of actions played. This only affects Throne Room I think
        if (activePlayer.cardsInPlay.filter((c) => c.types.includes(CardType.ACTION)).length >= 3) {
          await new GainActions({ amount: 1 }).effect(card, activePlayer, game);
          await new DrawCards({ amount: 1 }).effect(card, activePlayer, game);
        }
      },
    },
  ],
};

const Diplomat: CardParams = {
  name: "Diplomat",
  types: [CardType.ACTION, CardType.REACTION],
  cost: 4,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 2 }),
    {
      prompt: "If you have 5 or fewer cards in hand (after drawing), +2 actions",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        if (activePlayer.hand.length <= 5) {
          await new GainActions({ amount: 2 }).effect(card, activePlayer, game);
        }
      },
    },
  ],
  // TODO: reaction effect for being attacked
};

const Ironworks: CardParams = {
  name: "Ironworks",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    {
      prompt: "Gain a card costing up to $4. If its an: (action: +1 action), (treasure: +1$), (victory: +1 card)",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selected = await activePlayer.playerInput.choosePileFromSupply(activePlayer, game, {
          prompt: "Choose a card to gain costing 4 or less",
          sourceCard: card,
          filter: (pile) => pile.cards.length > 0 && pile.cards[0].calculateCost(game) <= 4,
        });
        if (!selected) return;

        const gainedCard = await await game.gainCardFromSupply(selected, activePlayer, false);

        // if card was not gained successfully, return early
        if (!gainedCard) return;

        // Get bonuses based on the type of the card that is gained
        if (gainedCard && gainedCard.types.includes(CardType.ACTION)) {
          await new GainActions({ amount: 1 }).effect(card, activePlayer, game);
        }
        if (gainedCard.types.includes(CardType.TREASURE)) {
          await new GainMoney({ amount: 1 }).effect(card, activePlayer, game);
        }
        if (gainedCard.types.includes(CardType.VICTORY)) {
          await new DrawCards({ amount: 1 }).effect(card, activePlayer, game);
        }
      },
    },
  ],
};

const Mill: CardParams = {
  name: "Mill",
  types: [CardType.ACTION, CardType.VICTORY],
  cost: 4,
  victoryPoints: 1,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 1 }),
    new GainActions({ amount: 1 }),
    {
      prompt: "You may discard two cards for +2 money",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selected = await activePlayer.playerInput.chooseBoolean(activePlayer, game, {
          defaultChoice: false,
          sourceCard: card,
          prompt: "Discard two cards for +2 money?",
        });

        if (selected) {
          const selectedCards = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
            prompt: "Discard two cards from your hand",
            cardList: activePlayer.hand,
            sourceCard: card,
            minCards: 2,
            maxCards: 2,
          });

          for (const card of selectedCards) {
            game.discardCard(card, activePlayer);
          }

          if (selectedCards.length >= 2) {
            await new GainMoney({ amount: 2 }).effect(card, activePlayer, game);
          }
        }
      },
    },
  ],
};

const MiningVillage: CardParams = {
  name: "Mining Village",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 1 }),
    new GainActions({ amount: 2 }),
    {
      prompt: "You may trash this for +2 money",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selected = await activePlayer.playerInput.chooseBoolean(activePlayer, game, {
          prompt: "Trash this for +2 money?",
          defaultChoice: false,
          sourceCard: card,
        });

        if (selected) {
          game.trashCard(card, activePlayer);
          await new GainMoney({ amount: 2 }).effect(card, activePlayer, game);
        }
      },
    },
  ],
};

const SecretPassage: CardParams = {
  name: "Secret Passage",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 2 }),
    new GainActions({ amount: 1 }),
    {
      prompt: "Take a card from your hand an place it anywhere in your deck",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selectedCards = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Select a card from your hand to place into your deck",
          cardList: activePlayer.hand,
          sourceCard: card,
          minCards: 1,
          maxCards: 1,
        });
        if (selectedCards.length <= 0) return;
        const selectedCard = selectedCards[0];

        const pos = await activePlayer.playerInput.chooseInteger(activePlayer, game, {
          prompt: "Choose the place to put the card into your draw pile",
          defaultValue: 0,
          minValue: 0,
          maxValue: activePlayer.drawPile.length - 1,
        });

        activePlayer.removeCard(selectedCard);
        activePlayer.drawPile.splice(pos, 0, selectedCard); // insert into draw pile at pos (splice is kind of a dumb function, but it seems to work)
      },
    },
  ],
};

const Courtier: CardParams = {
  name: "Courtier",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    {
      prompt: "Reveal a card from your hand. For each type it has choose 1: +1 Action, +1 Buy, +3 money, gain a gold",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selectedCards = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Reveal a card from your hand to choose 1 effect per type on the revealed card",
          cardList: activePlayer.hand,
          sourceCard: card,
          minCards: 1,
          maxCards: 1,
        });
        game.revealCards(selectedCards, activePlayer);

        if (selectedCards.length > 0) {
          const selectedCard = selectedCards[0];
          const choices = selectedCard.types.length;
          const selected = await activePlayer.playerInput.chooseEffectFromList(activePlayer, game, {
            prompt: `Choose ${choices} effects (all must be different)`,
            choices: [
              new GainActions({ amount: 1 }),
              new GainBuys({ amount: 1 }),
              new GainMoney({ amount: 3 }),
              new GainCard({ name: BasicCards.Gold.name }),
            ],
            sourceCard: card,
            minChoices: choices,
            maxChoices: choices,
          });

          for (const choice of selected) {
            await choice.effect(card, activePlayer, game);
          }
        }
      },
    },
  ],
};

const Duke: CardParams = {
  name: "Duke",
  types: [CardType.VICTORY],
  cost: 5,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  text: "Worth 1 VP per duchy you have",
  calculateVictoryPoints: (player: Player) => {
    return player.allCards().filter((c) => c.name == BasicCards.Duchy.name).length;
  },
};

const Minion: CardParams = {
  name: "Minion",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 5,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    new GainActions({ amount: 1 }),
    {
      prompt:
        "Choose 1: +2 money, or discard your hand and draw 4 cards and each other player with at least 5 cards in hand discards their hand and draws 4 cards",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selected = await activePlayer.playerInput.chooseEffectFromList(activePlayer, game, {
          prompt: "Choose 1",
          choices: [
            new GainMoney({ amount: 2 }),
            {
              prompt:
                "Discard your hand and draw 4 cards. Each other player with at least 5 cards in hand discards their hand and draws 4 cards",
              effect: async (card: Card, activePlayer: Player, game: Game) => {
                const hand = activePlayer.hand.slice();
                for (const card of hand) {
                  game.discardCard(card, activePlayer);
                }
                await new DrawCards({ amount: 4 }).effect(card, activePlayer, game);

                const otherPlayers = game.otherPlayers();
                for (const otherPlayer of otherPlayers) {
                  await attack(card, otherPlayer, game, async () => {
                    if (otherPlayer.hand.length >= 5) {
                      const hand = otherPlayer.hand.slice();
                      for (const card of hand) {
                        game.discardCard(card, otherPlayer);
                      }
                      await new DrawCards({ amount: 4 }).effect(card, otherPlayer, game);
                    }
                  });
                }
              },
            },
          ],
          sourceCard: card,
          minChoices: 1,
          maxChoices: 1,
        });

        for (const choice of selected) {
          await choice.effect(card, activePlayer, game);
        }
      },
    },
  ],
};

const Patrol: CardParams = {
  name: "Patrol",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 3 }),
    {
      // This is slightly different than how it actually works - I don't have a prompt for re-ordering the revealed cards
      prompt: "Reveal the top 4 cards of your deck. Put the Victory cards and Curses into your hand.",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const top4 = activePlayer.topNCards(4);
        game.revealCards(top4, activePlayer);
        const toHand = top4.filter((c) => c.types.includes(CardType.CURSE) || c.types.includes(CardType.VICTORY));
        for (const c of toHand) {
          activePlayer.transferCard(c, activePlayer.drawPile, activePlayer.hand, CardPosition.BOTTOM);
        }
      },
    },
  ],
};

const Replace: CardParams = {
  name: "Replace",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 5,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    {
      prompt:
        "Trash a card from your hand. Gain a card costing up to $2 more than it. If the gained card is an Action or Treasure, put it onto your deck; if it's a Victory card, each other player gains a Curse.",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selected = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Trash a card from your hand",
          cardList: activePlayer.hand,
          sourceCard: card,
          minCards: 1,
          maxCards: 1,
        });
        if (selected.length == 0) return;
        const selectedCard = selected[0];
        game.trashCard(selectedCard, activePlayer);

        const gainPile = await activePlayer.playerInput.choosePileFromSupply(activePlayer, game, {
          prompt: `Choose a card costing up to ${selectedCard.calculateCost(game) + 2}`,
          filter: (pile) =>
            pile.cards.length > 0 && pile.cards[0].calculateCost(game) <= selectedCard.calculateCost(game) + 2,
          sourceCard: card,
        });
        if (!gainPile) return;

        const cardToGain = gainPile.cards[0];
        if (cardToGain.types.includes(CardType.ACTION) || cardToGain.types.includes(CardType.TREASURE)) {
          await game.gainCardFromSupply(gainPile, activePlayer, false, CardLocation.TOP_OF_DECK);
        } else {
          await game.gainCardFromSupply(gainPile, activePlayer, false);
        }
        if (cardToGain.types.includes(CardType.VICTORY)) {
          const otherPlayers = game.otherPlayers();
          for (const otherPlayer of otherPlayers) {
            await attack(card, otherPlayer, game, async () => {
              await game.gainCardByName(BasicCards.Curse.name, otherPlayer, false);
            });
          }
        }
      },
    },
  ],
};

const Torturer: CardParams = {
  name: "Torturer",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 5,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 3 }),
    {
      prompt: "Each other player either discards two cards or gains a curse to their hand",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const otherPlayers = game.otherPlayers();
        for (const otherPlayer of otherPlayers) {
          await attack(card, otherPlayer, game, async () => {
            const selected = await otherPlayer.playerInput.chooseEffectFromList(activePlayer, game, {
              prompt: "Choose 1",
              choices: [
                {
                  prompt: "Discard two cards from your hand",
                  effect: async (c: Card, p: Player, g: Game) => {
                    const selectedCards = await otherPlayer.playerInput.chooseCardsFromList(otherPlayer, game, {
                      prompt: "Discard two cards from your hand",
                      cardList: otherPlayer.hand,
                      sourceCard: card,
                      minCards: 2,
                      maxCards: 2,
                    });

                    for (const card of selectedCards) {
                      game.discardCard(card, otherPlayer);
                    }
                  },
                },
                new GainCard({ name: BasicCards.Curse.name, toLocation: CardLocation.HAND }),
              ],
              sourceCard: card,
              minChoices: 1,
              maxChoices: 1,
            });

            for (const effect of selected) {
              await effect.effect(card, otherPlayer, game);
            }
          });
        }
      },
    },
  ],
};

const TradingPost: CardParams = {
  name: "Trading Post",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    {
      prompt: "Trash 2 cards from your hand to gain a silver to your hand",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selectedCards = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Trash 2 cards from your hand",
          cardList: activePlayer.hand,
          sourceCard: card,
          minCards: 2,
          maxCards: 2,
        });

        for (const card of selectedCards) {
          game.trashCard(card, activePlayer);
        }

        if (selectedCards.length == 2) {
          await game.gainCardByName(BasicCards.Silver.name, activePlayer, false, CardLocation.HAND);
        }
      },
    },
  ],
};

const Upgrade: CardParams = {
  name: "Upgrade",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 1 }),
    new GainActions({ amount: 1 }),
    {
      prompt: "Trash a card from your hand. Gain a card costing exactly $1 more than it",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selected = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose a card from your hand to trash",
          sourceCard: card,
          cardList: activePlayer.hand,
          minCards: 1,
          maxCards: 1,
        });
        if (selected.length == 0) return; // return early if no cards picked

        game.trashCard(selected[0], activePlayer);

        const applicableCosts = game.supply
          .allPiles()
          .filter((p) => p.cards.length > 0 && p.cards[0].calculateCost(game) == selected[0].calculateCost(game) + 1);
        if (applicableCosts.length == 0) return; // return early if there's no cards with a valid cost

        const gainPile = await activePlayer.playerInput.choosePileFromSupply(activePlayer, game, {
          prompt: `Choose a card costing exactly ${selected[0].calculateCost(game) + 1}$ to gain`,
          filter: (pile) =>
            pile.cards.length > 0 && pile.cards[0].calculateCost(game) == selected[0].calculateCost(game) + 1,
          sourceCard: card,
        });
        if (!gainPile) return;

        await game.gainCardFromSupply(gainPile, activePlayer, false);
      },
    },
  ],
};

const Harem: CardParams = {
  name: "Harem",
  types: [CardType.VICTORY, CardType.TREASURE],
  cost: 6,
  worth: 2,
  victoryPoints: 2,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [new GainMoney({ amount: 2 })],
};

const Nobles: CardParams = {
  name: "Nobles",
  types: [CardType.VICTORY, CardType.ACTION],
  cost: 6,
  victoryPoints: 2,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    {
      prompt: "Choose 1: +3 cards, or +2 actions",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const selected = await activePlayer.playerInput.chooseEffectFromList(activePlayer, game, {
          prompt: "Choose 1",
          choices: [new DrawCards({ amount: 3 }), new GainActions({ amount: 2 })],
          sourceCard: card,
          minChoices: 1,
          maxChoices: 1,
        });

        if (selected.length > 0) {
          await selected[0].effect(card, activePlayer, game);
        }
      },
    },
  ],
};

export function register() {
  cardConfigRegistry.registerAll(
    Courtyard,
    Lurker,
    Pawn,
    Masquerade,
    ShantyTown,
    Steward,
    Swindler,
    WishingWell,
    Baron,
    Bridge,
    Conspirator,
    Diplomat,
    Ironworks,
    Mill,
    MiningVillage,
    SecretPassage,
    Courtier,
    Duke,
    Minion,
    Patrol,
    Replace,
    Torturer,
    TradingPost,
    Upgrade,
    Harem,
    Nobles
  );
}
register();

export {
  Courtyard,
  Lurker,
  Pawn,
  Masquerade,
  ShantyTown,
  Steward,
  Swindler,
  WishingWell,
  Baron,
  Bridge,
  Conspirator,
  Diplomat,
  Ironworks,
  Mill,
  MiningVillage,
  SecretPassage,
  Courtier,
  Duke,
  Minion,
  Patrol,
  Replace,
  Torturer,
  TradingPost,
  Upgrade,
  Harem,
  Nobles,
};
