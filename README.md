<p align="center">
	<a href="https://stremio.com/">
		<img src="https://github.com/REVENGE977/stremio-enhanced/raw/main/images/icon.ico">
	</a>
	<h1 align="center">Stremio Enhanced</h1>

<div style="text-align: center;">

![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Electron.js](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white) ![HTML](https://img.shields.io/badge/HTML-239120?style=for-the-badge&logo=html5&logoColor=white) ![CSS](https://img.shields.io/badge/CSS-239120?&style=for-the-badge&logo=css3&logoColor=white)
</div>

</p>

## What is Stremio Enhanced ?
Stremio Enhanced is an Electron-based [Stremio](https://www.stremio.com/) client with plugins and themes support. It runs the [Stremio Service](https://github.com/Stremio/stremio-service) automatically and loads [the web version of Stremio](https://app.strem.io/shell-v4.4/).


With this project you can make stremio look like this, for example:
![screenshot](https://github.com/REVENGE977/stremio-enhanced/raw/main/images/amoled_screenshot.png)

this theme can be found in [StremioAmoledTheme](https://github.com/REVENGE977/StremioAmoledTheme).
## Downloads
You can download the latest version from [the releases tab](https://github.com/REVENGE977/stremio-enhanced/releases), or build it yourself:
```sh
git clone https://github.com/REVENGE977/stremio-enhanced.git
cd stremio-enhanced
npm run package-all
npm run package-macos-arm
```

## How do I install themes/plugins?
Go to the settings and scroll down and you should see a "OPEN THEMES FOLDER" button
click on it and it should open the themes folder to install themes simply move your theme into that folder
and when you restart stremio enhanced you should be able to see your theme in the settings and a button to apply that theme.

same for plugins, you just click on "OPEN PLUGINS FOLDER" and move your plugin into the plugins folder.
![settings_screenshot](https://github.com/REVENGE977/stremio-enhanced/raw/main/images/settings_screenshot.png)

## What is the difference between addons and plugins?
Addons are available on the normal version of Stremio. They simply add catalogs and streams for Stremio. Plugins, on the other hand, add more functionality to Stremio, like new features, for example.


## How do I make my own plugin?
Plugins are simply JavaScript files running on the client side, so just write your JavaScript code like you normally would on the client side and add `.plugin.js` at the end of the JavaScript file name.

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
You just make a file with a name that ends with `.theme.css` and write your CSS modifications there. Obviously, you can use the devtools (`Ctrl+Shift+I`) to find an element's class name, etc.

*You are also required to provide metadata in your theme. The same way as plugins from the example above.*

## Known Issues
- You can't switch audio tracks in streams that have multiple audio tracks to choose from. This is due to the limitations of browsers, unfortunetly. More info on this here: https://www.reddit.com/r/Stremio/comments/15sd629/new_web_ui_issue/jwf7jyp/ https://github.com/Stremio/stremio-web/issues/426

## Disclaimer
This project is not affiliated in any way with Stremio.