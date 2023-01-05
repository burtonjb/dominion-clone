import { question } from "../util/PromiseExtensions";
import { Card } from "../domain/objects/Card";
import { CardEffectConfig } from "../domain/objects/CardEffect";
import { CardPile } from "../domain/objects/CardPile";
import { Player } from "../domain/objects/Player";
import { Supply } from "../domain/objects/Supply";
import { Game } from "../domain/objects/Game";
import { matchInput } from "../util/MatchInput";

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

  constructor(prompt: string, private game: Game, private defaultValue: boolean = true) {
    this.prompt = prompt;
  }

  public async getChoice(): Promise<boolean> {
    this.game.ui?.renderPrompt(`${this.prompt} (t=yes, f=no)\n> `);
    const input = await question();
    if (this.defaultValue == true) {
      if (input.toLowerCase().startsWith("f") || input.toLowerCase().startsWith("n")) return false;
      return true;
    } else {
      if (input.toLowerCase().startsWith("t") || input.toLowerCase().startsWith("y")) return true;
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
  private params: CardsFromPlayerChoiceConfig;

  constructor(
    prompt: string,
    player: Player,
    cardContainer: Array<Card>,
    private game: Game,
    params?: CardsFromPlayerChoiceConfig
  ) {
    this.prompt = prompt;
    this.player = player;

    this.options = cardContainer;
    this.params = params ? params : {};
  }

  public async getChoice() {
    const selected: Array<Card> = [];
    let done = false;

    // if the number of cards is less than the required minimum, just return all the
    // cards that are available (e.g.) if its trash 1 card from hand, and there's only 1
    // card, then just return/trash that card
    if (this.params.minCards && this.options.length <= this.params.minCards) {
      return this.options;
    }

    while (!done) {
      const availableOptions = this.options.filter((card) => !selected.includes(card));

      this.game.ui?.renderPrompt(
        `${this.prompt} (available: ${availableOptions.map((c) =>
          this.game.ui?.formatCardName(c)
        )}) (already selected: ${selected.map((s) => s.name)})\n> `
      );
      const input = await question();

      const match = matchInput(
        input,
        this.options.filter((card) => !selected.includes(card)).map((c) => [c.name, c])
      );

      if (input.length > 0 && match) {
        selected.push(match);
        if (this.params.maxCards && selected.length >= this.params.maxCards) {
          done = true;
        }
      } else if (input.toLowerCase() == "end") {
        if (this.params.minCards && selected.length >= this.params.minCards) {
          done = true;
        } else if (!this.params.minCards) {
          done = true;
        } else {
          console.debug("Not enough cards selected");
        }
      } else {
        console.warn(`Unknown input ${input}`);
      }

      if (this.params.maxCards && selected.length >= this.params.maxCards) {
        return selected;
      }
    }
    return selected;
  }
}

/*
Used for selecting a card from the supply
*/
export class ChooseCardFromSupply implements Choice<CardPile | undefined> {
  public readonly prompt: string;
  private supply: Supply;
  private filter?: (pile: CardPile) => boolean;

  constructor(prompt: string, supply: Supply, private game: Game, filter?: (pile: CardPile) => boolean) {
    this.prompt = prompt;
    this.supply = supply;
    this.filter = filter;
  }

  public async getChoice(): Promise<CardPile | undefined> {
    const available = this.supply
      .allPiles()
      .filter((pile) => pile.cards.length > 0) // filter out non-empty piles
      .filter((pile) => (this.filter ? this.filter(pile) : true));

    if (available.length == 0) {
      return undefined;
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const available = this.supply
        .allPiles()
        .filter((pile) => pile.cards.length > 0) // filter out non-empty piles
        .filter((pile) => (this.filter ? this.filter(pile) : true));

      const availableDisplay = available.map((p) => this.game.ui?.formatCardPileName(p));

      this.game.ui?.renderPrompt(`${this.prompt}. (available: ${availableDisplay})\n> `);
      const input = await question();

      const matchingPiles = this.supply
        .allPiles()
        .filter((pile) => pile.cards.length > 0) // filter out non-empty piles
        .filter((pile) => (this.filter ? this.filter(pile) : true));

      const singleMatch = matchInput(
        input,
        matchingPiles.map((p) => [p.cards[0].name, p])
      );

      if (singleMatch) {
        const matchingPile = matchingPiles[0];
        return matchingPile;
      } else {
        console.warn(`Unknown input ${input}`);
      }
    }
  }
}

export interface ChooseEffectChoiceConfig {
  minChoices?: number;
  maxChoices?: number;
}

/*
Used for when the player is to select an option/effect from a list of effects.
For example, with pawn, the player will select two different effects. 
*/
export class ChooseEffectChoice implements Choice<Array<CardEffectConfig>> {
  private config: ChooseEffectChoiceConfig;

  constructor(
    public readonly prompt: string,
    private game: Game,
    private player: Player,
    private options: Array<CardEffectConfig>,
    config?: ChooseEffectChoiceConfig
  ) {
    this.config = config ? config : {};
  }

  public async getChoice(): Promise<Array<CardEffectConfig>> {
    const selected: Array<CardEffectConfig> = [];
    let done = false;

    // if the number of cards is less than the required minimum, just return all the
    // cards that are available (e.g.) if its trash 1 card from hand, and there's only 1
    // card, then just return/trash that card
    if (this.config.minChoices && this.options.length <= this.config.minChoices) {
      return this.options;
    }

    while (!done) {
      const availableOptions = this.options.filter((effect) => !selected.includes(effect));

      this.game.ui?.renderPrompt(
        `${this.prompt} (available: ${availableOptions.map((c) => c.prompt)}) (already selected: ${selected.map(
          (s) => s.prompt
        )})\n> `
      );
      const input = await question();
      const effects = this.options.filter((effect) => !selected.includes(effect)); // filter out cards that are already selected
      const singleMatch = matchInput(
        input,
        effects.map((e) => [e.prompt, e])
      );

      if (input.length > 0 && singleMatch) {
        selected.push(singleMatch);
        if (this.config.maxChoices && selected.length >= this.config.maxChoices) {
          done = true;
        }
      } else if (input.toLowerCase() == "end") {
        if (this.config.minChoices && selected.length >= this.config.minChoices) {
          done = true;
        } else if (!this.config.minChoices) {
          done = true;
        } else {
          console.debug("Not enough effects selected");
        }
      } else {
        console.warn(`Unknown input ${input}`);
      }
    }
    return selected;
  }
}

export class StringChoice implements Choice<string> {
  public readonly prompt: string;
  public readonly options = "";

  constructor(prompt: string, private game: Game) {
    this.prompt = prompt;
  }

  public async getChoice(): Promise<string> {
    this.game.ui?.renderPrompt(`${this.prompt}\n> `);
    const input = await question();
    return input;
  }
}

export class IntegerChoice implements Choice<number> {
  public readonly prompt: string;
  public readonly options = -1;

  constructor(
    prompt: string,
    private game: Game,
    private defaultValue: number,
    private minValue?: number,
    private maxValue?: number
  ) {
    this.prompt = `${prompt} (between ${minValue} and ${maxValue})`;
  }

  public async getChoice(): Promise<number> {
    this.game.ui?.renderPrompt(`${this.prompt}\n> `);
    const input = await question();
    try {
      const out = Number.parseInt(input.trim());
      if (this.minValue && out < this.minValue) {
        return this.minValue;
      }
      if (this.maxValue && out > this.maxValue) {
        return this.maxValue;
      }
      if (Number.isNaN(out)) {
        return this.defaultValue;
      }
      return out;
    } catch {
      return this.defaultValue;
    }
  }
}
