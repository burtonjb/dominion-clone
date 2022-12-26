import { kingdomConfigRegistry } from "../../di/configservice/KingdomConfigRegistry";
import { DominionExpansion } from "../../domain/objects/Card";
import { KingdomParams } from "../../domain/objects/Kingdom";
import * as BaseCards from "../cards/Base";
import * as IntrigueCards from "../cards/Intrigue";
import * as SeasideCards from "../cards/Seaside";

const HighSeas: KingdomParams = {
  name: "High Seas",
  expansions: [DominionExpansion.SEASIDE],
  cards: [
    SeasideCards.Bazaar.name,
    SeasideCards.Blockade.name,
    SeasideCards.Caravan.name,
    SeasideCards.Corsair.name,
    SeasideCards.Haven.name,
    SeasideCards.Island.name,
    SeasideCards.Lookout.name,
    SeasideCards.Pirate.name,
    SeasideCards.Warehouse.name,
    SeasideCards.Wharf.name,
  ],
};

const BuriedTreasure: KingdomParams = {
  name: "Buried Treasure",
  expansions: [DominionExpansion.SEASIDE],
  cards: [
    SeasideCards.Astrolabe.name,
    SeasideCards.Cutpurse.name,
    SeasideCards.FishingVillage.name,
    SeasideCards.Lighthouse.name,
    SeasideCards.Monkey.name,
    SeasideCards.Outpost.name,
    SeasideCards.Sailor.name,
    SeasideCards.SeaChart.name,
    SeasideCards.Tactician.name,
    SeasideCards.TreasureMap.name,
  ],
};

const ReachForTomorrow: KingdomParams = {
  name: "Reach for Tomorrow",
  expansions: [DominionExpansion.BASE, DominionExpansion.SEASIDE],
  cards: [
    BaseCards.Artisan.name,
    BaseCards.Cellar.name,
    BaseCards.CouncilRoom.name,
    BaseCards.Vassal.name,
    BaseCards.Village.name,
    SeasideCards.Cutpurse.name,
    SeasideCards.Lookout.name,
    SeasideCards.Monkey.name,
    SeasideCards.SeaWitch.name,
    SeasideCards.TreasureMap.name,
  ],
};

const Repetition: KingdomParams = {
  name: "Repetition",
  expansions: [DominionExpansion.BASE, DominionExpansion.SEASIDE],
  cards: [
    BaseCards.Festival.name,
    BaseCards.Harbinger.name,
    BaseCards.Militia.name,
    BaseCards.Remodel.name,
    BaseCards.Workshop.name,
    SeasideCards.Caravan.name,
    SeasideCards.Outpost.name,
    SeasideCards.Pirate.name,
    SeasideCards.SeaChart.name,
    SeasideCards.Treasury.name,
  ],
};

const AStarToSteerBy: KingdomParams = {
  name: "A Star to Steer by",
  expansions: [DominionExpansion.INTRIGUE, DominionExpansion.SEASIDE],
  cards: [
    IntrigueCards.Courtier.name,
    IntrigueCards.Diplomat.name,
    IntrigueCards.SecretPassage.name,
    IntrigueCards.Swindler.name,
    IntrigueCards.WishingWell.name,
    SeasideCards.Bazaar.name,
    SeasideCards.Lookout.name,
    SeasideCards.Monkey.name,
    SeasideCards.TidePools.name,
    SeasideCards.TreasureMap.name,
  ],
};

const ShorePatrol: KingdomParams = {
  name: "Shore Patrol",
  expansions: [DominionExpansion.INTRIGUE, DominionExpansion.SEASIDE],
  cards: [
    IntrigueCards.Patrol.name,
    IntrigueCards.Pawn.name,
    IntrigueCards.Replace.name,
    IntrigueCards.ShantyTown.name,
    IntrigueCards.TradingPost.name,
    SeasideCards.Cutpurse.name,
    SeasideCards.Island.name,
    SeasideCards.Lighthouse.name,
    SeasideCards.SeaChart.name,
    SeasideCards.Wharf.name,
  ],
};

export function register() {
  kingdomConfigRegistry.registerAll(
    HighSeas,
    BuriedTreasure,
    ReachForTomorrow,
    Repetition,
    AStarToSteerBy,
    ShorePatrol
  );
}
register();

export { HighSeas, BuriedTreasure, ReachForTomorrow, Repetition, AStarToSteerBy, ShorePatrol };
