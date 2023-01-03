import { cardConfigRegistry } from "../../di/configservice/CardConfigRegistry";
import { BasicCards } from "../../di/RegisterConfig";
import { Card, CardConfig, CardType, DominionExpansion } from "../../domain/objects/Card";
import {
  attack,
  DurationEffect,
  DurationTiming,
  OnGainCardTrigger,
  OnPlayCardTrigger,
} from "../../domain/objects/CardEffect";
import { Game } from "../../domain/objects/Game";
import { CardLocation, CardPosition, Player } from "../../domain/objects/Player";
import { GainParams } from "../../domain/objects/Reaction";
import { DiscardCardsFromHand, TrashCardsFromHand } from "../effects/AdvancedEffects";
import { DrawCards, GainActions, GainBuys, GainCard, GainMoney } from "../effects/BaseEffects";

const Haven: CardConfig = {
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

const Lighthouse: CardConfig = {
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

const NativeVillage: CardConfig = {
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

const Astrolabe: CardConfig = {
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

const FishingVillage: CardConfig = {
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

const Lookout: CardConfig = {
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
        await game.trashCard(cardToTrash[0], activePlayer);

        const top2Cards = top3Cards.filter((c) => c != cardToTrash[0]);
        const cardToDiscard = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "Choose a card to discard",
          minCards: 1,
          maxCards: 1,
          cardList: top2Cards,
          sourceCard: card,
        });
        if (cardToDiscard.length == 0) return;
        await game.discardCard(cardToDiscard[0], activePlayer);
      },
    },
  ],
};

const Monkey: CardConfig = {
  name: "Monkey",
  types: [CardType.ACTION, CardType.DURATION],
  cost: 3,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    {
      prompt:
        "Until your next turn, whenever the player on your right gains a card, +1 card. At the start of your next turn, +1 cards",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const onGainEffect = new OnGainCardTrigger(false, async () => {
          await new DrawCards({ amount: 1 }).effect(card, activePlayer, game);
        });
        const rightPlayer = game.rightPlayer(activePlayer);
        rightPlayer.onGainCardTriggers.push(onGainEffect);

        const durationEffect = new DurationEffect(DurationTiming.START_OF_TURN, async (p: Player, g: Game) => {
          await new DrawCards({ amount: 1 }).effect(card, activePlayer, game);

          // remove the on gain effect from the right player when the duration triggers
          const index = rightPlayer.onGainCardTriggers.indexOf(onGainEffect);
          if (index >= 0) {
            rightPlayer.onGainCardTriggers.splice(index, 1);
          }

          return false;
        });
        card.durationEffects.push(durationEffect);
      },
    },
  ],
};

const SeaChart: CardConfig = {
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

const Smugglers: CardConfig = {
  name: "Smugglers",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    {
      prompt: "Gain a copy of a card costing up to 6 that the player on your right gained last turn",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const rightPlayer = game.rightPlayer(activePlayer);
        const gainedLastTurn = rightPlayer.cardsGainedLastTurn.map((c) => c.name);

        const toGain = await activePlayer.playerInput.choosePileFromSupply(activePlayer, game, {
          prompt: "Choose a card to gain costing up to 6 that RP gained last turn",
          filter: (pile) =>
            pile.cards.length > 0 &&
            gainedLastTurn.includes(pile.cards[0].name) &&
            pile.cards[0].calculateCost(game) <= 6,
          sourceCard: card,
        });
        if (!toGain) return;

        await game.gainCardFromSupply(toGain, activePlayer, false, CardLocation.DISCARD);
      },
    },
  ],
};

