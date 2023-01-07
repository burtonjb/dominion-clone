import { CardPile } from "../../domain/objects/CardPile";
import { Kingdom, KingdomConfig } from "../../domain/objects/Kingdom";
import { createNInstances } from "../../util/ArrayExtensions";
import { getNumberOfPileCards } from "../CreateKingdom";
import { cardConfigRegistry } from "./CardConfigRegistry";
import { ConfigError } from "./ConfigRegistryError";

export class KingdomConfigRegistry {
  private kingdoms: Map<string, KingdomConfig>;

  constructor() {
    this.kingdoms = new Map();
  }

  keys(): Array<string> {
    return Array.from(this.kingdoms.keys());
  }

  values(): Array<KingdomConfig> {
    return Array.from(this.kingdoms.entries()).map((pair) => pair[1]);
  }

  register(params: KingdomConfig) {
    this.kingdoms.set(params.name, params);
  }

  registerAll(...params: Array<KingdomConfig>) {
    params.forEach((p) => this.register(p));
  }

  getConfig(name: string): KingdomConfig {
    const out = this.kingdoms.get(name);
    if (!out) throw new ConfigError(`Unable to find config for ${name}`);
    return out;
  }

  getConfigOrUndef(name: string): KingdomConfig | undefined {
    return this.kingdoms.get(name);
  }

  newKingdom(numberOfPlayers: number, name: string): Kingdom {
    const kingdom = this.newKingdomOrUndef(numberOfPlayers, name);
    if (!kingdom) {
      throw new ConfigError(`Unable to find config for ${name}`);
    }
    return kingdom;
  }

  newKingdomOrUndef(numberOfPlayers: number, name: string): Kingdom | undefined {
    const config = this.kingdoms.get(name);
    if (config == undefined) {
      return undefined;
    }

    const cardPiles = config.cards.map((c) => {
      const cardConfig = cardConfigRegistry.getConfig(c);
      const instances = createNInstances(getNumberOfPileCards(numberOfPlayers, cardConfig), () =>
        cardConfigRegistry.newCard(c)
      );
      return new CardPile(c, instances);
    });

    return new Kingdom(cardPiles);
  }
}

const kingdomConfigRegistry = new KingdomConfigRegistry();

export { kingdomConfigRegistry };
