document.addEventListener("keyup", (e) => {
    if(e.key == "/") {
        console.log("[ SLASHTOSEARCH ] slash pressed, focusing searchbar.")
        document.getElementById("global-search-field").focus();
    }
})