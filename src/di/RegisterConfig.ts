import { register as registerBase } from "../config/cards/Base";
import { register as registerBasic } from "../config/cards/Basic";
import { register as registerIntrigue } from "../config/cards/Intrigue";

function registerCards() {
  registerBasic();
  registerBase();
  registerIntrigue();
}

function registerKingdoms() {
  throw new Error("TODO!");
}

function registerAll() {
  registerCards();
}

export default registerAll;
