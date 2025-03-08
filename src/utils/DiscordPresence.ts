import DiscordRPC from 'discord-rpc';
import logger from './logger';
import Helpers from './Helpers';
import { ipcRenderer } from "electron";

class DiscordPresence {
    private static rpc:DiscordRPC.Client;
    public static started:boolean = false;
    public static start() {
        try {
            const clientId = '1200186750727893164';
            DiscordRPC.register(clientId);
            
            this.rpc = new DiscordRPC.Client({ transport: 'ipc' });
            this.rpc.on('ready', () => {
                logger.info('Connected to DiscordRPC.');
                this.updateActivity({
                    details: "Home",
                    largeImageKey: '1024stremio',
                    largeImageText: 'Stremio',
                    smallImageKey: "menuburger",
                    smallImageText: "Main Menu",
                    instance: false,
                })
            });
            
            this.started = true;
            this.rpc.login({ clientId }).catch(() => logger.error("Failed to connect to DiscordRPC, maybe Discord isn't running."));
        }catch(_) {}
    }
    
    public static updateActivity(newActivity: DiscordRPC.Presence) {
        try {
            setTimeout(() => {
                this.rpc.setActivity(newActivity);                
            }, 5000);
        }catch(_) {}
    }
    
    public static stop() {
        logger.info('Clearing DiscordRPC.');
        this.rpc.clearActivity();
        this.started = false;
    }
    
    public static async discordRPCHandler() {
        window.addEventListener('popstate', () => {
            this.checkWatching();
            this.checkExploring();
            this.checkMainMenu();
        });
    }
    
    private static checkWatching() {
        if(location.href.includes('#/player/')) {
            Helpers.waitForTitleChange().then(() => {
                const episodeSeasonRegex = /\((\d+)x(\d+)\)/;
                
                let playingStream = document.title.split('Stremio - ')[1];
                const episodeSeason = episodeSeasonRegex.exec(playingStream);
                
                let showNameRegex = /^([^\-]+)/;
                let showName = showNameRegex.exec(playingStream)[0].trim();
                let video = document.getElementById("videoPlayer") as HTMLVideoElement;
                let videoScope = window.angular.element(video).scope() as any;
                let mediaType = videoScope.info.type;
                
                showName = videoScope.info.name;
                let showPoster = videoScope.info.poster;
                
                const handlePlaying = () => {
                    let startTimestamp = Math.floor(Date.now() / 1000) - Math.floor(video.currentTime);
                    let endTimestamp = startTimestamp + Math.floor(video.duration);

                    if(mediaType == "series") {
                        ipcRenderer.send("discordrpc-update", { 
                            details: `${showName} (S${episodeSeason[1]}E${episodeSeason[2]})`, 
                            state: 'Watching', 
                            startTimestamp,
                            endTimestamp,
                            largeImageKey: showPoster ?? "1024stremio",
                            largeImageText: "Stremio Enhanced",
                            smallImageKey: "play",
                            smallImageText: "Playing..",
                            instance: false
                        }); 
                    } else if(mediaType == "movie") {
                        ipcRenderer.send("discordrpc-update", { 
                            details: showName, 
                            state: 'Watching',
                            startTimestamp,
                            endTimestamp,
                            largeImageKey: showPoster ?? "1024stremio",
                            largeImageText: "Stremio Enhanced",
                            smallImageKey: "play",
                            smallImageText: "Playing..",
                            instance: false
                        }); 
                    }
                };
                
                const handlePausing = () => {
                    if(mediaType == "series") {
                        ipcRenderer.send("discordrpc-update", { 
                            details: `${showName} (S${episodeSeason[1]}E${episodeSeason[2]})`, 
                            state: `Paused at ${Helpers.formatTime(video.currentTime)}`, 
                            largeImageKey: showPoster,
                            largeImageText: "Stremio Enhanced",
                            smallImageKey: "pause",
                            smallImageText: "Paused",
                            instance: false
                        }); 
                    } else if(mediaType == "movie") {
                        ipcRenderer.send("discordrpc-update", { 
                            details: showName,
                            state: `Paused at ${Helpers.formatTime(video.currentTime)}`, 
                            largeImageKey: showPoster ?? "1024stremio",
                            largeImageText: "Stremio Enhanced",
                            smallImageKey: "pause",
                            smallImageText: "Paused",
                            instance: false
                        }); 
                    }
                }
                
                video.addEventListener('playing', handlePlaying);
                video.addEventListener('pause', handlePausing);
                video.play();
            })
        }
    }
    
