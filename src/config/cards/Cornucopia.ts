import { cardConfigRegistry } from "../../di/configservice/CardConfigRegistry";
import { Card, CardConfig, CardType, DominionExpansion } from "../../domain/objects/Card";
import { Game } from "../../domain/objects/Game";
import { Player } from "../../domain/objects/Player";
import { DrawCards, GainActions, GainCard, GainBuys } from "../effects/BaseEffects";

const Hamlet: CardConfig = {
  name: "Hamlet",
  types: [CardType.ACTION],
  cost: 2,
  expansion: DominionExpansion.CORNUCOPIA,
  kingdomCard: true,
  playEffects: [
    new DrawCards({ amount: 1 }),
    new GainActions({ amount: 1 }),
    {
      prompt: "You may discard a card for +1 action",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const choice = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "You may discard a card for +1 action",
          minCards: 0,
          maxCards: 1,
          cardList: activePlayer.hand,
          sourceCard: card,
        });
        if (choice.length == 0) return;
        await game.discardCard(choice[0], activePlayer);

        await new GainActions({ amount: 1 }).effect(card, activePlayer, game);
      },
    },
    {
      prompt: "You may discard a card for +1 Buy",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        const choice = await activePlayer.playerInput.chooseCardsFromList(activePlayer, game, {
          prompt: "You may discard a card for +1 buy",
          minCards: 0,
          maxCards: 1,
          cardList: activePlayer.hand,
          sourceCard: card,
        });
        if (choice.length == 0) return;
        await game.discardCard(choice[0], activePlayer);

        await new GainBuys({ amount: 1 }).effect(card, activePlayer, game);
      },
    },
  ],
};

const FortuneTeller = {};
const Menagerie: CardConfig = {
  name: "Menagerie",
  types: [CardType.ACTION],
  cost: 2,
  expansion: DominionExpansion.CORNUCOPIA,
  kingdomCard: true,
  playEffects: [
    new GainActions({ amount: 1 }),
    {
      prompt: "Reveal your hand. If all cards have different names: +3 cards. Otherwise +1 card",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        game.revealCards(activePlayer.hand, activePlayer);

        const count = new Map<string, number>();
        activePlayer.hand
          .map((c) => c.name)
          .forEach((name) => {
            const current = count.get(name);
            count.set(name, current ? current + 1 : 1);
          });
        const values = count.values();
        const max = Math.max(...values);
        if (max <= 1) {
          await new DrawCards({ amount: 3 }).effect(card, activePlayer, game);
        } else {
          await new DrawCards({ amount: 1 }).effect(card, activePlayer, game);
        }
      },
    },
  ],
};
const FarmingVillage = {};
const HorseTraders = {};
const Remake = {};
const Tournament = {};
const YoungWitch = {};
const Harvest = {};
const HornOfPlenty = {};
const HuntingParty = {};
const Jester = {};
const Fairgrounds = {};

export function register() {
  cardConfigRegistry.registerAll(Hamlet, Menagerie);
}
register();

export { Hamlet, Menagerie };
