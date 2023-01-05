export function matchInput<T>(userInput: string, options: Array<[string, T]>): T | undefined {
  try {
    const inputMatch = new RegExp("^" + userInput + ".*", "i"); // matcher for options that start with the input

    // handle case when there's one exact match
    if (options.filter((option) => option[0].toLowerCase() == userInput).length == 1) {
      return options.filter((option) => option[0].toLowerCase() == userInput)[0][1];
    }

    // handle prefix case
    const matchingOptions = options.filter((option) => option[0].match(inputMatch));

    const isSingleMatch = new Set(matchingOptions.map((m) => m[0])).size == 1;
    if (isSingleMatch) {
      return matchingOptions[0][1];
    } else {
      return undefined;
    }
  } catch {
    return undefined;
  }
}
