import { cardConfigRegistry } from "../../di/configservice/CardConfigRegistry";
import * as BasicCards from "./Basic";
import { CardParams, CardType, DominionExpansion } from "../../domain/objects/Card";
import { CardLocation, CardPosition, Player } from "../../domain/objects/Player";
import { Card } from "../../domain/objects/Card";
import { Game } from "../../domain/objects/Game";
import { DrawCards, GainActions, GainMoney, GainBuys, GainCard } from "../effects/BaseEffects";
import {
  BooleanChoice,
  CardsFromPlayerChoice,
  ChooseCardFromSupply,
  ChooseEffectChoice,
} from "../../domain/objects/Choice";
import { attack } from "../../domain/objects/CardEffect";

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
        const input = new CardsFromPlayerChoice(
          "Choose a card from your hand to topdeck",
          activePlayer,
          activePlayer.hand,
          { minCards: 1, maxCards: 1 }
        );
        const selected = await input.getChoice();
        if (selected.length > 0) {
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
        const input = new ChooseEffectChoice(
          "Choose 1",
          activePlayer,
          [
            {
              prompt: "Trash an action from the supply",
              effect: async (card: Card, activePlayer: Player, game: Game) => {
                const input = new ChooseCardFromSupply(
                  `Trash an action from the supply`,
                  game.supply,
                  (pile) => pile.cards.length > 0 && pile.cards[0].types.includes(CardType.ACTION)
                );
                const pile = await input.getChoice();
                game.trashCardFromSupply(pile, activePlayer);
              },
            },
            {
              prompt: "Gain an action from the trash",
              effect: async (card: Card, activePlayer: Player, game: Game) => {
                const input = new CardsFromPlayerChoice(
                  `Gain an action from the trash`,
                  activePlayer,
                  game.trash.filter((c) => c.types.includes(CardType.ACTION)),
                  { minCards: 1, maxCards: 1 }
                );
                const selected = await input.getChoice();
                if (selected.length > 0) {
                  // remove the card from the supply
                  const index = game.trash.indexOf(selected[0]);
                  game.trash.splice(index, 1);
                  game.gainCard(selected[0], activePlayer);
                }
              },
            },
          ],
          { minChoices: 1, maxChoices: 1 }
        );

        const selected = await input.getChoice();
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
        const input = new ChooseEffectChoice(
          "Choose 2",
          activePlayer,
          [
            new GainActions({ amount: 1 }),
            new GainMoney({ amount: 1 }),
            new DrawCards({ amount: 1 }),
            new GainBuys({ amount: 1 }),
          ],
          { minChoices: 2, maxChoices: 2 }
        );

        const selected = await input.getChoice();
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
  //TODO
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
        const input = new ChooseEffectChoice(
          "Choose 1",
          activePlayer,
          [
            new DrawCards({ amount: 2 }),
            new GainMoney({ amount: 2 }),
            {
              prompt: "Trash two cards from your hand",
              effect: async (card: Card, activePlayer: Player, game: Game) => {
                const input = new CardsFromPlayerChoice(
                  "Trash two cards from your hand",
                  activePlayer,
                  activePlayer.hand,
                  { minCards: 2, maxCards: 2 }
                );
                const selectedCards = await input.getChoice();
                selectedCards.forEach((card) => {
                  game.trashCard(card, activePlayer);
                });
              },
            },
          ],
          { minChoices: 1, maxChoices: 1 }
        );

        const selected = await input.getChoice();
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
  // TODO
};

const WishingWell: CardParams = {
  name: "Wishing Well",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  // TODO
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
        // hand case when no estate in hand
        if (activePlayer.hand.filter((c) => c.name == BasicCards.Estate.name).length < 1) {
          await new GainCard({ name: BasicCards.Estate.name }).effect(card, activePlayer, game);
          return;
        }
        // otherwise allow the player to discard or not
        const input = new BooleanChoice(`Discard an estate for +4 $? Otherwise gain an estate`, true);
        const selected = await input.getChoice();
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
  // TODO
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
  // TODO
};

