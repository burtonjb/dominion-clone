import { cardConfigRegistry } from "../../di/configservice/CardConfigRegistry";
import { BaseCards, BasicCards } from "../../di/RegisterConfig";
import { Card, CardParams, CardType, DominionExpansion } from "../../domain/objects/Card";
import { attack, OnGainCardTrigger } from "../../domain/objects/CardEffect";
import { Game, TurnPhase } from "../../domain/objects/Game";
import { CardLocation, CardPosition, Player } from "../../domain/objects/Player";
import { GainParams } from "../../domain/objects/Reaction";
import { logger } from "../../util/Logger";
import { DiscardCardsFromHand, DrawToHandsize, TrashCardsFromHand } from "../effects/AdvancedEffects";
import { DrawCards, GainActions, GainBuys, GainCard, GainMoney, GainVictoryTokens } from "../effects/BaseEffects";

const Crossroads: CardParams = {
  name: "Crossroads",
  types: [CardType.ACTION],
  cost: 2,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  playEffects: [
    {
      prompt:
        "Reveal your hand. +1 card per victory card. If this is the first time you've played crossroads this turn, +3 actions",
      effect: async (card: Card, player: Player, game: Game) => {
        game.revealCards(player.hand, player);
        const victoryCardsInHand = player.hand.filter((c) => c.types.includes(CardType.VICTORY));
        await new DrawCards({ amount: victoryCardsInHand.length }).effect(card, player, game);

        //FIXME: this is slightly different than how it actually works in dominion, but Crossroads is not that strong so this is probably ok
        if (player.cardsInPlay.filter((c) => c.name == Crossroads.name).length <= 1) {
          await new GainActions({ amount: 3 }).effect(card, player, game);
        }
      },
    },
  ],
};

const FoolsGold: CardParams = {
  name: "Fool's Gold",
  types: [CardType.TREASURE, CardType.REACTION],
  cost: 2,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  playEffects: [
    {
      prompt: "If this is the first time you've played Fool's Gold this turn, +1$, otherwise +4$",
      effect: async (card: Card, player: Player, game: Game) => {
        if (player.cardsInPlay.filter((c) => c.name == FoolsGold.name).length > 1) {
          await new GainMoney({ amount: 4 }).effect(card, player, game);
        } else {
          await new GainMoney({ amount: 1 }).effect(card, player, game);
        }
      },
    },
  ],
  reactionEffects: {
    onGainCardEffects: [
      async (owningPlayer: Player, cardWithEffect: Card, game: Game, gainParams: GainParams) => {
        // If another player gained a province, you may trash this to gain a gold onto your deck
        if (owningPlayer != gainParams.gainedPlayer && gainParams.gainedCard.name == BasicCards.Province.name) {
          const shouldTrash = await owningPlayer.playerInput.chooseBoolean(owningPlayer, game, {
            prompt: "Trash fool's gold to put a gold onto your deck?",
            defaultChoice: false,
            sourceCard: cardWithEffect,
          });

          if (shouldTrash) {
            await game.trashCard(cardWithEffect, owningPlayer);
            await game.gainCardByName(BasicCards.Gold.name, owningPlayer, false, CardLocation.TOP_OF_DECK);
          }
        }
      },
    ],
  },
};

const Develop: CardParams = {
  name: "Develop",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  playEffects: [
    {
      // somewhat moderate rewording and has slightly different effects than the card when piles are low
      prompt:
        "Trash a card from your hand. Gain a card costing 1 more or less than it. Gain another card onto your deck costing 1 more or less but not the same as chosen before",
      effect: async (card: Card, player: Player, game: Game) => {
        const toTrash = await player.playerInput.chooseCardsFromList(player, game, {
          prompt: "choose a card to trash",
          cardList: player.hand,
          sourceCard: card,
          minCards: 1,
          maxCards: 1,
        });

        if (toTrash.length == 0) return;
        await game.trashCard(toTrash[0], player);
        const cost = toTrash[0].calculateCost(game);

        const toGainPile = await player.playerInput.choosePileFromSupply(player, game, {
          prompt: "Choose a card to gain",
          filter: (pile) =>
            pile.cards.length > 0 &&
            (pile.cards[0].calculateCost(game) == cost - 1 || pile.cards[0].calculateCost(game) == cost + 1),
          sourceCard: card,
        });
        if (!toGainPile) return;
        const gainedCard = await game.gainCardFromSupply(toGainPile, player, false, CardLocation.DISCARD);

        const toGainToHandPile = await player.playerInput.choosePileFromSupply(player, game, {
          prompt: "Choose a card to gain",
          filter: (pile) =>
            pile.cards.length > 0 &&
            pile.cards[0].calculateCost(game) != gainedCard?.calculateCost(game) &&
            (pile.cards[0].calculateCost(game) == cost - 1 || pile.cards[0].calculateCost(game) == cost + 1),
          sourceCard: card,
        });
        if (!toGainToHandPile) return;
        await game.gainCardFromSupply(toGainToHandPile, player, false, CardLocation.TOP_OF_DECK);
      },
    },
  ],
};

