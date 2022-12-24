import fs from "node:fs";

class Logger {
  constructor(private filename: string) {}

  debug(s: string) {
    fs.appendFileSync(this.filename, "DEBUG: " + s + "\n");
  }
  info(s: string) {
    fs.appendFileSync(this.filename, "INFO: " + s + "\n");
  }
  warn(s: string) {
    fs.appendFileSync(this.filename, "WARN: " + s + "\n");
  }
  error(s: string) {
    fs.appendFileSync(this.filename, "ERROR: " + s + "\n");
  }
}

let loggerPath = `./logs/game_${new Date().getTime()}.log`;
if (process.env["LOG_PATH"]) {
  loggerPath = process.env["LOG_PATH"];
}

const logger = new Logger(loggerPath);

export { logger };
