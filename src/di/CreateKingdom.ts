import { Card, CardConfig, CardType, DominionExpansion } from "../domain/objects/Card";
import { CardPile } from "../domain/objects/CardPile";
import { Kingdom } from "../domain/objects/Kingdom";
import { createNInstances, shuffleArray } from "../util/ArrayExtensions";
import { logger } from "../util/Logger";
import { Random } from "../util/Random";
import { cardConfigRegistry } from "./configservice/CardConfigRegistry";
import { kingdomConfigRegistry } from "./configservice/KingdomConfigRegistry";

export function createKingdom(
  numberOfPlayers: number,
  random: Random,
  inputKingdom?: string,
  useRandomRecommendedKingdom?: boolean,
  maxExpansions?: number,
  disableExpansions?: Array<string>,
  forceExpansions?: Array<string>,
  disableCards?: Array<string>,
  forceCards?: Array<string>,
  useCardOfTheDay?: boolean
): Kingdom {
  // if input kingdom is set, use a pre-defined kingdom
  if (inputKingdom) {
    logger.info(`Loading kingdom named ${inputKingdom}`);
    const kingdomConfig = kingdomConfigRegistry.getConfigOrUndef(inputKingdom);
    if (!kingdomConfig) {
      logger.warn(
        `Unable to find kingdom config. Got ${inputKingdom}. Choices are: ${kingdomConfigRegistry.keys()}. Using default value`
      );
    } else {
      const selectedCards = kingdomConfig.cards;
      const piles = getCardPilesFromCardNames(numberOfPlayers, selectedCards);
      return new Kingdom(kingdomConfig.name, piles);
    }
  }

  if (useRandomRecommendedKingdom) {
    let preconfiguredKingdoms = kingdomConfigRegistry.values();
    if (forceExpansions) {
      preconfiguredKingdoms = preconfiguredKingdoms.filter((config) =>
        config.expansions.some((exp) => forceExpansions.includes(exp))
      );
    }
    if (disableExpansions) {
      preconfiguredKingdoms = preconfiguredKingdoms.filter((config) =>
        config.expansions.some((exp) => !disableExpansions.includes(exp))
      );
    }
    const selectedPreconfiguredKingdom = preconfiguredKingdoms[random.randomInt(0, preconfiguredKingdoms.length)];
    logger.info(`Using a random kingdom: ${selectedPreconfiguredKingdom.name}`);
    const selectedCards = selectedPreconfiguredKingdom.cards;
    const piles = getCardPilesFromCardNames(numberOfPlayers, selectedCards);
    return new Kingdom(selectedPreconfiguredKingdom.name, piles);
  }

  const selectedExpansions = selectExpansions(random, maxExpansions, disableExpansions, forceExpansions);
  let kingdomCards = cardConfigRegistry.values().filter((c) => c.kingdomCard);
  const allKingdomCards = cardConfigRegistry.values().filter((c) => c.kingdomCard);
  logger.info(`Using expansions: ${selectedExpansions} to generate kingdom`);
  kingdomCards = kingdomCards.filter((c) => selectedExpansions?.includes(c.expansion));

  // card of the day is a random card selectable from any expansion (even if that expansion/card is disabled).
  // its a chance to try multiple kingdoms with a single card that rotates every day (e.g. try multiple kingdoms with like bandit)
  let cardOfTheDay: CardConfig | undefined = undefined;
  if (useCardOfTheDay) {
    const date = new Date();
    const seed = date.getFullYear() * 10_000 + (date.getMonth() + 1) * 100 + date.getDate() * 1; // number is formatted like YYYYMMDD
    const cardOfTheDaySelection = new Random(seed).randomInt(0, allKingdomCards.length);
    cardOfTheDay = allKingdomCards[cardOfTheDaySelection];
    logger.info(`Using ${cardOfTheDay.name} (seed: ${seed}) as the card of the day`);
  }
  const forcedCards: Array<CardConfig> = [];
  if (forceCards) {
    const tryToFind = forceCards.map((c) => [c, cardConfigRegistry.getConfigOrUndef(c)]);
    const failedToFind = tryToFind.filter((a) => a[1] == undefined).map((a) => tryToFind[0]);
    if (failedToFind.length > 0) {
      logger.warn(`Failed to find forcedCards: ${failedToFind}`);
    }
    const found = tryToFind.filter((a) => a[1] != undefined).map((a) => a[1]) as Array<CardConfig>;
    forcedCards.push(...found);
  }

  if (disableCards) {
    kingdomCards = kingdomCards.filter((c) => !disableCards.includes(c.name));
    logger.info(`Disabling cards ${disableCards}`);
  }
  let randomKingdomCards = 10;
  if (cardOfTheDay) {
    randomKingdomCards--;
  }
  randomKingdomCards -= forcedCards.length;

  shuffleArray(kingdomCards, random);
  const selectedCardConfig = kingdomCards.slice(0, randomKingdomCards);

  selectedCardConfig.sort((a, b) => {
    if (a.cost == b.cost) {
      return a.name < b.name ? -1 : 1;
    } else {
      return a.cost < b.cost ? -1 : 1;
    }
  });
  if (cardOfTheDay) {
    selectedCardConfig.push(cardOfTheDay); // will always be placed at the bottom of the kingdom, for easier tracking
  }
  selectedCardConfig.push(...forcedCards);

  const selectedCards = selectedCardConfig.map((c) => c.name);
  const cardPiles = getCardPilesFromCardNames(numberOfPlayers, selectedCards);

  return new Kingdom("random", cardPiles);
}

function selectExpansions(
  random: Random,
  maxExpansions?: number,
  disableExpansions?: Array<string>,
  forceExpansions?: Array<string>
): Array<DominionExpansion> {
  // if there's expansion filters set, configure the selected expansions
  let expansionChoices = Object.values(DominionExpansion);
  if (disableExpansions) {
    expansionChoices = expansionChoices.filter((c) => !disableExpansions.includes(c));
    logger.info(`Disabling expansions: ${disableExpansions}. Expansions available are: ${expansionChoices}`);
  }
  if (forceExpansions) {
    expansionChoices = expansionChoices.filter((c) => forceExpansions.includes(c));
    logger.info(`Forcing expansions: ${disableExpansions}. Expansions available are: ${expansionChoices}`);
  }
  if (maxExpansions) {
    shuffleArray(expansionChoices, random);
    expansionChoices = expansionChoices.slice(0, maxExpansions);
  }
  return expansionChoices;
}

function getCardPilesFromCardNames(numberOfPlayers: number, cardNames: Array<string>): Array<CardPile> {
  const cardPiles = cardNames.map((c) => {
    const config = cardConfigRegistry.getConfig(c);
    const instances = createNInstances(getNumberOfPileCards(numberOfPlayers, config), () =>
      cardConfigRegistry.newCard(c)
    );
    return new CardPile(c, instances);
  });
  return cardPiles;
}

export function getNumberOfPileCards(numberOfPlayers: number, card: CardConfig): number {
  // victory cards have 8 cards in the supply (or 12 if >= 3 players), otherwise piles have 10 cards by default
  if (card.types.includes(CardType.VICTORY)) {
    return numberOfPlayers <= 2 ? 8 : 12;
  }
  return 10;
}
