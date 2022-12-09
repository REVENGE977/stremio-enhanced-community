import * as electron from "electron";
import { exec } from "child_process";
import { readdirSync, readFileSync } from "original-fs";

/*
    angular.element($0).scope().episodesBySeason(angular.element($0).scope().info, seasonNumber)
    use thie line of code to grab episodes for a certain season in a show.

    angular.element($0).scope().info.getSeasons()
    to get an array of available seasons.
*/

window.addEventListener("DOMContentLoaded", () => {   
    settings.waitForElm('#toast-container > div > div > button').then((elm) => {
        document.querySelector<HTMLElement>('#toast-container > div > div > button').click();
    })

    if(localStorage.getItem("currentTheme") != null) {
        let link = document.querySelector("head > link:nth-child(22)");
        link.setAttribute("href", `http://localhost:3000/themes/${localStorage.getItem("currentTheme")}`);
    }

    let pluginsToLoad = readdirSync(`${process.env.APPDATA}\\stremio-enhanced\\plugins`).filter((fileName) => { return fileName.endsWith(".plugin.js") });
    pluginsToLoad.forEach(plugin => {
        loadPlugin(plugin);
    })
    
	let settingsBtn = document.querySelector("#user-panel > div:nth-child(3) > div:nth-child(1)");
	settingsBtn.addEventListener("click", e => {
		settings.waitForElm('#settingsPage > div.sections > nav').then((elm) => {
            addApplyThemeFunction();
            let themesList = readdirSync(`${process.env.APPDATA}\\stremio-enhanced\\themes`).filter((fileName) => { return fileName.endsWith(".theme.css") })
            let pluginsList = readdirSync(`${process.env.APPDATA}\\stremio-enhanced\\plugins`).filter((fileName) => { return fileName.endsWith(".plugin.js") })

            settings.addIcon("\E9B0", "ias-icon-colors");
            settings.addSeciton("enhanced", "Stremio Enhanced");
            settings.addCategory("Themes", "enhanced", "ias-icon-colors");
            settings.addCategory("Plugins", "enhanced", "ias-icon-colors");
            settings.addCategory("About", "enhanced", "ias-icon-colors");

            settings.addButton("Open Themes Folder", "openthemesfolderBtn", "#enhanced > div:nth-child(2)");
            settings.addButton("Open Plugins Folder", "openpluginsfolderBtn", "#enhanced > div:nth-child(3)");
            document.querySelector("#enhanced > div:nth-child(4)").innerHTML += `<h4>Developed By: <p style="display: inline !important;"><a href="https://github.com/REVENGE977">REVENGE977</a></p><br>Version: v0.1</h4>`

            themesList.forEach(theme => {
                document.querySelector("#enhanced > div:nth-child(2)").innerHTML += `<div class="option custom-space"><div class="setting"><label translate="THEME" class="ng-scope ng-binding">${theme}</label><div class="ro-copy-text-container"><button id="${theme}" tabindex="-1" translate="apply" onclick="applyTheme('${theme}')" class="button-b ng-scope ng-binding" ${localStorage.getItem("currentTheme") == theme ? "disabled" : ""}>${localStorage.getItem("currentTheme") == theme ? "Applied" : "Apply"}</button></div></div></div>`
            })

            pluginsList.forEach(plugin => {
                document.querySelector("#enhanced > div:nth-child(3)").innerHTML += `<div class="option custom-space"><div class="setting"><label translate="PLUGIN" class="ng-scope ng-binding">${plugin}</label><div class="ro-copy-text-container"></div></div></div>`
            })

            scrollToEnhanced();
            openThemesFolder();
            openPluginsFolder();
		});
	})
})

function loadPlugin(pluginName:string) {
    let plugin = readFileSync(`${process.env.APPDATA}\\stremio-enhanced\\plugins\\${pluginName}`, "utf-8");
    let script = document.createElement("script");
    script.innerHTML = plugin
    script.id = pluginName

    document.body.appendChild(script);
    console.log(`[ INFO ] plugin ${pluginName} loaded !`);
}

function addApplyThemeFunction() {
    let script = document.createElement("script");
    script.innerHTML = 
    `function applyTheme(theme) {
        let link = document.querySelector("head > link:nth-child(22)");
        link.setAttribute("href", \`http://localhost:3000/themes/\${theme}\`);

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

function scrollToEnhanced() {
    let sectionElement = document.querySelector('#settingsPage > div.sections > nav > a:nth-child(5)');
    sectionElement.addEventListener("click", () => {
        document.querySelector("#enhanced > h2").scrollIntoView();
        settings.activeSection(sectionElement);
    })
}

class settings {
    public static addSeciton(sectionid:string, title:string) {
        document.querySelector("#settingsPage > div.sections > nav").innerHTML += `<a href="#settings-${sectionid}" tabindex="-1" translate="SETTINGS_NAV_${sectionid}" class="ng-scope ng-binding">${title}</a>`;
        document.querySelector("#settingsPanel").innerHTML += `<hr><section id="${sectionid}"><h2 translate="SETTINGS_NAV_${sectionid}" class="ng-scope ng-binding">${title}</h2></section><hr>`
    }

    public static addCategory(title:string, sectionid:string, icon:string) {
        document.getElementById(sectionid).innerHTML += `<div class="category"><div class="title"><div class="icon"></div>${title}</div></div>`
    }

    public static addButton(title:string, id:string, query:string) {
        document.querySelector(query).innerHTML += `<div id="${id}" translate="${title}" tabindex="-1" class="button button-s ng-scope ng-binding">${title}</div>`
    }

    public static addIcon(icon:string, classname:string) {
        let style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `.${classname}:before {
            content: ${icon};
        }`;
    }

    public static waitForElm(selector:string) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) return resolve(document.querySelector(selector));
    
            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector));
                    observer.disconnect();
                }
            });
    
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    public static activeSection(element:Element) {
        for (let i = 0; i < 5; i++) {
            try {
                document.querySelector("#settingsPage > div.sections > nav > a:nth-child(" + i + ")").classList.remove("active"); 
            }catch {}
        }

        element.classList.add("active");
    }
}