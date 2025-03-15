import DiscordRPC from 'discord-rpc';
import { getLogger } from './logger';
import Helpers from './Helpers';
import { ipcRenderer } from "electron";

class DiscordPresence {
    private static logger = getLogger("DiscordPresence");
    private static rpc:DiscordRPC.Client;
    public static started:boolean = false;
    public static start() {
        try {
            const clientId = '1200186750727893164';
            DiscordRPC.register(clientId);
            
            this.rpc = new DiscordRPC.Client({ transport: 'ipc' });
            this.rpc.on('ready', () => {
                this.logger.info('Connected to DiscordRPC.');
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
            this.rpc.login({ clientId }).catch(() => this.logger.error("Failed to connect to DiscordRPC, maybe Discord isn't running."));
        }catch(_) {}
    }
    
    public static updateActivity(newActivity: DiscordRPC.Presence) {
        try {
            this.rpc.setActivity(newActivity);                
        }catch(_) {}
    }
    
    public static stop() {
        this.logger.info('Clearing DiscordRPC.');
        this.rpc.clearActivity();
        this.rpc.destroy();
        this.started = false;
    }
    
    public static async discordRPCHandler() {
        const handleNavigation = () => {            
            this.checkWatching();
            this.checkExploring();
            this.checkMainMenu();
        };

        window.addEventListener('hashchange', handleNavigation);
    }
    
    private static async checkWatching() {
        if(location.href.includes('#/player')) {
            Helpers.waitForElm('video').then(async () => {
                let video = document.getElementsByTagName('video')[0] as HTMLVideoElement;
                
                const metaDetails = await this.getMetaDetails();
                
                let mediaType = metaDetails.type;
                this.logger.info("Updating activity to Watching.");

                let mediaName = metaDetails.name;
                let mediaPoster = metaDetails.poster;
                
                const handlePlaying = async () => {
                    let startTimestamp = Math.floor(Date.now() / 1000) - Math.floor(video.currentTime);
                    let endTimestamp = startTimestamp + Math.floor(video.duration);
                    
                    if(mediaType == "series") {
                        let seriesInfoDetails = (await this.getPlayerState()).seriesInfoDetails;
                        let episode = seriesInfoDetails.episode;
                        let season = seriesInfoDetails.season; 

                        ipcRenderer.send("discordrpc-update", { 
                            details: `${mediaName} (S${season}E${episode})`, 
                            state: 'Watching', 
                            startTimestamp,
                            endTimestamp,
                            largeImageKey: mediaPoster ?? "1024stremio",
                            largeImageText: "Stremio Enhanced",
                            smallImageKey: "play",
                            smallImageText: "Playing..",
                            instance: false
                        }); 
                    } else if(mediaType == "movie") {
                        ipcRenderer.send("discordrpc-update", { 
                            details: mediaName, 
                            state: 'Watching',
                            startTimestamp,
                            endTimestamp,
                            largeImageKey: mediaPoster ?? "1024stremio",
                            largeImageText: "Stremio Enhanced",
                            smallImageKey: "play",
                            smallImageText: "Playing..",
                            instance: false
                        }); 
                    }
                };
                
                const handlePausing = async () => {
                    if(mediaType == "series") {
                        let seriesInfoDetails = (await this.getPlayerState()).seriesInfoDetails;
                        let episode = seriesInfoDetails.episode;
                        let season = seriesInfoDetails.season; 

                        ipcRenderer.send("discordrpc-update", { 
                            details: `${mediaName} (S${season}E${episode})`, 
                            state: `Paused at ${Helpers.formatTime(video.currentTime)}`, 
                            largeImageKey: mediaPoster,
                            largeImageText: "Stremio Enhanced",
                            smallImageKey: "pause",
                            smallImageText: "Paused",
                            instance: false
                        }); 
                    } else if(mediaType == "movie") {
                        ipcRenderer.send("discordrpc-update", { 
                            details: mediaName,
                            state: `Paused at ${Helpers.formatTime(video.currentTime)}`, 
                            largeImageKey: mediaPoster ?? "1024stremio",
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
        if(location.href.includes("#/detail")) {
            Helpers.waitForElm('.metadetails-container-K_Dqa').then(async () => {
                const metaDetails = await this.getMetaDetails();
                this.logger.info("Updating activity to Exploring.");
                
                Helpers.waitForElm('.description-container-yi8iU').then(() => {
                    let mediaName = metaDetails.name;
                    let mediaPoster = metaDetails.poster;
                                            
                    ipcRenderer.send("discordrpc-update", { 
                        details: mediaName,
                        state: 'Exploring',
                        largeImageKey: mediaPoster ?? "1024stremio",
                        largeImageText: "Stremio Enhanced",
                        smallImageKey: "menuburger",
                        smallImageText: "Main Menu",
                        instance: false
                    });
                })
            })
        }
    }
    
    private static checkMainMenu() {
        let activityDetails = {
            details: "",
            largeImageKey: "1024stremio",
            largeImageText: "Stremio Enhanced",
            smallImageKey: "menuburger",
            smallImageText: "Main Menu",
            instance: false
        };
    
        switch (location.hash) {
            case '':
            case "#/":
                this.logger.info("Updating activity to Home.");
                activityDetails.details = "Home";
                break;
            case "#/discover":
                this.logger.info("Updating activity to Discover.");
                activityDetails.details = "Discover";
                break;
            case "#/library":
                this.logger.info("Updating activity to Library.");
                activityDetails.details = "Library";
                break;
            case "#/calendar":
                this.logger.info("Updating activity to Calendar.");
                activityDetails.details = "Calendar";
                break;
            case "#/addons":
                this.logger.info("Updating activity to Addons.");
                activityDetails.details = "Addons";
                break;
            case "#/settings":
                this.logger.info("Updating activity to Settings.");
                activityDetails.details = "Settings";
                break;
            default:
                return;
        }
    
        ipcRenderer.send("discordrpc-update", activityDetails);
    };
    
    private static async getMetaDetails() {
        let metaDetailsState = null;
        
        // Retry fetching the data until it's available
        while (metaDetailsState == null || !metaDetailsState.metaItem?.content?.content) {
            try {
                metaDetailsState = await Helpers._eval('core.transport.getState(\'meta_details\')');
                
                if (metaDetailsState.metaItem?.content?.content) {
                    break;  // Data is available, break out of the loop
                }
            } catch (err) {
                console.error('Error fetching meta details:', err);
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const metaDetails = metaDetailsState.metaItem.content.content;
        return metaDetails;
    }

    private static async getPlayerState() {
        let playerState = null;
      
        // Retry fetching the data until it's available
        while (playerState == null || !playerState.seriesInfo || !playerState.metaItem?.content) {
            try {
                playerState = await Helpers._eval('core.transport.getState(\'player\')');
                
                if (playerState.seriesInfo && playerState.metaItem?.content) {
                break;  // Data is available, break out of the loop
                }
            } catch (err) {
                console.error('Error fetching player state:', err);
            }
        
            await new Promise(resolve => setTimeout(resolve, 1000)); 
        }
      
        const seriesInfoDetails = playerState.seriesInfo;
        const metaDetails = playerState.metaItem.content;
        return { seriesInfoDetails, metaDetails };
    }
}
    
export default DiscordPresence;