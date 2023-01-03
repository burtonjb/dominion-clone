import { kingdomConfigRegistry } from "../../di/configservice/KingdomConfigRegistry";
import { DominionExpansion } from "../../domain/objects/Card";
import { Kingdom, KingdomConfig } from "../../domain/objects/Kingdom";
import * as BaseCards from "../cards/Base";
import * as IntrigueCards from "../cards/Intrigue";
import * as SeasideCards from "../cards/Seaside";
import * as ProsperityCards from "../cards/Prosperity";
import * as HinterlandsCards from "../cards/Hinterlands";

const Introduction: KingdomConfig = {
  name: "Introduction",
  expansions: [DominionExpansion.HINTERLANDS],
  cards: [
    HinterlandsCards.Cartographer.name,
    HinterlandsCards.Crossroads.name,
    HinterlandsCards.Develop.name,
    HinterlandsCards.JackOfAllTrades.name,
    HinterlandsCards.Margrave.name,
    HinterlandsCards.Nomads.name,
    HinterlandsCards.Oasis.name,
    HinterlandsCards.SpiceMerchant.name,
    HinterlandsCards.Stables.name,
    HinterlandsCards.Weaver.name,
  ],
};

const Bargains: KingdomConfig = {
  name: "Bargains",
  expansions: [DominionExpansion.HINTERLANDS],
  cards: [
    HinterlandsCards.BorderVillage.name,
    HinterlandsCards.Cauldron.name,
    HinterlandsCards.FoolsGold.name,
    HinterlandsCards.Haggler.name,
    HinterlandsCards.Highway.name,
    HinterlandsCards.Scheme.name,
    HinterlandsCards.Souk.name,
    HinterlandsCards.Trader.name,
    HinterlandsCards.Trail.name,
    HinterlandsCards.Wheelwright.name,
  ],
};

const HighwayRobbery: KingdomConfig = {
  name: "Highway Robbery",
  expansions: [DominionExpansion.HINTERLANDS, DominionExpansion.BASE],
  cards: [
    BaseCards.Cellar.name,
    BaseCards.Library.name,
    BaseCards.Moneylender.name,
    BaseCards.ThroneRoom.name,
    BaseCards.Workshop.name,
    HinterlandsCards.Berserker.name,
    HinterlandsCards.Highway.name,
    HinterlandsCards.Nomads.name,
    HinterlandsCards.Oasis.name,
    HinterlandsCards.Trail.name,
  ],
};

const AdventuresAbroad: KingdomConfig = {
  name: "Adventures Abroad",
  expansions: [DominionExpansion.HINTERLANDS, DominionExpansion.BASE],
  cards: [
    BaseCards.Festival.name,
    BaseCards.Laboratory.name,
    BaseCards.Remodel.name,
    BaseCards.Sentry.name,
    BaseCards.Vassal.name,
    HinterlandsCards.Crossroads.name,
    HinterlandsCards.FoolsGold.name,
    HinterlandsCards.GuardDog.name,
    HinterlandsCards.Souk.name,
    HinterlandsCards.WitchsHut.name,
  ],
};

const MoneyForNothing: KingdomConfig = {
  name: "Money For Nothing",
  expansions: [DominionExpansion.HINTERLANDS, DominionExpansion.INTRIGUE],
  cards: [
    IntrigueCards.Replace.name,
    IntrigueCards.Patrol.name,
    IntrigueCards.Pawn.name,
    IntrigueCards.ShantyTown.name,
    IntrigueCards.Torturer.name,
    HinterlandsCards.Cartographer.name,
    HinterlandsCards.JackOfAllTrades.name,
    HinterlandsCards.Tunnel.name,
    HinterlandsCards.Weaver.name,
    HinterlandsCards.Wheelwright.name,
  ],
};

const TheDukesBall: KingdomConfig = {
  name: "The Duke's Ball",
  expansions: [DominionExpansion.HINTERLANDS, DominionExpansion.INTRIGUE],
  cards: [
    IntrigueCards.Conspirator.name,
    IntrigueCards.Duke.name,
    IntrigueCards.Harem.name,
    IntrigueCards.Masquerade.name,
    IntrigueCards.Upgrade.name,
    HinterlandsCards.GuardDog.name,
    HinterlandsCards.Haggler.name,
    HinterlandsCards.Inn.name,
    HinterlandsCards.Scheme.name,
    HinterlandsCards.Trail.name,
  ],
};

const Travelers: KingdomConfig = {
  name: "Travelers",
  expansions: [DominionExpansion.HINTERLANDS, DominionExpansion.SEASIDE],
  cards: [
    SeasideCards.Cutpurse.name,
    SeasideCards.Island.name,
    SeasideCards.Lookout.name,
    SeasideCards.MerchantShip.name,
    SeasideCards.Warehouse.name,
    HinterlandsCards.Cartographer.name,
    HinterlandsCards.Crossroads.name,
    HinterlandsCards.Farmland.name,
    HinterlandsCards.Souk.name,
    HinterlandsCards.Stables.name,
  ],
};

const Runners: KingdomConfig = {
  name: "Runners",
  expansions: [DominionExpansion.HINTERLANDS, DominionExpansion.SEASIDE],
  cards: [
    SeasideCards.Bazaar.name,
    SeasideCards.Blockade.name,
    SeasideCards.Caravan.name,
    SeasideCards.Smugglers.name,
    SeasideCards.Sailor.name,
    HinterlandsCards.Berserker.name,
    HinterlandsCards.Cauldron.name,
    HinterlandsCards.GuardDog.name,
    HinterlandsCards.Nomads.name,
    HinterlandsCards.Wheelwright.name,
  ],
};

const InstantGratification: KingdomConfig = {
  name: "Instant Gratification",
  expansions: [DominionExpansion.HINTERLANDS, DominionExpansion.PROSPERITY],
  cards: [
    ProsperityCards.Bishop.name,
    ProsperityCards.Expand.name,
    ProsperityCards.Hoard.name,
    ProsperityCards.Mint.name,
    ProsperityCards.Watchtower.name,
    HinterlandsCards.Berserker.name,
    HinterlandsCards.Cauldron.name,
    HinterlandsCards.Haggler.name,
    HinterlandsCards.Oasis.name,
    HinterlandsCards.Trail.name,
  ],
  usePlatinumAndColony: true,
};

const TreasureTrove: KingdomConfig = {
  name: "Treasure Trove",
  expansions: [DominionExpansion.HINTERLANDS, DominionExpansion.PROSPERITY],
  cards: [
    ProsperityCards.Bank.name,
    ProsperityCards.Clerk.name,
    ProsperityCards.CrystalBall.name,
    ProsperityCards.Monument.name,
    ProsperityCards.Tiara.name,
    HinterlandsCards.Cauldron.name,
    HinterlandsCards.Develop.name,
    HinterlandsCards.FoolsGold.name,
    HinterlandsCards.GuardDog.name,
    HinterlandsCards.Inn.name,
  ],
  usePlatinumAndColony: true,
};

export function register() {
  kingdomConfigRegistry.registerAll(
    Introduction,
    Bargains,
    HighwayRobbery,
    AdventuresAbroad,
    MoneyForNothing,
    TheDukesBall,
    Travelers,
    Runners,
    InstantGratification,
    TreasureTrove
  );
}
register();

export {
  Introduction,
  Bargains,
  HighwayRobbery,
  AdventuresAbroad,
  MoneyForNothing,
  TheDukesBall,
  Travelers,
  Runners,
  InstantGratification,
  TreasureTrove,
};
