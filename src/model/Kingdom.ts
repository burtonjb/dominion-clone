import { Card, DominionExpansion } from "./Card";

export interface KingdomParams {
  name: string;
  expansions: Array<DominionExpansion>;
  cards: Array<string>;
}

export class Kingdom {
  public kingdomCards: Array<Array<Card>>;

  constructor(kingdomCards: Array<Array<Card>>) {
    this.kingdomCards = kingdomCards;
  }
}
