<p align="center">
  <img src="https://github.com/REVENGE977/stremio-enhanced/raw/main/images/icon.ico">
</p>

<h1 align="center">[WIP] Stremio Enhanced</h1>

## What is stremio enhanced ?
Basically a stremio client with plugins and themes support,
it runs the stremio service automatically and opens this [url](https://app.strem.io/shell-v4.4) in an electron app.

With this project you can make stremio look like this, for example:
![screenshot](https://github.com/REVENGE977/stremio-enhanced/raw/main/images/amoled_screenshot.png)

this theme can be found [here](https://github.com/REVENGE977/stremio-enhanced-community/blob/main/examples/amoled.theme.css).
## Downloads
You can download the latest version from [here](https://github.com/REVENGE977/stremio-enhanced/releases), or build it yourself:
```
git clone https://github.com/REVENGE977/stremio-enhanced.git
cd stremio-enhanced
npm run package-win32
```

## How do I install themes/plugins?
Just go to the settings and scroll down and you should see a "OPEN THEMES FOLDER" button
click on it and it should open the themes folder to install themes simply move your theme into that folder
and when you restart stremio enhanced you should be able to see your theme in the settings and a button to apply that theme.

same for plugins, you just click on "OPEN PLUGINS FOLDER" and move your plugin into the plugins folder.
![settings_screenshot](https://github.com/REVENGE977/stremio-enhanced/raw/main/images/settings_screenshot.png)

## How do I make my own plugin?
Plugins are simply javascript files running on the client-side, so just write your javascript code like you normally would on client-side
and add .plugin.js at the end of the javascript file name, and move your javascript plugin to the plugins folder (%appdata%\stremio-enhanced\plugins).

As of version v0.3 you are required to provide meta data for the plugin, here is an example:
```js
/**
 * @name YourPluginNameHere
 * @description What does your plugin do?
 * @updateUrl your plugin's raw file url for update checking.
 * @version VersionHere (ex: 1.0.0)
 * @author AuthorName
 */
```
## How do I make my own theme?
You just take the stock stremio css file and modify it. The stock css file can be found [here](https://github.com/REVENGE977/stremio-enhanced-community/blob/main/examples/stockstremio_unminified.theme.css). You can also just take the default theme yourself, by opening devtools and going to the Source tab, and there you will find the css file for the default theme. You can take it and put it [here](https://www.unminify2.com/) to unminify it and make it easier to read and modify.

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