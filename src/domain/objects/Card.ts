import { BasicCardEffectConfig, CardEffect, CardEffectConfig } from "./CardEffect";
import { Game } from "./Game";
import { Player } from "./Player";

// internal counter for tracking cards' uniqueness (for debugging if required)
let cardNumber = 0;

export enum CardType {
  ACTION = "Action",
  ATTACK = "Attack",
  CURSE = "Curse",
  REACTION = "Reaction",
  TREASURE = "Treasure",
  VICTORY = "Victory",
}

export enum DominionExpansion {
  BASE = "Base",
}

export interface ReactionEffects {
  onOtherPlayEffect?: Array<CardEffectConfig>;
}

export interface CardParams {
  name: string;
  types: Array<CardType>;
  cost: number;
  worth?: number;
  victoryPoints?: number;
  expansion: DominionExpansion;
  kingdomCard: boolean;
  playEffects?: Array<CardEffectConfig>;
  reactionEffects?: ReactionEffects;
  calculateVictoryPoints?: (player: Player, game: Game) => number;
}

export class Card {
  public readonly params: CardParams;
  private id: number;
  public name: string;
  public cost: number;
  public types: Array<CardType>;
  public worth: number;
  public victoryPoints: number;
  private playEffects: Array<CardEffectConfig>;

  constructor(params: CardParams) {
    this.params = params;
    this.id = cardNumber++;
    this.name = params.name;
    this.cost = params.cost;
    this.types = params.types.slice(); // copy of the config
    this.worth = params.worth ? params.worth : 0;
    this.victoryPoints = params.victoryPoints ? params.victoryPoints : 0;
    this.playEffects = params.playEffects ? params.playEffects : [];
  }

  public calculateVictoryPoints(player: Player, game: Game): number {
    if (this.params.calculateVictoryPoints) {
      return this.params.calculateVictoryPoints(player, game);
    } else {
      return this.victoryPoints;
    }
  }
}