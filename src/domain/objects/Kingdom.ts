import { Card, DominionExpansion } from "./Card";
import { CardPile } from "./CardPile";

export interface KingdomParams {
  readonly name: string;
  readonly expansions: Array<DominionExpansion>;
  readonly cards: Array<string>;
}

export class Kingdom {
  public kingdomCards: Array<CardPile>;

  constructor(kingdomCards: Array<CardPile>) {
    this.kingdomCards = kingdomCards;
  }
}