const GuardDog: CardParams = {
  name: "Guard Dog",
  types: [CardType.ACTION, CardType.REACTION],
  cost: 3,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 2 }),
    {
      prompt: "If you have 5 or fewer cards in hand, +2 cards",
      effect: async (card: Card, player: Player, game: Game) => {
        if (player.hand.length <= 5) {
          await new DrawCards({ amount: 2 }).effect(card, player, game);
        }
      },
    },
  ],
  //FIXME: add the reaction
};

const Oasis: CardParams = {
  name: "Oasis",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 1 }),
    new GainActions({ amount: 1 }),
    new GainMoney({ amount: 1 }),
    new DiscardCardsFromHand({ minCards: 1, maxCards: 1 }),
  ],
};

const Scheme: CardParams = {
  name: "Scheme",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  playEffects: [new DrawCards({ amount: 1 }), new GainActions({ amount: 1 })],
  onCleanupEffects: [
    {
      prompt: "Before cleanup, you may put an action from in play onto your deck",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const toTopDeck = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose an action to put onto your deck",
          cardList: activePlayer.cardsInPlay.filter((c) => c.types.includes(CardType.ACTION)),
          sourceCard: card,
          minCards: 0,
          maxCards: 1,
        });
        if (toTopDeck.length == 0) return;

        activePlayer.transferCard(toTopDeck[0], activePlayer.cardsInPlay, activePlayer.drawPile, CardPosition.TOP);
      },
    },
  ],
};

const Tunnel: CardParams = {
  name: "Tunnel",
  types: [CardType.VICTORY, CardType.REACTION],
  cost: 3,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  victoryPoints: 2,
  reactionEffects: {
    onDiscardEffects: [
      {
        prompt: "Gain a gold?",
        effect: async (card: Card, player: Player, game: Game) => {
          if (game.currentPhase == TurnPhase.CLEAN_UP) return;
          const shouldGainGold = await player.playerInput.chooseBoolean(player, game, {
            prompt: "Gain a gold because you discarded tunnel?",
            defaultChoice: true,
            sourceCard: card,
          });
          if (shouldGainGold) {
            await game.gainCardByName(BasicCards.Gold.name, player, false);
          }
        },
      },
    ],
  },
};

const JackOfAllTrades: CardParams = {
  name: "Jack Of All Trades",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  victoryPoints: 2,
  playEffects: [
    {
      prompt:
        "Gain a silver. Look at the top card of your deck, you may discard it. Draw until you have 5 cards in hand. You may trash a non-treasure from your hand",
      effect: async (card: Card, player: Player, game: Game) => {
        await game.gainCardByName(BasicCards.Silver.name, player, false, CardLocation.DISCARD);

        const topCard = player.topNCards(1);
        const shouldDiscard = await player.playerInput.chooseBoolean(player, game, {
          prompt: `Discard ${topCard.map((c) => c.name)}?`,
          defaultChoice: false,
          sourceCard: card,
        });
        if (topCard.length > 0 && shouldDiscard) {
          await game.discardCard(topCard[0], player);
        }

        await new DrawToHandsize({ handsize: 5 }).effect(card, player, game);

        game.ui?.render(); // this is bad and hacky. Maybe instead split up the effects
        const toTrash = await player.playerInput.chooseCardsFromList(player, game, {
          prompt: "Choose a non-treasure to trash",
          cardList: player.hand.filter((c) => !c.types.includes(CardType.TREASURE)),
          sourceCard: card,
          minCards: 0,
          maxCards: 1,
        });
        if (toTrash.length == 0) return;
        await game.trashCard(toTrash[0], player);
      },
    },
  ],
};

