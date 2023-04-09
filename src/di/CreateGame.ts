import * as BasicCards from "../config/cards/Basic";
import { DominionExpansion } from "../domain/objects/Card";
import { CardPile } from "../domain/objects/CardPile";
import { Game } from "../domain/objects/Game";
import { Kingdom } from "../domain/objects/Kingdom";
import { Player } from "../domain/objects/Player";
import { Supply } from "../domain/objects/Supply";
import { createNInstances, shuffleArray } from "../util/ArrayExtensions";
import { Random } from "../util/Random";
import { cardConfigRegistry } from "./configservice/CardConfigRegistry";
import { kingdomConfigRegistry } from "./configservice/KingdomConfigRegistry";
import { createKingdom } from "./CreateKingdom";
import registerAll from "./RegisterConfig";
import { logger } from "../util/Logger";

export function createGame(
  numberOfPlayers: number,
  inputKingdom?: string,
  maxExpansions?: number,
  disableExpansions?: Array<string>,
  forceExpansions?: Array<string>,
  disableCards?: Array<string>,
  forceCards?: Array<string>,
  usePlatAndColony?: boolean,
  useCardOfTheDay?: boolean,
  seed?: number
): Game {
  // construct utility classes and "services"
  const random = new Random(seed);
  registerAll();

  // create players and their starting cards
  const players = createPlayers(random, numberOfPlayers);

  // create the kingdom based on the number of players
  const kingdom = createKingdom(
    numberOfPlayers,
    random,
    inputKingdom,
    maxExpansions,
    disableExpansions,
    forceExpansions,
    disableCards,
    forceCards,
    useCardOfTheDay
  );

  const determinedPlatAndColony = usePlatinumAndColony(random, kingdom, inputKingdom, usePlatAndColony);
  const supply = createSupply(numberOfPlayers, kingdom, determinedPlatAndColony);

  const game = new Game(random, players, supply);

  return game;
}

function createPlayers(random: Random, numberOfPlayers: number): Array<Player> {
  const players = [];
  for (let i = 0; i < numberOfPlayers; i++) {
    // players start with 7 coppers and 3 estates
    const coppers = createNInstances(7, () => cardConfigRegistry.newCard(BasicCards.Copper.name));
    const estates = createNInstances(3, () => cardConfigRegistry.newCard(BasicCards.Estate.name));
    const initialCards = [...coppers, ...estates];
    players.push(new Player(createName(i), random, initialCards));
  }
  return players;
}

function usePlatinumAndColony(
  random: Random,
  kingdom: Kingdom,
  inputKingdom?: string,
  usePlatAndColony?: boolean
): boolean {
  if (usePlatAndColony != undefined) {
    // I guess this means in theory kingdom configuration can be overridden with this flag
    return usePlatAndColony;
  }

  if (inputKingdom && kingdomConfigRegistry.getConfigOrUndef(inputKingdom)) {
    return kingdomConfigRegistry.getConfigOrUndef(inputKingdom)?.usePlatinumAndColony ?? false;
  }

  // the rules in dominion is that there's a X/10 chance to use plat/colony, where X = # of prosperity cards in the kingdom
  const prosperityCards = kingdom.kingdomPiles.filter(
    (p) => p.cards[0].expansion == DominionExpansion.PROSPERITY
  ).length;
  const roll = random.randomInt(0, 10);
  logger.info(
    `Rolling ${roll} compared to ${prosperityCards} cards from prosperity to determine to use colonies and platinums or not.`
  );
  return roll < prosperityCards;
}

function createName(index: number): string {
  return `player_${index}`;
}

function createSupply(numberOfPlayers: number, kingdom: Kingdom, usePlatAndColony: boolean): Supply {
  const baseTreasures = [
    // populate with basic treasures
    new CardPile(
      BasicCards.Copper.name,
      createNInstances(60 - numberOfPlayers * 7, () => cardConfigRegistry.newCard(BasicCards.Copper.name))
    ),
    new CardPile(
      BasicCards.Silver.name,
      createNInstances(40, () => cardConfigRegistry.newCard(BasicCards.Silver.name))
    ),
    new CardPile(
      BasicCards.Gold.name,
      createNInstances(30, () => cardConfigRegistry.newCard(BasicCards.Gold.name))
    ),
  ];
  const baseVictoryCards = [
    // populate with victory cards - 2 players have 8 of each type, 3 or more have 12 of each type
    new CardPile(
      BasicCards.Estate.name,
      createNInstances(numberOfPlayers <= 2 ? 8 : 12, () => cardConfigRegistry.newCard(BasicCards.Estate.name))
    ),
    new CardPile(
      BasicCards.Duchy.name,
      createNInstances(numberOfPlayers <= 2 ? 8 : 12, () => cardConfigRegistry.newCard(BasicCards.Duchy.name))
    ),
    new CardPile(
      BasicCards.Province.name,
      createNInstances(numberOfPlayers <= 2 ? 8 : 12, () => cardConfigRegistry.newCard(BasicCards.Province.name))
    ),
  ];

  // curses. 10 in the supply for each player beyond the first (If there's one pile, I guess there's 10 curses)
  const curses = new CardPile(
    BasicCards.Curse.name,
    createNInstances(numberOfPlayers == 1 ? 10 : (numberOfPlayers - 1) * 10, () =>
      cardConfigRegistry.newCard(BasicCards.Curse.name)
    )
  );

  if (usePlatAndColony) {
    baseTreasures.push(
      new CardPile(
        BasicCards.Platinum.name,
        createNInstances(12, () => cardConfigRegistry.newCard(BasicCards.Platinum.name))
      )
    );
    baseVictoryCards.push(
      new CardPile(
        BasicCards.Colony.name,
        createNInstances(numberOfPlayers <= 2 ? 8 : 12, () => cardConfigRegistry.newCard(BasicCards.Colony.name))
      )
    );
  }

  return new Supply([...baseTreasures, ...baseVictoryCards, curses], kingdom);
}
