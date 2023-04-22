// Class responsible for rendering the game screen to the player

import { Card, CardType } from "../domain/objects/Card";
import { CardPile } from "../domain/objects/CardPile";
import { Game } from "../domain/objects/Game";
import { Player } from "../domain/objects/Player";
import { formatBackgroundColor, formatForegroundColor, xtermColors } from "./Colors";
import { BaseTerminalScreen } from "./Terminal";
import { Event, formatEvent } from "../domain/events/Event";

const EVENT_COLUMN_START = 130;

export class GameScreen {
  private terminal: BaseTerminalScreen;
  private game: Game;

  constructor(terminal: BaseTerminalScreen, game: Game, private includeDebugInfo = false) {
    this.terminal = terminal;
    this.game = game;
  }

  render() {
    this.terminal.clear();
    this.renderSupply();
    this.renderPlayers();
    this.renderActivePlayer();
    this.renderEvents();
  }

  renderSupply() {
    this.terminal.putString(0, 0, `======= SUPPLY: ${this.game.supply.kingdom.name} =======`);

    this.game.supply.basePiles.forEach((pile, i) => {
      this.terminal.putString(0, 1 + i, this.formatCardPile(pile));
    });

    this.game.supply.kingdom.kingdomPiles.forEach((pile, i) => {
      this.terminal.putString(0, this.game.supply.basePiles.length + 1 + i, this.formatCardPile(pile));
    });
  }

  renderPlayers() {
    const start = this.game.supply.allPiles().length + 2;
    this.terminal.putString(0, start, "======= PLAYERS =======");

    this.game.players.forEach((player, i) => {
      this.terminal.putString(0, start + 1 + i, this.formatPlayerOverview(player));
    });
  }

  renderActivePlayer() {
    const start = this.game.supply.allPiles().length + 2 + this.game.players.length + 1;
    this.terminal.putString(0, start + 1, "In Hand: " + this.formatCardList(this.game.getActivePlayer().hand));
    this.terminal.putString(0, start + 2, "In Play: " + this.formatCardList(this.game.getActivePlayer().cardsInPlay));
  }

  renderPrompt(prompt: string) {
    const start = this.terminal.getSize()[1] - 5;
    this.terminal.clearLine(0, start + 2);
    this.terminal.putString(0, start + 2, prompt);
  }

  renderEvents() {
    const colStart = EVENT_COLUMN_START;
    const colEnd = this.terminal.getSize()[0] - 2;
    const maxEvents = this.terminal.getSize()[1] - 6;
    this.terminal.putString(colStart, 0, "|======== EVENTS ========");
    this.game.eventLog
      .getEventsAfter(0)
      .slice(-1 * maxEvents)
      .forEach((event, i) => {
        this.terminal.putString(
          colStart,
          1 + i,
          `| ${this.formatEvent(event, this.includeDebugInfo).slice(0, colEnd - colStart)}`
        );
      });
  }

  formatEvent(event: Event, includeDebugInfo = false): string {
    return formatEvent(event, includeDebugInfo);
  }

  formatCardPile(pile: CardPile, skipEffects = false): string {
    if (pile.cards.length > 0) {
      const pileLength = `[${pile.cards.length}]`.padEnd(4, " ");
      return `${pileLength} ${this.formatCard(pile.cards[0], skipEffects)}`;
    } else {
      return `[0]`;
    }
  }

  formatCardPileName(pile: CardPile): string {
    if (pile.cards.length > 0) {
      const pileLength = `[${pile.cards.length}]`.padEnd(4, " ");
      return `${pileLength} ${this.formatCardName(pile.cards[0])}`;
    } else {
      return `[0]`;
    }
  }

  formatCard(card: Card, skipEffects = false): string {
    const formattedName = this.formatCardName(card, 14);
    const formattedCost = `(${card.calculateCost(this.game)})`;
    const formattedTypes = `{${card.types}}`;
    if (skipEffects) {
      return `${formattedName} ${formattedCost} ${formattedTypes}`;
    }
    const formattedEffect = card.effectString();
    return `${formattedName} ${formattedCost} ${formattedTypes} ${formattedEffect}`;
  }

