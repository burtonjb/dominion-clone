import { HumanPlayerInput } from "../../config/input/HumanInput";
import { doNTimes, shuffleArray } from "../../util/ArrayExtensions";
import { Random } from "../../util/Random";
import { Card } from "./Card";
import { CardEffect } from "./CardEffect";
import { Game } from "./Game";
import { PlayerInput } from "./PlayerInput";

let playerId = 0;

export enum CardLocation {
  TOP_OF_DECK = "TopOfDeck",
  HAND = "Hand",
  DISCARD = "Discard",
  IN_PLAY = "InPlay",
}

export enum CardPosition {
  TOP = "Top",
  BOTTOM = "Bottom",
}

export class Player {
  private random: Random;
  private id: number;
  public name: string;

  public hand: Array<Card>;
  public drawPile: Array<Card>;
  public discardPile: Array<Card>;
  public cardsInPlay: Array<Card>;

  public onPlayCardTriggers: Array<CardEffect>;

  public actions: number;
  public buys: number;
  public money: number;

  public turns: number;

  public playerInput: PlayerInput;

  constructor(name: string, random: Random, initialCards: Array<Card>, playerInput?: PlayerInput) {
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

    this.onPlayCardTriggers = [];

    this.turns = 0;

    this.playerInput = playerInput ? playerInput : new HumanPlayerInput();
  }

  public drawHand() {
    // draw cards from deck
    doNTimes(5, () => this.drawCard());
  }

  public drawCard(): Card | undefined {
    if (this.drawPile.length > 0) {
      // draw a card from your deck
      const topCard = this.drawPile.shift()!;
      this.hand.push(topCard);
      return topCard;
    } else if (this.drawPile.length == 0 && this.discardPile.length > 0) {
      // shuffle your discard, put it below your deck, and then draw
      shuffleArray(this.discardPile, this.random);
      while (this.discardPile.length > 0) {
        const topCard = this.discardPile.shift()!;
        this.drawPile.push(topCard);
      }
      const topCard = this.drawPile.shift()!;
      this.hand.push(topCard);
      return topCard;
    } else {
      // do nothing, no cards left in deck and discardPile
      return undefined;
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
  // Returns the list of cards that were deleted
  public removeCard(card: Card): Array<Card> {
    const containers = [this.hand, this.drawPile, this.cardsInPlay, this.discardPile];
    for (const container of containers) {
      const index = container.findIndex((c) => c == card);
      if (index > -1) {
        return container.splice(index, 1); // remove the card from the container (in place)
      }
    }
    return [];
  }

  public transferCard(card: Card, from: Array<Card>, to: Array<Card>, position: CardPosition) {
    const cardIndex = from.findIndex((c) => c == card);
    if (cardIndex == -1) {
      console.warn("Unable to find card in transfercard method");
      return;
    }
    from.splice(cardIndex, 1);
    if (position == CardPosition.TOP) {
      to.unshift(card);
    } else if (position == CardPosition.BOTTOM) {
      to.push(card);
    }
  }

  public calculateVictoryPoints() {
    return this.allCards()
      .map((card) => card.calculateVictoryPoints(this))
      .reduce((prev, cur) => prev + cur);
  }

  public infoString(): string {
    return `Player${this.id} | actions: ${this.actions} | buys: ${this.buys} | money: ${this.money} | hand: ${
      this.hand.length
    } | deck: ${this.drawPile.length} | discard: ${this.discardPile.length} | VP: ${this.calculateVictoryPoints()}
    hand: ${this.hand.map((c) => c.name)}
    inPlay: ${this.cardsInPlay.map((c) => c.name)}`;
  }

  public cleanUp(game: Game) {
    // discard all cards in play
    const cardsInPlay = this.cardsInPlay.slice(); // create a copy of the array (to not run into concurrent modification problems)
    cardsInPlay.forEach((card) => game.discardCard(card, this));

    // discard all cards in hand
    const cardsInHand = this.hand.slice();
    cardsInHand.forEach((card) => game.discardCard(card, this));

    // draw a new hand of 5 cards
    doNTimes(5, () => this.drawCard());

    // reset buys/actions/money
    this.buys = 1;
    this.money = 0;
    this.actions = 1;

    // clean up the onPlay effects
    this.onPlayCardTriggers.length = 0;
  }
}
