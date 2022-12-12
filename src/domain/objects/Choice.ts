import { question } from "../../util/PromiseExtensions";
import { Card } from "./Card";
import { CardPile } from "./CardPile";
import { Game } from "./Game";
import { Player } from "./Player";
import { Supply } from "./Supply";

// Choices
export interface Choice<T> {
  prompt: string;
  getChoice: () => Promise<T>;
}

/*
Used for things that give the player an option to do something or not 
e.g. "may" effects. Set the defaultValue to the one that you think the player is more likely to 
take - e.g. moneylender would most likely default to a true value
*/
export class BooleanChoice implements Choice<boolean> {
  public readonly prompt: string;
  public readonly options = [true, false];

  constructor(prompt: string, private defaultValue: boolean = true) {
    this.prompt = prompt;
  }

  public async getChoice(): Promise<boolean> {
    console.log(`${this.prompt} (t=yes, f=no)\n>`);
    const input = await question(this.prompt);
    if (this.defaultValue == true) {
      if (input.toLowerCase().startsWith("f")) return false;
      return true;
    } else {
      if (input.toLowerCase().startsWith("t")) return true;
      return false;
    }
  }
}

export interface CardsFromPlayerChoiceConfig {
  minCards?: number;
  maxCards?: number;
}

/*
Used for things for the player to pick cards (or a single card) from ones that are owned by a player
e.g. Harbinger will pick one card from the discard pile and Chapel can trash from 0 to 4 cards from hand
*/
export class CardsFromPlayerChoice implements Choice<Array<Card>> {
  private player: Player;
  public readonly prompt: string;
  public readonly options: Array<Card>;
  private config: CardsFromPlayerChoiceConfig;

  constructor(prompt: string, player: Player, cardContainer: Array<Card>, config?: CardsFromPlayerChoiceConfig) {
    this.prompt = prompt;
    this.player = player;

    this.options = cardContainer;
    this.config = config ? config : {};
  }

  public async getChoice() {
    const selected: Array<Card> = [];
    let done = false;

    while (!done) {
      const availableOptions = this.options.filter((card) => !selected.includes(card));
      console.log(
        `${this.prompt} (available: ${availableOptions.map((c) => c.name)}) (already selected: ${selected.map(
          (s) => s.name
        )})\n> `
      );

      const input = await question(this.prompt);
      const inputMatch = new RegExp("^" + input + ".*", "i"); // matcher for options that start with the input

      const matchingCards = this.options
        .filter((card) => !selected.includes(card)) // filter out cards that are already selected
        .filter((card) => card.name.match(inputMatch));

      const singleMatch = new Set(matchingCards.map((c) => c.name)).size == 1;

      if (input.length > 0 && singleMatch) {
        const matchingCard = matchingCards[0];
        selected.push(matchingCard);
        if (this.config.maxCards && selected.length >= this.config.maxCards) {
          done = true;
        }
      } else if (input.toLowerCase() == "end") {
        if (this.config.minCards && selected.length >= this.config.minCards) {
          done = true;
        } else if (this.config.minCards == undefined) {
          done = true;
        } else {
          console.debug("Not enough cards selected");
        }
      } else {
        console.warn(`Unknown input ${input}`);
      }
    }
    return selected;
  }
}

/*

*/
export class ChooseCardFromSupply implements Choice<CardPile> {
  public readonly prompt: string;
  private supply: Supply;
  private filter?: (pile: CardPile) => boolean;

  constructor(prompt: string, supply: Supply, filter?: (pile: CardPile) => boolean) {
    this.prompt = prompt;
    this.supply = supply;
    this.filter = filter;
  }

  public async getChoice(): Promise<CardPile> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const available = this.supply
        .allPiles()
        .filter((pile) => pile.cards.length > 0) // filter out non-empty piles
        .filter((pile) => (this.filter ? this.filter(pile) : true));

      const availableDisplay = available.map((p) => `{${p.cards.length}} ${p.name}`);

      console.log(`${this.prompt}. (available: ${availableDisplay}`);
      const input = await question(this.prompt);
      const inputMatch = new RegExp("^" + input + ".*", "i"); // matcher for options that start with the input

      const matchingPiles = this.supply
        .allPiles()
        .filter((pile) => pile.cards.length > 0) // filter out non-empty piles
        .filter((card) => card.name.match(inputMatch))
        .filter((pile) => (this.filter ? this.filter(pile) : true));

      const singleMatch = new Set(matchingPiles.map((c) => c.name)).size == 1;

      if (singleMatch) {
        const matchingPile = matchingPiles[0];
        return matchingPile;
      } else {
        console.warn(`Unknown input ${input}`);
      }
    }
  }
}
