import { Kingdom, KingdomConfig } from "../../domain/objects/Kingdom";
import { createKingdom } from "../CreateKingdom";
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

  getParams(name: string): KingdomConfig {
    const out = this.kingdoms.get(name);
    if (!out) throw new ConfigError(`Unable to find config for ${name}`);
    return out;
  }

  getParamsOfUndef(name: string): KingdomConfig | undefined {
    return this.kingdoms.get(name);
  }

  newKingdom(numberOfPlayers: number, name: string): Kingdom {
    return createKingdom(numberOfPlayers, this.getParams(name).cards);
  }

  newKingdomOrUndef(numberOfPlayers: number, name: string): Kingdom | undefined {
    const config = this.kingdoms.get(name);
    if (config == undefined) {
      return undefined;
    }
    return createKingdom(numberOfPlayers, config.cards);
  }
}

const kingdomConfigRegistry = new KingdomConfigRegistry();

export { kingdomConfigRegistry };
