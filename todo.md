## Feature roadmap
* AI (support for big money or other simple strategies)
* Add other expansions
  - finish testing base + intrigue
  - refactor base / intrigue
  - add seaside/prosperity/hinterlands
* persistence layer (store results to sqlite?)
* Client/server split (if I want to do it)
* Easy way to configure games - ui for game/kingdom config?
* Add eslint config to remove unused imports

## Bugs
* score calculation might be buggy (write UT/check if its duplicate counting)
* Some prompts move around the UI (some are at the bottom of the page, som seem to move upwards, though this might be because I've scrolled down)
* cardselection 
  - should autoclose when the user has selected up to the max number of cards
  - should support cancel/clear to clear the UI
* add game ends after max number of turns (not in the real rules, but useful when doing AI testing)
