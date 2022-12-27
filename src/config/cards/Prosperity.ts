import { cardConfigRegistry } from "../../di/configservice/CardConfigRegistry";
import { Card, CardParams, CardType, DominionExpansion } from "../../domain/objects/Card";
import { Game } from "../../domain/objects/Game";
import { CardPosition, Player } from "../../domain/objects/Player";
import { GainParams } from "../../domain/objects/Reaction";
import { DrawToHandsize } from "../effects/AdvancedEffects";
import { GainMoney, GainVictoryTokens } from "../effects/BaseEffects";

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
      prompt: "",
      effect: async (card: Card, activePlayer: Player, game: Game) => {
        console.log("TODO");
      },
    },
  ],
};



export function register() {
  cardConfigRegistry.registerAll(Anvil, Watchtower, Bishop);
}
register();

export { Anvil, Watchtower, Bishop };
