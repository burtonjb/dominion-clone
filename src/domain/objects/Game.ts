import { Random } from "../../util/Random";
import { Card } from "./Card";
import { CardLocation, Player } from "./Player";
import { Supply } from "./Supply";
import * as BasicCards from "../../config/cards/Basic";
import { CardPile } from "./CardPile";
import { doNTimes } from "../../util/ArrayExtensions";
import { EventLog } from "../events/EventLog";

export interface GameParams {
  seed: number;
  numberOfPlayers: number;
}

export enum TurnPhase {
  ACTION = "Action",
  BUY = "Buy",
  CLEAN_UP = "Clean up",
}

export class Game {
  private random: Random;
  public players: Array<Player>;
  public supply: Supply;
  public activePlayerIndex: number;
  public currentPhase: TurnPhase;

  public trash: Array<Card>;

  public eventLog: EventLog;

  constructor(random: Random, players: Array<Player>, supply: Supply) {
    this.random = random;
    this.players = players;
    this.supply = supply;
    this.trash = [];

    // pick the first player randomly
    this.activePlayerIndex = this.random.randomInt(0, players.length);
    this.getActivePlayer().turns += 1;
    this.currentPhase = TurnPhase.ACTION;

    this.eventLog = new EventLog();
  }

  // determines if the game is still in progress or is finished
  public isGameFinished(): boolean {
    const isProvincePileEmpty =
      this.supply.baseCards.find((pile) => pile.name == BasicCards.Province.name)?.cards.length == 0;
    const areAtLeast3PilesEmpty = this.supply.allPiles().filter((pile) => pile.cards.length == 0).length >= 3;
    return isProvincePileEmpty || areAtLeast3PilesEmpty;
  }

  public async playCard(card: Card, player: Player) {
    card.play(player, this);
    for (const effect of player.onPlayCardTriggers) {
      await effect.call(this, card, player, this);
    }
    player.removeCard(card);
    player.cardsInPlay.push(card);
    this.eventLog.publishEvent({ type: "PlayCard", player: player, card: card });
  }

  public revealCards(cards: Array<Card>, player: Player) {
    this.eventLog.publishEvent({ type: "RevealCard", cards: cards, player: player });
  }

  public buyCard(cardPile: CardPile, player: Player) {
    const activePlayer = this.getActivePlayer();
    const gainedCard = this.gainCard(cardPile, player, true);
    activePlayer.buys -= 1;
    activePlayer.money -= gainedCard.cost;
  }

  public gainCard(cardPile: CardPile, player: Player, wasBought: boolean, toLocation?: CardLocation): Card {
    // only handles gaining cards from the supply to the player's discard pile for now
    const cardToGain = cardPile.cards.shift();
    if (cardToGain == undefined) {
      throw new Error("Card not found in pile"); // there UX layer did not validate the inputs properly so throwing.
    }
    if (toLocation == undefined || toLocation == CardLocation.DISCARD) {
      player.discardPile.unshift(cardToGain);
    } else if (toLocation == CardLocation.TOP_OF_DECK) {
      player.drawPile.unshift(cardToGain);
    } else if (toLocation == CardLocation.HAND) {
      player.hand.unshift(cardToGain);
    }
    this.eventLog.publishEvent({
      type: "GainCard",
      player: player,
      card: cardToGain,
      wasBought: wasBought,
      toLocation: toLocation,
    });
    return cardToGain;
  }

  public gainCardByName(
    cardName: string,
    player: Player,
    wasBought: boolean,
    toLocation?: CardLocation
  ): Card | undefined {
    const pile = this.supply.allPiles().find((pile) => pile.name == cardName);
    if (pile != undefined) {
      return this.gainCard(pile, player, wasBought);
    } else {
      return undefined;
    }
  }

  public discardCard(card: Card, player: Player) {
    player.removeCard(card);
    player.discardPile.unshift(card); // put on-top of discard pile
    this.eventLog.publishEvent({ type: "DiscardCard", player: player, card: card });
  }

  public trashCard(card: Card, player: Player) {
    player.removeCard(card);
    this.trash.push(card);
    this.eventLog.publishEvent({ type: "TrashCard", player: player, card: card });
  }

  public cleanUp() {
    const activePlayer = this.getActivePlayer();
    activePlayer.cleanUp(this);

    // advance the active player index, have the next player start their turn
    this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
    this.getActivePlayer().turns += 1;
  }

  /*
  Returns the active/current player
  */
  public getActivePlayer(): Player {
    return this.players[this.activePlayerIndex];
  }

  /*
  Return the other players in the game. 
  */
  public otherPlayers(player?: Player): Array<Player> {
    const filterPlayer = player ? player : this.getActivePlayer();
    return this.players.filter((p) => p != filterPlayer);
  }

  public calculateWinners(): Array<Player> {
    // winner is the player with the highest VP then with the lowest number of turns taken.
    // If there's a tie, they all win!
    const highestVp = Math.max(...this.players.map((p) => p.calculateVictoryPoints()));
    const lowestTurnWithHighestVp = Math.min(
      ...this.players.filter((player) => player.calculateVictoryPoints() == highestVp).map((player) => player.turns)
    );
    return this.players.filter(
      (player) => player.calculateVictoryPoints() == highestVp && player.turns == lowestTurnWithHighestVp
    );
  }
}
