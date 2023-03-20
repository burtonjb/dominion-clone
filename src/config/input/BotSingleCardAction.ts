import {
  BaseCards,
  BasicCards,
  HinterlandsCards,
  IntrigueCards,
  ProsperityCards,
  SeasideCards,
} from "../../di/RegisterConfig";
import { CardConfig, CardType } from "../../domain/objects/Card";
import { CardPile } from "../../domain/objects/CardPile";
import { Game } from "../../domain/objects/Game";
import { Player } from "../../domain/objects/Player";
import { logger } from "../../util/Logger";
import { OptimizedBigMoneyAiInput } from "./OptimizedBigMoneyInput";

const BaseCardsThatHelpMoney: Array<CardConfig> = [
  BaseCards.Moat,
  BaseCards.Militia,
  BaseCards.Smithy,
  BaseCards.Bandit,
  BaseCards.CouncilRoom,
  BaseCards.Laboratory,
  BaseCards.Library,
];

const IntrigueCardsThatHelpMoney: Array<CardConfig> = [
  IntrigueCards.Courtyard,
  // IntrigueCards.Masquerade, // too hard to program right now - need to support money density calculation for trashing and passing priority
  IntrigueCards.Steward,
  IntrigueCards.Patrol,
  IntrigueCards.Torturer,
  IntrigueCards.Harem,
  IntrigueCards.Nobles,
];

const SeasideCardsThatHelpMoney: Array<CardConfig> = [
  SeasideCards.Caravan,
  SeasideCards.Pirate,
  SeasideCards.SeaWitch,
  SeasideCards.Wharf,
];

const ProsperityCardsThatHelpMoney: Array<CardConfig> = [
  BasicCards.Platinum,
  BasicCards.Colony,
  ProsperityCards.Watchtower,
  ProsperityCards.Magnate,
  ProsperityCards.Rabble,
  ProsperityCards.Vault,
];

const HinterlandsCardsThatHelpMoney: Array<CardConfig> = [
  HinterlandsCards.JackOfAllTrades,
  HinterlandsCards.Margrave,
  HinterlandsCards.WitchsHut,
];

const CardsThatHelpMoney = [
  ...BaseCardsThatHelpMoney,
  ...IntrigueCardsThatHelpMoney,
  ...SeasideCardsThatHelpMoney,
  ...ProsperityCardsThatHelpMoney,
  ...HinterlandsCardsThatHelpMoney,
];
/*
 * This bot will run a strategy similar to big money, except with
 * that it will try to buy a couple action cards that will help out
 * it's big money strategy - e.g. smithy big-money or wharf big-money
 *
 * Its to make a slightly more challenging bot that doesn't require too
 * much more programming effort to make
 *
 * Its a bit more random but when I tested it
 * BSCA won(or tied) 681 / 1000 games
 * OBM won(or tied) 362 / 1000 games [with 43 ties]
 */
export class BotSingleCardAction extends OptimizedBigMoneyAiInput {
  private actionToBuy: CardPile | undefined;

  constructor() {
    super();
  }

  async chooseCardToBuy(player: Player, game: Game): Promise<CardPile | undefined> {
    if (!this.pilesCached) {
      this.cachePiles(game);

      const namesToFind = CardsThatHelpMoney.map((c) => c.name);
      const candidateActions = game.supply.kingdom.kingdomPiles.filter((c) => namesToFind.includes(c.name));
      const choice = candidateActions[game.random.randomInt(0, candidateActions.length)];
      if (choice) {
        this.actionToBuy = choice;
      } else {
        this.actionToBuy = this.goldPile;
      }

      logger.info(`Bot ${player.name} (BotSingleCardAction) has chosen ${this.actionToBuy?.name} as its strategy`);
    }

    const playerTotalMoney = this.getTotalMoney(player);
    const gainsToEndGame = this.gainsToEndGame(game);
    const actionCount = this.getTotalActionCount(player);

    // Prioritized list of cards to gain for BM
    if (this.commonPileConditions(this.provincePile, player, game) && playerTotalMoney > 18) return this.provincePile;
    if (this.commonPileConditions(this.duchyPile, player, game) && gainsToEndGame <= 4) return this.duchyPile;
    if (this.commonPileConditions(this.estatePile, player, game) && gainsToEndGame <= 2) return this.estatePile;
    if (this.commonPileConditions(this.goldPile, player, game)) return this.goldPile;
    if (actionCount < 2 && this.commonPileConditions(this.actionToBuy, player, game)) return this.actionToBuy;
    if (this.commonPileConditions(this.duchyPile, player, game) && gainsToEndGame <= 6) return this.duchyPile;
    if (this.commonPileConditions(this.silverPile, player, game)) return this.silverPile;
  }

  getTotalActionCount(player: Player) {
    return player.allCards().filter((c) => c.types.includes(CardType.ACTION)).length;
  }
}