    private static checkExploring() {
        if(location.href.includes("#/detail/")) {
            let detailElm = document.getElementById("board") as HTMLDivElement;
            let detailScope = window.angular.element(detailElm).scope() as any;
            let mediaType = detailScope.info.type;
            
            if(mediaType == "series") {
                Helpers.waitForElm("select[name='season']").then(() => {
                    let showName = detailScope.info.name;
                    let showPoster = detailScope.info.poster;
                    
                    const seasonSelectMenu = document.getElementsByName("season")[0] as HTMLSelectElement;
                    
                    ipcRenderer.send("discordrpc-update", { 
                        details: `${showName} ${seasonSelectMenu.value == "all" ? "" : `(S${seasonSelectMenu.value})`}`,
                        state: 'Exploring',
                        largeImageKey: showPoster ?? "1024stremio",
                        largeImageText: "Stremio Enhanced",
                        smallImageKey: "menuburger",
                        smallImageText: "Main Menu",
                        instance: false
                    });
                    
                    seasonSelectMenu.addEventListener('change', (e:any) => {
                        ipcRenderer.send("discordrpc-update", { 
                            details: `${showName} ${seasonSelectMenu.value == "all" ? "" : `(S${seasonSelectMenu.value})`}`,
                            state: 'Exploring',
                            largeImageKey: showPoster ?? "1024stremio",
                            largeImageText: "Stremio Enhanced",
                            smallImageKey: "menuburger",
                            smallImageText: "Main Menu",
                            instance: false
                        });
                    });
                })
            } else if(mediaType == "movie") {
                let moviePoster = detailScope.info.poster;
                let movieName = detailScope.info.name;
                
                ipcRenderer.send("discordrpc-update", { 
                    details: movieName,
                    state: 'Exploring',
                    largeImageKey: moviePoster ?? "1024stremio",
                    largeImageText: "Stremio Enhanced",
                    smallImageKey: "menuburger",
                    smallImageText: "Main Menu",
                    instance: false
                });
            }
        }
    }
    
    private static checkMainMenu() {
        if(location.href.endsWith("#/")) {
            ipcRenderer.send("discordrpc-update", { 
                details: "Home", 
                largeImageKey: "1024stremio",
                largeImageText: "Stremio Enhanced",
                smallImageKey: "menuburger",
                smallImageText: "Main Menu",
                instance: false
            });
        }
        
        if(location.href.includes("#/discover/")) {
            ipcRenderer.send("discordrpc-update", { 
                details: "Discover", 
                largeImageKey: "1024stremio",
                largeImageText: "Stremio Enhanced",
                smallImageKey: "menuburger",
                smallImageText: "Main Menu",
                instance: false
            });
        }
        
        if(location.href.includes("#/library/")) {
            ipcRenderer.send("discordrpc-update", { 
                details: "Library", 
                largeImageKey: "1024stremio",
                largeImageText: "Stremio Enhanced",
                smallImageKey: "menuburger",
                smallImageText: "Main Menu",
                instance: false
            });
        }
        
        if(location.href.includes("#/calendar")) {
            ipcRenderer.send("discordrpc-update", { 
                details: "Calender", 
                largeImageKey: "1024stremio",
                largeImageText: "Stremio Enhanced",
                smallImageKey: "menuburger",
                smallImageText: "Main Menu",
                instance: false
            });
        }
        
        if(location.href.includes("#/addons/")) {
            ipcRenderer.send("discordrpc-update", { 
                details: "Addons", 
                largeImageKey: "1024stremio",
                largeImageText: "Stremio Enhanced",
                smallImageKey: "menuburger",
                smallImageText: "Main Menu",
                instance: false
            });
        }
        
        if(location.href.includes("#/settings")) {
            ipcRenderer.send("discordrpc-update", { 
                details: "Settings", 
                largeImageKey: "1024stremio",
                largeImageText: "Stremio Enhanced",
                smallImageKey: "menuburger",
                smallImageText: "Main Menu",
                instance: false
            });
        }
    }
}

export default DiscordPresence;