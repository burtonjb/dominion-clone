import { doNTimes, shuffleArray } from "../../util/ArrayExtensions";
import { Random } from "../../util/Random";
import { Card } from "./Card";
import { Game } from "./Game";

let playerId = 0;

export enum CardLocation {
  TOP_OF_DECK = "TopOfDeck",
  HAND = "Hand",
  DISCARD = "Discard",
  IN_PLAY = "InPlay",
}

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
    this.drawHand();

    this.discardPile = [];
    this.cardsInPlay = [];

    this.actions = 1;
    this.buys = 1;
    this.money = 0;

    this.turns = 0;
  }

  public drawHand() {
    // draw cards from deck
    doNTimes(5, () => this.drawCard());
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

  public topNCards(numberOfCards: number): Array<Card> {
    if (this.drawPile.length >= numberOfCards) {
      // draw a card from your deck
    } else if (this.drawPile.length < numberOfCards && this.discardPile.length > 0) {
      // shuffle your discard, put it below your deck, and then draw
      shuffleArray(this.discardPile, this.random);
      while (this.discardPile.length > 0) {
        const topCard = this.discardPile.shift()!;
        this.drawPile.push(topCard);
      }
    } else {
      // do nothing, no cards left in deck and discardPile
    }
    return this.drawPile.slice(0, numberOfCards);
  }

  public allCards(): Array<Card> {
    return [...this.hand, ...this.drawPile, ...this.discardPile, ...this.cardsInPlay];
  }

  // removes a card from whatever location its currently in (e.g. hand, deck, inPlay)
  // this might actually be wrong, since once the card is lost track of (e.g. shuffled into the deck)
  // its no longer tracked. But this method will still track the card...
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
      .map((card) => card.calculateVictoryPoints(this))
      .reduce((prev, cur) => prev + cur);
  }

  public infoString(): string {
    return `Player${this.id} | actions: ${this.actions} | buys: ${this.buys} | money: ${this.money} | deck: ${
      this.drawPile.length
    } | discard: ${this.discardPile.length} | VP: ${this.calculateVictoryPoints()}
    hand: ${this.hand.map((c) => c.name)}
    inPlay: ${this.cardsInPlay.map((c) => c.name)}`;
  }
}
