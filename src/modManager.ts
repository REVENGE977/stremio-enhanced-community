import { Settings } from "./settings";
import { readFileSync } from "fs";
import { exec } from "child_process";
import properties from "./properties"

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
        
        console.log(`[ INFO ] plugin ${pluginName} loaded !`);
    }
    
    static unloadPlugin(pluginName:string) {
        document.getElementById(pluginName).remove();
        
        let enabledPlugins = JSON.parse(localStorage.getItem("enabledPlugins"));
        enabledPlugins = enabledPlugins.filter((x:string) => x !== pluginName);
        localStorage.setItem("enabledPlugins", JSON.stringify(enabledPlugins));
        
        console.log(`[ INFO ] plugin ${pluginName} unloaded !`);
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
                    document.querySelector("#enhanced > div:nth-child(3)").innerHTML += `<p style="color: white;">Reload is required to disable plugins. Press F5 to reload.</p>`
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
        
    public static handleScroll(): void {
        console.log("handling scroll")
        document.addEventListener("scroll", () => {
            let generalSection:HTMLElement = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(1)');
            let playerSection:HTMLElement = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(2)');
            let streamingSection:HTMLElement = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(3)');
            let shortcutsSection:HTMLElement = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(4)');
            //let enhancedSection:HTMLElement = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(5)');
            
            if (window.scrollY >= generalSection.getBoundingClientRect().top) {
                Settings.activeSection(generalSection);
            } 
            
            if (window.scrollY >= playerSection.getBoundingClientRect().top) {
                Settings.activeSection(playerSection);
            } 
            
            if (window.scrollY >= streamingSection.getBoundingClientRect().top) {
                Settings.activeSection(streamingSection);
            } 
            
            if (window.scrollY >= shortcutsSection.getBoundingClientRect().top) {
                Settings.activeSection(shortcutsSection);
            } 
            
            // if (this.isElementInViewport(enhancedSection)) {
            //     Settings.activeSection(enhancedSection);
            // } 
        });
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
            let link = document.querySelector("${properties.themeLinkSelector}");
            if(theme != "Default") {
                link.setAttribute("href", \`http://localhost:3000/themes/\${theme}\`);
            } else link.setAttribute("href", \`${properties.defaultThemeFileName}\`);
            
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
    
    static checkForItemUpdates() {
        
    }
}
    
    export default ModManager;