import { Event } from "./Event";

export class EventLog {
  // A better way to represent this would be with a tree-map, which would be O(lg n) ordered inserts
  // and O(lg n) to find the first event after the timestamp
  // and O(E) to find all events after some timestamp, where E is number of events after the timestamp
  private events: Array<Event>;

  constructor() {
    this.events = [];
  }

  public publishEvent(event: Event) {
    if (!event.timestamp) {
      event.timestamp = new Date().getTime();
    }
    this.events.push(event); // assuming already ordered by timestamp
  }

  public getEventsAfter(timestamp: number) {
    return this.events.filter((e) => (e.timestamp ? e.timestamp : 0 > timestamp));
  }
}
