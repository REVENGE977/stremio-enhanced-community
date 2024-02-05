import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { dialog, BrowserWindow } from "electron";
import { spawnSync } from "child_process"
import logger from "./Logger";
import { ipcRenderer } from "electron";

class Helpers {
    private static instance: Helpers;
    private mainWindow: BrowserWindow | null = null;
    
    private constructor() {}
    
    static getInstance(): Helpers {
        if (!Helpers.instance) {
            Helpers.instance = new Helpers();
        }
        return Helpers.instance;
    }
    
    setMainWindow(mainWindow: BrowserWindow): void {
        this.mainWindow = mainWindow;
    }
    
    extractMetadataFromFile(filePath:string) {
        try {
            const fileContent = readFileSync(filePath, 'utf8');
            
            const commentBlockRegex = /\/\*\*([\s\S]*?)\*\//;
            const commentBlockMatch = fileContent.match(commentBlockRegex);
            
            if (commentBlockMatch && commentBlockMatch[1]) {
                const metadataRegex = /@(\w+)\s+([^\n\r]+)/g;
                const metadataMatches = commentBlockMatch[1].matchAll(metadataRegex);
                
                const metadata:any = {};
                
                for (const match of metadataMatches) {
                    metadata[match[1].trim()] = match[2].trim();
                }
                
                return metadata;
            } else {
                logger.error('Comment block not found in file ' + filePath);
                return null;
            }
        } catch (error) {
            logger.error('Error reading the file:', error);
            return null;
        }
    }
    
    extractMetadataFromText(textContent: string) {
        try {
            const commentBlockRegex = /\/\*\*([\s\S]*?)\*\//;
            const commentBlockMatch = textContent.match(commentBlockRegex);
            
            if (commentBlockMatch && commentBlockMatch[1]) {
                const metadataRegex = /@(\w+)\s+([^\n\r]+)/g;
                const metadataMatches = commentBlockMatch[1].matchAll(metadataRegex);
                
                const metadata: any = {};
                
                for (const match of metadataMatches) {
                    metadata[match[1].trim()] = match[2].trim();
                }
                
                return metadata;
            } else {
                logger.error('Comment block not found in the provided text');
                return null;
            }
        } catch (error) {
            logger.error('Error processing the provided text:', error);
            return null;
        }
    }
    
    
    checkExecutableExists() {
        let installationPath: string | undefined;
        
        switch (process.platform) {
            case 'win32':
            installationPath = join(process.env.LOCALAPPDATA || '', 'Programs', 'StremioService', `stremio-service.exe`);
            break;
            case 'darwin':
            installationPath = join(process.env.HOME || '', 'Applications', 'StremioService', `stremio-service.app`, 'Contents', 'MacOS', `stremio-service`);
            break;
            case 'linux':
            installationPath = join(process.env.HOME || '', 'bin', `stremio-service`);
            break;
            default:
            logger.error('Unsupported operating system');
            return null;
        }
        
        if (!installationPath) {
            logger.error('Failed to determine installation path for the current operating system');
            return null;
        }
        
        const fullPath = resolve(installationPath);
        
        try {
            if (existsSync(fullPath)) {
                return fullPath;
            }
        } catch (error) {
            logger.error(`Error checking stremio-service existence in ${fullPath}:`, error.message);
        }
        
        return null;
    }
    
    async showAlert(alertType: 'info' | 'warning' | 'error', title: string, message: string, buttons: Array<string>) : Promise<number> {
        const options: Electron.MessageBoxOptions = {
            type: alertType,
            title: title,
            message: message,
            buttons: buttons
        }
        
        try {
            const response = await dialog.showMessageBox(this.mainWindow!, options)
            return response.response;
        } catch (error) {
            logger.error('Error displaying alert:', error);
            return -1; 
        }
    }
    
    waitForElm(selector:string) {
        return new Promise((resolve, reject) => {
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

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout waiting for element with selector: ${selector}`));
            }, 10000);
        });
    }

    waitForTitleChange() {
        return new Promise((resolve, reject) => {
            const observer = new MutationObserver(() => {
                resolve(document.title);
                observer.disconnect();
            });
            
            observer.observe(document.querySelector('head'), {
                subtree: true,
                childList: true,
            });
            
            const timeoutId = setTimeout(() => {
                observer.disconnect();
                reject(new Error('Timeout waiting for document.title to change'));
            }, 10000);
            
            const titleChangeListener = () => {
                clearTimeout(timeoutId);
                observer.disconnect();
                resolve(document.title);
            };
            
            document.addEventListener('titlechange', titleChangeListener);
        });
    }
    
    async isProcessRunning(processName: string) {
        const result = spawnSync('tasklist', ['/fo', 'csv', '/nh', '/v']);
        
        if (result.error) {
            logger.error('Error executing tasklist:', result.error.message);
            return false;
        }
        
        return result.stdout.toString().toLowerCase().includes(processName.toLowerCase());
    }

    async discordRPCHandler() {
        window.addEventListener('popstate', () => {
            if(location.href.includes('#/player/')) {
                this.waitForTitleChange().then(() => {
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
                            details: `Paused ${showName} at ${this.formatTime(video.currentTime)}`, 
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
            } else if(location.href.includes("#/detail/")) {
                this.waitForElm(".episodes-list").then(() => {
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

    private formatTime(seconds:number) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }
}

const helpersInstance = Helpers.getInstance();


export default helpersInstance;