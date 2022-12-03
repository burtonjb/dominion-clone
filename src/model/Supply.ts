import { Card } from "./Card";
import { Kingdom } from "./Kingdom";

export class Supply {
  public baseCards: Array<Array<Card>>;
  public kingdom: Kingdom;

  constructor(baseCards: Array<Array<Card>>, kingdom: Kingdom) {
    this.baseCards = baseCards;
    this.kingdom = kingdom;
  }
}
