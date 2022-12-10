import { question } from "../util/PromiseExtensions";
import { Card, CardType } from "./objects/Card";
import { Game } from "./objects/Game";
import * as BasicCards from "../config/cards/Basic";
import { Choice } from "./objects/Choice";
import { Player } from "./objects/Player";

class PlayTreasuresInput implements Choice<Card> {
  private activePlayer: Player;
  public readonly prompt: string;
  public readonly options: Array<Card>; // what to do about ALL and END?
  private donePlayingTreasures = false;

  constructor(activePlayer: Player) {
    this.activePlayer = activePlayer;

    this.prompt = `Play a treasure from your hand: ${this.activePlayer.hand.map((c) => c.name)}, or 'end' to end\n> `;
    this.options = activePlayer.hand.filter((card) => card.types.includes(CardType.TREASURE));
  }

  public isDone(): boolean {
    this.donePlayingTreasures =
      this.donePlayingTreasures || !this.activePlayer.hand.some((card) => card.types.includes(CardType.TREASURE));
    return this.donePlayingTreasures;
  }

  public async loop(game: Game) {
    const activePlayer = game.getActivePlayer();
    while (!this.isDone()) {
      const input = await question(this.prompt);
      const inputMatch = new RegExp("^" + input + ".*", "i"); // matcher for options that start with the input

      const matchingCards = activePlayer.hand
        .filter((c) => c.types.includes(CardType.TREASURE))
        .filter((card) => card.name.match(inputMatch));
      const singleMatch = new Set(matchingCards.map((c) => c.name)).size == 1;
      if (input.length > 0 && singleMatch) {
        const matchingCard = matchingCards[0];
        game.playCard(matchingCard, activePlayer);
      } else if (input.toLowerCase() == "all") {
        // play all coppers, silvers, golds
        const m = activePlayer.hand.filter(
          (c) => c.name == BasicCards.Copper.name || c.name == BasicCards.Silver.name || c.name == BasicCards.Gold.name
        );
        m.forEach((c) => game.playCard(c, activePlayer));
      } else if (input.toLowerCase() == "end") {
        this.donePlayingTreasures = true;
      } else {
        console.log(`Unknown input: ${input}`); // TODO: handle unknowns or handle trying to play cards that cannot be played now
      }
      console.log(activePlayer.infoString());
    }
  }
}
