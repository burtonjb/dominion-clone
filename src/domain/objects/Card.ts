import { CardEffectConfig, DurationEffect } from "./CardEffect";
import { Game } from "./Game";
import { Player } from "./Player";

// internal counter for tracking cards' uniqueness (for debugging if required)
let cardNumber = 0;

export enum CardType {
  ACTION = "Action",
  ATTACK = "Attack",
  CURSE = "Curse",
  DURATION = "Duration",
  REACTION = "Reaction",
  TREASURE = "Treasure",
  VICTORY = "Victory",
}

export enum DominionExpansion {
  BASE = "Base",
  INTRIGUE = "Intrigue",
  SEASIDE = "Seaside",
}

export interface ReactionEffects {
  onOtherPlayEffect?: Array<CardEffectConfig>;
}

export interface CardParams {
  readonly name: string;
  readonly types: Array<CardType>;
  readonly cost: number;
  readonly worth?: number;
  readonly victoryPoints?: number;
  readonly text?: string;
  readonly expansion: DominionExpansion;
  readonly kingdomCard: boolean;
  readonly playEffects?: Array<CardEffectConfig>;
  readonly reactionEffects?: ReactionEffects;
  readonly calculateVictoryPoints?: (player: Player) => number;
}

export class Card {
  private readonly params: CardParams;
  public readonly id: number; // used to trace the exact card instance - for debugging mostly
  public name: string;
  public baseCost: number;
  public types: Array<CardType>;
  public worth: number;
  public victoryPoints: number;

  public durationEffects: Array<DurationEffect>;

  constructor(params: CardParams) {
    this.params = params;
    this.id = cardNumber++;
    this.name = params.name;
    this.baseCost = params.cost;
    this.types = params.types.slice(); // copy of the config
    this.worth = params.worth ? params.worth : 0;
    this.victoryPoints = params.victoryPoints ? params.victoryPoints : 0;
    this.durationEffects = [];
  }

  public calculateCost(game: Game): number {
    // cost can't be less than 0
    return Math.max(0, this.baseCost + game.costModifiers.map((mod) => mod(this)).reduce((prev, cur) => prev + cur, 0));
  }

  public calculateVictoryPoints(player: Player): number {
    if (this.params.calculateVictoryPoints) {
      return this.params.calculateVictoryPoints(player);
    } else {
      return this.victoryPoints;
    }
  }

  public async play(player: Player, game: Game) {
    if (!this.params.playEffects) return;
    for (let i = 0; i < this.params.playEffects?.length; i++) {
      game.ui?.render();
      await this.params.playEffects[i].effect(this, player, game);
    }
  }

  public shouldCleanUp(): boolean {
    return this.durationEffects.length == 0;
  }

  public effectString(): string {
    if (this.params.text) {
      return this.params.text;
    }
    let out = "";
    if (this.victoryPoints) {
      out += `${this.victoryPoints} VP. `;
    }
    if (this.params.playEffects) {
      out += this.params.playEffects?.map((e) => e.prompt)?.join(". ");
    }
    return out;
  }
}
