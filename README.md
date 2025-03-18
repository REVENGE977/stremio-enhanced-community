<p align="center">
	<a href="https://stremio.com/">
		<img src="https://github.com/REVENGE977/stremio-enhanced/raw/main/images/icon.ico" alt="Stremio Enhanced Icon">
	</a>
	<h1 align="center">Stremio Enhanced</h1>
	<p align="center">
		<img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS">
		<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
		<img src="https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white" alt="Electron.js">
		<img src="https://img.shields.io/badge/HTML-239120?style=for-the-badge&logo=html5&logoColor=white" alt="HTML">
		<img src="https://img.shields.io/badge/CSS-239120?&style=for-the-badge&logo=css3&logoColor=white" alt="CSS">
	</p>
</p>

## Table of Contents
- [Table of Contents](#table-of-contents)
- [What is Stremio Enhanced?](#what-is-stremio-enhanced)
- [Downloads](#downloads)
- [Installation](#installation)
- [Themes and Plugins](#themes-and-plugins)
	- [Installing Themes](#installing-themes)
	- [Installing Plugins](#installing-plugins)
- [Differences Between Addons and Plugins](#differences-between-addons-and-plugins)
- [Creating Your Own Plugin](#creating-your-own-plugin)
- [Creating Your Own Theme](#creating-your-own-theme)
- [Known Issues](#known-issues)
- [Disclaimer](#disclaimer)

## What is Stremio Enhanced?
Stremio Enhanced is an Electron-based [Stremio](https://www.stremio.com/) client with plugins and themes support. It runs the [Stremio Service](https://github.com/Stremio/stremio-service) automatically and loads [the web version of Stremio](https://web.stremio.com).

With this project, you can make Stremio look like this, for example:
![screenshot](https://github.com/REVENGE977/stremio-enhanced/raw/main/images/amoled_screenshot.png)

This theme can be found in [StremioAmoledTheme](https://github.com/REVENGE977/StremioAmoledTheme).

## Downloads
You can download the latest version from [the releases tab](https://github.com/REVENGE977/stremio-enhanced/releases).

## Installation
1. Clone the repository: `git clone https://github.com/REVENGE977/stremio-enhanced.git`
2. Navigate to the project directory: `cd stremio-enhanced`
3. Install dependencies: `npm install`
4. Build the project: 
    - For all platforms: `npm run package-all`
    - For macOS ARM: `npm run package-macos-arm`

## Themes and Plugins

### Installing Themes
1. Go to the settings and scroll down.
2. Click on the "OPEN THEMES FOLDER" button.
3. Move your theme into the opened folder.
4. Restart Stremio Enhanced.
5. You should see your theme in the settings with an option to apply it.

### Installing Plugins
1. Go to the settings and scroll down.
2. Click on the "OPEN PLUGINS FOLDER" button.
3. Move your plugin into the opened folder.
4. Restart Stremio Enhanced.
5. You should see your plugin in the settings with an option to enable it.

![settings_screenshot](https://github.com/REVENGE977/stremio-enhanced/raw/main/images/settings_screenshot.png)

## Differences Between Addons and Plugins
- **Addons** are available on the normal version of Stremio. They add catalogs and streams for Stremio.
- **Plugins** add more functionality to Stremio, like new features.

## Creating Your Own Plugin
Plugins are simply JavaScript files running on the client side. Create a JavaScript file with a `.plugin.js` extension and write your code as you would normally for the client side.

As of version v0.3, you are required to provide metadata for the plugin. Here is an example:

```js
/**
 * @name YourPluginNameHere
 * @description What does your plugin do?
 * @updateUrl your plugin's raw file URL for update checking. (Set this to 'none' if you don't want to provide one)
 * @version VersionHere (e.g., 1.0.0)
 * @author AuthorName
 */
```

## Creating Your Own Theme
Create a file with a name ending in `.theme.css` and write your CSS modifications there. You can use the devtools (`Ctrl+Shift+I`) to find an element's class name, etc.

*You are also required to provide metadata in your theme, in the same way as plugins.*

## Known Issues
- Subtitles are not available for **some** streams that have embedded subs. This seems to be an issue with either [Stremio Web](https://web.stremio.com/) or Stremio Service, as it also occurs in the browser. Subtitles do work fine for **most** streams though.

## Disclaimer
This project is not affiliated in any way with Stremio.