  formatCardName(card: Card, forcedLength?: number): string {
    let formattedName = card.name;
    let lengthDiff = 0;
    if (this.includeDebugInfo) {
      formattedName += `(${card.id})`;
    }
    if (forcedLength) {
      lengthDiff = forcedLength - card.name.length;
      // trim the name if its too long
      if (lengthDiff < 0) formattedName = formattedName.slice(0, forcedLength);
    }

    if (card.types.includes(CardType.VICTORY) && card.types.includes(CardType.TREASURE)) {
      formattedName = formatForegroundColor(formattedName, xtermColors.getByName("Green")!);
      formattedName = formatBackgroundColor(formattedName, xtermColors.getByName("Yellow2")!);
    } else if (card.types.includes(CardType.VICTORY) && card.types.includes(CardType.REACTION)) {
      formattedName = formatForegroundColor(formattedName, xtermColors.getByName("Green")!);
      formattedName = formatBackgroundColor(formattedName, xtermColors.getByName("Blue1")!);
    } else if (card.types.includes(CardType.REACTION) && card.types.includes(CardType.TREASURE)) {
      formattedName = formatForegroundColor(formattedName, xtermColors.getByName("Blue1")!);
      formattedName = formatBackgroundColor(formattedName, xtermColors.getByName("Yellow2")!);
    } else if (card.types.includes(CardType.REACTION) && card.types.includes(CardType.DURATION)) {
      formattedName = formatForegroundColor(formattedName, xtermColors.getByName("Blue1")!);
      formattedName = formatBackgroundColor(formattedName, xtermColors.getByName("Orange1")!);
    } else if (card.types.includes(CardType.TREASURE) && card.types.includes(CardType.DURATION)) {
      formattedName = formatForegroundColor(formattedName, xtermColors.getByName("Yellow2")!);
      formattedName = formatBackgroundColor(formattedName, xtermColors.getByName("Orange1")!);
    } else if (card.types.includes(CardType.CURSE)) {
      formattedName = formatForegroundColor(formattedName, xtermColors.getByName("Purple")!);
    } else if (card.types.includes(CardType.DURATION)) {
      formattedName = formatForegroundColor(formattedName, xtermColors.getByName("Orange1")!);
    } else if (card.types.includes(CardType.TREASURE)) {
      formattedName = formatForegroundColor(formattedName, xtermColors.getByName("Yellow2")!);
    } else if (card.types.includes(CardType.VICTORY)) {
      formattedName = formatForegroundColor(formattedName, xtermColors.getByName("Green")!);
    } else if (card.types.includes(CardType.REACTION)) {
      formattedName = formatForegroundColor(formattedName, xtermColors.getByName("Blue1")!);
    }
    if (lengthDiff > 0) {
      formattedName = formattedName + " ".repeat(lengthDiff);
    }

    return formattedName;
  }

  formatPlayerOverview(player: Player): string {
    const playerName = player.name;
    const actions = player.actions;
    const buys = player.buys;
    const money = player.money;
    const handSize = player.hand.length;
    const deckSize = player.drawPile.length;
    const discardSize = player.discardPile.length;
    const topDiscardCard = player.discardPile.length > 0 ? this.formatCardName(player.discardPile[0]) : "";
    const victoryPoints = `${player.calculateVictoryPoints()}`;
    const turns = `${player.turns}`;

    return `${playerName} actions: ${actions} | buys: ${buys} | money: ${money} | hand: ${handSize} | deck: ${deckSize} | discard: ${discardSize} (${topDiscardCard}) | VP: ${victoryPoints} | turns: ${turns}`;
  }

  formatCardList(cards: Array<Card>): string {
    return cards.map((c) => this.formatCardName(c)).join(", ");
  }
}
