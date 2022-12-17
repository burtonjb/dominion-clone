import { CardParams, CardType } from "../domain/objects/Card";
import { CardPile } from "../domain/objects/CardPile";
import { Kingdom } from "../domain/objects/Kingdom";
import { createNInstances } from "../util/ArrayExtensions";
import { cardConfigRegistry } from "./configservice/CardConfigRegistry";

export function createKingdom(numberOfPlayers: number, cardNames: Array<string>): Kingdom {
  const cards = cardNames.map((cardName) => {
    const card = cardConfigRegistry.getParams(cardName);
    return new CardPile(
      cardName,
      createNInstances(getNumberOfPileCards(numberOfPlayers, card), () => cardConfigRegistry.newCard(cardName))
    );
  });
  return new Kingdom(cards);
}

function getNumberOfPileCards(numberOfPlayers: number, card: CardParams): number {
  // victory cards have 8 cards in the supply (or 12 if >= 3 players), otherwise piles have 10 cards by default
  if (card.types.includes(CardType.VICTORY)) {
    return numberOfPlayers <= 2 ? 8 : 12;
  }
  return 10;
}