const Nomads: CardParams = {
  name: "Nomads",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  playEffects: [new GainBuys({ amount: 1 }), new GainMoney({ amount: 2 })],
  onGainEffects: [new GainMoney({ amount: 2 })],
  onTrashEffects: [new GainMoney({ amount: 2 })],
};

const SpiceMerchant: CardParams = {
  name: "Spice Merchant",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  playEffects: [
    {
      prompt: "You may trash a treasure from your hand to choose 1: +1 action and +2 cards; or +2$ and +1 buy",
      effect: async (card: Card, player: Player, game: Game) => {
        const toTrash = await player.playerInput.chooseCardsFromList(player, game, {
          prompt: "Choose a treasure to trash",
          cardList: player.hand.filter((c) => c.types.includes(CardType.TREASURE)),
          sourceCard: card,
          minCards: 0,
          maxCards: 1,
        });
        if (toTrash.length == 0) return;
        await game.trashCard(toTrash[0], player);

        const effects = await player.playerInput.chooseEffectFromList(player, game, {
          prompt: "Choose 1",
          choices: [
            {
              prompt: "Cards +2 and Actions +1",
              effect: async (card: Card, player: Player, game: Game) => {
                await new DrawCards({ amount: 2 }).effect(card, player, game);
                await new GainActions({ amount: 1 }).effect(card, player, game);
              },
            },
            {
              prompt: "Buys +1 and Money +2$",
              effect: async (card: Card, player: Player, game: Game) => {
                await new GainBuys({ amount: 1 }).effect(card, player, game);
                await new GainMoney({ amount: 2 }).effect(card, player, game);
              },
            },
          ],
          minChoices: 1,
          maxChoices: 1,
          sourceCard: card,
        });
        for (const effect of effects) {
          await effect.effect(card, player, game);
        }
      },
    },
  ],
};

const Trader: CardParams = {
  name: "Trader",
  types: [CardType.ACTION, CardType.REACTION],
  cost: 4,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  playEffects: [
    {
      prompt: "Trash a card from your hand. Gain 1 silver per $ it costs",
      effect: async (card: Card, player: Player, game: Game) => {
        const toTrash = await player.playerInput.chooseCardsFromList(player, game, {
          prompt: "Choose a card to trash",
          cardList: player.hand,
          sourceCard: card,
          minCards: 1,
          maxCards: 1,
        });
        if (toTrash.length == 0) return;
        await game.trashCard(toTrash[0], player);

        for (let i = 0; i < toTrash[0].calculateCost(game); i++) {
          await game.gainCardByName(BasicCards.Silver.name, player, false, CardLocation.DISCARD);
        }
      },
    },
  ],
  reactionEffects: {
    onGainCardEffects: [
      async (owningPlayer: Player, cardWithEffect: Card, game: Game, gainParams: GainParams) => {
        // when you gain a card, you may reveal trader from your hand to exchange the card for a Silver
        // this does not trigger trash/gain effects, so going to do some hacky coding here
        if (owningPlayer == gainParams.gainedPlayer) {
          const shouldExchange = await owningPlayer.playerInput.chooseBoolean(owningPlayer, game, {
            prompt: `Reveal trader to exchange the gained card for a Silver? ${gainParams.gainedCard.name}`,
            defaultChoice: true,
            sourceCard: cardWithEffect,
          });

          if (shouldExchange) {
            // return the card
            const toReturnPile = game.supply.allPiles().find((p) => p.name == gainParams.gainedCard.name);
            if (!toReturnPile) return; // return if something is wrong
            owningPlayer.removeCard(gainParams.gainedCard);
            toReturnPile.cards.unshift(gainParams.gainedCard);

            // get a silver (not gained)
            const silverPile = game.supply.allPiles().find((p) => p.name == BasicCards.Silver.name);
            if (!silverPile) return; // shouldn't happen, but good to handle this case instead of throwing weird errors
            const topSilver = silverPile.cards.shift();
            if (!topSilver) return; // pile probably empty so return
            owningPlayer.discardPile.unshift(topSilver);
          }
        }
      },
    ],
  },
};

