## Feature roadmap
* Add other expansions
  - add seaside/prosperity/hinterlands
* Easy way to configure games - ui for game/kingdom config?

## Out of scope (for now)
* client/server architecture
* persistence layer with sqlite to store results

## Bugs
* score calculation might be buggy (write UT/check if its duplicate counting)
* Some prompts move around the UI (some are at the bottom of the page, som seem to move upwards, though this might be because I've scrolled down)
* cardselection 
  - should support cancel/clear to clear the UI
* add game ends after max number of turns (not in the real rules, but useful when doing AI testing)
* go through and test all the added cards