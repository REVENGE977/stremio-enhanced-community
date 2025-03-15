import Settings from "./Settings";
import { readFileSync, writeFileSync } from "fs";
import { exec } from "child_process";
import properties from "./Properties"
import helpers from "../utils/Helpers"
import MetaData from "../interfaces/MetaData";
import { getLogger } from "../utils/logger";
import Properties from "./Properties";
import { getApplyThemeTemplate } from "../components/apply-theme/applyTheme";

class ModManager {
    private static logger = getLogger("DiscordPresence");
    
    public static loadPlugin(pluginName:string) {
        if(document.getElementById(pluginName)) return;
        let plugin = readFileSync(`${Properties.pluginsPath}\\${pluginName}`, "utf-8");
        let script = document.createElement("script");
        script.innerHTML = plugin
        script.id = pluginName
        
        document.body.appendChild(script);
        
        let enabledPlugins = JSON.parse(localStorage.getItem("enabledPlugins"));
        if(enabledPlugins.includes(pluginName) == false) {
            enabledPlugins.push(pluginName)
            localStorage.setItem("enabledPlugins", JSON.stringify(enabledPlugins));
        }
        
        this.logger.info(`Plugin ${pluginName} loaded!`);
    }
    
    public static unloadPlugin(pluginName:string) {
        document.getElementById(pluginName).remove();
        
        let enabledPlugins = JSON.parse(localStorage.getItem("enabledPlugins"));
        enabledPlugins = enabledPlugins.filter((x:string) => x !== pluginName);
        localStorage.setItem("enabledPlugins", JSON.stringify(enabledPlugins));
        
        this.logger.info(`Plugin ${pluginName} unloaded!`);
    }
    
    
    // not sure if this is the best way to do this, but hey at least it works.
    public static togglePluginListener() {
        helpers.waitForElm("#enhanced > div:nth-child(3)").then(() => {
            this.logger.info("Listening to plugin checkboxes...");
            let pluginCheckboxes = document.getElementsByClassName("plugin") as HTMLCollectionOf<HTMLInputElement>
            
            for(let i = 0; i < pluginCheckboxes.length; i++) {
                pluginCheckboxes[i].addEventListener("click", () => {
                    pluginCheckboxes[i].classList.toggle("checked");
                    const pluginName = pluginCheckboxes[i].getAttribute('name');

                    if(pluginCheckboxes[i].classList.contains("checked")) {
                        this.loadPlugin(pluginName);
                    } else {
                        this.unloadPlugin(pluginName);

                        const container = document.querySelector("#enhanced > div:nth-child(3)");

                        const paragraph = document.createElement("p");
                        paragraph.style.color = "white";
                        
                        const link = document.createElement("a");
                        link.style.color = "cyan";
                        link.textContent = "here";
                        link.setAttribute("onclick", "window.location.href = '/'");
                        
                        paragraph.appendChild(document.createTextNode("Reload is required to disable plugins. Press "));
                        paragraph.appendChild(link);
                        paragraph.appendChild(document.createTextNode(" to reload."));
                        
                        container.appendChild(paragraph);
                    }
                })
            }
        })
    }
    
    
    public static openThemesFolder() {
        helpers.waitForElm("#openthemesfolderBtn").then(() => {
            let button = document.getElementById("openthemesfolderBtn");
            button.addEventListener("click", () => {
                exec(`start "" "${Properties.themesPath}"`);
            })
        })
    }
    
    public static openPluginsFolder() {
        helpers.waitForElm("#openpluginsfolderBtn").then(() => {
            let button = document.getElementById("openpluginsfolderBtn");
            button.addEventListener("click", () => {
                exec(`start "" "${Properties.pluginsPath}"`);
            })
        })
    }
        
    public static scrollListener() {
        // let generalSection = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(1)');
        // generalSection.addEventListener("click", () => {
        //     document.querySelector("#settings-user-prefs").scrollIntoView();
        //     Settings.activeSection(generalSection);
        // })
        
        // let playerSection = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(2)');
        // playerSection.addEventListener("click", () => {
        //     document.querySelector("#settings-player-prefs").scrollIntoView();
        //     Settings.activeSection(playerSection);
        // })
        
        // let streamingSection = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(3)');
        // streamingSection.addEventListener("click", () => {
        //     document.querySelector("#settings-streaming-prefs").scrollIntoView();
        //     Settings.activeSection(streamingSection);
        // })
        
        // let shortcutsSection = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(4)');
        // shortcutsSection.addEventListener("click", () => {
        //     document.querySelector("#settings-shortcuts").scrollIntoView();
        //     Settings.activeSection(shortcutsSection);
        // })

        helpers.waitForElm(".side-menu-container-NG17D > div:nth-child(5) > div").then(() => {
            let enhanced = document.getElementById('enhanced');
            let enhancedNav = document.querySelector('.side-menu-container-NG17D > div:nth-child(5) > div');

            enhancedNav.addEventListener("click", () => {
                document.querySelector("#enhanced > div").scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                Settings.activeSection(enhancedNav);
            })
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        Settings.activeSection(enhancedNav);
                    } else {
                        enhancedNav.classList.remove("selected-yhdng");
                    }
                });
            }, { threshold: 0.1 });
        
            observer.observe(enhanced);
        })
    }
    
    public static addApplyThemeFunction() {
        let applyThemeScript = getApplyThemeTemplate();
        let script = document.createElement("script");  
        script.innerHTML = applyThemeScript;
        
        document.body.appendChild(script);
    }
    
    public static async checkForItemUpdates(itemFile: string) {
        this.logger.info('Checking for updates for ' + itemFile);
        let pluginOrTheme:'theme'|'plugin';
        let itemBox = document.getElementsByName(`${itemFile}-box`)[0];
        if(!itemBox) return this.logger.warn(`${itemFile}-box element not found.`);

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
                        this.logger.info(`An update exists for ${pluginOrTheme} (${installedItemMetaData.name}). New version: ${extractedMetaData.version} | Current version: ${installedItemMetaData.version}`);

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