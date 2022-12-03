import { Kingdom } from "../model/Kingdom";
import { createNInstances } from "../util/ArrayExtensions";
import { cardConfigRegistry } from "./configservice/CardConfigRegistry";

export function createKingdom(cardNames: Array<string>): Kingdom {
  const cards = cardNames.map((cardName) => {
    return createNInstances(10, () => cardConfigRegistry.newCard(cardName)!);
  });
  return new Kingdom(cards);
}
