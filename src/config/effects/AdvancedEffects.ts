import { Card } from "../../domain/objects/Card";
import { BasicCardEffectConfig } from "../../domain/objects/CardEffect";
import { Game } from "../../domain/objects/Game";
import { Player } from "../../domain/objects/Player";

// This file contains some of the more commonly used effects
// I'll populate it once I do my refactoring (after the UI and AI changes but before implementing Seaside I think)

export interface TrashCardsFromHandParams {
  minCards?: number;
  maxCards?: number;
}
export class TrashCardsFromHand implements BasicCardEffectConfig<TrashCardsFromHandParams> {
  public readonly type = "TrashCardsFromHand";
  public params: TrashCardsFromHandParams;
  public readonly prompt: string;

  constructor(params: TrashCardsFromHandParams) {
    this.params = params;
    this.prompt = `Trash between ${params.minCards} and ${params.maxCards} from hand`;
  }

  async effect(card: Card, player: Player, game: Game) {
    const chosenCards = await player.playerInput.chooseCardsFromList(player, game, {
      prompt: this.prompt,
      minCards: this.params.minCards,
      maxCards: this.params.maxCards,
      cardList: player.hand,
      sourceCard: card,
    });

    for (const card of chosenCards) {
      game.trashCard(card, player);
    }
  }
}
