import { Card, CardConfig } from "../../domain/objects/Card";
import { ConfigError } from "./ConfigRegistryError";

/* 
Provides information about all cards that are available
in the game
*/
export class CardConfigRegistry {
  private cards: Map<string, CardConfig>;

  constructor() {
    this.cards = new Map();
  }

  keys(): Array<string> {
    return Array.from(this.cards.keys());
  }

  values(): Array<CardConfig> {
    return Array.from(this.cards.entries()).map((pair) => pair[1]);
  }

  register(params: CardConfig) {
    this.cards.set(params.name, params);
  }

  registerAll(...params: Array<CardConfig>) {
    params.forEach((p) => this.register(p));
  }

  getParams(name: string): CardConfig {
    const params = this.cards.get(name);
    if (!params) throw new ConfigError(`Failed to find config for ${name}`);
    return params;
  }

  getParamsOrUndef(name: string): CardConfig | undefined {
    return this.cards.get(name);
  }

  newCard(name: string): Card {
    const params = this.getParams(name);
    return new Card(params);
  }

  newCardOrUndef(name: string): Card | undefined {
    const params = this.getParamsOrUndef(name);
    if (!params) return undefined;
    return new Card(params);
  }
}

const cardConfigRegistry = new CardConfigRegistry();

export { cardConfigRegistry };