const Ironworks: CardParams = {
  name: "Ironworks",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.INTRIGUE,
  kingdomCard: true,
  playEffects: [
    {
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const input = new ChooseCardFromSupply(
          "Choose a card to gain costing 4 or less",
          game.supply,
          (pile) => pile.cards.length > 0 && pile.cards[0].cost <= 4
        );
        const selected = await input.getChoice();
        const gainedCard = game.gainCardFromSupply(selected, activePlayer, false);

        // Get bonuses based on the type of the card that is gained
        if (gainedCard.types.includes(CardType.ACTION)) {
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
        const input = new BooleanChoice("Discard two cards for +2 money?", false);
        const selected = await input.getChoice();
        if (selected) {
          const cardInput = new CardsFromPlayerChoice(
            "Discard two cards from your hand",
            activePlayer,
            activePlayer.hand,
            { minCards: 2, maxCards: 2 }
          );
          const selectedCards = await cardInput.getChoice();

          selectedCards.forEach((card) => {
            game.discardCard(card, activePlayer);
          });
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
        const input = new BooleanChoice("Trash this for +2 money?", false);
        const selected = await input.getChoice();
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
  // TODO
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
        const cardInput = new CardsFromPlayerChoice("Reveal a card from your hand", activePlayer, activePlayer.hand, {
          minCards: 1,
          maxCards: 1,
        });
        const selectedCards = await cardInput.getChoice();
        game.revealCards(selectedCards, activePlayer);

        if (selectedCards.length > 0) {
          const selectedCard = selectedCards[0];
          const input = new ChooseEffectChoice(
            `Choose ${selectedCard.types.length} effects (all must be different)`,
            activePlayer,
            [
              new GainActions({ amount: 1 }),
              new GainBuys({ amount: 1 }),
              new GainMoney({ amount: 3 }),
              new GainCard({ name: BasicCards.Gold.name }),
            ],
            { minChoices: selectedCard.types.length, maxChoices: selectedCard.types.length }
          );

          const selected = await input.getChoice();
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
        const input = new ChooseEffectChoice(
          `Choose 1: `,
          activePlayer,
          [
            new GainMoney({ amount: 2 }),
            {
              prompt:
                "Discard your hand and draw 4 cards. Each other player with at least 5 cards in hand discards their hand and draws 4 cards",
              effect: async (card: Card, activePlayer: Player, game: Game) => {
                const hand = activePlayer.hand;
                for (const card of hand) {
                  game.discardCard(card, activePlayer);
                }
                await new DrawCards({ amount: 4 }).effect(card, activePlayer, game);

                const otherPlayers = game.otherPlayers();
                for (const otherPlayer of otherPlayers) {
                  await attack(card, otherPlayer, game, async () => {
                    if (otherPlayer.hand.length >= 5) {
                      const hand = otherPlayer.hand;
                      for (const card of hand) {
                        game.discardCard(card, activePlayer);
                      }
                      await new DrawCards({ amount: 4 }).effect(card, otherPlayer, game);
                    }
                  });
                }
              },
            },
          ],
          { minChoices: 1, maxChoices: 1 }
        );

        const selected = await input.getChoice();
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
      // FIXME: the effect of putting the remaining cards back in any order will probably not be fixed
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
          `Choose a card costing up to ${selected[0].cost + 2}`,
          game.supply,
          (pile) => pile.cards.length > 0 && pile.cards[0].cost <= selected[0].cost + 2
        );
        const gainPile = await toGain.getChoice();
        const cardToGain = gainPile.cards[0];
        if (cardToGain.types.includes(CardType.ACTION) || cardToGain.types.includes(CardType.TREASURE)) {
          game.gainCardFromSupply(gainPile, activePlayer, false, CardLocation.TOP_OF_DECK);
        } else {
          game.gainCardFromSupply(gainPile, activePlayer, false);
        }
        if (cardToGain.types.includes(CardType.VICTORY)) {
          const otherPlayers = game.otherPlayers();
          for (const otherPlayer of otherPlayers) {
            await attack(card, otherPlayer, game, async () => {
              game.gainCardByName(BasicCards.Curse.name, otherPlayer, false);
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
  // TODO
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
        const input = new CardsFromPlayerChoice("Trash 2 cards from your hand", activePlayer, activePlayer.hand, {
          minCards: 2,
          maxCards: 2,
        });
        const selectedCards = await input.getChoice();
        selectedCards.forEach((card) => {
          game.trashCard(card, activePlayer);
        });
        if (selectedCards.length == 2) {
          game.gainCardByName(BasicCards.Silver.name, activePlayer, false, CardLocation.HAND);
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
        const input = new CardsFromPlayerChoice(
          "Choose a card from your hand to trash",
          activePlayer,
          activePlayer.hand,
          { minCards: 1, maxCards: 1 }
        );
        const selected = await input.getChoice();
        if (selected.length == 0) return; // return early if no cards picked

        game.trashCard(selected[0], activePlayer);

        const applicableCosts = game.supply
          .allPiles()
          .filter((p) => p.cards.length > 0 && p.cards[0].cost == selected[0].cost + 1);
        if (applicableCosts.length == 0) return; // return early if there's no cards with a valid cost

        const toGain = new ChooseCardFromSupply(
          `Choose a card costing up to ${selected[0].cost + 1}`,
          game.supply,
          (pile) => pile.cards.length > 0 && pile.cards[0].cost == selected[0].cost + 1
        );
        const gainPile = await toGain.getChoice();
        game.gainCardFromSupply(gainPile, activePlayer, false);
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
        const input = new ChooseEffectChoice(
          "Choose 1",
          activePlayer,
          [new DrawCards({ amount: 3 }), new GainActions({ amount: 2 })],
          { minChoices: 1, maxChoices: 1 }
        );

        const selected = await input.getChoice();
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