const Trail: CardParams = {
  name: "Trail",
  types: [CardType.ACTION, CardType.REACTION],
  cost: 4,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  playEffects: [new DrawCards({ amount: 1 }), new GainActions({ amount: 1 })],
  onGainEffects: [
    {
      prompt: "Play the gained trail?",
      effect: async (gainedCard: Card, gainer: Player, game: Game, wasBought: boolean, toLocation?: CardLocation) => {
        if (game.currentPhase == TurnPhase.CLEAN_UP) return;
        const shouldPlay = await gainer.playerInput.chooseBoolean(gainer, game, {
          prompt: "Play the gained trail?",
          defaultChoice: true,
          sourceCard: gainedCard,
        });
        if (shouldPlay) {
          await game.playCard(gainedCard, gainer);
        }
      },
    },
  ],
  onTrashEffects: [
    {
      prompt: "Play the trashed trail?",
      effect: async (card: Card, player: Player, game: Game) => {
        if (game.currentPhase == TurnPhase.CLEAN_UP) return;
        const shouldPlay = await player.playerInput.chooseBoolean(player, game, {
          prompt: "Play the trashed trail?",
          defaultChoice: true,
          sourceCard: card,
        });
        if (shouldPlay) {
          await game.playCard(card, player);
        }
      },
    },
  ],
  reactionEffects: {
    onDiscardEffects: [
      {
        prompt: "Play the discarded trail?",
        effect: async (card: Card, player: Player, game: Game) => {
          if (game.currentPhase == TurnPhase.CLEAN_UP) return;
          const shouldPlay = await player.playerInput.chooseBoolean(player, game, {
            prompt: "Play the discarded trail?",
            defaultChoice: true,
            sourceCard: card,
          });
          if (shouldPlay) {
            await game.playCard(card, player);
          }
        },
      },
    ],
  },
};

const Weaver: CardParams = {
  name: "Weaver",
  types: [CardType.ACTION, CardType.REACTION],
  cost: 4,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  playEffects: [
    {
      prompt: "Gain two silvers or a card costing up to 4",
      effect: async (card: Card, player: Player, game: Game) => {
        const effect = await player.playerInput.chooseEffectFromList(player, game, {
          prompt: "Choose an effect. Either gain:",
          choices: [
            {
              prompt: "Two silvers",
              effect: async (card: Card, player: Player, game: Game) => {
                await game.gainCardByName(BasicCards.Silver.name, player, false);
                await game.gainCardByName(BasicCards.Silver.name, player, false);
              },
            },
            {
              prompt: "Card costing up to 4$",
              effect: async (card: Card, player: Player, game: Game) => {
                const selected = await player.playerInput.choosePileFromSupply(player, game, {
                  prompt: "Choose a card to gain costing 4 or less",
                  filter: (pile) => pile.cards.length > 0 && pile.cards[0].calculateCost(game) <= 4,
                  sourceCard: card,
                });

                if (!selected) return; // return early in cases like there's no piles costing 4 or less (unlikely, but could happen)

                await game.gainCardFromSupply(selected, player, false);
              },
            },
          ],
          sourceCard: card,
          minChoices: 1,
          maxChoices: 1,
        });

        for (const e of effect) {
          await e.effect(card, player, game);
        }
      },
    },
  ],
  reactionEffects: {
    onDiscardEffects: [
      {
        prompt: "Play the discarded weaver?",
        effect: async (card: Card, player: Player, game: Game) => {
          if (game.currentPhase == TurnPhase.CLEAN_UP) return;
          const shouldPlay = await player.playerInput.chooseBoolean(player, game, {
            prompt: "Play the discarded weaver?",
            defaultChoice: true,
            sourceCard: card,
          });
          if (shouldPlay) {
            await game.playCard(card, player);
          }
        },
      },
    ],
  },
};

const Berserker: CardParams = {
  name: "Berserker",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 5,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  playEffects: [
    {
      prompt: "Gain a card costing less than this. Each other player discards down to 3 cards",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        // gainer effect
        const selected = await activePlayer.playerInput.choosePileFromSupply(activePlayer, game, {
          prompt: `Choose a card to gain costing less than berserker`,
          filter: (pile) => pile.cards.length > 0 && pile.cards[0].calculateCost(game) < card.calculateCost(game),
          sourceCard: card,
        });

        if (!selected) return;
        await game.gainCardFromSupply(selected, activePlayer, false);

        // attack
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
              await game.discardCard(card, otherPlayer);
            }
          });
        }
      },
    },
  ],
  onGainEffects: [
    {
      prompt: "When you gain this, if you have an action in play, you may play this",
      effect: async (gainedCard: Card, gainer: Player, game: Game, wasBought: boolean, toLocation?: CardLocation) => {
        if (gainer.cardsInPlay.filter((c) => c.types.includes(CardType.ACTION)).length > 0) {
          const shouldPlay = await gainer.playerInput.chooseBoolean(gainer, game, {
            prompt: "Play the gained berserker?",
            defaultChoice: true,
            sourceCard: gainedCard,
          });

          if (shouldPlay) {
            await game.playCard(gainedCard, gainer);
          }
        }
      },
    },
  ],
};

