import { Card, CardParams } from "../../domain/objects/Card";

/* 
Provides information about all cards that are available
in the game
*/
export class CardConfigRegistry {
  private cards: Map<string, CardParams>;

  constructor() {
    this.cards = new Map();
  }

  keys(): Array<string> {
    return Array.from(this.cards.keys());
  }

  values(): Array<CardParams> {
    return Array.from(this.cards.entries()).map((pair) => pair[1]);
  }

  register(params: CardParams) {
    this.cards.set(params.name, params);
  }

  registerAll(...params: Array<CardParams>) {
    params.forEach((p) => this.register(p));
  }

  getParams(name: string): CardParams | undefined {
    return this.cards.get(name);
  }

  newCard(name: string): Card | undefined {
    const config = this.cards.get(name);
    if (config == undefined) {
      return undefined;
    }
    return new Card(config);
  }
}

const cardConfigRegistry = new CardConfigRegistry();

export { cardConfigRegistry };
