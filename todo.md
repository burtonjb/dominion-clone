## Feature roadmap
* Add other expansions
  - add ~~seaside/prosperity/~~hinterlands
* "big" code cleanup and refactor
* add stats tracking - victory points/turn and money/turn for now
* Easy way to configure games - ui for game/kingdom config?
* Update the prompts so there's some flavor in them (e.g. pirate's input prompt should say avast or arrg, masquerade should reference 'Fidelio' (either from Robot Chicken or Eyes Wide Shut))


## Out of scope (for now)
* unit tests (I should, but I'm supposed to wrap this up)
* client/server architecture
* persistence layer with sqlite to store results

## Bugs
* score calculation might be buggy (write UT/check if its duplicate counting)
* Some prompts move around the UI (some are at the bottom of the page, som seem to move upwards, though this might be because I've scrolled down)
* card selection 
  - should support cancel/clear to clear the UI
* add game ends after max number of turns (not in the real rules, but useful when doing AI testing)
* go through and test all the added cards
* game ended early - when I swindled the last province. Game should only end at the end of the player's cleanup after the end conditions are met
