import { Card, DominionExpansion } from "./Card";
import { CardPile } from "./CardPile";

export interface KingdomParams {
  name: string;
  expansions: Array<DominionExpansion>;
  cards: Array<string>;
}

export class Kingdom {
  public kingdomCards: Array<CardPile>;

  constructor(kingdomCards: Array<CardPile>) {
    this.kingdomCards = kingdomCards;
  }
}
