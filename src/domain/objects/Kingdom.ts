import { DominionExpansion } from "./Card";
import { CardPile } from "./CardPile";

export interface KingdomConfig {
  readonly name: string;
  readonly expansions: Array<DominionExpansion>;
  readonly cards: Array<string>;
  readonly usePlatinumAndColony?: boolean;
}

export class Kingdom {
  public kingdomPiles: Array<CardPile>;

  constructor(readonly name: string, kingdomCards: Array<CardPile>) {
    this.kingdomPiles = kingdomCards;
  }
}
