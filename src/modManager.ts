import { Settings } from "./settings";
import { readFileSync, writeFileSync } from "fs";
import { exec } from "child_process";
import properties from "./properties"
import helpers from "./helpers"
import MetaData from "./metadata";
import logger from "./logger";
import Properties from "./properties";

class ModManager {
    static loadPlugin(pluginName:string) {
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
        
        logger.info(`plugin ${pluginName} loaded !`);
    }
    
    static unloadPlugin(pluginName:string) {
        document.getElementById(pluginName).remove();
        
        let enabledPlugins = JSON.parse(localStorage.getItem("enabledPlugins"));
        enabledPlugins = enabledPlugins.filter((x:string) => x !== pluginName);
        localStorage.setItem("enabledPlugins", JSON.stringify(enabledPlugins));
        
        logger.info(`plugin ${pluginName} unloaded !`);
    }
    
    
    // not sure if this is the best way to do this, but hey at least it works.
    static togglePluginListener() {
        let pluginCheckboxes = document.getElementsByClassName("plugin") as HTMLCollectionOf<HTMLInputElement>
        
        for(let i = 0; i < pluginCheckboxes.length; i++) {
            pluginCheckboxes[i].addEventListener("click", () => {
                if(pluginCheckboxes[i].checked) {
                    this.loadPlugin(pluginCheckboxes[i].name)
                } else {
                    this.unloadPlugin(pluginCheckboxes[i].name);
                    document.querySelector("#enhanced > div:nth-child(3)").innerHTML += `<p style="color: white;">Reload is required to disable plugins. Press <a style="color: cyan;" onclick="window.location.href = '/';">here</a> to reload.</p>`
                }
            })
        }
    }
    
    
    static openThemesFolder() {
        let button = document.getElementById("openthemesfolderBtn");
        button.addEventListener("click", () => {
            exec(`start "" "${process.env.APPDATA}\\stremio-enhanced\\themes"`);
        })
    }
    
    static openPluginsFolder() {
        let button = document.getElementById("openpluginsfolderBtn");
        button.addEventListener("click", () => {
            exec(`start "" "${process.env.APPDATA}\\stremio-enhanced\\plugins"`);
        })
    }
        
    static scrollListener() {
        let generalSection = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(1)');
        generalSection.addEventListener("click", () => {
            document.querySelector("#settings-user-prefs").scrollIntoView();
            Settings.activeSection(generalSection);
        })
        
        let playerSection = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(2)');
        playerSection.addEventListener("click", () => {
            document.querySelector("#settings-player-prefs").scrollIntoView();
            Settings.activeSection(playerSection);
        })
        
        let streamingSection = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(3)');
        streamingSection.addEventListener("click", () => {
            document.querySelector("#settings-streaming-prefs").scrollIntoView();
            Settings.activeSection(streamingSection);
        })
        
        let shortcutsSection = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(4)');
        shortcutsSection.addEventListener("click", () => {
            document.querySelector("#settings-shortcuts").scrollIntoView();
            Settings.activeSection(shortcutsSection);
        })
        
        let enhancedSection = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(5)');
        enhancedSection.addEventListener("click", () => {
            document.querySelector("#enhanced > h2").scrollIntoView();
            Settings.activeSection(enhancedSection);
        })
    }
    
    static addApplyThemeFunction() {
        let script = document.createElement("script");  
        script.innerHTML = 
        `function applyTheme(theme) {
            if(document.getElementById("activeTheme")) document.getElementById("activeTheme").remove();

            if(theme != "Default") {      
                let themeElement = document.createElement('link');
                themeElement.setAttribute("id", "activeTheme");
                themeElement.setAttribute("rel", "stylesheet");
                themeElement.setAttribute("href", \`${Properties.themesPath.replace(/\\/g, "\\\\")}\\\\\${theme}\`);

                document.head.appendChild(themeElement);
            }
                        
            let currentTheme = localStorage.getItem("currentTheme");
            if(currentTheme != null) {
                document.getElementById(currentTheme).disabled = false;
                document.getElementById(currentTheme).innerText = "Apply";
            }
            
            localStorage.setItem("currentTheme", theme);
            document.getElementById(theme).disabled = true;
            document.getElementById(theme).innerText = "Applied";
            console.log(\`\${theme} applied !\`);
        }`
        
        document.body.appendChild(script);
    }
    
    static async checkForItemUpdates(itemFile: string) {
        let pluginOrTheme:'theme'|'plugin';
        let itemBox = document.getElementsByName(`${itemFile}-box`)[0];
        if(!itemBox) return logger.warn("item box not found.");


        if(itemFile.endsWith(".theme.css")) pluginOrTheme = "theme";
        else pluginOrTheme = "plugin";

        let itemPath = `${pluginOrTheme == "theme" ? properties.themesPath : properties.pluginsPath}\\${itemFile}`;

        let installedItemMetaData:MetaData = helpers.extractMetadataFromFile(itemPath);
        if (installedItemMetaData && Object.keys(installedItemMetaData).length > 0) {
            let updateUrl = installedItemMetaData.updateUrl;
            if(updateUrl) {
                let request = await fetch(updateUrl);
                let response = await request.text();
                
                if(request.status == 200) {
                    let extractedMetaData:MetaData = helpers.extractMetadataFromText(response);
                    if(extractedMetaData.version > installedItemMetaData.version) {
                        logger.info(`[ ${installedItemMetaData.name} ] An update exists. New version: ${extractedMetaData.version} | Current version: ${installedItemMetaData.version}`);

                        document.getElementById(`${itemFile}-update`).style.display = "flex";
                        document.getElementById(`${itemFile}-update`).addEventListener("click", () => {
                            writeFileSync(itemPath, response, 'utf-8');
                            Settings.removeItem(itemFile);
                            Settings.addItem(pluginOrTheme, itemFile, extractedMetaData);
                        })
                    }
                }
            }
        }
    }
}
    
export default ModManager;