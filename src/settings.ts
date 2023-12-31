class settings {
    public static addSeciton(sectionid:string, title:string, last:Boolean) {
        document.querySelector("#settingsPage > div.sections > nav").innerHTML += `<a href="#settings-${sectionid}" tabindex="-1"><div translate="SETTINGS_NAV_${sectionid}" class="label ng-scope ng-binding">${title}</div></a>`;
        document.querySelector("#settingsPanel").innerHTML += `<hr><section id="${sectionid}" ${last ? "last": ""}><h2 translate="SETTINGS_NAV_${sectionid}" class="ng-scope ng-binding">${title}</h2></section><hr>`
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
        for (let i = 0; i < 6; i++) {
            try {
                document.querySelector("#settingsPage > div.sections > nav > a:nth-child(" + i + ")").classList.remove("active"); 
            }catch {}
        }

        element.classList.add("active");
    }
}

export default settings;