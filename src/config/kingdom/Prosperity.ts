import { kingdomConfigRegistry } from "../../di/configservice/KingdomConfigRegistry";
import { DominionExpansion } from "../../domain/objects/Card";
import { KingdomParams } from "../../domain/objects/Kingdom";
import * as BaseCards from "../cards/Base";
import * as IntrigueCards from "../cards/Intrigue";
import * as SeasideCards from "../cards/Seaside";
import * as ProsperityCards from "../cards/Prosperity";

const Beginners: KingdomParams = {
  name: "Beginners",
  expansions: [DominionExpansion.PROSPERITY],
  cards: [
    ProsperityCards.Bank.name,
    ProsperityCards.Clerk.name,
    ProsperityCards.CrystalBall.name,
    ProsperityCards.Expand.name,
    ProsperityCards.Magnate.name,
    ProsperityCards.Monument.name,
    ProsperityCards.Rabble.name,
    ProsperityCards.Tiara.name,
    ProsperityCards.Watchtower.name,
    ProsperityCards.WorkersVillage.name,
  ],
  usePlatinumAndColony: true,
};

const FriendlyInteractive: KingdomParams = {
  name: "Friendly Interactive",
  expansions: [DominionExpansion.PROSPERITY],
  cards: [
    ProsperityCards.Bishop.name,
    ProsperityCards.City.name,
    ProsperityCards.Collection.name,
    ProsperityCards.Forge.name,
    ProsperityCards.Hoard.name,
    ProsperityCards.Peddler.name,
    ProsperityCards.Tiara.name,
    ProsperityCards.Vault.name,
    ProsperityCards.WarChest.name,
    ProsperityCards.WorkersVillage.name,
  ],
  usePlatinumAndColony: true,
};

const BiggestMoney: KingdomParams = {
  name: "Biggest Money",
  expansions: [DominionExpansion.PROSPERITY, DominionExpansion.BASE],
  cards: [
    BaseCards.Artisan.name,
    BaseCards.Harbinger.name,
    BaseCards.Laboratory.name,
    BaseCards.Mine.name,
    BaseCards.Moneylender.name,
    ProsperityCards.Bank.name,
    ProsperityCards.CrystalBall.name,
    ProsperityCards.GrandMarket.name,
    ProsperityCards.Mint.name,
    ProsperityCards.Tiara.name,
  ],
  usePlatinumAndColony: true,
};

const TheKingsArmy: KingdomParams = {
  name: "The King's Army",
  expansions: [DominionExpansion.PROSPERITY, DominionExpansion.BASE],
  cards: [
    BaseCards.Bureaucrat.name,
    BaseCards.CouncilRoom.name,
    BaseCards.Merchant.name,
    BaseCards.Moat.name,
    BaseCards.Village.name,
    ProsperityCards.Collection.name,
    ProsperityCards.Expand.name,
    ProsperityCards.KingsCourt.name,
    ProsperityCards.Rabble.name,
    ProsperityCards.Vault.name,
  ],
  usePlatinumAndColony: true,
};

const PathsToVictory: KingdomParams = {
  name: "PathsToVictory",
  expansions: [DominionExpansion.PROSPERITY, DominionExpansion.INTRIGUE],
  cards: [
    ProsperityCards.Bishop.name,
    ProsperityCards.Collection.name,
    ProsperityCards.Magnate.name,
    ProsperityCards.Monument.name,
    ProsperityCards.Peddler.name,

    IntrigueCards.Baron.name,
    IntrigueCards.Harem.name,
    IntrigueCards.Pawn.name,
    IntrigueCards.ShantyTown.name,
    IntrigueCards.Upgrade.name,
  ],
  usePlatinumAndColony: true,
};

const LuckySeven: KingdomParams = {
  name: "Lucky Seven",
  expansions: [DominionExpansion.PROSPERITY, DominionExpansion.INTRIGUE],
  cards: [
    ProsperityCards.Bank.name,
    ProsperityCards.Expand.name,
    ProsperityCards.Forge.name,
    ProsperityCards.KingsCourt.name,
    ProsperityCards.Vault.name,
    IntrigueCards.Bridge.name,
    IntrigueCards.Lurker.name,
    IntrigueCards.Patrol.name,
    IntrigueCards.Swindler.name,
    IntrigueCards.WishingWell.name,
  ],
  usePlatinumAndColony: true,
};

const ExplodingKingdom: KingdomParams = {
  name: "Exploding Kingdom",
  expansions: [DominionExpansion.PROSPERITY, DominionExpansion.SEASIDE],
  cards: [
    ProsperityCards.Bishop.name,
    ProsperityCards.City.name,
    ProsperityCards.GrandMarket.name,
    ProsperityCards.KingsCourt.name,
    ProsperityCards.Quarry.name,
    SeasideCards.FishingVillage.name,
    SeasideCards.Lookout.name,
    SeasideCards.Outpost.name,
    SeasideCards.Tactician.name,
    SeasideCards.Wharf.name,
  ],
  usePlatinumAndColony: true,
};

const PirateBay: KingdomParams = {
  name: "Pirate Bay",
  expansions: [DominionExpansion.PROSPERITY, DominionExpansion.SEASIDE],
  cards: [
    ProsperityCards.Charlatan.name,
    ProsperityCards.Hoard.name,
    ProsperityCards.Investment.name,
    ProsperityCards.Magnate.name,
    ProsperityCards.Mint.name,

    SeasideCards.Astrolabe.name,
    SeasideCards.Corsair.name,
    SeasideCards.Monkey.name,
    SeasideCards.NativeVillage.name,
    SeasideCards.Treasury.name,
  ],
  usePlatinumAndColony: true,
};

export function register() {
  kingdomConfigRegistry.registerAll(
    Beginners,
    FriendlyInteractive,
    BiggestMoney,
    TheKingsArmy,
    PathsToVictory,
    LuckySeven,
    ExplodingKingdom,
    PirateBay
  );
}
register();

export {
  Beginners,
  FriendlyInteractive,
  BiggestMoney,
  TheKingsArmy,
  PathsToVictory,
  LuckySeven,
  ExplodingKingdom,
  PirateBay,
};
