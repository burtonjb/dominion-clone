import { Random } from "../util/Random";
import { Card } from "./Card";
import { Player } from "./Player";
import { Supply } from "./Supply";

export interface GameParams {
  seed: number;
  numberOfPlayers: number;
}

export enum TurnPhase {
  ACTION = "Action",
  BUY = "Buy",
  CLEAN_UP = "Clean up",
}

export class Game {
  private random: Random;
  public players: Array<Player>;
  public supply: Supply;
  public activePlayerIndex: number;

  public trash: Array<Card>;

  constructor(random: Random, players: Array<Player>, supply: Supply) {
    this.random = random;
    this.players = players;
    this.supply = supply;
    this.trash = [];

    // pick the first player randomly
    this.activePlayerIndex = this.random.randomInt(0, players.length);
  }
}
