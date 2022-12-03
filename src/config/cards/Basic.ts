import { cardConfigRegistry } from "../../di/configservice/CardConfigRegistry";
import { CardParams, CardType, DominionExpansion } from "../../model/Card";

// This file is the basic cards from the base dominion set

const Copper: CardParams = {
  name: "Copper",
  types: [CardType.TREASURE],
  cost: 0,
  worth: 1,
  kingdomCard: false,
  expansion: DominionExpansion.BASE,
};

const Silver: CardParams = {
  name: "Silver",
  types: [CardType.TREASURE],
  cost: 3,
  worth: 2,
  kingdomCard: false,
  expansion: DominionExpansion.BASE,
};

const Gold: CardParams = {
  name: "Gold",
  types: [CardType.TREASURE],
  cost: 6,
  worth: 3,
  kingdomCard: false,
  expansion: DominionExpansion.BASE,
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

cardConfigRegistry.registerAll(Copper, Silver, Gold, Estate, Duchy, Province, Curse);

export { Copper, Silver, Gold, Estate, Duchy, Province, Curse };
