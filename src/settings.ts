import MetaData from "./metadata"

export class Settings {
    
    public static addSeciton(sectionid:string, title:string, last:Boolean) {
        document.querySelector("#settingsPage > div.sections > nav").innerHTML += `<a href="#settings-${sectionid}" tabindex="-1"><div translate="SETTINGS_NAV_${sectionid}" class="label ng-scope ng-binding">${title}</div></a>`;
        document.querySelector("#settingsPanel").innerHTML += `<hr><section id="${sectionid}" ${last ? "last": ""}><h2 translate="SETTINGS_NAV_${sectionid}" class="ng-scope ng-binding">${title}</h2></section><hr>`
    }

    public static addCategory(title:string, sectionid:string, icon:string) {
        document.getElementById(sectionid).innerHTML += `<div class="category"><div class="title">${icon} ${title}</div></div></div>`
    }

    public static addButton(title:string, id:string, query:string) {
        document.querySelector(query).innerHTML += `<div id="${id}" translate="${title}" tabindex="-1" class="button button-s ng-scope ng-binding">${title}</div>`
    }

    public static addItem(type: "theme" | "plugin", fileName:string, metaData:MetaData) {
        if(type == "theme") {
            document.querySelector(`#enhanced > div:nth-child(2)`).innerHTML += `
            <div class="pure-u-1-4 addon ng-scope installed" name="${fileName}-box">
                <div>
                    <button id="${fileName}" style="float:right; height: 2.5rem;" tabindex="-1" translate="apply" onclick="applyTheme('${fileName}')" class="button-b ng-scope ng-binding" ${localStorage.getItem("currentTheme") == fileName ? "disabled" : ""}>${localStorage.getItem("currentTheme") == fileName ? "Applied" : "Apply"}</button>
                    <button id="${fileName}-update" style="float:right; height: 2.5rem; display:none; color: #f5bf42;" tabindex="-1" translate="update" class="button button-s ng-scope ng-binding">Update</button>
                </div>
                <div class="title ng-binding">${metaData.name}</div>
                <div class="footer">
                    <div class="date ng-isolate-scope"><b>Description:</b> ${metaData.description}</div>
                    <div class="date ng-isolate-scope"><b>Author:</b> ${metaData.author}</div>
                    <div class="date ng-isolate-scope"><b>Version:</b> ${metaData.version}</div>
                    <br/>
                </div>
            </div>`;
        } else if(type == "plugin") {
            let enabledPlugins = JSON.parse(localStorage.getItem("enabledPlugins"));

            document.querySelector(`#enhanced > div:nth-child(3)`).innerHTML += `
            <div class="pure-u-1-4 addon ng-scope" style="margin-top: 1rem;" name="${fileName}-box">
                <div>
                    <button id="${fileName}-update" style="float:right; height: 2.5rem; display:none; color: #f5bf42;" tabindex="-1" translate="update" class="button button-s ng-scope ng-binding">Update</button>
                </div>
                <div class="stremio-checkbox ng-isolate-scope"><div class="option option-toggle"><input style="float:right;" class="plugin" name="${fileName}" type="checkbox" tabindex="-1" ${enabledPlugins.includes(fileName) ? "checked=\"checked\"" : ""}></div>
                <div class="title ng-binding">${metaData.name}</div>
                <div class="footer">
                    <div class="date ng-isolate-scope"><b>Description:</b> ${metaData.description}</div>
                    <div class="date ng-isolate-scope"><b>Author:</b> ${metaData.author}</div>
                    <div class="date ng-isolate-scope"><b>Version:</b> ${metaData.version}</div>
                    <br/>
                </div>
            </div>`;
        }
    }

    public static removeItem(fileName:string) {
        document.getElementsByName(`${fileName}-box`)[0].remove();
    }

    public static activeSection(element:Element) {
        for (let i = 0; i < 6; i++) {
            try {
                document.querySelector("#settingsPage > div.sections > nav > a:nth-child(" + i + ")").classList.remove("active"); 
            }catch {}
        }

        element.classList.add("active");
    }
}