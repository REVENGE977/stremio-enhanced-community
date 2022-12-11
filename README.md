<p align="center">
  <img src="https://github.com/REVENGE977/stremio-enhanced/raw/main/images/icon.ico">
</p>

<h1 align="center">[WIP] Stremio Enhanced</h1>

## What is stremio enhanced ?
basically a stremio client with plugins and themes support,
it runs the stremio streaming server and opens this [url](https://app.strem.io/shell-v4.4) in electron (i know its probably not the best way to do it, but thats just how i got it working).

with this project you can make stremio look like this:
![screenshot](https://github.com/REVENGE977/stremio-enhanced/raw/main/images/amoled_screenshot.png)

this theme can be found [here](https://github.com/REVENGE977/stremio-enhanced-community/blob/main/examples/amoled.theme.css),
## Downloads
you can download the latest version from [here](https://github.com/REVENGE977/stremio-enhanced/releases)
or build it yourself
```
git clone https://github.com/REVENGE977/stremio-enhanced.git
cd stremio-enhanced
npm run package-win32
```

## How do i install themes/plugins ?
just go to the settings and scroll down and you should see a "OPEN THEMES FOLDER" button
click on it and it should open the themes folder to install themes simply move your theme into that folder
and when you restart stremio enhanced you should be able to see your theme in the settings and a button to apply that theme.

same for plugins, you just click on "OPEN PLUGINS FOLDER" and move your plugin into the plugins folder.
![settings_screenshot](https://github.com/REVENGE977/stremio-enhanced/raw/main/images/settings_screenshot.png)

## How do i make my own plugin ?
plugins are simply javascript files running on the client-side, so just write your javascript code like you normally would on client-side
and add .plugin.js at the end of the javascript file name, and move your javascript plugin to the plugins folder (%appdata%\stremio-enhanced\plugins)

## How do i make my own theme ?
you just take the stock stremio css file and modify it
the stock css file can be found [here](https://github.com/REVENGE977/stremio-enhanced-community/blob/main/examples/stockstremio_unminified.theme.css)

## Videos wont load ?
try this:
[download ffmpeg](https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip) and put it in the stremio-enhanced folder (you only need ffmpeg.exe, its in the bin folder).

## "Your code sucks"
i know, i dont have much experience with electron,
you're free to improve it and make a [pull request](https://github.com/REVENGE977/stremio-enhanced/pulls).


## Todo
- might switch to [stremio web v5](https://github.com/Stremio/stremio-web)
- updater