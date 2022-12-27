import { cardConfigRegistry } from "../../di/configservice/CardConfigRegistry";
import { CardParams, CardType, DominionExpansion } from "../../domain/objects/Card";
import { GainMoney } from "../effects/BaseEffects";

// This file is the basic cards from the base dominion set
// - copper, silver, gold, estate, duchy, province, curse

const Copper: CardParams = {
  name: "Copper",
  types: [CardType.TREASURE],
  cost: 0,
  worth: 1,
  kingdomCard: false,
  expansion: DominionExpansion.BASE,
  playEffects: [new GainMoney({ amount: 1 })],
};

const Silver: CardParams = {
  name: "Silver",
  types: [CardType.TREASURE],
  cost: 3,
  worth: 2,
  kingdomCard: false,
  expansion: DominionExpansion.BASE,
  playEffects: [new GainMoney({ amount: 2 })],
};

const Gold: CardParams = {
  name: "Gold",
  types: [CardType.TREASURE],
  cost: 6,
  worth: 3,
  kingdomCard: false,
  expansion: DominionExpansion.BASE,
  playEffects: [new GainMoney({ amount: 3 })],
};

const Estate: CardParams = {
  name: "Estate",
  types: [CardType.VICTORY],
  cost: 2,
  victoryPoints: 1,
  kingdomCard: false,
  expansion: DominionExpansion.BASE,
};

const Duchy: CardParams = {
  name: "Duchy",
  types: [CardType.VICTORY],
  cost: 5,
  victoryPoints: 3,
  kingdomCard: false,
  expansion: DominionExpansion.BASE,
};

const Province: CardParams = {
  name: "Province",
  types: [CardType.VICTORY],
  cost: 8,
  victoryPoints: 6,
  kingdomCard: false,
  expansion: DominionExpansion.BASE,
};

const Curse: CardParams = {
  name: "Curse",
  types: [CardType.CURSE],
  cost: 0,
  victoryPoints: -1,
  kingdomCard: false,
  expansion: DominionExpansion.BASE,
};

const Platinum: CardParams = {
  name: "Platinum",
  types: [CardType.TREASURE],
  cost: 9,
  worth: 5,
  kingdomCard: false,
  expansion: DominionExpansion.PROSPERITY,
  playEffects: [new GainMoney({ amount: 5 })],
};

const Colony: CardParams = {
  name: "Colony",
  types: [CardType.VICTORY],
  cost: 11,
  kingdomCard: false,
  victoryPoints: 10,
  expansion: DominionExpansion.PROSPERITY,
};

export function register() {
  cardConfigRegistry.registerAll(Copper, Silver, Gold, Estate, Duchy, Province, Curse, Platinum, Colony);
}
register();

export { Copper, Silver, Gold, Estate, Duchy, Province, Curse, Platinum, Colony };
