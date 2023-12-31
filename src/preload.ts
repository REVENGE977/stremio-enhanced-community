import { ipcRenderer } from "electron";
import { exec } from "child_process";
import { readdirSync, readFileSync } from "fs";
import settings from "./settings";
import { themeLinkSelector, defaultThemeFileName } from "./constants"

/*
    angular.element($0).scope().episodesBySeason(angular.element($0).scope().info, seasonNumber)
    use thie line of code to grab episodes for a certain season in a show.

    angular.element($0).scope().info.getSeasons()
    to get an array of available seasons.
*/

ipcRenderer.on("autoUpdate-status", (event, code) => {
    switch(code) {
        case "update-available":
            prompt("Update available for Stremio-Enhanced, update now ?");
            break;
        case "error":
            alert("Error in the autoupdate system")
            break;
        case "update-downloaded":
            alert("Update download finished, restart app to install the update.")
            break;
    }
})

window.addEventListener("DOMContentLoaded", () => {
    //removes the toast that appears on startup automatically.
    settings.waitForElm('#toast-container > div > div > button').then((elm) => {
        document.querySelector<HTMLElement>('#toast-container > div > div > button').click();
    })

    if(localStorage.getItem("enabledPlugins") == null || localStorage.getItem("enabledPlugins") == "") localStorage.setItem("enabledPlugins", "[]");

    if(localStorage.getItem("currentTheme") != null) {
        let currentTheme = localStorage.getItem("currentTheme");

        let link = document.querySelector(themeLinkSelector);
        if(currentTheme != "Default") {
            link.setAttribute("href", `http://localhost:3000/themes/${currentTheme}`);
        } else {
            link.setAttribute("href", defaultThemeFileName);
        }
    }

    //loads enabled plugins.
    let pluginsToLoad = readdirSync(`${process.env.APPDATA}\\stremio-enhanced\\plugins`).filter((fileName) => { return fileName.endsWith(".plugin.js") });
    pluginsToLoad.forEach(plugin => {
        let enabledPlugins = JSON.parse(localStorage.getItem("enabledPlugins"));
        if(enabledPlugins.includes(plugin)) loadPlugin(plugin);
    })
    
	let settingsBtn = document.querySelector("#user-panel > div:nth-child(3) > div:nth-child(1)");
    let navBarSettingsBtn = document.querySelector("#navbar > div:nth-child(6)");

	[settingsBtn, navBarSettingsBtn].forEach(element => {
        element.addEventListener("click", e => {
            settings.waitForElm('#settingsPage > div.sections > nav').then((elm) => {
                addApplyThemeFunction();
                let themesList = readdirSync(`${process.env.APPDATA}\\stremio-enhanced\\themes`).filter((fileName) => { return fileName.endsWith(".theme.css") })
                let pluginsList = readdirSync(`${process.env.APPDATA}\\stremio-enhanced\\plugins`).filter((fileName) => { return fileName.endsWith(".plugin.js") })
                let enabledPlugins = JSON.parse(localStorage.getItem("enabledPlugins"));
                
                //sets the #enhanced section as the last section instead of #settings-shortcuts.
                document.querySelector("#settings-shortcuts").classList.remove("last");

                settings.addIcon("\E9B0", "ias-icon-colors");
                settings.addSeciton("enhanced", "Stremio Enhanced", true);
                settings.addCategory("Themes", "enhanced", "ias-icon-colors");
                settings.addCategory("Plugins", "enhanced", "ias-icon-colors");
                settings.addCategory("About", "enhanced", "ias-icon-colors");
    
                settings.addButton("Open Themes Folder", "openthemesfolderBtn", "#enhanced > div:nth-child(2)");
                settings.addButton("Open Plugins Folder", "openpluginsfolderBtn", "#enhanced > div:nth-child(3)");
                document.querySelector("#enhanced > div:nth-child(4)").innerHTML += `<h4>Developed By: <p style="display: inline !important;"><a href="https://github.com/REVENGE977" target="_blank" rel="noreferrer">REVENGE977</a></p><br>Version: v0.2</h4>`
    
                //default theme
                document.querySelector("#enhanced > div:nth-child(2)").innerHTML += `<div class="option custom-space"><div class="setting"><label translate="THEME" class="ng-scope ng-binding">Default</label><div class="ro-copy-text-container"><button id="Default" tabindex="-1" translate="apply" onclick="applyTheme('Default')" class="button-b ng-scope ng-binding" ${localStorage.getItem("currentTheme") == "Default" ? "disabled" : ""}>${localStorage.getItem("currentTheme") == "Default" ? "Applied" : "Apply"}</button></div></div></div>`
    
                themesList.forEach(theme => {
                    document.querySelector("#enhanced > div:nth-child(2)").innerHTML += `<div class="option custom-space"><div class="setting"><label translate="THEME" class="ng-scope ng-binding">${theme}</label><div class="ro-copy-text-container"><button id="${theme}" tabindex="-1" translate="apply" onclick="applyTheme('${theme}')" class="button-b ng-scope ng-binding" ${localStorage.getItem("currentTheme") == theme ? "disabled" : ""}>${localStorage.getItem("currentTheme") == theme ? "Applied" : "Apply"}</button></div></div></div>`
                })
    
                pluginsList.forEach(plugin => {
                    document.querySelector("#enhanced > div:nth-child(3)").innerHTML += `<div class="setting"><div class="stremio-checkbox ng-isolate-scope"><div class="option option-toggle"><input class="plugin" name="${plugin}" type="checkbox" tabindex="-1" ${enabledPlugins.includes(plugin) ? "checked=\"checked\"" : ""}><label class="ng-binding">${plugin}</label></div></div></div>`
                })
    
                togglePluginListener();
                scrollListener();
                openThemesFolder();
                openPluginsFolder();
            });
        })
    })
})