const Warehouse: CardConfig = {
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

const Blockade: CardConfig = {
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
        const toGain = await activePlayer.playerInput.choosePileFromSupply(activePlayer, game, {
          prompt: "Choose a card to gain costing up to 4",
          filter: (pile) => pile.cards.length > 0 && pile.cards[0].calculateCost(game) <= 4,
          sourceCard: card,
        });
        if (!toGain) return;
        const blockadeGainedCard = await game.gainCardFromSupply(toGain, activePlayer, false, CardLocation.SET_ASIDE);
        if (!blockadeGainedCard) return;

        const onGainAttacks: Array<[Player, OnGainCardTrigger]> = [];
        for (const otherPlayer of game.otherPlayers()) {
          await attack(card, otherPlayer, game, async () => {
            const onGainAttack = new OnGainCardTrigger(
              false,
              async (
                otherGainedCard: Card,
                gainer: Player,
                game: Game,
                wasBought: boolean,
                toLocation?: CardLocation
              ) => {
                if (otherGainedCard.name == blockadeGainedCard?.name && gainer == game.getActivePlayer()) {
                  await game.gainCardByName(BasicCards.Curse.name, otherPlayer, false);
                }
              }
            );
            otherPlayer.onGainCardTriggers.push(onGainAttack);
            onGainAttacks.push([otherPlayer, onGainAttack]);
          });
        }

        const durationEffect = new DurationEffect(DurationTiming.START_OF_TURN, async (p: Player, g: Game) => {
          // put the card into the active player's hand
          activePlayer.transferCard(
            blockadeGainedCard,
            activePlayer.cardsSetAside,
            activePlayer.hand,
            CardPosition.TOP
          );
          game.eventLog.publishEvent({ type: "CardPutInHand", player: activePlayer, card: blockadeGainedCard });

          // clean up the on gain effects on the other players
          for (const [player, gainEffect] of onGainAttacks) {
            // remove the on gain effect from the right player when the duration triggers
            const index = player.onGainCardTriggers.indexOf(gainEffect);
            if (index >= 0) {
              player.onGainCardTriggers.splice(index, 1);
            }
          }
          return false;
        });

        card.durationEffects.push(durationEffect);
      },
    },
  ],
};

const Caravan: CardConfig = {
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

const Cutpurse: CardConfig = {
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
              await game.discardCard(coppers[0], otherPlayer);
            }
          });
        }
      },
    },
  ],
};

const Island: CardConfig = {
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
        activePlayer.transferCard(selectedCard, activePlayer.hand, activePlayer.mats.island, CardPosition.BOTTOM);
        game.eventLog.publishEvent({ type: "CardSetAside", player: activePlayer, card: selectedCard });
      },
    },
  ],
};

const Sailor: CardConfig = {
  name: "Sailor",
  types: [CardType.ACTION, CardType.DURATION],
  cost: 4,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    new GainActions({ amount: 1 }),
    {
      prompt:
        "Once this turn, you may play a duration card that you gain. At the start of your next turn +2$ and you may trash a card from your hand",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        // add the effect to be able to play duration effects
        let hasAlreadyTriggered = false;
        const onGainTrigger = new OnGainCardTrigger(
          false,
          async (gainedCard: Card, gainer: Player, game: Game, wasBought: boolean, toLocation?: CardLocation) => {
            if (hasAlreadyTriggered) return; // return early if this has already fired
            if (!gainedCard.types.includes(CardType.DURATION)) return; // return early if non-duration gained
            if (gainer.cardsInPlay.indexOf(gainedCard) >= 0) return; // return early if the gained card is already in play (e.g. played by another pirate)

            const shouldPlay = await gainer.playerInput.chooseBoolean(gainer, game, {
              prompt: `Play the gained ${gainedCard.name}`,
              defaultChoice: true,
              sourceCard: card,
            });

            if (shouldPlay) {
              game.playCard(gainedCard, gainer);
              hasAlreadyTriggered = true;
            }
          }
        );
        activePlayer.onGainCardTriggers.push(onGainTrigger);

        // set up duration effect to gain money, clean up the on gain effect, and trash a card
        const durationEffect = new DurationEffect(DurationTiming.START_OF_TURN, async (p: Player, g: Game) => {
          await new GainMoney({ amount: 2 }).effect(card, activePlayer, game);

          // clean up the on gain effect
          const index = activePlayer.onGainCardTriggers.indexOf(onGainTrigger);
          if (index >= 0) {
            activePlayer.onGainCardTriggers.splice(index, 1);
          }

          await new TrashCardsFromHand({ minCards: 0, maxCards: 1 }).effect(card, activePlayer, game);
          return false;
        });
        card.durationEffects.push(durationEffect);
      },
    },
  ],
};

const Salvager: CardConfig = {
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
        await game.trashCard(toTrash, activePlayer);
        await new GainMoney({ amount: toTrash.calculateCost(game) }).effect(card, activePlayer, game);
      },
    },
  ],
};

const TidePools: CardConfig = {
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

const TreasureMap: CardConfig = {
  name: "Treasure Map",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    {
      prompt: "Trash this and a treasure map from your hand. If you do gain 4 Golds onto your deck",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        await game.trashCard(card, activePlayer);

        const mapsInHand = activePlayer.hand.filter((c) => c.name == TreasureMap.name);
        if (mapsInHand.length == 0) return; // just trash this map and return (this is the rules in the FAQ)

        for (let i = 0; i < 4; i++) {
          await new GainCard({ name: BasicCards.Gold.name, toLocation: CardLocation.TOP_OF_DECK }).effect(
            card,
            activePlayer,
            game
          );
        }
        await game.trashCard(mapsInHand[0], activePlayer);
      },
    },
  ],
};

