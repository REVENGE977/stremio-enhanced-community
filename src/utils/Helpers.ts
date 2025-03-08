import { readFileSync } from "fs";
import { dialog, BrowserWindow } from "electron";
import logger from "./logger";

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

    public formatTime(seconds:number) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }
}

const helpersInstance = Helpers.getInstance();


export default helpersInstance;
