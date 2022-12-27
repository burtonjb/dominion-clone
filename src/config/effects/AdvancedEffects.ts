import { Card } from "../../domain/objects/Card";
import { BasicCardEffectConfig } from "../../domain/objects/CardEffect";
import { Game } from "../../domain/objects/Game";
import { Player } from "../../domain/objects/Player";
import { DrawCards } from "./BaseEffects";

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

export interface DiscardCardsFromHandParams {
  minCards?: number;
  maxCards?: number;
}
export class DiscardCardsFromHand implements BasicCardEffectConfig<DiscardCardsFromHandParams> {
  public readonly type = "DiscardCardsFromHand";
  public params: TrashCardsFromHandParams;
  public readonly prompt: string;

  constructor(params: TrashCardsFromHandParams) {
    this.params = params;
    this.prompt = `Discard between ${params.minCards} and ${params.maxCards} from hand`;
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
      game.discardCard(card, player);
    }
  }
}
export interface DrawToHandsizeParams {
  handsize: number;
}
export class DrawToHandsize implements BasicCardEffectConfig<DrawToHandsizeParams> {
  public readonly type = "DrawToHandsize";
  public params: DrawToHandsizeParams;
  public readonly prompt: string;

  constructor(params: DrawToHandsizeParams) {
    this.params = params;
    this.prompt = `Draw until you have ${params.handsize} cards in hand`;
  }

  async effect(card: Card, player: Player, game: Game) {
    while (
      player.hand.length < this.params.handsize &&
      !(player.drawPile.length == 0 && player.discardPile.length == 0)
    ) {
      await new DrawCards({ amount: 1 }).effect(card, player, game);
    }
  }
}
