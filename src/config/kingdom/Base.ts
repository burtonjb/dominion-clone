import { kingdomConfigRegistry } from "../../di/configservice/KingdomConfigRegistry";
import { DominionExpansion } from "../../domain/objects/Card";
import { KingdomParams } from "../../domain/objects/Kingdom";
import * as BaseCards from "../cards/Base";

const FirstGame: KingdomParams = {
  name: "First Game",
  expansions: [DominionExpansion.BASE],
  cards: [
    BaseCards.Cellar.name,
    BaseCards.Market.name,
    BaseCards.Merchant.name,
    BaseCards.Militia.name,
    BaseCards.Mine.name,
    BaseCards.Moat.name,
    BaseCards.Remodel.name,
    BaseCards.Smithy.name,
    BaseCards.Village.name,
    BaseCards.Workshop.name,
  ],
};

const SizeDistortion: KingdomParams = {
  name: "Size Distortion",
  expansions: [DominionExpansion.BASE],
  cards: [
    BaseCards.Artisan.name,
    BaseCards.Bandit.name,
    BaseCards.Bureaucrat.name,
    BaseCards.Chapel.name,
    BaseCards.Festival.name,
    BaseCards.Gardens.name,
    BaseCards.Sentry.name,
    BaseCards.ThroneRoom.name,
    BaseCards.Witch.name,
    BaseCards.Workshop.name,
  ],
};

const DeckTop: KingdomParams = {
  name: "Deck Top",
  expansions: [DominionExpansion.BASE],
  cards: [
    BaseCards.Artisan.name,
    BaseCards.Bureaucrat.name,
    BaseCards.CouncilRoom.name,
    BaseCards.Festival.name,
    BaseCards.Harbinger.name,
    BaseCards.Laboratory.name,
    BaseCards.Moneylender.name,
    BaseCards.Sentry.name,
    BaseCards.Vassal.name,
    BaseCards.Village.name,
  ],
};
const SleightOfHand: KingdomParams = {
  name: "Sleight of Hand",
  expansions: [DominionExpansion.BASE],
  cards: [
    BaseCards.Cellar.name,
    BaseCards.CouncilRoom.name,
    BaseCards.Festival.name,
    BaseCards.Gardens.name,
    BaseCards.Library.name,
    BaseCards.Harbinger.name,
    BaseCards.Militia.name,
    BaseCards.Poacher.name,
    BaseCards.Smithy.name,
    BaseCards.ThroneRoom.name,
  ],
};
const Improvements: KingdomParams = {
  name: "Improvements",
  expansions: [DominionExpansion.BASE],
  cards: [
    BaseCards.Artisan.name,
    BaseCards.Cellar.name,
    BaseCards.Market.name,
    BaseCards.Merchant.name,
    BaseCards.Mine.name,
    BaseCards.Moat.name,
    BaseCards.Moneylender.name,
    BaseCards.Poacher.name,
    BaseCards.Remodel.name,
    BaseCards.Witch.name,
  ],
};

const SilverAndGold: KingdomParams = {
  name: "Silver & Gold",
  expansions: [DominionExpansion.BASE],
  cards: [
    BaseCards.Bandit.name,
    BaseCards.Bureaucrat.name,
    BaseCards.Chapel.name,
    BaseCards.Harbinger.name,
    BaseCards.Laboratory.name,
    BaseCards.Merchant.name,
    BaseCards.Mine.name,
    BaseCards.Moneylender.name,
    BaseCards.ThroneRoom.name,
    BaseCards.Vassal.name,
  ],
};

export function register() {
  kingdomConfigRegistry.registerAll(FirstGame, SizeDistortion, DeckTop, SleightOfHand, Improvements, SilverAndGold);
}
register();

export { FirstGame, SizeDistortion, DeckTop, SleightOfHand, Improvements, SilverAndGold };
