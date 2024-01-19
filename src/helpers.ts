import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { dialog, BrowserWindow } from "electron";
import { spawnSync } from "child_process"

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
                console.error('Comment block not found in file ' + filePath);
                return null;
            }
        } catch (error) {
            console.error('Error reading the file:', error);
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
                console.error('Comment block not found in the provided text');
                return null;
            }
        } catch (error) {
            console.error('Error processing the provided text:', error);
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
            console.error('Unsupported operating system');
            return null;
        }
        
        if (!installationPath) {
            console.error('Failed to determine installation path for the current operating system');
            return null;
        }
        
        const fullPath = resolve(installationPath);
        
        try {
            if (existsSync(fullPath)) {
                return fullPath;
            }
        } catch (error) {
            console.error(`Error checking stremio-service existence in ${fullPath}:`, error.message);
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
            console.error('Error displaying alert:', error);
            return -1; 
        }
    }

    waitForElm(selector:string) {
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
    
    async isProcessRunning(processName: string) {
        const result = spawnSync('tasklist', ['/fo', 'csv', '/nh', '/v']);
        
        if (result.error) {
            console.error('Error executing tasklist:', result.error.message);
            return false;
        }
        
        return result.stdout.toString().toLowerCase().includes(processName.toLowerCase());
    }
    
    // static killProcess(processName: string): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         const isWindows = process.platform === 'win32';
            
    //         const findCommand = isWindows
    //         ? `tasklist /FI "IMAGENAME eq ${processName}.exe" /NH /FO CSV`
    //         : `pgrep ${processName}`;
            
    //         exec(findCommand, (error, stdout) => {
    //             if (error) {
    //                 reject(`Error finding process: ${error.message}`);
    //                 return;
    //             }
                
    //             const pid = stdout.trim();
                
    //             if (pid) {
    //                 const killCommand = isWindows ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`;
                    
    //                 exec(killCommand, (killError) => {
    //                     if (killError) {
    //                         reject(`Error killing process ${processName} (PID: ${pid}): ${killError.message}`);
    //                     } else {
    //                         console.log(`Process ${processName} (PID: ${pid}) killed successfully.`);
    //                         resolve();
    //                     }
    //                 });
    //             } else {
    //                 console.log(`No process found with name ${processName}.`);
    //                 resolve();
    //             }
    //         });
    //     });
    // }
    
}

const helpersInstance = Helpers.getInstance();


export default helpersInstance;