const Bazaar: CardConfig = {
  name: "Bazaar",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [new DrawCards({ amount: 1 }), new GainActions({ amount: 2 }), new GainMoney({ amount: 1 })],
};

const Corsair: CardConfig = {
  name: "Corsair",
  types: [CardType.ACTION, CardType.ATTACK, CardType.DURATION],
  cost: 5,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    new GainMoney({ amount: 2 }),
    {
      prompt:
        "At the start of your next turn, +2$. Until then each other player trashes the first gold or silver they play each turn",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        // FIXME: this is slightly wrong - its effect isn't supposed to stack (I think this won't, but it will try to trash the treasure multiple times)
        // and is supposed to trigger each turn the other player plays silver/gold (this will affect outpost games, but won't have a major effect)
        const onPlayAttacks: Array<[Player, OnPlayCardTrigger]> = [];
        for (const otherPlayer of game.otherPlayers()) {
          await attack(card, otherPlayer, game, async () => {
            let hasAlreadyTriggered = false;
            const onPlayEffect = new OnPlayCardTrigger(false, async (card, player, game) => {
              if (hasAlreadyTriggered) return; // return early if the effect has already fired
              if (card.name == BasicCards.Silver.name || card.name == BasicCards.Gold.name) {
                await game.trashCard(card, otherPlayer);
                hasAlreadyTriggered = true;
              }
            });

            otherPlayer.onPlayCardTriggers.push(onPlayEffect);
            onPlayAttacks.push([otherPlayer, onPlayEffect]);
          });
        }

        const durationEffect = new DurationEffect(DurationTiming.START_OF_TURN, async (p: Player, g: Game) => {
          await new DrawCards({ amount: 1 }).effect(card, p, g);

          // clean up the on gain effects on the other players
          for (const [player, playEffect] of onPlayAttacks) {
            // remove the on gain effect from the right player when the duration triggers
            const index = player.onPlayCardTriggers.indexOf(playEffect);
            if (index >= 0) {
              player.onGainCardTriggers.splice(index, 1);
            }
          }
          return false;
        });

        card.durationEffects.push(durationEffect);
      },
    },
  ],
};

const MerchantShip: CardConfig = {
  name: "Merchant Ship",
  types: [CardType.ACTION, CardType.DURATION],
  cost: 5,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    new GainMoney({ amount: 2 }),
    {
      prompt: "At the start of next turn, +2$",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const durationEffect = new DurationEffect(DurationTiming.START_OF_TURN, async (p: Player, g: Game) => {
          await new GainMoney({ amount: 2 }).effect(card, activePlayer, game);
          return false;
        });
        card.durationEffects.push(durationEffect);
      },
    },
  ],
};

const Outpost: CardConfig = {
  name: "Outpost",
  types: [CardType.ACTION, CardType.DURATION],
  cost: 5,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    {
      prompt:
        "If this is the first time you've played outpost this turn and the previous turn wasn't yours, take an extra turn after this one but only draw 3 cards for your next hand",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        if (activePlayer.cardsInPlay.filter((c) => c.name == Outpost.name).length > 1) return; // return early if an outpost has already been played (this is slightly different than it should be)
        if (activePlayer.cardFlags.outpost || activePlayer.extraTurn) return; // return if the "outpost" flag has already been set
        activePlayer.cardFlags.outpost = true;

        const durationEffect = new DurationEffect(DurationTiming.START_OF_TURN, async (p: Player, g: Game) => {
          activePlayer.cardFlags.outpost = false;
          return false;
        });
        card.durationEffects.push(durationEffect);
      },
    },
  ],
};

