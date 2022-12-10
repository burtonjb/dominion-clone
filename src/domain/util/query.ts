import { Game } from "../objects/Game";
import { Player } from "../objects/Player";

/*
This file contains wrapper functions so that its a bit easier to 
communicate the intent in the card configuration (e.g.) otherPlayers.forEach ...
instead of the filter statement
*/

// function to get all other players in the game.
function otherPlayers(player: Player, game: Game) {
  return game.players.filter((p) => p != player);
}
