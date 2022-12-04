import { CardPile } from "./CardPile";
import { Kingdom } from "./Kingdom";

export class Supply {
  public baseCards: Array<CardPile>;
  public kingdom: Kingdom;

  constructor(baseCards: Array<CardPile>, kingdom: Kingdom) {
    this.baseCards = baseCards;
    this.kingdom = kingdom;
  }

  public allPiles(): Array<CardPile> {
    return [...this.baseCards, ...this.kingdom.kingdomCards];
  }
}
