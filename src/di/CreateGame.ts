import * as BasicCards from "../config/cards/Basic";
import { CardPile } from "../domain/objects/CardPile";
import { Game } from "../domain/objects/Game";
import { Kingdom } from "../domain/objects/Kingdom";
import { Player } from "../domain/objects/Player";
import { Supply } from "../domain/objects/Supply";
import { createNInstances, shuffleArray } from "../util/ArrayExtensions";
import { Random } from "../util/Random";
import { cardConfigRegistry } from "./configservice/CardConfigRegistry";
import { createKingdom } from "./CreateKingdom";
import registerAll, { SeasideCards } from "./RegisterConfig";

export function createGame(numberOfPlayers: number, seed?: number): Game {
  // construct utility classes and "services"
  const random = new Random(seed);
  registerAll();

  // create players and their starting cards
  const players = createPlayers(random, numberOfPlayers);

  const kingdomCardNames = cardConfigRegistry.values().filter((c) => c.kingdomCard);
  shuffleArray(kingdomCardNames, random);
  const selectedCards = kingdomCardNames.slice(0, 10);
  selectedCards.sort((a, b) => {
    if (a.cost == b.cost) {
      return a.name < b.name ? -1 : 1;
    } else {
      return a.cost < b.cost ? -1 : 1;
    }
  });

  // create the kingdom based on the number of players
  const kingdom = createKingdom(
    numberOfPlayers,
    // selectedCards.map((c) => c.name)
    [
      SeasideCards.NativeVillage.name,
      SeasideCards.FishingVillage.name,
      SeasideCards.Astrolabe.name,
      SeasideCards.Lookout.name,
      SeasideCards.SeaChart.name,
      SeasideCards.Warehouse.name,
      SeasideCards.Caravan.name,
      SeasideCards.Cutpurse.name,
      SeasideCards.Island.name,
      SeasideCards.Salvager.name,
      SeasideCards.TidePools.name,
      SeasideCards.TreasureMap.name,
      SeasideCards.MerchantShip.name,
      SeasideCards.SeaWitch.name,
      SeasideCards.Tactician.name,
      SeasideCards.Wharf.name,
    ]
  );

  const supply = createSupply(numberOfPlayers, kingdom);

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

function createName(index: number): string {
  return `player_${index}`;
}

function createSupply(numberOfPlayers: number, kingdom: Kingdom): Supply {
  return new Supply(
    [
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

      // curses. 10 in the supply for each player beyond the first (If there's one pile, I guess there's 10 curses)
      new CardPile(
        BasicCards.Curse.name,
        createNInstances(numberOfPlayers == 1 ? 10 : (numberOfPlayers - 1) * 10, () =>
          cardConfigRegistry.newCard(BasicCards.Curse.name)
        )
      ),
    ],
    kingdom
  );
}
