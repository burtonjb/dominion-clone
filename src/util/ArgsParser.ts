export type SupportedPrimativeType = number | string | boolean;
export type SupportedArgType = SupportedPrimativeType | Array<SupportedPrimativeType>;

// parses arguments of the form arg=value (or --arg=value)
// supports number, string, boolean and arrays of the types
// make sure that you pass in all arguments
// if just the argument is set (e.g. 'help') then it will return the key set to the argument value and the value set to true
export class CommandLineArgumentParser {
  /*
   * Pass in the data from process.argv here
   */
  parse(args?: Array<string>): Map<string, SupportedArgType> {
    if (!args) {
      args = process.argv;
    }
    const cliArgs = args.slice(2);
    const out = new Map<string, SupportedArgType>();

    cliArgs.forEach((arg) => {
      const [key, value] = this.parseArg(arg);
      out.set(key, value);
    });

    return out;
  }

  // returns the pair of parsed-arg name, parsed-arg value
  // expected input shape is name=value
  parseArg(arg: string): [string, SupportedArgType] {
    // support for argument with no value
    if (!arg.includes("=")) {
      return [arg, true];
    }

    const [argName, argValue] = arg.split("=");
    let parsedValue: SupportedArgType = argValue;

    //check if array
    if (argValue.includes(",")) {
      const values = argValue.split(",");
      parsedValue = values.filter((v) => v).map((v) => this.parseSingleValue(v));
    } else {
      // assume its a single value
      parsedValue = this.parseSingleValue(argValue);
    }
    return [argName, parsedValue];
  }

  parseSingleValue(argValue: string): SupportedPrimativeType {
    //check if its a number
    if (!isNaN(parseFloat(argValue))) {
      return parseFloat(argValue);
    }

    //check if boolean
    if (argValue == "true") {
      return true;
    } else if (argValue == "false") {
      return false;
    }

    return argValue;
  }
}
