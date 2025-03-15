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

    waitForElmByXPath(xpath: string) {
        return new Promise((resolve, reject) => {
            const evaluateXPath = () => {
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                return result.singleNodeValue;
            };
    
            // If the element is already in the DOM, resolve immediately
            const existingElement = evaluateXPath();
            if (existingElement) return resolve(existingElement);
            
            const observer = new MutationObserver(() => {
                const element = evaluateXPath();
                if (element) {
                    resolve(element);
                    observer.disconnect();
                }
            });
    
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
    
            // Reject if the element is not found after 10 seconds
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout waiting for element with XPath: ${xpath}`));
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

    public _eval(js: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const eventName = 'stremio-enhanced'
                const script = document.createElement('script')
                
                window.addEventListener(
                    eventName,
                    (data) => {
                        script.remove()
                        resolve((data as CustomEvent).detail)
                    },
                    { once: true },
                )
                
                script.id = eventName
                script.appendChild(
                    document.createTextNode(`
                        var core = window.services.core;
                        var result = ${js};
                
                        if (result instanceof Promise) {
                        result.then((awaitedResult) => {
                            window.dispatchEvent(new CustomEvent("${eventName}", { detail: awaitedResult }));
                        });
                        } else {
                        window.dispatchEvent(new CustomEvent("${eventName}", { detail: result }));
                        }
                    `),
                    )
                    
                    document.head.appendChild(script)
            } catch (err) {
                reject(err)
            }
        })
    }

    public getElementByXpath(path:string) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
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
