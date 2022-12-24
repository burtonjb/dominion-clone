import { CardPile } from "./CardPile";
import { Kingdom } from "./Kingdom";

export class Supply {
  public basePiles: Array<CardPile>;
  public kingdom: Kingdom;

  constructor(baseCards: Array<CardPile>, kingdom: Kingdom) {
    this.basePiles = baseCards;
    this.kingdom = kingdom;
  }

  public allPiles(): Array<CardPile> {
    return [...this.basePiles, ...this.kingdom.kingdomPiles];
  }

  public nonEmptyPiles(): Array<CardPile> {
    return [...this.basePiles, ...this.kingdom.kingdomPiles].filter((pile) => pile.cards.length > 0);
  }

  public emptyPiles(): Array<CardPile> {
    return this.allPiles().filter((pile) => pile.cards.length == 0);
  }
}
