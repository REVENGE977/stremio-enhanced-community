function applyTheme(theme) {
    console.log("applying " + theme);
    
    const activeThemeElement = document.getElementById("activeTheme");
    if (activeThemeElement) {
        activeThemeElement.remove();
    }

    if (theme !== "Default") {      
        const themeElement = document.createElement("link");
        themeElement.id = "activeTheme";
        themeElement.rel = "stylesheet";
        themeElement.href = `{{ themesPath }}\\\\${theme}`;

        document.head.appendChild(themeElement);
    }

    const currentTheme = localStorage.getItem("currentTheme");
    if (currentTheme) {
        console.log("disabling " + currentTheme + " CURRENTTHEME");

        const currentThemeElement = document.getElementById(currentTheme);
        if (currentThemeElement) {
            currentThemeElement.classList.remove("disabled");

            if (currentTheme !== "Default") {
                currentThemeElement.classList.remove("uninstall-button-container-oV4Yo");
                currentThemeElement.classList.add("install-button-container-yfcq5");   
            } else {
                currentThemeElement.style.backgroundColor = "var(--secondary-accent-color)";
            }

            currentThemeElement.firstElementChild.innerText = "Apply";
        }
    }

    localStorage.setItem("currentTheme", theme);
    console.log("disabling " + theme + " NEWTHEME");

    const newThemeElement = document.getElementById(theme);
    if (newThemeElement) {
        newThemeElement.classList.add("disabled");

        if (theme !== "Default") {
            newThemeElement.classList.remove("install-button-container-yfcq5");
            newThemeElement.classList.add("uninstall-button-container-oV4Yo");
        } else {
            newThemeElement.style.backgroundColor = "var(--overlay-color)";
        }

        newThemeElement.firstElementChild.innerText = "Applied";
    }

    console.log(`${theme} applied!`);
}