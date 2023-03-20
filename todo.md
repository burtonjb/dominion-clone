## Feature roadmap
* Easy way to configure games - ui for game/kingdom config?
* better AI opponents (I can pull simple strategies off simulators I think)
* finish the cards marked with TODO
* add stats tracking - victory points/turn and money/turn for now
* ~~add a game ending splash screen - list of cards and VP per player~~
* better simulator functionality. Right now it requires restarting the nodejs instance which can be pretty slow. 
* split events into public/private so that the player can't see all the details about the other player's turn & private info
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
