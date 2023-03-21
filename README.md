# Dominion Clone

A terminal-based dominion clone.

Supporting the 2nd edition sets - Base, Intrigue, Seaside, Prosperity and Hinterlands since I own physical copies of the sets. 

This is neither supported or endorsed by Rio Grande Games. 

This was mostly to evaluate the feasibility of making a game in typescript
and text-only graphics for games.

## Gameplay
![gameplay](./docs/animated_gameplay_vs_code_terminal.gif)

## Setup
Requires nodejs to run (tested on node 16) and only runs in the terminal (for now)

1. Clone the repo `git clone https://github.com/burtonjb/dominion-clone.git`
2. run `npm run setup`
4. run `npm run main`

## Gameplay
Generally you can type in the first unique prefix for a choice to select that choice - e.g. if you have "copper, collection" then you can play the copper by typing "cop" and the collection by typing "col". "End" will exit the prompt (if its an optional prompt). 

There's a couple changes I made to make implementation easier (should not really be gamebreaking) and there's a lot of stuff not fully implemented.

## Design/Making changes
All the general "config" for the game is in the [config](./src/config/) folder. It contains how the cards work (separated by expansion), some common card effects (drawing cards, gaining money, etc.) and the recommended kingdoms. 
It also contains the "config" for player and AI inputs which is maybe not the best design, but I don't have a better top-level directory for this. 

[di](./src/di/) stands for dependency injection - which I opted to not use, but its generally for setting up the game objects or finding configuration for how to set up game objects. 

[domain](./src/domain/) has all the actual game objects - e.g. the classes for cards, kingdoms, players, etc. 

[ui](./src/ui/) has the files related to any kind of UI stuff - displaying to the terminal, some "views" to display the current game state/end of game screen. Its also got a 3K line json file with the color config which was kind of dumb. 

[util](./src/util/) is either useful extensions to typescript (e.g. a random class that can be seeded and methods to shuffle arrays) or dumb ideas that I kind of regret now (doNTimes I think is unnecessary. createNInstances might be too, though I've also seen a ton of issues with the same object being used in Array(n).fill(value))

## Evaluation notes
### Typescript
I thought typescript worked great for configuring games!

Pros:
* Tight integration with json so easy to store all the cards as configuration (which I think is a good design, though I think it does have some performance tradeoffs)
* typescript typechecking gives IDE/intellisence/autocomplete support if you forget what you named something and will fail the build if you mis-spell a property. 
* javascript/typescript is a pretty flexible language and its quite easy to create closures

Cons:
* Performance I think is kind of bad, though that might be on me
* Standard library is pretty anemic and dependency quality is kind of all over the place (e.g. when the 'colors' library was messed with on NPM)

Generally unless you're working on something that involves a lot of data crunching I found typescript quite nice to work with and fun. VS code's integration is lightweight enough that it worked on my lower power devices while still being useful. 

### Console/text for games
I don't think this worked as well as I initially hoped. 

Pros:
* Time investment for making simple graphics is low
* The colors actually look pretty good (though this is mostly attributed to Dominion's original design)

Cons:
* The terminal emulator I was testing on had poor performance for control characters so I couldn't have graphics at a character level.
* Control characters are included in string length and there was no easy way to determine the display length of the string compared to the total length (not sure if this is fixable)
* Still need to think about UI design. It can be even more difficult since you can't make easy buttons to click.

I think if you're going to be making simple 2D graphics its still better to go with a sprite-based approach (browsers have been supporting the canvas API since like 2011 so I'd recommend that). You do have a little more work to do to get sprites working though, but it gives you much more flexibility. 