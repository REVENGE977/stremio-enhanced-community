import logger from "./logger";
import { join, resolve } from "path";
import { existsSync } from "fs";
import { spawnSync, exec } from "child_process";

class StremioService {
    public static run(servicePath: string) {
        setTimeout(() => {
            if(exec(servicePath)) {
                logger.info("Stremio Service Started.");
            }
        }, 0);
    }
    
    public static kill() {        
        try {
            logger.info("Killing Stremio Service.")
            exec(this.stremioServiceKillCommand());
        }catch(e) {
            logger.error(e);
        }
    }

    private static stremioServiceKillCommand() {
        switch (process.platform) {
            case 'win32':
                return "taskkill /F /IM stremio-service.exe && taskkill /F /IM stremio-runtime.exe"
            case 'darwin':
            case 'linux':
                return "pkill -f stremio-service && pkill -f stremio-runtime";
            default:
                logger.error('Unsupported operating system');
                return null;
        }
    }

    public static checkExecutableExists() {
        let installationPath;
        
        switch (process.platform) {
            case 'win32':
                installationPath = join(process.env.LOCALAPPDATA || '', 'Programs', 'StremioService', 'stremio-service.exe');
                break;
            case 'darwin':
                // Typical Mac installation path for app bundles
                installationPath = join('/Applications', 'StremioService.app', 'Contents', 'MacOS', 'stremio-service');
                break;
            case 'linux':
                // Common Linux installation paths
                installationPath = existsSync('/usr/local/bin/stremio-service') ? '/usr/local/bin/stremio-service' :
                                existsSync('/usr/bin/stremio-service') ? '/usr/bin/stremio-service' :
                                join(process.env.HOME || '', 'bin', 'stremio-service');
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
        logger.info("Checking existence of " + fullPath);

        try {
            if (existsSync(fullPath)) {
                logger.info("StremioService executable found.");
                return fullPath;
            } else {
                logger.error(`StremioService executable not found at ${fullPath}`);
            }
        } catch (error) {
            logger.error(`Error checking StremioService existence in ${fullPath}:`, error.message);
        }

        return null;
    }
    
    public static async isProcessRunning() {
        let result;
        
        switch (process.platform) {
            case 'win32':
                result = spawnSync('tasklist', ['/fo', 'csv', '/nh', '/v']);
                if (result.error) {
                    logger.error('Error executing tasklist:', result.error.message);
                    return false;
                }
                return result.stdout.toString().toLowerCase().includes("stremio-service".toLowerCase());
            case 'darwin':
            case 'linux':
                result = spawnSync('ps', ['aux']);
                if (result.error) {
                    logger.error('Error executing ps command:', result.error.message);
                    return false;
                }
                return result.stdout.toString().toLowerCase().includes("stremio-service".toLowerCase());
    
            default:
                logger.error('Unsupported operating system');
                return false;
        }
    }
}

export default StremioService;