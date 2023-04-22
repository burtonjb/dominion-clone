import { CardEffectConfig, DurationEffect, OnGainCardEffect } from "./CardEffect";
import { Game } from "./Game";
import { Player } from "./Player";
import { GainParams, ReactionEffectsCardParams } from "./Reaction";

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
  PROSPERITY = "Prosperity",
  HINTERLANDS = "Hinterlands",
}

export interface CardConfig {
  readonly name: string;
  readonly types: Array<CardType>;
  readonly cost: number;
  readonly costModifier?: (player: Player, game: Game) => number; // returns a number that is added to the total cost (use negative numbers for cost reduction)
  readonly worth?: number;
  readonly victoryPoints?: number;
  readonly text?: string;
  readonly expansion: DominionExpansion;
  readonly kingdomCard: boolean;
  readonly playEffects?: Array<CardEffectConfig>;
  readonly reactionEffects?: ReactionEffectsCardParams;
  readonly calculateVictoryPoints?: (player: Player) => number;
  readonly onCleanupEffects?: Array<CardEffectConfig>;
  readonly onGainEffects?: Array<{ prompt: string; effect: OnGainCardEffect }>;
  readonly onTrashEffects?: Array<CardEffectConfig>;
  readonly additionalBuyRestrictions?: (player: Player, game: Game) => boolean;
}

export class Card {
  private readonly params: CardConfig;
  public readonly id: number; // used to trace the exact card instance - for debugging mostly
  public readonly name: string;
  public readonly baseCost: number;
  public readonly types: Array<CardType>;
  public readonly worth: number;
  public readonly victoryPoints: number;
  public readonly expansion: DominionExpansion;

  public durationEffects: Array<DurationEffect>;

  constructor(params: CardConfig) {
    this.params = params;
    this.id = cardNumber++;
    this.name = params.name;
    this.baseCost = params.cost;
    this.types = params.types.slice(); // copy of the config
    this.worth = params.worth ? params.worth : 0;
    this.victoryPoints = params.victoryPoints ? params.victoryPoints : 0;
    this.durationEffects = [];
    this.expansion = params.expansion;
  }

  public canBuy(player: Player, game: Game): boolean {
    if (!this.params.additionalBuyRestrictions) return true;
    return this.params.additionalBuyRestrictions(player, game);
  }

  public calculateCost(game: Game): number {
    // cost can't be less than 0
    const cardCostMod = this.params.costModifier ? this.params.costModifier(game.getActivePlayer(), game) : 0;
    const gameCostMods = game.costModifiers.map((mod) => mod(this)).reduce((prev, cur) => prev + cur, 0);
    return Math.max(0, this.baseCost + cardCostMod + gameCostMods);
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

  public async onGainCard(game: Game, args: GainParams) {
    if (!this.params.onGainEffects) return;
    for (let i = 0; i < this.params.onGainEffects?.length; i++) {
      await this.params.onGainEffects[i].effect(this, args.gainedPlayer, game, args.wasBought, args.toLocation);
    }
  }

  public async onTrash(player: Player, game: Game) {
    if (!this.params.onTrashEffects) return;
    for (let i = 0; i < this.params.onTrashEffects?.length; i++) {
      await this.params.onTrashEffects[i].effect(this, player, game);
    }
  }

  public async onDiscard(player: Player, game: Game) {
    if (!this.params.reactionEffects || !this.params.reactionEffects.onDiscardEffects) return;
    for (let i = 0; i < this.params.reactionEffects.onDiscardEffects.length; i++) {
      await this.params.reactionEffects.onDiscardEffects[i].effect(this, player, game);
    }
  }

  public async onGainReaction(game: Game, owningPlayer: Player, gainParams: GainParams) {
    if (!this.params.reactionEffects || !this.params.reactionEffects.onGainCardEffects) return;
    for (let i = 0; i < this.params.reactionEffects.onGainCardEffects.length; i++) {
      game.ui?.render();
      await this.params.reactionEffects.onGainCardEffects[i](owningPlayer, this, game, gainParams);
    }
  }

  public async onStartTurnReaction(activePlayer: Player, game: Game) {
    if (!this.params.reactionEffects || !this.params.reactionEffects.onStartTurnEffects) return;
    for (let i = 0; i < this.params.reactionEffects.onStartTurnEffects.length; i++) {
      game.ui?.render();
      await this.params.reactionEffects.onStartTurnEffects[i].effect(this, activePlayer, game);
    }
  }

  public async onCleanUp(game: Game) {
    const activePlayer = game.getActivePlayer();

    if (!this.params.onCleanupEffects) return;
    for (let i = 0; i < this.params.onCleanupEffects?.length; i++) {
      game.ui?.render();
      await this.params.onCleanupEffects[i].effect(this, activePlayer, game);
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
