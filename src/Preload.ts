import { ipcRenderer } from "electron";
import { readdirSync } from "fs";
import Settings from "./core/Settings";
import properties from "./core/Properties"
import { existsSync } from "fs";
import ModManager from "./core/ModManager";
import Helpers from "./utils/Helpers";
import Updater from "./core/Updater";
import DiscordPresence from "./utils/DiscordPresence";

window.addEventListener("DOMContentLoaded", async () => {
    //removes the toast that appears on startup automatically.
    Helpers.waitForElm('#toast-container > div > div > button').then((elm:HTMLElement) => {
        elm.click();
    })

    if(localStorage.getItem("enabledPlugins") == null || localStorage.getItem("enabledPlugins") == "") localStorage.setItem("enabledPlugins", "[]");
    if(localStorage.getItem("checkForUpdatesOnStartup") == null || localStorage.getItem("checkForUpdatesOnStartup") == "") localStorage.setItem("checkForUpdatesOnStartup", "true");
    if(localStorage.getItem("discordrichpresence") == null || localStorage.getItem("discordrichpresence") == "") localStorage.setItem("discordrichpresence", "false");

    ipcRenderer.send('update-check-on-startup', localStorage.getItem('checkForUpdatesOnStartup'));
    
    //Wait for videos to play and update discord presence accordingly.
    if(localStorage.getItem("discordrichpresence") == "true") {
        ipcRenderer.send("discordrpc-status", "true");
        await DiscordPresence.discordRPCHandler();
    }
    
    if(localStorage.getItem("currentTheme") != null) {
        let currentTheme = localStorage.getItem("currentTheme");
        
        if(currentTheme != "Default" && existsSync(`${properties.themesPath}\\${currentTheme}`)) {
            if(document.getElementById("activeTheme")) document.getElementById("activeTheme").remove();

            let themeElement = document.createElement('link');
            themeElement.setAttribute("id", "activeTheme");
            themeElement.setAttribute("rel", "stylesheet");
            themeElement.setAttribute("href", `${properties.themesPath}\\${currentTheme}`);

            document.head.appendChild(themeElement);
        } else {
            localStorage.setItem("currentTheme", "Default");
        }
    } else localStorage.setItem("currentTheme", "Default");
    
    //loads enabled plugins.
    let pluginsToLoad = readdirSync(`${properties.pluginsPath}`).filter((fileName) => { return fileName.endsWith(".plugin.js") });
    pluginsToLoad.forEach(plugin => {
        let enabledPlugins = JSON.parse(localStorage.getItem("enabledPlugins"));
        if(enabledPlugins.includes(plugin)) ModManager.loadPlugin(plugin);
    })
    
    let settingsBtn = document.querySelector("#user-panel > div:nth-child(3) > div:nth-child(1)");
    let navBarSettingsBtn = document.querySelector("#navbar > div:nth-child(6)");
    
    [settingsBtn, navBarSettingsBtn].forEach(element => {
        element.addEventListener("click", () => {
            Helpers.waitForElm('#settingsPage > div.sections > nav').then(() => {
                if(document.querySelector(`a[href="#settings-enhanced"]`)) return;
                ModManager.addApplyThemeFunction();
                
                let themesList = readdirSync(`${properties.themesPath}`).filter((fileName) => { return fileName.endsWith(".theme.css") })
                let pluginsList = readdirSync(`${properties.pluginsPath}`).filter((fileName) => { return fileName.endsWith(".plugin.js") })
                
                //sets the #enhanced section as the last section instead of #settings-shortcuts.
                document.querySelector("#settings-shortcuts").classList.remove("last");
                
                Settings.addSection("enhanced", "Enhanced", true);
                Settings.addCategory("Themes", "enhanced", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon"> <g> <path fill="none" d="M0 0h24v24H0z"></path> <path d="M4 3h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 9h6a1 1 0 0 1 1 1v3h1v6h-4v-6h1v-2H5a1 1 0 0 1-1-1v-2h2v1zm11.732 1.732l1.768-1.768 1.768 1.768a2.5 2.5 0 1 1-3.536 0z" style="
                fill: currentcolor;"></path></g></svg>`);
                Settings.addCategory("Plugins", "enhanced", `<svg icon="addons-outline" class="icon" viewBox="0 0 512 512" style="fill: currentcolor;"><path d="M413.6999999999998 246.10000000000014H386c-0.53-0.01-1.03-0.23-1.4-0.6-0.37-0.37-0.59-0.87-0.6-1.4v-77.2a38.94 38.94 0 0 0-11.4-27.5 38.94 38.94 0 0 0-27.5-11.4h-77.2c-0.53-0.01-1.03-0.23-1.4-0.6-0.37-0.37-0.59-0.87-0.6-1.4v-27.7c0-27.1-21.5-49.9-48.6-50.3-6.57-0.1-13.09 1.09-19.2 3.5a49.616 49.616 0 0 0-16.4 10.7 49.823 49.823 0 0 0-11 16.2 48.894 48.894 0 0 0-3.9 19.2v28.5c-0.01 0.53-0.23 1.03-0.6 1.4-0.37 0.37-0.87 0.59-1.4 0.6h-77.2c-10.5 0-20.57 4.17-28 11.6a39.594 39.594 0 0 0-11.6 28v70.4c0.01 0.53 0.23 1.03 0.6 1.4 0.37 0.37 0.87 0.59 1.4 0.6h26.9c29.4 0 53.7 25.5 54.1 54.8 0.4 29.9-23.5 57.2-53.3 57.2H50c-0.53 0.01-1.03 0.23-1.4 0.6-0.37 0.37-0.59 0.87-0.6 1.4v70.4c0 10.5 4.17 20.57 11.6 28s17.5 11.6 28 11.6h70.4c0.53-0.01 1.03-0.23 1.4-0.6 0.37-0.37 0.59-0.87 0.6-1.4V441.20000000000005c0-30.3 24.8-56.4 55-57.1 30.1-0.7 57 20.3 57 50.3v27.7c0.01 0.53 0.23 1.03 0.6 1.4 0.37 0.37 0.87 0.59 1.4 0.6h71.1a38.94 38.94 0 0 0 27.5-11.4 38.958 38.958 0 0 0 11.4-27.5v-78c0.01-0.53 0.23-1.03 0.6-1.4 0.37-0.37 0.87-0.59 1.4-0.6h28.5c27.6 0 49.5-22.7 49.5-50.4s-23.2-48.7-50.3-48.7Z" style="stroke:currentcolor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32;fill: currentColor;"></path></svg>`);
                Settings.addCategory("About", "enhanced", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon"> <g> <path fill="none" d="M0 0h24v24H0z"></path> <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z" style="fill:currentcolor"></path> </g> </svg>`);
                
                Settings.addButton("Open Themes Folder", "openthemesfolderBtn", "#enhanced > div:nth-child(2)");
                Settings.addButton("Open Plugins Folder", "openpluginsfolderBtn", "#enhanced > div:nth-child(3)");
                
                document.querySelector("#enhanced > div:nth-child(4)").innerHTML += `
                <h4>
                    Developed By: <p style="display: inline !important;"><a href="https://github.com/REVENGE977" target="_blank" rel="noreferrer">REVENGE977</a></p>
                    <br/>
                    Version: v${Updater.getCurrentVersion()}
                    <br/>
                </h4>
                <div id="checkForUpdatesOnStartup" class="setting">
                    <div class="stremio-checkbox ng-isolate-scope">
                        <div class="option option-toggle"><input type="checkbox" tabindex="-1" ${localStorage.getItem("checkForUpdatesOnStartup") == "true" ? "checked=\"checked\"" : ""}><label class="ng-binding">Check for updates on startup</label></div>
                    </div>
                </div>
                <div id="discordrichpresence" class="setting">
                    <div class="stremio-checkbox ng-isolate-scope">
                        <div class="option option-toggle"><input type="checkbox" tabindex="-1" ${localStorage.getItem("discordrichpresence") == "true" ? "checked=\"checked\"" : ""}><label class="ng-binding">Discord Rich Presence</label></div>
                    </div>
                </div>
                <br/>
                `
                
                //Check for updates button
                Settings.addButton("Check For Updates", "checkforupdatesBtn", "#enhanced > div:nth-child(4)");
                let checkForUpdateBtn:any = document.getElementById("checkforupdatesBtn");
                checkForUpdateBtn.addEventListener("click", async () => {
                    checkForUpdateBtn.style.pointerEvents = "none";
                    ipcRenderer.send("update-check-userrequest");
                    checkForUpdateBtn.style.pointerEvents = "all";
                })
                
                //CheckForUpdatesOnStartup toggle
                document.getElementById("checkForUpdatesOnStartup").addEventListener("click", (e) => {
                    if ((e.target as HTMLInputElement).checked) {
                        localStorage.setItem("checkForUpdatesOnStartup", "true")
                    } else {
                        localStorage.setItem("checkForUpdatesOnStartup", "false")
                    }
                })

                //Discord Rich Presence toggle
                document.getElementById("discordrichpresence").addEventListener("click", async (e) => {
                    if ((e.target as HTMLInputElement).checked) {
                        localStorage.setItem("discordrichpresence", "true")
                        ipcRenderer.send("discordrpc-status", "true")
                        await DiscordPresence.discordRPCHandler();
                    } else {
                        localStorage.setItem("discordrichpresence", "false")
                        ipcRenderer.send("discordrpc-status", "false")
                    }
                })
                
                //default theme
                document.querySelector("#enhanced > div:nth-child(2)").innerHTML += `<div class="option custom-space"><div class="setting"><label translate="THEME" class="ng-scope ng-binding">Default</label><div class="ro-copy-text-container"><button id="Default" tabindex="-1" translate="apply" onclick="applyTheme('Default')" class="button-b ng-scope ng-binding" ${localStorage.getItem("currentTheme") == "Default" ? "disabled" : ""}>${localStorage.getItem("currentTheme") == "Default" ? "Applied" : "Apply"}</button></div></div></div>`
                
                themesList.forEach(theme => {
                    //document.querySelector("#enhanced > div:nth-child(2)").innerHTML += `<div class="option custom-space"><div class="setting"><label translate="THEME" class="ng-scope ng-binding">${theme}</label><div class="ro-copy-text-container"><button id="${theme}" tabindex="-1" translate="apply" onclick="applyTheme('${theme}')" class="button-b ng-scope ng-binding" ${localStorage.getItem("currentTheme") == theme ? "disabled" : ""}>${localStorage.getItem("currentTheme") == theme ? "Applied" : "Apply"}</button></div></div></div>`
                    let readMetaData = Helpers.extractMetadataFromFile(`${properties.themesPath}\\${theme}`);
                    
                    if (readMetaData && Object.keys(readMetaData).length > 0) {
                        if(readMetaData.name.toLowerCase() != "default") {
                            Settings.addItem("theme", theme, readMetaData);
                            if(readMetaData.updateUrl != "none") ModManager.checkForItemUpdates(theme);
                        }
                    }
                })
                
                pluginsList.forEach(plugin => {
                    //document.querySelector("#enhanced > div:nth-child(3)").innerHTML += `<div class="setting"><div class="stremio-checkbox ng-isolate-scope"><div class="option option-toggle"><input class="plugin" name="${plugin}" type="checkbox" tabindex="-1" ${enabledPlugins.includes(plugin) ? "checked=\"checked\"" : ""}><label class="ng-binding">${plugin}</label></div></div></div>`
                    let readMetaData = Helpers.extractMetadataFromFile(`${properties.pluginsPath}\\${plugin}`);
                    
                    if (readMetaData && Object.keys(readMetaData).length > 0) {
                        Settings.addItem("plugin", plugin, readMetaData);
                        if(readMetaData.updateUrl != "none") ModManager.checkForItemUpdates(plugin);
                    }
                })
                
                ModManager.togglePluginListener();
                ModManager.scrollListener();
                ModManager.openThemesFolder();
                ModManager.openPluginsFolder();
            });
        })
    })
})