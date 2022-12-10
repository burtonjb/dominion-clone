import { question } from "../../util/PromiseExtensions";
import { Card } from "./Card";
import { Game } from "./Game";
import { Player } from "./Player";

export interface Choose {
  cardsFromHand: Array<Choose>;
}

export interface Choice<T> {
  prompt: string;
  options: Array<T>;
}

export interface ChooseCardFromHandConfig {
  minCards?: number;
  maxCards?: number;
}

export class ChooseCards implements Choice<Card> {
  private player: Player;
  private game: Game;
  public readonly prompt: string;
  public readonly options: Array<Card>; // what to do about ALL and END?
  private done = false;
  private selectedCards: Array<Card> = [];
  private config: ChooseCardFromHandConfig;

  constructor(player: Player, game: Game, cardContainer: Array<Card>, config?: ChooseCardFromHandConfig) {
    this.player = player;
    this.game = game;

    this.prompt = `TODO: fill this in: ${this.player.hand.map((c) => c.name)}, or 'end' to end\n> `;
    this.options = cardContainer;
    this.config = config ? config : {};
  }

  public isDone(): boolean {
    return this.done;
  }

  public getSelected(): Array<Card> {
    return this.selectedCards;
  }

  public async loop() {
    while (!this.isDone()) {
      const input = await question(this.prompt);
      const inputMatch = new RegExp("^" + input + ".*", "i"); // matcher for options that start with the input

      const matchingCards = this.player.hand.filter((card) => card.name.match(inputMatch));

      const singleMatch = new Set(matchingCards.map((c) => c.name)).size == 1;
      if (input.length > 0 && singleMatch) {
        const matchingCard = matchingCards[0];
        this.selectedCards.push(matchingCard);
        if (this.config.maxCards && this.selectedCards.length >= this.config.maxCards) {
          this.done = true;
        }
      } else if (input.toLowerCase() == "all") {
        this.selectedCards = this.player.hand;
      } else if (input.toLowerCase() == "end") {
        if (this.config.minCards && this.selectedCards.length >= this.config.minCards) {
          this.done = true;
        } else if (this.config.minCards == undefined) {
          this.done = true;
        } else {
          console.debug("Min number of cards has not yet been selected.");
        }
      } else {
        console.log(`Unknown input: ${input}`); // TODO: handle unknowns or handle trying to play cards that cannot be played now
      }
    }
  }
}

export class BooleanOption implements Choice<boolean> {
  private player: Player;
  private game: Game;
  public readonly prompt: string;
  public readonly options = [true, false];
  private done = false;
  private selected = false;

  constructor(player: Player, game: Game) {
    this.prompt = "input 't' for true, 'f' for false"; // TODO
    this.player = player;
    this.game = game;
  }

  public getSelected(): boolean {
    return this.selected;
  }

  public async loop(): Promise<boolean> {
    const input = await question(this.prompt);
    if (input.toLowerCase().startsWith("t")) this.selected = true;
    else this.selected = false;
    return this.selected;
  }
}
