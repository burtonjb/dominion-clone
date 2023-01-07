import { CardConfig, CardType } from "../domain/objects/Card";
import { CardPile } from "../domain/objects/CardPile";
import { Kingdom } from "../domain/objects/Kingdom";
import { createNInstances, shuffleArray } from "../util/ArrayExtensions";
import { logger } from "../util/Logger";
import { Random } from "../util/Random";
import { cardConfigRegistry } from "./configservice/CardConfigRegistry";
import { kingdomConfigRegistry } from "./configservice/KingdomConfigRegistry";

export function createKingdom(numberOfPlayers: number, random: Random): Kingdom {
  const kingdomCards = cardConfigRegistry.values().filter((c) => c.kingdomCard);
  shuffleArray(kingdomCards, random);
  const selectedCardConfig = kingdomCards.slice(0, 10);

  selectedCardConfig.sort((a, b) => {
    if (a.cost == b.cost) {
      return a.name < b.name ? -1 : 1;
    } else {
      return a.cost < b.cost ? -1 : 1;
    }
  });

  let selectedCards = selectedCardConfig.map((c) => c.name);

  //FIXME: eventually clean this up when I want to make the actual UI
  const kingdomNameIndex = process.argv.indexOf("KINGDOM_NAME");
  const kingdomName = process.argv[kingdomNameIndex + 1];
  if (kingdomName) {
    logger.info(`Loading kingdom named ${kingdomName}`);
    const kingdomConfig = kingdomConfigRegistry.getConfigOrUndef(kingdomName);
    if (!kingdomConfig) {
      logger.warn(`Unable to find kingdom config`);
    } else {
      selectedCards = kingdomConfig.cards;
    }
  }

  const cardPiles = selectedCards.map((c) => {
    const config = cardConfigRegistry.getConfig(c);
    const instances = createNInstances(getNumberOfPileCards(numberOfPlayers, config), () =>
      cardConfigRegistry.newCard(c)
    );
    return new CardPile(c, instances);
  });

  return new Kingdom(cardPiles);
}

export function getNumberOfPileCards(numberOfPlayers: number, card: CardConfig): number {
  // victory cards have 8 cards in the supply (or 12 if >= 3 players), otherwise piles have 10 cards by default
  if (card.types.includes(CardType.VICTORY)) {
    return numberOfPlayers <= 2 ? 8 : 12;
  }
  return 10;
}