const Cartographer: CardParams = {
  name: "Cartographer",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 1 }),
    new GainActions({ amount: 1 }),
    {
      prompt: "Look at the top 4 cards of your draw pile. You may discard any of them",
      // FIXME: I'm not going to implement re-ordering the cards that get put back
      effect: async (card: Card, player: Player, game: Game) => {
        const top4 = player.topNCards(4);
        const toDiscard = await player.playerInput.chooseCardsFromList(player, game, {
          prompt: "Choose any cards to discard",
          cardList: top4,
          sourceCard: card,
        });

        for (const card of toDiscard) {
          await game.discardCard(card, player);
        }
      },
    },
  ],
};

const Cauldron: CardParams = {
  name: "Cauldron",
  types: [CardType.ATTACK, CardType.TREASURE],
  cost: 5,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  playEffects: [
    new GainMoney({ amount: 2 }),
    new GainBuys({ amount: 1 }),
    {
      prompt: "The third time you gain an action this turn, each other player gains a curse",
      effect: async (card: Card, player: Player, game: Game) => {
        const onGainCardTriggers: Array<OnGainCardTrigger> = [];
        const otherPlayers = game.otherPlayers();

        for (const otherPlayer of otherPlayers) {
          await attack(card, otherPlayer, game, async () => {
            const onGainEffect = new OnGainCardTrigger(
              true,
              async (gainedCard: Card, gainer: Player, game: Game, wasBought: boolean, toLocation?: CardLocation) => {
                if (
                  gainedCard.types.includes(CardType.ACTION) &&
                  gainer.cardsGainedLastTurn.filter((c) => c.types.includes(CardType.ACTION)).length == 3
                ) {
                  await game.gainCardByName(BasicCards.Curse.name, otherPlayer, false);
                }
              }
            );
            onGainCardTriggers.push(onGainEffect);
          });
        }
        player.onGainCardTriggers.push(...onGainCardTriggers);
      },
    },
  ],
};

const Haggler: CardParams = {
  name: "Haggler",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  playEffects: [
    new GainMoney({ amount: 2 }),
    {
      prompt: "This turn when you gain a card, if you bought it you may gain a cheaper non-victory card",
      effect: async (card: Card, player: Player, game: Game) => {
        const onGainEffect = new OnGainCardTrigger(
          true,
          async (gainedCard: Card, gainer: Player, game: Game, wasBought: boolean, toLocation?: CardLocation) => {
            if (wasBought) {
              const selected = await gainer.playerInput.choosePileFromSupply(gainer, game, {
                prompt: `Choose a card to gain costing less than ${gainedCard.calculateCost(game)}`,
                filter: (pile) =>
                  pile.cards.length > 0 && pile.cards[0].calculateCost(game) < gainedCard.calculateCost(game),
                sourceCard: card,
              });

              if (!selected) return;
              await game.gainCardFromSupply(selected, gainer, false);
            }
          }
        );
        player.onGainCardTriggers.push(onGainEffect);
      },
    },
  ],
};

const Highway: CardParams = {
  name: "Highway",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.HINTERLANDS,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 1 }),
    new GainActions({ amount: 1 }),
    {
      prompt: "This turn, cards cost 1$ less",
      effect: async (card: Card, player: Player, game: Game) => {
        const reduceCostMod = (card: Card) => -1;
        game.costModifiers.push(reduceCostMod);
      },
    },
  ],
};

export function register() {
  cardConfigRegistry.registerAll(
    Crossroads,
    FoolsGold,
    Develop,
    GuardDog,
    Oasis,
    Scheme,
    Tunnel,
    JackOfAllTrades,
    Nomads,
    SpiceMerchant,
    Trader,
    Trail,
    Weaver,
    Berserker,
    Cartographer,
    Cauldron,
    Haggler,
    Highway
  );
}
register();

export {
  Crossroads,
  FoolsGold,
  Develop,
  Oasis,
  GuardDog,
  Scheme,
  Tunnel,
  JackOfAllTrades,
  Nomads,
  SpiceMerchant,
  Trader,
  Trail,
  Weaver,
  Berserker,
  Cartographer,
  Cauldron,
  Haggler,
  Highway,
};
