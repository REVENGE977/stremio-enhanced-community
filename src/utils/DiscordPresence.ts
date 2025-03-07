import DiscordRPC, { Client } from 'discord-rpc';
import logger from './logger';
import Activity from '../interfaces/Activity';
import Helpers from './Helpers';
import { ipcRenderer } from "electron";

class DiscordPresence {
    private rpc:Client;
    constructor() {
        try {
            const clientId = '1200186750727893164';
            DiscordRPC.register(clientId);
            
            this.rpc = new DiscordRPC.Client({ transport: 'ipc' });
            this.rpc.on('ready', () => {
                logger.info('Connected to DiscordRPC.');
                this.updateActivity({
                    details: "Main Menu",
                    largeImageKey: '1024stremio',
                    largeImageText: 'Stremio Enhanced',
                    smallImageKey: "menuburger",
                    smallImageText: "Main Menu",
                    instance: false,
                })
            });

            this.rpc.login({ clientId }).catch(() => logger.error("Failed to connect to DiscordRPC, maybe Discord isn't running."));
        }catch(_) {}
    }

    public updateActivity(newActivity: Activity) {
        try {
            this.rpc.setActivity(newActivity);
        }catch(_) {}
    }

    public stopActivity() {
        logger.info('Clearing DiscordRPC.');
        this.rpc.clearActivity();
    }

    public static async discordRPCHandler() {
        window.addEventListener('popstate', () => {
            //currently watching something
            if(location.href.includes('#/player/')) {
                Helpers.waitForTitleChange().then(() => {
                    const episodeSeasonRegex = /\((\d+)x(\d+)\)/;

                    let playingStream = document.title.split('Stremio - ')[1];
                    const episodeSeason = episodeSeasonRegex.exec(playingStream);

                    let showNameRegex = /^([^\-]+)/;
                    let showName = showNameRegex.exec(playingStream)[0].trim();
                    let video = document.getElementById("videoPlayer") as HTMLVideoElement;

                    const handlePlaying = () => {
                        let currentTimestamp = Math.floor(Date.now() / 1000) - Math.floor(video.currentTime)

                        ipcRenderer.send("discordrpc-update", { 
                            details: `Watching ${showName}`, 
                            state: `Season: ${episodeSeason[1]}, Episode: ${episodeSeason[2]}`, 
                            startTimestamp: currentTimestamp,
                            largeImageKey: "1024stremio",
                            largeImageText: "Stremio Enhanced",
                            smallImageKey: "play",
                            smallImageText: "Playing..",
                            instance: false
                        }); 
                    };

                    const handlePausing = () => {
                        ipcRenderer.send("discordrpc-update", { 
                            details: `Paused ${showName} at ${Helpers.formatTime(video.currentTime)}`, 
                            state: `Season: ${episodeSeason[1]}, Episode: ${episodeSeason[2]}`, 
                            largeImageKey: "1024stremio",
                            largeImageText: "Stremio Enhanced",
                            smallImageKey: "pause",
                            smallImageText: "Paused",
                            instance: false
                        }); 
                    }

                    video.addEventListener('playing', handlePlaying);
                    video.addEventListener('pause', handlePausing);
                    video.play();
                })
                //currently exploring a show
            } else if(location.href.includes("#/detail/")) {
                Helpers.waitForElm(".episodes-list").then(() => {
                    let showName = document.querySelector('div[class="fallback ng-binding"]').textContent;
                    const seasonSelectMenu = document.getElementsByName("season")[0] as HTMLSelectElement;

                    ipcRenderer.send("discordrpc-update", { 
                        details: `Exploring ${showName}`,
                        state: `Season: ${seasonSelectMenu.value}`,
                        largeImageKey: "1024stremio",
                        largeImageText: "Stremio Enhanced",
                        smallImageKey: "menuburger",
                        smallImageText: "Main Menu",
                        instance: false
                    });

                    seasonSelectMenu.addEventListener('change', (e:any) => {
                        ipcRenderer.send("discordrpc-update", { 
                            details: `Exploring ${showName}`,
                            state: `Season: ${e.target.value}`,
                            largeImageKey: "1024stremio",
                            largeImageText: "Stremio Enhanced",
                            smallImageKey: "menuburger",
                            smallImageText: "Main Menu",
                            instance: false
                        });
                    });
                })
                //currently on main menu
            } else if(location.href.endsWith("#/")) {
                ipcRenderer.send("discordrpc-update", { 
                    details: "Main Menu", 
                    largeImageKey: "1024stremio",
                    largeImageText: "Stremio Enhanced",
                    smallImageKey: "menuburger",
                    smallImageText: "Main Menu",
                    instance: false
                });
            }
        });
    }
}

export default DiscordPresence;