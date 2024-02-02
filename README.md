<p align="center">
  <img src="https://github.com/REVENGE977/stremio-enhanced/raw/main/images/icon.ico">
</p>

<h1 align="center">[WIP] Stremio Enhanced</h1>

## What is stremio enhanced ?
Stremio Enhanced is an Electron-based [Stremio](https://www.stremio.com/) client with plugins and themes support. It runs the [Stremio Service](https://github.com/Stremio/stremio-service) automatically and loads [the web version of Stremio](https://app.strem.io/shell-v4.4/).


With this project you can make stremio look like this, for example:
![screenshot](https://github.com/REVENGE977/stremio-enhanced/raw/main/images/amoled_screenshot.png)

this theme can be found [here](https://github.com/REVENGE977/stremio-enhanced-community/blob/main/examples/amoled.theme.css).
## Downloads
You can download the latest version from [here](https://github.com/REVENGE977/stremio-enhanced/releases), or build it yourself:
```
git clone https://github.com/REVENGE977/stremio-enhanced.git
cd stremio-enhanced
npm run package-all
```

## How do I install themes/plugins?
Go to the settings and scroll down and you should see a "OPEN THEMES FOLDER" button
click on it and it should open the themes folder to install themes simply move your theme into that folder
and when you restart stremio enhanced you should be able to see your theme in the settings and a button to apply that theme.

same for plugins, you just click on "OPEN PLUGINS FOLDER" and move your plugin into the plugins folder.
![settings_screenshot](https://github.com/REVENGE977/stremio-enhanced/raw/main/images/settings_screenshot.png)

## How do I make my own plugin?
Plugins are simply javascript files running on the client side, so just write your javascript code like you normally would on the client side and add .plugin.js at the end of the javascript file name.

As of version v0.3 you are required to provide meta data for the plugin, here is an example:
```js
/**
 * @name YourPluginNameHere
 * @description What does your plugin do?
 * @updateUrl your plugin's raw file url for update checking. (set this to none if you don't want to provide one)
 * @version VersionHere (ex: 1.0.0)
 * @author AuthorName
 */
```
## How do I make my own theme?
You just make a file that ends with .theme.css and write your CSS modifications there. Obviously, you can use the devtools (Ctrl+Shift+I) to find an element's class name, etc.

*You are also required to provide metadata in your theme. The same way as plugins from the example above.*