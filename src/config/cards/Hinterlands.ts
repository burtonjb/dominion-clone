import { cardConfigRegistry } from "../../di/configservice/CardConfigRegistry";
import { BasicCards } from "../../di/RegisterConfig";
import { Card, CardParams, CardType, DominionExpansion } from "../../domain/objects/Card";
import { attack, OnGainCardTrigger } from "../../domain/objects/CardEffect";
import { Game, TurnPhase } from "../../domain/objects/Game";
import { CardLocation, CardPosition, Player } from "../../domain/objects/Player";
import { GainParams } from "../../domain/objects/Reaction";
import { DrawToHandsize, TrashCardsFromHand } from "../effects/AdvancedEffects";
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
            game.trashCard(cardWithEffect, owningPlayer);
            game.gainCardByName(BasicCards.Gold.name, owningPlayer, false, CardLocation.TOP_OF_DECK);
          }
        }
      },
    ],
  },
};

export function register() {
  cardConfigRegistry.registerAll(Crossroads, FoolsGold);
}
register();

export { Crossroads, FoolsGold };
