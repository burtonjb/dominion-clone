import { Event } from "./Event";

export class EventLog {
  // A better way to represent this would be with a tree-map, which would be O(lg n) ordered inserts
  // and O(lg n) to find the first event after the timestamp
  // and O(E) to find all events after some timestamp, where E is number of events after the timestamp
  private events: Array<Event>;

  private eventCounter = 0;

  constructor() {
    this.events = [];
  }

  public publishEvent(event: Event) {
    event.eventCounter = this.eventCounter++;
    this.events.push(event); // assuming already ordered by timestamp
    // console.log(event)
  }

  public getEventsAfter(counter: number) {
    return this.events.filter((e) => (e.eventCounter ? e.eventCounter : 0 > counter));
  }
}
