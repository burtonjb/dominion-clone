import { Card } from "./Card";

export class CardPile {
  public readonly name: string;
  public cards: Array<Card>;

  constructor(name: string, cards: Array<Card>) {
    this.name = name;
    this.cards = cards;
  }
}
