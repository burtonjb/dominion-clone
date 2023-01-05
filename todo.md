## Feature roadmap
* add stats tracking - victory points/turn and money/turn for now
* Easy way to configure games - ui for game/kingdom config?
* Update the prompts so there's some flavor in them (e.g. pirate's input prompt should say avast or arrg, masquerade should reference 'Fidelio' (either from Robot Chicken or Eyes Wide Shut))
  * update card text/prompts so that it covers reaction and other effects 

## Out of scope (for now)
* unit tests (I should, but I'm supposed to wrap this up)
* client/server architecture
* persistence layer with sqlite to store results
* additional code cleanup

## Bugs
* card selection 
  - should support cancel/clear to clear the UI
* add game ends after max number of turns (not in the real rules, but useful when doing AI testing)
