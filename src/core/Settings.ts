import Helpers from "../utils/Helpers";
import MetaData from "../interfaces/MetaData"
import { getPluginItemTemplate } from "../components/plugin-item/pluginItem";
import { getThemeItemTemplate } from "../components/theme-item/themeItem";
import { getEnhancedNav } from "../components/enhanced-nav/enhancedNav";
import { getLogger } from "../utils/logger";
import ModManager from "./ModManager";

class Settings {
    private static logger = getLogger("Settings");

    public static addSection(sectionid:string, title:string) {
        Helpers.waitForElm(`[class^="sections-container-"]`).then(() => {
            this.logger.info("Adding section: " + sectionid + " with title: " + title);
            // add section to settings panel
            const settingsPanel = document.querySelector(`[class^="sections-container-"]`);

            const sectionClassName = document.querySelector(`[class^="section-container-"]`).className;
            const titleClassName = document.querySelector(`[class^="section-title-"]`).className;

            const sectionContainer = document.createElement("div");
            sectionContainer.className = sectionClassName;
            sectionContainer.id = sectionid;

            const sectionTitle = document.createElement("div");
            sectionTitle.className = titleClassName;
            sectionTitle.textContent = title;

            sectionContainer.appendChild(sectionTitle);

            settingsPanel.appendChild(sectionContainer);

            // add section to nav
            Helpers.waitForElm(`[class^="side-menu-container-"]`).then(() => {
                const nav = document.querySelector(`[class^="side-menu-container-"]`);
                const shortcutsNav = document.querySelector('[title="Shortcuts"]');

                const enhancedNavContainer = document.createElement("div");
                enhancedNavContainer.innerHTML = getEnhancedNav();
                
                nav.insertBefore(enhancedNavContainer, shortcutsNav.nextSibling);
            });
        })
    }

    public static addCategory(title:string, sectionid:string, icon:string) {
        Helpers.waitForElm(`[class^="section-container-"]`).then(() => {
            this.logger.info("Adding category: " + title + " to section: " + sectionid);
            const containerClass = document.querySelector(`[class^="section-container-"]`).className;
            const categoryClass = document.querySelector(`[class^="section-category-container-"]`).className;
            const categoryTitleClass = document.querySelector(`[class^="section-category-container-"] > [class^="label-"]`).className;
            let categoryIconClass:any = document.querySelector(`[class^="section-category-container-"] > [class^="icon-"]`);

            if (categoryIconClass instanceof SVGElement) {
                categoryIconClass = categoryIconClass.className.baseVal;
            } else if (categoryIconClass) {
                categoryIconClass = categoryIconClass.className;
            }

            
            icon = icon.replace(`class="icon"`, `class="${categoryIconClass}"`);

            const section = document.getElementById(sectionid);

            const containerDiv = document.createElement("div");
            containerDiv.classList.add(containerClass);

            const categoryDiv = document.createElement("div");
            categoryDiv.classList.add(categoryClass);
            
            const titleDiv = document.createElement("div");
            titleDiv.classList.add(categoryTitleClass);
            titleDiv.innerHTML = title;

            categoryDiv.innerHTML += icon;
            
            categoryDiv.appendChild(titleDiv);
            containerDiv.appendChild(categoryDiv);
            section.appendChild(containerDiv);
        })
    }

    public static addButton(title:string, id:string, query:string) {
        Helpers.waitForElm(query).then(() => {
            const element = document.querySelector(query);

            const outerDiv = document.createElement("div");
            outerDiv.classList.add("option-container-EGlcv");

            const anchor = document.createElement("a");
            anchor.setAttribute("tabindex", "0");
            anchor.setAttribute("title", title);
            anchor.classList.add("option-input-container-NPgpT", "button-container-ENMae", "button-container-zVLH6");
            anchor.id = id;
            
            const innerDiv = document.createElement("div");
            innerDiv.classList.add("label-FFamJ");
            innerDiv.textContent = title;

            anchor.appendChild(innerDiv);

            outerDiv.appendChild(anchor);

            element.appendChild(outerDiv);
        })
    }

    public static addItem(type: "theme" | "plugin", fileName:string, metaData:MetaData) {
        // let addonClasses = this.getAddonClasses().replace(/\./g, "").trim();

        this.logger.info("Adding " + type + ": " + fileName);
        if (type == "theme") {
            Helpers.waitForElm('#enhanced > div:nth-child(2)').then(() => {
                this.addTheme(fileName, metaData);
            })
        } else if (type == "plugin") {
            Helpers.waitForElm('#enhanced > div:nth-child(3)').then(() => {
                this.addPlugin(fileName, metaData);
            })
        }        
    }

    private static addPlugin(fileName:string, metaData:{name:string, description:string, author:string, version:string}) {
        let enabledPlugins = JSON.parse(localStorage.getItem("enabledPlugins"));

        const pluginContainer = document.createElement("div");
        pluginContainer.innerHTML = getPluginItemTemplate(fileName, metaData, enabledPlugins.includes(fileName));
        pluginContainer.setAttribute("name", `${fileName}-box`);

        document.querySelector(`#enhanced > div:nth-child(3)`).appendChild(pluginContainer);
        ModManager.checkForItemUpdates(fileName);
    }

    private static addTheme(fileName:string, metaData:{name:string, description:string, author:string, version:string}) {
        let currentTheme = localStorage.getItem("currentTheme");

        const themeContainer = document.createElement("div");
        themeContainer.innerHTML = getThemeItemTemplate(fileName, metaData, currentTheme == fileName);
        themeContainer.setAttribute("name", `${fileName}-box`);

        document.querySelector(`#enhanced > div:nth-child(2)`).appendChild(themeContainer);
        ModManager.checkForItemUpdates(fileName);
    }

    public static removeItem(fileName:string) {
        document.getElementsByName(`${fileName}-box`)[0].remove();
    }

    public static activeSection(element:Element) {
        for (let i = 0; i < 6; i++) {
            try {
                document.querySelector(`.side-menu-container-NG17D > div:nth-child(${i})`).classList.remove("selected-yhdng"); 
            }catch {}
        }

        element.classList.add("selected-yhdng");
    }
}

export default Settings;