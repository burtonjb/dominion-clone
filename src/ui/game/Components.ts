import { CardPile } from "../../domain/objects/CardPile";
import { Component } from "../Component";
import { TextImage, textImageFactory } from "../TextImage";

export class CardPileComponent implements Component {
  private pile: CardPile;

  constructor(pile: CardPile) {
    this.pile = pile;
  }

  render(): TextImage {
    if (this.pile.cards.length <= 0)
      // return empty display if the pile is empty
      return textImageFactory.fromString(``);
    const topCard = this.pile.cards[0];
    const formattedDepth = `[${this.pile.cards.length}]`.padEnd(4, " ");
    const formattedName = `${topCard.name}`.substring(0, 10).padEnd(10, " ");
    const formattedCost = `(${topCard.cost})`;
    const formattedTypes = `{${topCard.types}}`;

    return textImageFactory.fromString(`${formattedDepth} ${formattedName} ${formattedCost} ${formattedTypes}`);
  }
}
