import { shuffleArray } from "../util/ArrayExtensions";
import { Random } from "../util/Random";
import { Card } from "./Card";

export class Player {
  private random: Random;

  public hand: Array<Card>;
  public deck: Array<Card>;
  public discardPile: Array<Card>;
  public cardsInPlay: Array<Card>;

  public actions: number;
  public buys: number;
  public money: number;

  public turns: number;

  constructor(random: Random, initialCards: Array<Card>) {
    this.random = random;

    shuffleArray(initialCards, random);
    this.deck = initialCards;
    this.hand = [];
    // draw cards
    this.discardPile = [];
    this.cardsInPlay = [];

    this.actions = 1;
    this.buys = 1;
    this.money = 0;

    this.turns = 0;
  }
}
