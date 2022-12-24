import { kingdomConfigRegistry } from "../../di/configservice/KingdomConfigRegistry";
import { DominionExpansion } from "../../domain/objects/Card";
import { KingdomParams } from "../../domain/objects/Kingdom";
import * as Base from "../cards/Base";
import * as Intrigue from "../cards/Intrigue";

const VictoryDance: KingdomParams = {
  name: "Victory Dance",
  expansions: [DominionExpansion.INTRIGUE],
  cards: [
    Intrigue.Baron.name,
    Intrigue.Courtier.name,
    Intrigue.Duke.name,
    Intrigue.Harem.name,
    Intrigue.Ironworks.name,
    Intrigue.Masquerade.name,
    Intrigue.Mill.name,
    Intrigue.Nobles.name,
    Intrigue.Patrol.name,
    Intrigue.Replace.name,
  ],
};

const ThePlotThickens: KingdomParams = {
  name: "The Plot Thickens",
  expansions: [DominionExpansion.INTRIGUE],
  cards: [
    Intrigue.Conspirator.name,
    Intrigue.Ironworks.name,
    Intrigue.Lurker.name,
    Intrigue.Pawn.name,
    Intrigue.MiningVillage.name,
    Intrigue.SecretPassage.name,
    Intrigue.Steward.name,
    Intrigue.Swindler.name,
    Intrigue.Torturer.name,
    Intrigue.TradingPost.name,
  ],
};

const BestWishes: KingdomParams = {
  name: "Best Wishes",
  expansions: [DominionExpansion.INTRIGUE],
  cards: [
    Intrigue.Baron.name,
    Intrigue.Conspirator.name,
    Intrigue.Courtyard.name,
    Intrigue.Diplomat.name,
    Intrigue.Duke.name,
    Intrigue.SecretPassage.name,
    Intrigue.ShantyTown.name,
    Intrigue.Torturer.name,
    Intrigue.Upgrade.name,
    Intrigue.WishingWell.name,
  ],
};

const Underlings: KingdomParams = {
  name: "Underlings",
  expansions: [DominionExpansion.BASE, DominionExpansion.INTRIGUE],
  cards: [
    Base.Cellar.name,
    Base.Festival.name,
    Base.Library.name,
    Base.Sentry.name,
    Base.Vassal.name,
    Intrigue.Courtier.name,
    Intrigue.Diplomat.name,
    Intrigue.Minion.name,
    Intrigue.Nobles.name,
    Intrigue.Pawn.name,
  ],
};

const GrandScheme: KingdomParams = {
  name: "Grand Scheme",
  expansions: [DominionExpansion.BASE, DominionExpansion.INTRIGUE],
  cards: [
    Base.Artisan.name,
    Base.CouncilRoom.name,
    Base.Market.name,
    Base.Militia.name,
    Base.Workshop.name,
    Intrigue.Bridge.name,
    Intrigue.Mill.name,
    Intrigue.MiningVillage.name,
    Intrigue.Patrol.name,
    Intrigue.ShantyTown.name,
  ],
};

const Deconstruction: KingdomParams = {
  name: "Deconstruction",
  expansions: [DominionExpansion.BASE, DominionExpansion.INTRIGUE],
  cards: [
    Base.Bandit.name,
    Base.Mine.name,
    Base.Remodel.name,
    Base.ThroneRoom.name,
    Base.Village.name,
    Intrigue.Diplomat.name,
    Intrigue.Harem.name,
    Intrigue.Lurker.name,
    Intrigue.Replace.name,
    Intrigue.Swindler.name,
  ],
};

kingdomConfigRegistry.registerAll(VictoryDance, ThePlotThickens, BestWishes, Underlings, GrandScheme, Deconstruction);

export { VictoryDance, ThePlotThickens, BestWishes, Underlings, GrandScheme, Deconstruction };
