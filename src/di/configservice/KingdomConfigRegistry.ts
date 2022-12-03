import { Kingdom, KingdomParams } from "../../model/Kingdom";
import { createKingdom } from "../CreateKingdom";

export class KingdomConfigRegistry {
  private kingdoms: Map<string, KingdomParams>;

  constructor() {
    this.kingdoms = new Map();
  }

  values(): Array<KingdomParams> {
    return Array.from(this.kingdoms.entries()).map((pair) => pair[1]);
  }

  register(params: KingdomParams) {
    this.kingdoms.set(params.name, params);
  }

  registerAll(...params: Array<KingdomParams>) {
    params.forEach((p) => this.register(p));
  }

  getParams(name: string): KingdomParams | undefined {
    return this.kingdoms.get(name);
  }

  newKingdom(name: string): Kingdom | undefined {
    const config = this.kingdoms.get(name);
    if (config == undefined) {
      return undefined;
    }
    return createKingdom(config.cards);
  }
}

const kingdomConfigRegistry = new KingdomConfigRegistry();

export { kingdomConfigRegistry };
