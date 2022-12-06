import { doNTimes, shuffleArray } from "../../util/ArrayExtensions";
import { Random } from "../../util/Random";
import { Card } from "./Card";

let playerId = 0;

export class Player {
  private random: Random;
  private id: number;
  public readonly name: string;

  public hand: Array<Card>;
  public drawPile: Array<Card>;
  public discardPile: Array<Card>;
  public cardsInPlay: Array<Card>;

  public actions: number;
  public buys: number;
  public money: number;

  public turns: number;

  constructor(name: string, random: Random, initialCards: Array<Card>) {
    this.random = random;
    this.id = playerId++;
    this.name = name;

    // right now start game logic is in the constructor, but I might want to change this
    shuffleArray(initialCards, random);
    this.drawPile = initialCards;
    this.hand = [];
    // draw cards from deck
    doNTimes(5, () => this.drawCard());

    this.discardPile = [];
    this.cardsInPlay = [];

    this.actions = 1;
    this.buys = 1;
    this.money = 0;

    this.turns = 0;
  }

  public drawCard() {
    if (this.drawPile.length > 0) {
      // draw a card from your deck
      const topCard = this.drawPile.shift()!;
      this.hand.push(topCard);
    } else if (this.drawPile.length == 0 && this.discardPile.length > 0) {
      // shuffle your discard, put it below your deck, and then draw
      shuffleArray(this.discardPile, this.random);
      while (this.discardPile.length > 0) {
        const topCard = this.discardPile.shift()!;
        this.drawPile.push(topCard);
      }
      const topCard = this.drawPile.shift()!;
      this.hand.push(topCard);
    } else {
      // do nothing, no cards left in deck and discardPile
    }
  }

  public allCards(): Array<Card> {
    return [...this.hand, ...this.drawPile, ...this.discardPile, ...this.cardsInPlay];
  }

  // removes a card from whatever location its currently in (e.g. hand, deck, inPlay)
  public removeCard(card: Card) {
    const containers = [this.hand, this.drawPile, this.cardsInPlay, this.discardPile];
    for (const container of containers) {
      const index = container.findIndex((c) => c == card);
      if (index > -1) {
        container.splice(index, 1); // remove the card from the container (in place)
      }
    }
  }

  public calculateVictoryPoints() {
    return this.allCards()
      .map((card) => card.victoryPoints)
      .reduce((prev, cur) => prev + cur);
  }

  public infoString(): string {
    return `Player${this.id} | actions: ${this.actions} | buys: ${this.buys} | money: ${this.money} | deck: ${
      this.drawPile.length
    } | discard: ${this.discardPile.length} 
    hand: ${this.hand.map((c) => c.name)}
    inPlay: ${this.cardsInPlay.map((c) => c.name)}`;
  }
}
