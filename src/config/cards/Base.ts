import { cardConfigRegistry } from "../../di/configservice/CardConfigRegistry";
import { CardParams, CardType, DominionExpansion } from "../../model/Card";

const Cellar: CardParams = {
  name: "Cellar",
  types: [CardType.ACTION],
  cost: 2,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
  // The rest of the effects are TODO
};

const Chapel: CardParams = {
  name: "Chapel",
  types: [CardType.ACTION],
  cost: 2,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};

const Moat: CardParams = {
  name: "Moat",
  types: [CardType.ACTION, CardType.REACTION],
  cost: 2,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};

const Harbinger: CardParams = {
  name: "Harbinger",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Merchant: CardParams = {
  name: "Merchant",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Vassal: CardParams = {
  name: "Vassal",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Village: CardParams = {
  name: "Village",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Workshop: CardParams = {
  name: "Workshop",
  types: [CardType.ACTION],
  cost: 3,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Bureaucrat: CardParams = {
  name: "Bureaucrat",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Gardens: CardParams = {
  name: "Gardens",
  types: [CardType.VICTORY],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Militia: CardParams = {
  name: "Militia",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Moneylender: CardParams = {
  name: "Moneylender",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Poacher: CardParams = {
  name: "Poacher",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Remodel: CardParams = {
  name: "Remodel",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Smithy: CardParams = {
  name: "Smithy",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const ThroneRoom: CardParams = {
  name: "Throne Room",
  types: [CardType.ACTION],
  cost: 4,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Bandit: CardParams = {
  name: "Bandit",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const CouncilRoom: CardParams = {
  name: "Council Room",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Festival: CardParams = {
  name: "Festival",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Laboratory: CardParams = {
  name: "Laboratory",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Library: CardParams = {
  name: "Library",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Market: CardParams = {
  name: "Market",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Mine: CardParams = {
  name: "Mine",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Sentry: CardParams = {
  name: "Sentry",
  types: [CardType.ACTION],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Witch: CardParams = {
  name: "Witch",
  types: [CardType.ACTION, CardType.ATTACK],
  cost: 5,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};
const Artisan: CardParams = {
  name: "Artisan",
  types: [CardType.ACTION],
  cost: 6,
  expansion: DominionExpansion.BASE,
  kingdomCard: true,
};

cardConfigRegistry.registerAll(
  Cellar,
  Chapel,
  Moat,
  Harbinger,
  Merchant,
  Vassal,
  Village,
  Workshop,
  Bureaucrat,
  Gardens,
  Militia,
  Moneylender,
  Poacher,
  Remodel,
  Smithy,
  ThroneRoom,
  Bandit,
  CouncilRoom,
  Festival,
  Laboratory,
  Library,
  Market,
  Mine,
  Sentry,
  Witch,
  Artisan
);

export {
  Cellar,
  Chapel,
  Moat,
  Harbinger,
  Merchant,
  Vassal,
  Village,
  Workshop,
  Bureaucrat,
  Gardens,
  Militia,
  Moneylender,
  Poacher,
  Remodel,
  Smithy,
  ThroneRoom,
  Bandit,
  CouncilRoom,
  Festival,
  Laboratory,
  Library,
  Market,
  Mine,
  Sentry,
  Witch,
  Artisan,
};
