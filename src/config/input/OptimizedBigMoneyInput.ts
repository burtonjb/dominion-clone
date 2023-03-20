import { BasicCards } from "../../di/RegisterConfig";
import { CardPile } from "../../domain/objects/CardPile";
import { Game } from "../../domain/objects/Game";
import { Player } from "../../domain/objects/Player";
import { BadBigMoneyAiInput } from "./BaseAiInput";

/* Taken from rspeer's simulator, originally posted by WanderingWinder here: http://forum.dominionstrategy.com/index.php?topic=625
 * does not support colonies just yet
 * Original source can be found here: https://rspeer.github.io/dominiate/play.html#DoubleJack/BigMoney
 * I've added it as an additional AI since my original bot was quite bad.
 *
 * I've tested it a bit:
 * I ran some small scripts (some small modifications to disable rendering in main and only have AI players)
 * Then I wrapped it in a bash script - `for i in {1..1000}; do node dist/src/main.js; done` and ran until I got bored
 * From the 1000 games OBM played against BBM (Bad big money) here are the stats:
 * OBM won 806 games (80.6%)
 * BBM won 211 games (21.1%)
 * There were 17 ties (0.02%)
 */
export class OptimizedBigMoneyAiInput extends BadBigMoneyAiInput {
  protected provincePile: CardPile | undefined;
  protected duchyPile: CardPile | undefined;
  protected estatePile: CardPile | undefined;
  protected goldPile: CardPile | undefined;
  protected silverPile: CardPile | undefined;
  protected pilesCached = false;

  constructor() {
    super();
  }

  cachePiles(game: Game) {
    this.provincePile = game.supply.nonEmptyPiles().find((c) => c.name == BasicCards.Province.name);
    this.duchyPile = game.supply.nonEmptyPiles().find((c) => c.name == BasicCards.Duchy.name);
    this.estatePile = game.supply.nonEmptyPiles().find((c) => c.name == BasicCards.Estate.name);
    this.goldPile = game.supply.nonEmptyPiles().find((c) => c.name == BasicCards.Gold.name);
    this.silverPile = game.supply.nonEmptyPiles().find((c) => c.name == BasicCards.Silver.name);
    this.pilesCached = true;
  }

  commonPileConditions = (pile: CardPile | undefined, player: Player, game: Game) =>
    pile && pile.cards.length > 0 && player.money >= pile.cards[0].calculateCost(game);

  async chooseCardToBuy(player: Player, game: Game): Promise<CardPile | undefined> {
    if (!this.pilesCached) {
      this.cachePiles(game);
    }

    const playerTotalMoney = this.getTotalMoney(player);
    const gainsToEndGame = this.gainsToEndGame(game);

    // Prioritized list of cards to gain for BM
    if (this.commonPileConditions(this.provincePile, player, game) && playerTotalMoney > 18) return this.provincePile;
    if (this.commonPileConditions(this.duchyPile, player, game) && gainsToEndGame <= 4) return this.duchyPile;
    if (this.commonPileConditions(this.estatePile, player, game) && gainsToEndGame <= 2) return this.estatePile;
    if (this.commonPileConditions(this.goldPile, player, game)) return this.goldPile;
    if (this.commonPileConditions(this.duchyPile, player, game) && gainsToEndGame <= 6) return this.duchyPile;
    if (this.commonPileConditions(this.silverPile, player, game)) return this.silverPile;
  }

  // estimates the total amount of money a player has
  // limitations is that it only will count money from basic treasures
  getTotalMoney(player: Player): number {
    const totalMoney = player
      .allCards()
      .map((c) => {
        if (c.name == BasicCards.Copper.name) return 1;
        else if (c.name == BasicCards.Silver.name) return 2;
        else if (c.name == BasicCards.Gold.name) return 3;
        else if (c.name == BasicCards.Platinum.name) return 5;
        else return 0 as number;
      })
      .reduce((prev, cur) => prev + cur);
    return totalMoney;
  }

  // estimates how many gains required to end the game
  gainsToEndGame(game: Game): number {
    // game ends when 0 provinces - so gainsLeft is at most number of provinces left
    const provincesLeft =
      game.supply.allPiles().find((p) => p.name == BasicCards.Province.name)?.cards?.length || Infinity;
    // game ends when 0 colonies (if present) - so gainsLeft is at most number of colonies left
    const coloniesLeft =
      game.supply.allPiles().find((p) => p.name == BasicCards.Colony.name)?.cards?.length || Infinity;
    // game ends when 3 supplies are empty - so gainsLeft is at most the length of the 3 shortest piles
    const lowPiles = game.supply
      .allPiles()
      .map((p) => p.cards.length)
      .sort((a, b) => a - b)
      .slice(0, 3)
      .reduce((a, b) => a + b);

    return Math.min(provincesLeft, coloniesLeft, lowPiles);
  }
}