const Pirate: CardConfig = {
  name: "Pirate",
  types: [CardType.ACTION, CardType.DURATION, CardType.REACTION],
  cost: 5,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    {
      prompt: "At the start of your next turn gain a treasure costing up to 6$",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const durationEffect = new DurationEffect(DurationTiming.START_OF_TURN, async (p: Player, g: Game) => {
          const selected = await activePlayer.playerInput.choosePileFromSupply(activePlayer, game, {
            prompt: "Choose a treasure to gain costing 6 or less to your hand",
            filter: (pile) =>
              pile.cards.length > 0 &&
              pile.cards[0].types.includes(CardType.TREASURE) &&
              pile.cards[0].calculateCost(game) <= 6,
            sourceCard: card,
          });

          if (!selected) return false; // return early in cases like there's no piles costing 4 or less (unlikely, but could happen)

          await game.gainCardFromSupply(selected, activePlayer, false, CardLocation.HAND);

          return false;
        });
        card.durationEffects.push(durationEffect);
      },
    },
  ],
  reactionEffects: {
    onGainCardEffects: [
      // if a player gains a treasure, you may play pirate
      async (owningPlayer: Player, cardWithEffect: Card, game: Game, gainParams: GainParams) => {
        if (!gainParams.gainedCard.types.includes(CardType.TREASURE)) return; // skip this effect if the gained card is not a treasure

        const selected = await owningPlayer.playerInput.chooseBoolean(owningPlayer, game, {
          prompt: "Play pirate?",
          defaultChoice: true,
          sourceCard: cardWithEffect,
        });
        if (!selected) return;

        await game.playCard(cardWithEffect, owningPlayer);
      },
    ],
  },
};

const SeaWitch: CardConfig = {
  name: "Sea Witch",
  types: [CardType.ACTION, CardType.ATTACK, CardType.DURATION],
  cost: 5,
  expansion: DominionExpansion.SEASIDE,
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
    {
      prompt: "At the start of your next turn +2 cards then discard 2 cards",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const durationEffect = new DurationEffect(DurationTiming.START_OF_TURN, async (p: Player, g: Game) => {
          await new DrawCards({ amount: 2 }).effect(card, activePlayer, game);
          await new DiscardCardsFromHand({ minCards: 2, maxCards: 2 }).effect(card, activePlayer, game);
          return false;
        });
        card.durationEffects.push(durationEffect);
      },
    },
  ],
};

const Tactician: CardConfig = {
  name: "Tactician",
  types: [CardType.ACTION, CardType.DURATION],
  cost: 5,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    {
      prompt:
        "If you have at least 1 card in hand: discard your hand and at the start of next turn +5 Cards, +1 Action, +1 Buy",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        if (activePlayer.hand.length == 0) {
          return; // return early if no cards
        }

        for (const card of activePlayer.hand.slice()) {
          await game.discardCard(card, activePlayer);
        }

        const durationEffect = new DurationEffect(DurationTiming.START_OF_TURN, async (p: Player, g: Game) => {
          await new DrawCards({ amount: 5 }).effect(card, activePlayer, game);
          await new GainActions({ amount: 1 }).effect(card, activePlayer, game);
          await new GainBuys({ amount: 1 }).effect(card, activePlayer, game);
          return false;
        });
        card.durationEffects.push(durationEffect);
      },
    },
  ],
};

const Treasury: CardConfig = {
  name: "Treasury",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [new DrawCards({ amount: 1 }), new GainActions({ amount: 1 }), new GainMoney({ amount: 1 })],
  onCleanupEffects: [
    {
      prompt:
        "At the end of the turn, if you didn't gain a victory card in your buy phase, you may put this onto your deck",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        // FIXME: this is slightly different - it should filter only gained during the buy phase
        if (activePlayer.cardsGainedLastTurn.filter((c) => c.types.includes(CardType.VICTORY)).length > 0) return;

        const shouldTopDeck = await activePlayer.playerInput.chooseBoolean(activePlayer, game, {
          defaultChoice: true,
          prompt: "Should put Treasury onto your deck?",
          sourceCard: card,
        });
        if (shouldTopDeck) {
          activePlayer.transferCard(card, activePlayer.cardsInPlay, activePlayer.drawPile, CardPosition.TOP);
        }
      },
    },
  ],
};

const Wharf: CardConfig = {
  name: "Wharf",
  types: [CardType.ACTION, CardType.DURATION],
  cost: 5,
  expansion: DominionExpansion.SEASIDE,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 2 }),
    new GainBuys({ amount: 1 }),
    {
      prompt: "At the start of your next turn: +2 cards, +1 buy",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const durationEffect = new DurationEffect(DurationTiming.START_OF_TURN, async (p: Player, g: Game) => {
          await new DrawCards({ amount: 2 }).effect(card, activePlayer, game);
          await new GainBuys({ amount: 1 }).effect(card, activePlayer, game);
          return false;
        });
        card.durationEffects.push(durationEffect);
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
    TreasureMap,
    Bazaar,
    Corsair,
    MerchantShip,
    Outpost,
    Pirate,
    SeaWitch,
    Tactician,
    Treasury,
    Wharf
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
  Bazaar,
  Corsair,
  MerchantShip,
  Outpost,
  Pirate,
  SeaWitch,
  Tactician,
  Treasury,
  Wharf,
};
