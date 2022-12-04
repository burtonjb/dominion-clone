import * as BasicCards from "../config/cards/Basic";
import { CardPile } from "../model/CardPile";
import { Game } from "../model/Game";
import { Kingdom } from "../model/Kingdom";
import { Player } from "../model/Player";
import { Supply } from "../model/Supply";
import { createNInstances } from "../util/ArrayExtensions";
import { Random } from "../util/Random";
import { cardConfigRegistry } from "./configservice/CardConfigRegistry";
import { createKingdom } from "./CreateKingdom";

export function createGame(numberOfPlayers: number, seed?: number): Game {
  // construct utility classes and "services"
  const random = new Random(seed);

  // create players and their starting cards
  const players = createPlayers(random, numberOfPlayers);

  // create the kingdom based on the number of players
  const kingdom = createKingdom(numberOfPlayers, []);

  const supply = createSupply(numberOfPlayers, kingdom);

  const game = new Game(random, players, supply);

  return game;
}

function createPlayers(random: Random, numberOfPlayers: number): Array<Player> {
  const players = [];
  for (let i = 0; i < numberOfPlayers; i++) {
    // players start with 7 coppers and 3 estates
    const coppers = createNInstances(7, () => cardConfigRegistry.newCard(BasicCards.Copper.name)!);
    const estates = createNInstances(3, () => cardConfigRegistry.newCard(BasicCards.Estate.name)!);
    const initialCards = [...coppers, ...estates];
    players.push(new Player(random, initialCards));
  }
  return players;
}

function createSupply(numberOfPlayers: number, kingdom: Kingdom): Supply {
  return new Supply(
    [
      // populate with basic treasures
      new CardPile(
        BasicCards.Copper.name,
        createNInstances(60 - numberOfPlayers * 7, () => cardConfigRegistry.newCard(BasicCards.Copper.name)!)
      ),
      new CardPile(
        BasicCards.Silver.name,
        createNInstances(40, () => cardConfigRegistry.newCard(BasicCards.Silver.name)!)
      ),
      new CardPile(
        BasicCards.Gold.name,
        createNInstances(30, () => cardConfigRegistry.newCard(BasicCards.Gold.name)!)
      ),

      // populate with victory cards - 2 players have 8 of each type, 3 or more have 12 of each type
      new CardPile(
        BasicCards.Estate.name,
        createNInstances(numberOfPlayers <= 2 ? 8 : 12, () => cardConfigRegistry.newCard(BasicCards.Estate.name)!)
      ),
      new CardPile(
        BasicCards.Duchy.name,
        createNInstances(numberOfPlayers <= 2 ? 8 : 12, () => cardConfigRegistry.newCard(BasicCards.Duchy.name)!)
      ),
      new CardPile(
        BasicCards.Province.name,
        createNInstances(numberOfPlayers <= 2 ? 8 : 12, () => cardConfigRegistry.newCard(BasicCards.Gold.name)!)
      ),

      // curses. 10 in the supply for each player beyond the first
      new CardPile(
        BasicCards.Curse.name,
        createNInstances((numberOfPlayers - 1) * 10, () => cardConfigRegistry.newCard(BasicCards.Curse.name)!)
      ),
    ],
    kingdom
  );
}
