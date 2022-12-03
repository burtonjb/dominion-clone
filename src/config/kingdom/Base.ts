import { kingdomConfigRegistry } from "../../di/configservice/KingdomConfigRegistry";
import { DominionExpansion } from "../../model/Card";
import { KingdomParams } from "../../model/Kingdom";
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

kingdomConfigRegistry.registerAll(FirstGame);

export { FirstGame };
