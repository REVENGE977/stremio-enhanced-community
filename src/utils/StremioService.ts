import { getLogger } from "./logger";
import { join, resolve } from "path";
import { existsSync } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { exec as execAsync } from "child_process";
import * as process from 'process';
import { homedir } from 'os';

const execPromise = promisify(execAsync);
class StremioService {
    private static logger = getLogger("StremioService");
    public static run(servicePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    this.logger.info("Starting Stremio Service from " + servicePath);

                    if (exec(servicePath)) {
                        this.logger.info("Stremio Service Started.");
                        resolve();
                    } else {
                        this.logger.error("Failed to start the service.");
                        reject(new Error("Failed to start the service.")); 
                    }
                } catch (error) {
                    reject(error); 
                }
            }, 0);
        });
    }    
    
    public static terminate(): number {
        try {
            this.logger.info("Terminating Stremio Service.");
    
            const pid = this.getStremioServicePid();
            if (pid) {
                process.kill(pid, 'SIGTERM');
                this.logger.info("Stremio Service terminated.");
                return 0; 
            } else {
                this.logger.error("Failed to find Stremio Service PID.");
                return 1;
            }
        } catch (e) {
            this.logger.error(e);
            return 2; 
        }
    }
    
    private static getStremioServicePid(): number | null {
        switch (process.platform) {
            case 'win32':
                return this.getPidForWindows();
            case 'darwin':
            case 'linux':
                return this.getPidForUnix();
            default:
                this.logger.error('Unsupported operating system');
                return null;
        }
    }
    
    private static getPidForWindows(): number | null {
        const execSync = require('child_process').execSync;
        try {
            const output = execSync('tasklist /FI "IMAGENAME eq stremio-service.exe"').toString();
            
            const lines = output.split('\n');
            
            for (const line of lines) {
                if (line.includes('stremio-service.exe')) {
                    const columns = line.trim().split(/\s+/);
                    if (columns.length > 1) {
                        return parseInt(columns[1], 10);
                    }
                }
            }
            
            this.logger.error("Stremio service not found in tasklist.");
        } catch (error) {
            this.logger.error('Error retrieving PID for Stremio service on Windows:' + error);
        }
        return null;
    }
    
    
    private static getPidForUnix(): number | null {
        const execSync = require('child_process').execSync;
        try {
            const output = execSync("pgrep -f stremio-service").toString();
            return parseInt(output.trim(), 10);
        } catch (error) {
            this.logger.error('Error retrieving PID for Stremio service on Unix: ' + error);
        }
        return null;
    }

    public static checkExecutableExists() {
        let installationPath;
    
        // Check if the executable exists in the current directory first
        const localPath = resolve('./stremio-service.exe'); // Windows
        const localPathUnix = resolve('./stremio-service'); // macOS & Linux
    
        if (existsSync(localPath) || existsSync(localPathUnix)) {
            this.logger.info("StremioService executable found in the current directory.");
            return existsSync(localPath) ? localPath : localPathUnix;
        }
    
        // If not found locally, check OS-specific paths
        switch (process.platform) {
            case 'win32':
                const localAppData = process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local');
                installationPath = join(localAppData, 'Programs', 'StremioService', 'stremio-service.exe');
                break;
            case 'darwin':
                installationPath = join('/Applications', 'StremioService.app', 'Contents', 'MacOS', 'stremio-service');
                break;
            case 'linux':
                installationPath = existsSync('/usr/local/bin/stremio-service') ? '/usr/local/bin/stremio-service' :
                                existsSync('/usr/bin/stremio-service') ? '/usr/bin/stremio-service' :
                                join(process.env.HOME || '', 'bin', 'stremio-service');
                break;
            default:
                this.logger.error('Unsupported operating system');
                return null;
        }
    
        if (!installationPath) {
            this.logger.error('Failed to determine installation path for the current operating system');
            return null;
        }
    
        const fullPath = resolve(installationPath);
        this.logger.info("Checking existence of " + fullPath);
    
        try {
            if (existsSync(fullPath)) {
                this.logger.info(`StremioService executable found in OS-specific path (${process.platform}).`);
                return fullPath;
            } else {
                this.logger.error(`StremioService executable not found at ${fullPath}`);
            }
        } catch (error) {
            this.logger.error(`Error checking StremioService existence in ${fullPath}:` + error.message);
        }
    
        return null;
    }    
    
    public static async isProcessRunning() {
        try {
            let command;
            switch (process.platform) {
                case 'win32':
                    command = 'tasklist /FI "IMAGENAME eq stremio-service.exe"';
                    break;
                case 'darwin':
                case 'linux':
                    command = 'pgrep -f "stremio-service"';
                    break;
                default:
                    this.logger.error('Unsupported operating system');
                    return false;
            }

            const { stdout } = await execPromise(command);
            const isRunning = process.platform === 'win32'
                ? stdout.toLowerCase().includes('stremio-service.exe')
                : stdout.trim().length > 0;

            return isRunning;
        } catch (error) {
            this.logger.error(`Error executing process check command: ${error.message}`);
            return false;
        }
    }
}

export default StremioService;