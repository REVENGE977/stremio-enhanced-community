import MetaData from "../interfaces/MetaData"

class Settings {
    public static addSection(sectionid:string, title:string, last:Boolean) {
        // add section to settings panel
        const settingsPanel = document.querySelector("#settingsPanel");
        
        const hr1 = document.createElement("hr");
        const section = document.createElement("section");
        section.id = sectionid;
        if (last) section.classList.add("last");
        
        const h2 = document.createElement("h2");
        h2.setAttribute("translate", `SETTINGS_NAV_${sectionid}`);
        h2.classList.add("ng-scope", "ng-binding");
        h2.textContent = title;
        
        section.appendChild(h2);
        settingsPanel.appendChild(hr1);
        settingsPanel.appendChild(section);
        const hr2 = document.createElement("hr");
        settingsPanel.appendChild(hr2);
        
        // add section to nav
        const nav = document.querySelector("#settingsPage > div.sections > nav");

        const a = document.createElement("a");
        a.href = `#settings-${sectionid}`;
        a.tabIndex = -1;
        
        const div = document.createElement("div");
        div.setAttribute("translate", `SETTINGS_NAV_${sectionid}`);
        div.classList.add("label", "ng-scope", "ng-binding", "last");
        div.textContent = title;
        
        a.appendChild(div);
        nav.appendChild(a);  
    }

    public static addCategory(title:string, sectionid:string, icon:string) {
        const section = document.getElementById(sectionid);

        const categoryDiv = document.createElement("div");
        categoryDiv.classList.add("category");
        
        const titleDiv = document.createElement("div");
        titleDiv.classList.add("title");
        titleDiv.innerHTML = `${icon} ${title}`;
        
        categoryDiv.appendChild(titleDiv);
        section.appendChild(categoryDiv);
    }

    public static addButton(title:string, id:string, query:string) {
        const element = document.querySelector(query);

        const buttonDiv = document.createElement("div");
        buttonDiv.id = id;
        buttonDiv.setAttribute("translate", title);
        buttonDiv.tabIndex = -1;
        buttonDiv.classList.add("button", "button-s", "ng-scope", "ng-binding");
        buttonDiv.textContent = title;
        
        element.appendChild(buttonDiv);        
    }

