import { Card } from "../domain/objects/Card";
import { CardPile } from "../domain/objects/CardPile";
import { Game } from "../domain/objects/Game";
import { Player } from "../domain/objects/Player";
import { question } from "../util/PromiseExtensions";
import { GameScreen } from "./GameScreen";
import { BaseTerminalScreen } from "./Terminal";

export class GameEndingScreen {
  constructor(
    private terminal: BaseTerminalScreen,
    private game: Game,
    private gameScreen: GameScreen // used only to steal some of the functions defined here
  ) {}

  render() {
    this.terminal.clear();
    this.renderPlayers();
  }

  async waitForInput() {
    await question();
  }

  private renderPlayers() {
    const winners = this.game.calculateWinners();
    let diff = 1;
    this.game.players.forEach((player) => {
      this.terminal.putString(0, 1 + ++diff, this.formatPlayerGameSummary(player, winners.includes(player)));
      this.formatCardsForPlayer(player).forEach((formattedPile) => {
        this.terminal.putString(0, 1 + ++diff, formattedPile);
      });
      diff++;
    });
    this.terminal.putString(0, 1 + this.game.players.length + ++diff + 1, "Press any key to continue");
  }

  private formatPlayerGameSummary(player: Player, isWinner: boolean) {
    const totalVictoryPoints = player.calculateVictoryPoints();
    const victoryTokens = player.victoryTokens;
    return `${player.name} Turns Taken:${player.turns} Total VP:${totalVictoryPoints} VT:${victoryTokens} ${
      isWinner ? "Winner!" : ""
    }`;
  }

  private formatCardsForPlayer(player: Player): Array<string> {
    const collectedCards: Map<string, Array<Card>> = new Map();
    player.allCards().forEach((card) => {
      // I don't think JS/TS has a groupBy
      const current = collectedCards.get(card.name) || [];
      current.push(card);
      collectedCards.set(card.name, current);
    });

    const piles = Array.from(collectedCards.keys()).map((key) => {
      const cards = collectedCards.get(key)!;
      return new CardPile(cards[0].name, cards);
    });

    piles.sort((a, b) => a.cards[0].baseCost - b.cards[0].baseCost);
    return piles.map((p) => this.formatCardPile(p, player));
  }

  private formatCardPile(cardPile: CardPile, player: Player) {
    const topCard = cardPile.cards[0];
    const vpPerCard = cardPile.cards[0].calculateVictoryPoints(player);
    return `[${cardPile.cards.length}] ${this.gameScreen.formatCardName(topCard, 16)} - VP: ${
      vpPerCard * cardPile.cards.length
    } (${vpPerCard}/card)`;
  }
}
