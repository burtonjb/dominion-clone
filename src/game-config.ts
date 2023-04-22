import { main } from "./MainLoop";
import { CommandLineArgumentParser } from "./util/ArgsParser";

export interface GameConfig {
  seed?: number;
  // bots
  kingdom?: string;
  randomRecommendedKingdom?: boolean;

  maxExpansions?: number;
  disableExpansions?: Array<string>;
  forceExpansions?: Array<string>;

  disableCards?: Array<string>;
  forceCards?: Array<string>;

  useColonyPlat?: boolean;
  cardOfTheDay?: boolean;
  disableUi?: boolean;

  debug?: boolean;
}

function gameConfig(): GameConfig {
  const argParser = new CommandLineArgumentParser();
  const args = argParser.parse();

  return {
    seed: args.get("seed") as number | undefined,
    // TODO: bot config
    kingdom: args.get("kingdom") as string | undefined,
    randomRecommendedKingdom: args.get("random-recommended-kingdom") as boolean | undefined,

    maxExpansions: args.get("max-expansions") as number | undefined,
    disableExpansions: args.get("disable-expansions") as Array<string> | undefined,
    forceExpansions: args.get("force-expansions") as Array<string> | undefined,

    disableCards: args.get("disable-cards") as Array<string> | undefined,
    forceCards: args.get("force-cards") as Array<string> | undefined,

    useColonyPlat: args.get("use-colony-plat") as boolean | undefined,
    cardOfTheDay: args.get("card-of-the-day") as boolean | undefined,
    disableUi: args.get("disable-ui") as boolean | undefined,
  };
}

const config = gameConfig();
main(config);
