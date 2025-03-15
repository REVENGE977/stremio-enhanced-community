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

## Update v0.7.1
This should've been part of v0.7 tbh, but I rushed the previous release for no reason.
- Better DiscordRPC implementation.
  - Now supports movies as well, not just shows like before.
  - Better rich presence looks. Now if available, it will show the poster of what you're watching instead of the stremio icon.
  - Supports other navbar tabs like browse and settings etc.
- Codebase improvements. Now StremioService-related things are in their own separate class under ./utils/StremioService.ts

**I am soon planning move on from https://app.strem.io/shell-v4.4/ and use https://web.stremio.com/ instead. It will take some work but it will fix the [multiple audio tracks issue](https://github.com/REVENGE977/stremio-enhanced-community/issues/3) and make this project more in-line with the newest features added to Stremio.**

*Note: I've only tested the update on Windows. I do not have access to a mac at the moment*

## Update v0.8
#### This is so far the closest experience to the official app while still having the functionality and customizability of plugins and themes!
- **Now uses [Stremio Web v5](https://web.stremio.com/) instead of [Stremio shell-v4.4](https://app.strem.io/shell-v4.4/). This means:**
  - Support for multiple audio tracks, allowing you to switch audio tracks as you would in the official app.
  - Subtitles menu is working more often than not now.
  - Access to the latest features, like the episode search bar.
- **Way faster launch time:** The [StremioService.isProcessRunning()](https://github.com/REVENGE977/stremio-enhanced-community/blob/main/src/utils/StremioService.ts#L81) method was previously taking too long to execute, which has now been resolved.
- **More consistent Discord Rich Presence.**
- **Stremio Service can now be placed in the same directory as the app:** You can now download the [.zip archive of Stremio Service](https://github.com/Stremio/stremio-service/releases/tag/v0.1.13), extract it in the same directory as Stremio Enhanced, and it should be recognized. Previously, Stremio Service had to be installed on your system using the setup file.
- **Better codebase:** Instead of embedding HTML/JS as strings in the source code, most HTML/JS components are now separate files inside ./src/components. This makes debugging and making changes much easier.
- **Improved logging:** Class names are now displayed in log messages.


**Notes:**
- This update has only been tested on Windows. I do not currently have access to a Mac but may create a macOS Virtual Machine for testing in the near future.
- Since this project now uses [Stremio Web v5](https://web.stremio.com/), this means most, if not all, previous themes and plugins are no longer compatible and will require an update. This is because in [Stremio Web v5](https://web.stremio.com/), the UI has different structure, classes and ids are different, etc. So far I've only updated [Amoled theme](https://github.com/REVENGE977/StremioAmoledTheme) and [SlashToSearch](https://github.com/REVENGE977/SlashToSearch) to work on this version. I'll work on updating [BetterEpisodeList](https://github.com/REVENGE977/BetterEpisodeList) soon.