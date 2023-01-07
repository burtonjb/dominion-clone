import * as BasicCards from "../config/cards/Basic";
import * as BaseCards from "../config/cards/Base";
import * as IntrigueCards from "../config/cards/Intrigue";
import * as SeasideCards from "../config/cards/Seaside";
import * as ProsperityCards from "../config/cards/Prosperity";
import * as HinterlandsCards from "../config/cards/Hinterlands";

import { register as registerBase } from "../config/cards/Base";
import { register as registerBasic } from "../config/cards/Basic";
import { register as registerIntrigue } from "../config/cards/Intrigue";
import { register as registerSeaside } from "../config/cards/Seaside";
import { register as registerProsperity } from "../config/cards/Prosperity";
import { register as registerHinterlands } from "../config/cards/Hinterlands";

import { register as registerBaseKingdom } from "../config/kingdom/Base";
import { register as registerIntrigueKingdom } from "../config/kingdom/Intrigue";
import { register as registerSeasideKingdom } from "../config/kingdom/Seaside";
import { register as registerProsperityKingdom } from "../config/kingdom/Prosperity";
import { register as registerHinterlandsKingdom } from "../config/kingdom/Hinterlands";

function registerCards() {
  registerBasic();
  registerBase();
  registerIntrigue();
  registerSeaside();
  registerProsperity();
  registerHinterlands();
}

function registerKingdoms() {
  registerBaseKingdom();
  registerIntrigueKingdom();
  registerSeasideKingdom();
  registerProsperityKingdom();
  registerHinterlandsKingdom();
}

function registerAll() {
  registerCards();
  registerKingdoms();
}

export default registerAll;

export {
  BasicCards as BasicCards,
  BaseCards as BaseCards,
  IntrigueCards as IntrigueCards,
  SeasideCards as SeasideCards,
  ProsperityCards as ProsperityCards,
  HinterlandsCards as HinterlandsCards,
};
