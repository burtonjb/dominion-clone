# Dominion Clone

A terminal-based dominion clone.
Supporting cards up to Hinterlands 2nd ed!




### Debugging
You can attach a debugger similar to other nodejs applications
run `node --inspect dist/src/main.js` 
and then go to `chrome://inspect` and attach the debugger.

(You have to do it this way so that stdout still goes to the console, otherwise it will crash when it tries to 
render the ui)