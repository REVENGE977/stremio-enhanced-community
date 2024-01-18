/**
 * @name BetterEpisodeList
 * @description Adds a search bar to search episodes either by name or number, and adds an option to show all episodes in one list.
 * @updateUrl https://raw.githubusercontent.com/REVENGE977/BetterEpisodeList/main/BetterEpisodeList.plugin.js
 * @version 1.0.0
 * @author REVENGE977
 */

//regex pattern for shows and movies urls
const regexPattern = /\/detail\/(series|movie)\/[a-zA-Z0-9]+(?:\/[a-zA-Z0-9]+)?(?:\/tt[0-9]+%3A\d+:\d+)?(?:\/[^\/]+)?\/?$/;

window.addEventListener('popstate', () => {
    console.log("[ BetterEpisodeList ] URL changed: " + window.location.href);
    waitForElm('[name="season"]').then(() => {
        if(regexPattern.test(window.location.href)) {
            console.log("[ BetterEpisodeList ] regex matches!");
            if(document.getElementById("episode-search-field")) document.getElementById("episode-search-field").remove();
            if(document.getElementById("AllEpisodesPlugin")) document.getElementById("AllEpisodesPlugin").remove();
            
            //insert episode search bar
            addSearchBar();

            //insert all option into the season selection
            const seasonSelectMenu = document.getElementsByName("season")[0];
            addAllOption(seasonSelectMenu);

            seasonSelectMenu.addEventListener('change', (e) => {
                let pluginAddedEpisodes = document.getElementsByName("allEpisodesPlugin-episode");

                if (e.target.value === 'all') {
                    console.log('[ BetterEpisodeList ] Option All is selected!');
                    let injector = angular.injector(['ng']);
                    let compile = injector.get('$compile');
                    let container = document.getElementsByClassName('episodes-list')[0];
                    let scope = angular.element(container).scope()

                    scope.$apply(() => {
                        if(pluginAddedEpisodes.length > 0) { 
                            pluginAddedEpisodes.forEach(element => {
                                if(element) element.style.display = "flex";
                            })
                        } else {
                            hideAddedEpisodes();
                            addEpisodesToAll(compile, scope);
                        }
                    });
                } else if (e.target.value != 'all' && pluginAddedEpisodes.length > 0) {
                    console.log("[BetterEpisodeList] Hiding all episodes.")
                    pluginAddedEpisodes.forEach(element => {
                        if(element) element.style.display = "none";
                    })
                }
            });
        }
    })
});

function addSearchBar() {
    let injector = angular.injector(['ng']);
    let compile = injector.get('$compile');

    let heading = document.querySelector(".episodes > .heading");
    let headingScope = angular.element(heading).scope();

    let inputElm = document.createElement('input');
    inputElm.setAttribute("id", "episode-search-field");
    inputElm.setAttribute("tabindex", "-1");
    inputElm.setAttribute("placeholder", "Search episode by name or number");
    inputElm.setAttribute("type", "text");
    inputElm.setAttribute("class", "ng-pristine ng-valid ng-isolate-scope ng-empty ng-touched");
    inputElm.setAttribute("style", `
    width: -webkit-fill-available;
    position: relative;
    margin-top: 5%;`);

    heading.appendChild(inputElm);
    compile(inputElm)(headingScope);

    inputElm.addEventListener("input", () => {
        searchEpisodes(inputElm.value);
    })
}

function addAllOption(seasonSelectMenu) {
    let allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.text = 'All';
    allOption.id = "AllEpisodesPlugin";

    seasonSelectMenu.insertBefore(allOption, seasonSelectMenu.firstChild);

    return seasonSelectMenu;
}

function addEpisodesToAll(compile, scope) {
	const container = document.getElementsByClassName('episodes-list')[0];
	const episodes = scope.info.availableEpisodes || [];

	let episodesCounter = 0;

	episodes.forEach(episode => {	
		let isSpecialEpisode = episode.season == 0;
		if(isSpecialEpisode) return;
		episodesCounter++;

		let childScope = scope.$new();
		
		childScope.libItem = scope.item;
		childScope.metaItem = scope.info;
		childScope.intent = "player";
		childScope.episode = episode;
		
		let li = document.createElement('li');
		
		li.setAttribute('ng-click', `open({ libItem: libItem, metaItem: metaItem, video: episode, intent: "player" })`);
		li.setAttribute('tabindex', '-1');
		li.setAttribute('title', `${episode.name}: Season ${episode.season}, Episode ${episode.number}, AllEpisode: ${episodesCounter}`);
		li.setAttribute("ng-right-click", "!isUpcoming(episode) && contextMenuVideo(item, info, episode, $event)");
		li.setAttribute("name", "allEpisodesPlugin-episode");

		li.innerHTML = `
		<div class="thumbnail">
		  <img stremio-image="::{ url: ${episode.thumbnail} }" data-image="${episode.thumbnail}" loading="lazy" src="${episode.thumbnail}">
		</div>
		<div class="episode-details">
		  <div class="title ng-binding">${episodesCounter}. ${episode.title}</div>
		  <div class="footer">
			<div class="date ng-isolate-scope">${formatTimestamp(episode.released.getTime())}</div>
            <div class="date ng-isolate-scope">Season ${episode.season}, Ep. ${episode.number}</div>
		  </div>
		</div>`;
	  
		container.appendChild(li);
		compile(li)(childScope);
	});
}

function formatTimestamp(timestamp) {
    try {
        const date = new Date(timestamp);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedDate = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        return formattedDate;
    } catch {
        return 'N/A';
    }
}

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function hideAddedEpisodes(){
    const container = document.getElementsByClassName('episodes-list')[0];
	var elements = container.children;
	
	for (var i = 0; i < elements.length; i++) {
		elements[i].style.display = 'none';
	}
}

function searchEpisodes(query) {
    let liElements = document.querySelectorAll('li');
    let allEpisodes = Array.from(liElements).filter((liElement) => {
        return liElement.querySelector('div.episode-details') !== null;
    });

    allEpisodes.forEach((episode) => {
        let titleAttribute = episode.getAttribute('title').toLowerCase();
        if (titleAttribute && titleAttribute.includes(query.toLowerCase())) {
            episode.style.display = 'flex';
        } else {
            episode.style.display = 'none';
        }
    });
}