import { CardPile } from "./domain/objects/CardPile";
import { cardConfigRegistry } from "./di/configservice/CardConfigRegistry";
import { BaseTerminalScreen, BufferedScreen } from "./ui/Screen";
import { createNInstances } from "./util/ArrayExtensions";
import { CardPileComponent } from "./ui/game/Components";
import * as BasicCards from "./config/cards/Basic";
import * as BaseCards from "./config/cards/Base";

async function main() {
  const screen = new BufferedScreen(new BaseTerminalScreen());
  // const screen = new BaseTerminalScreen()

  const goldPile = new CardPile(
    BasicCards.Gold.name,
    createNInstances(10, () => cardConfigRegistry.newCard(BasicCards.Gold.name))
  );
  const estatePile = new CardPile(
    "Estate",
    createNInstances(10, () => cardConfigRegistry.newCard("Estate"))
  );
  const curse = new CardPile(
    "Curse",
    createNInstances(10, () => cardConfigRegistry.newCard("Curse"))
  );
  const village = new CardPile(
    BaseCards.Village.name,
    createNInstances(10, () => cardConfigRegistry.newCard(BaseCards.Village.name))
  );
  const militia = new CardPile(
    BaseCards.Militia.name,
    createNInstances(10, () => cardConfigRegistry.newCard(BaseCards.Militia.name))
  );

  const components = [goldPile, estatePile, curse, village, militia].map((pile) => new CardPileComponent(pile));

  screen.clear();
  components.forEach((c, index) => {
    screen.drawImage(0, index, c.render());
  });
  screen.draw();
}

main();
