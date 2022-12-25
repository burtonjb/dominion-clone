import * as BasicCards from "../config/cards/Basic";
import * as BaseCards from "../config/cards/Base";
import * as IntrigueCards from "../config/cards/Intrigue";
import * as SeasideCards from "../config/cards/Seaside";

import { register as registerBase } from "../config/cards/Base";
import { register as registerBasic } from "../config/cards/Basic";
import { register as registerIntrigue } from "../config/cards/Intrigue";
import { register as registerSeaside } from "../config/cards/Seaside";

function registerCards() {
  registerBasic();
  registerBase();
  registerIntrigue();
  registerSeaside();
}

function registerKingdoms() {
  throw new Error("TODO!");
}

function registerAll() {
  registerCards();
}

export default registerAll;

export {
  BasicCards as BasicCards,
  BaseCards as BaseCards,
  IntrigueCards as IntrigueCards,
  SeasideCards as SeasideCards,
};