function loadPlugin(pluginName:string) {
    let plugin = readFileSync(`${process.env.APPDATA}\\stremio-enhanced\\plugins\\${pluginName}`, "utf-8");
    let script = document.createElement("script");
    script.innerHTML = plugin
    script.id = pluginName

    document.body.appendChild(script);

    let enabledPlugins = JSON.parse(localStorage.getItem("enabledPlugins"));
    if(enabledPlugins.includes(pluginName) == false) {
        enabledPlugins.push(pluginName)
        localStorage.setItem("enabledPlugins", JSON.stringify(enabledPlugins));
    }

    console.log(`[ INFO ] plugin ${pluginName} loaded !`);
}

function unloadPlugin(pluginName:string) {
    document.getElementById(pluginName).remove();

    let enabledPlugins = JSON.parse(localStorage.getItem("enabledPlugins"));
    enabledPlugins = enabledPlugins.filter((x:string) => x !== pluginName);
    localStorage.setItem("enabledPlugins", JSON.stringify(enabledPlugins));

    console.log(`[ INFO ] plugin ${pluginName} unloaded !`);
}


// not sure if this is the best way to do this, but hey at least it works.
function togglePluginListener() {
    let pluginCheckboxes = document.getElementsByClassName("plugin") as HTMLCollectionOf<HTMLInputElement>

    for(let i = 0; i < pluginCheckboxes.length; i++) {
        pluginCheckboxes[i].addEventListener("click", () => {
            if(pluginCheckboxes[i].checked) {
                loadPlugin(pluginCheckboxes[i].name)
            } else {
                unloadPlugin(pluginCheckboxes[i].name);
                document.querySelector("#enhanced > div:nth-child(3)").innerHTML += `<p style="color: #8a5aab">reload is required to disable plugins, <a onclick="location.reload()">click here to reload</a></p>`
            }
        })
    }
}

function addApplyThemeFunction() {
    let script = document.createElement("script");
    script.innerHTML = 
    `function applyTheme(theme) {
        let link = document.querySelector("${themeLinkSelector}");
        if(theme != "Default") {
            link.setAttribute("href", \`http://localhost:3000/themes/\${theme}\`);
        } else link.setAttribute("href", \`${defaultThemeFileName}\`);

        let currentTheme = localStorage.getItem("currentTheme");
        if(currentTheme != null) {
            document.getElementById(currentTheme).disabled = false;
            document.getElementById(currentTheme).innerText = "Apply";
        }

        localStorage.setItem("currentTheme", theme);
        document.getElementById(theme).disabled = true;
        document.getElementById(theme).innerText = "Applied";
        console.log(\`[ INFO ] \${theme} applied !\`);
    }`

    document.body.appendChild(script);
}

function openThemesFolder() {
    let button = document.getElementById("openthemesfolderBtn");
    button.addEventListener("click", () => {
        exec(`start "" "${process.env.APPDATA}\\stremio-enhanced\\themes"`);
    })
}

function openPluginsFolder() {
    let button = document.getElementById("openpluginsfolderBtn");
    button.addEventListener("click", () => {
        exec(`start "" "${process.env.APPDATA}\\stremio-enhanced\\plugins"`);
    })
}

// had to make scroll thing for every section because for some reason after adding the stremio enhanced section buttons stopped working for other sections.
function scrollListener() {
    let generalSection = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(1)');
    generalSection.addEventListener("click", () => {
        document.querySelector("#settings-user-prefs").scrollIntoView();
        settings.activeSection(generalSection);
    })

    let playerSection = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(2)');
    playerSection.addEventListener("click", () => {
        document.querySelector("#settings-player-prefs").scrollIntoView();
        settings.activeSection(playerSection);
    })
    
    let streamingSection = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(3)');
    streamingSection.addEventListener("click", () => {
        document.querySelector("#settings-streaming-prefs").scrollIntoView();
        settings.activeSection(streamingSection);
    })

    let shortcutsSection = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(4)');
    shortcutsSection.addEventListener("click", () => {
        document.querySelector("#settings-shortcuts").scrollIntoView();
        settings.activeSection(shortcutsSection);
    })

    let enhancedSection = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(5)');
    enhancedSection.addEventListener("click", () => {
        document.querySelector("#enhanced > h2").scrollIntoView();
        settings.activeSection(enhancedSection);
    })
}