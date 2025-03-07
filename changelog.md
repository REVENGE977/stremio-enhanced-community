## Update v0.3
- Now relies on [Stremio Service](https://github.com/Stremio/stremio-service) to run (if stremio service isn't installed it will guide the user to install it). This is means you will get a similar streaming experience to the official app.
- Checks if the installed version is the latest version or not. Startup checking can be disabled from the settings (not tested yet).
- Made a new plugin called "BetterEpisodesList." The idea is to add a new season option in shows that says "all." When the option is chosen, the plugin will take all of the episodes available in a show (except specials) and put them in one list for you, numbered as they are in one list. This is very useful for shows like One Piece, Where in other platforms the episodes are listed as they are in one season. This plugin brings that to Stremio. The plugin also adds a search bar for the user to search episodes, which is a feature apparent in [Stremio Web](https://web.stremio.com/).
- Now shows the list of plugins/themes in more details. It will show the details provided in the meta data (the first few comment lines). You can check examples/BetterEpisodesList.plugin.js.
- The source is a bit more organized now.
- Fixed the flag for --devtools. Now if the user launches stremio-enhanced with the flag --devtools it will open the F12 devtools on launch properly.
- Added the hotkey Ctrl+Shift+I to open the devtools.
- Added the flag --no-stremio-service for users who don't want to use stremio service and override the streaming server URL from the settings.
- Now sets the background to black on startup, so you don't get flashbanged on launch.

*Note: I've only tested the update on Windows.*

## Update v0.4
- Implemented a plugin/theme update checker.
- Added hotkeys for zooming in/out Ctrl+= and Ctrl+-.

*Note: I've only tested the update on Windows.*

## Update v0.5
- Added [Discord Rich Presence](https://github.com/discordjs/RPC) (disabled by default and can be toggled from the settings).
- Now uses [winston](https://www.npmjs.com/package/winston) for logging.
- Now kills [Stremio Service](https://github.com/Stremio/stremio-service) when the app is closed.

*Note: I've only tested the update on Windows.*

## Update v0.6
- I Made it so it doesn't rely on a webserver just to load themes anymore (I don't know why I had it working that way before tbh).
- Now, instead of having to copy the default theme css and modify it, you can just make a new file and put all of your CSS changes, making it easier to make and modify themes now.

*Note: I've only tested the update on Windows.*


## Update v0.7
- Fixed an issue where options in the settings menu that are part of the regular stremio were not working.
- Codebase improvements
#### knowns issues that have not been solved here:
- Not sure if this works on macOS or not. [Although the stremio service path detection issue shouldn't be there anymore](https://github.com/REVENGE977/stremio-enhanced-community/pull/16).
- Changing audio tracks isn't supported.
  
*Note: I've only tested the update on Windows. I do not have access to a mac at the moment*