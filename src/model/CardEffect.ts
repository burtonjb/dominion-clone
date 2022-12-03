import { Kingdom } from "./Kingdom";
import { Player } from "./Player";

export interface CardEffect<T> {
  type: string;
  params: T;
  effect: (player: Player, kingdom: Kingdom) => void;
}