    public static addItem(type: "theme" | "plugin", fileName:string, metaData:MetaData) {
        if (type == "theme") {
            const container = document.querySelector(`#enhanced > div:nth-child(2)`);
            
            const addonDiv = document.createElement("div");
            addonDiv.classList.add("pure-u-1-4", "addon", "ng-scope", "installed");
            addonDiv.setAttribute("name", `${fileName}-box`);
        
            const buttonDiv = document.createElement("div");
        
            const applyButton = document.createElement("button");
            applyButton.id = fileName;
            applyButton.style.cssText = "float:right; height: 2.5rem;";
            applyButton.tabIndex = -1;
            applyButton.setAttribute("translate", "apply");
            applyButton.classList.add("button-b", "ng-scope", "ng-binding");
            applyButton.textContent = (localStorage.getItem("currentTheme") == fileName ? "Applied" : "Apply");
            applyButton.disabled = localStorage.getItem("currentTheme") == fileName;
            applyButton.setAttribute("onclick", `applyTheme('${fileName}')`);
        
            const updateButton = document.createElement("button");
            updateButton.id = `${fileName}-update`;
            updateButton.style.cssText = "float:right; height: 2.5rem; display:none; color: #f5bf42;";
            updateButton.tabIndex = -1;
            updateButton.setAttribute("translate", "update");
            updateButton.classList.add("button", "button-s", "ng-scope", "ng-binding");
            updateButton.textContent = "Update";
        
            buttonDiv.appendChild(applyButton);
            buttonDiv.appendChild(updateButton);
        
            const titleDiv = document.createElement("div");
            titleDiv.classList.add("title", "ng-binding");
            titleDiv.textContent = metaData.name;
        
            const footerDiv = document.createElement("div");
            footerDiv.classList.add("footer");
        
            const descriptionDiv = document.createElement("div");
            descriptionDiv.classList.add("date", "ng-isolate-scope");
            descriptionDiv.innerHTML = `<b>Description:</b> ${metaData.description}`;
        
            const authorDiv = document.createElement("div");
            authorDiv.classList.add("date", "ng-isolate-scope");
            authorDiv.innerHTML = `<b>Author:</b> ${metaData.author}`;
        
            const versionDiv = document.createElement("div");
            versionDiv.classList.add("date", "ng-isolate-scope");
            versionDiv.innerHTML = `<b>Version:</b> ${metaData.version}`;
        
            footerDiv.appendChild(descriptionDiv);
            footerDiv.appendChild(authorDiv);
            footerDiv.appendChild(versionDiv);
            footerDiv.appendChild(document.createElement("br"));
        
            addonDiv.appendChild(buttonDiv);
            addonDiv.appendChild(titleDiv);
            addonDiv.appendChild(footerDiv);
            
            container.appendChild(addonDiv);
        } else if (type == "plugin") {
            let enabledPlugins = JSON.parse(localStorage.getItem("enabledPlugins"));
        
            const container = document.querySelector(`#enhanced > div:nth-child(3)`);
        
            const addonDiv = document.createElement("div");
            addonDiv.classList.add("pure-u-1-4", "addon", "ng-scope");
            addonDiv.style.marginTop = "1rem";
            addonDiv.setAttribute("name", `${fileName}-box`);
        
            const buttonDiv = document.createElement("div");
        
            const updateButton = document.createElement("button");
            updateButton.id = `${fileName}-update`;
            updateButton.style.cssText = "float:right; height: 2.5rem; display:none; color: #f5bf42;";
            updateButton.tabIndex = -1;
            updateButton.setAttribute("translate", "update");
            updateButton.classList.add("button", "button-s", "ng-scope", "ng-binding");
            updateButton.textContent = "Update";
        
            buttonDiv.appendChild(updateButton);
        
            const checkboxDiv = document.createElement("div");
            checkboxDiv.classList.add("stremio-checkbox", "ng-isolate-scope");
        
            const optionDiv = document.createElement("div");
            optionDiv.classList.add("option", "option-toggle");
        
            const checkbox = document.createElement("input");
            checkbox.style.cssText = "float:right;";
            checkbox.classList.add("plugin");
            checkbox.name = fileName;
            checkbox.type = "checkbox";
            checkbox.tabIndex = -1;
            checkbox.checked = enabledPlugins.includes(fileName);
        
            optionDiv.appendChild(checkbox);
            checkboxDiv.appendChild(optionDiv);
        
            const titleDiv = document.createElement("div");
            titleDiv.classList.add("title", "ng-binding");
            titleDiv.textContent = metaData.name;
        
            const footerDiv = document.createElement("div");
            footerDiv.classList.add("footer");
        
            const descriptionDiv = document.createElement("div");
            descriptionDiv.classList.add("date", "ng-isolate-scope");
            descriptionDiv.innerHTML = `<b>Description:</b> ${metaData.description}`;
        
            const authorDiv = document.createElement("div");
            authorDiv.classList.add("date", "ng-isolate-scope");
            authorDiv.innerHTML = `<b>Author:</b> ${metaData.author}`;
        
            const versionDiv = document.createElement("div");
            versionDiv.classList.add("date", "ng-isolate-scope");
            versionDiv.innerHTML = `<b>Version:</b> ${metaData.version}`;
        
            footerDiv.appendChild(descriptionDiv);
            footerDiv.appendChild(authorDiv);
            footerDiv.appendChild(versionDiv);
            footerDiv.appendChild(document.createElement("br"));
        
            addonDiv.appendChild(buttonDiv);
            addonDiv.appendChild(checkboxDiv);
            addonDiv.appendChild(titleDiv);
            addonDiv.appendChild(footerDiv);
        
            container.appendChild(addonDiv);
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

export default Settings;