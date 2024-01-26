import { app, BrowserWindow, shell, ipcMain } from "electron";
import { join } from "path";
import { exec } from "child_process";
import { mkdirSync, existsSync } from "fs";
import express from "express";
import helpers from './helpers';
import Updater from "./updater";
import Properties from "./properties";
import DiscordPresence from "./discordpresence";
import logger from "./logger";

var mainWindow: BrowserWindow | null;
var discordrpc: DiscordPresence | null;

async function createWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            preload: join(__dirname, "preload.js"),
            webSecurity: false,
            nodeIntegration: true
        },
        width: 1500,
        height: 850,
        icon: "./images/icon.ico",
        backgroundColor: '#000000'
    });
        
    mainWindow.setMenu(null);
    mainWindow.loadURL("https://app.strem.io/shell-v4.4/?streamingServer=http%3A%2F%2F127.0.0.1%3A11470#/");
    helpers.setMainWindow(mainWindow);

    ipcMain.on('update-check-on-startup', async (_, checkForUpdatesOnStartup) => {
        logger.info(`Checking for updates on startup: ${checkForUpdatesOnStartup == "true" ? "enabled" : "disabled"}.`);
        if(checkForUpdatesOnStartup == "true") await Updater.checkForUpdates(false);
    });

    ipcMain.on('update-check-userrequest', async () => {
        logger.info("Checking for updates on user request.");
        await Updater.checkForUpdates(true);
    });

    ipcMain.on('discordrpc-status', async(_, status) => {
        logger.info(`DiscordRPC is set to ${status == "true" ? "enabled" : "disabled"}`);
        if(status == "true") {
            discordrpc = new DiscordPresence();
        } else {
            if(discordrpc) {
                discordrpc.stopActivity();
            }
        }
    });

    ipcMain.on('discordrpc-update', async (_, newDetails) => {
        logger.info("Updating DiscordRPC.");
        discordrpc.updateActivity(newDetails);
    });

    mainWindow.webContents.setWindowOpenHandler((edata:any) => {
        shell.openExternal(edata.url);
        return { action: "deny" };
    });
    
    if(process.argv.includes("--devtools")) { 
        logger.info("Opening devtools."); 
        mainWindow.webContents.openDevTools(); 
    }

    mainWindow.on('closed', () => {
        killStremioService();
    });
}

function RunStremioService(servicePath: string) {
    setTimeout(() => {
        if(exec(servicePath)) {
            logger.info("Stremio Service Started.");
        }
    }, 0);
}

function killStremioService() {        
    try {
        logger.info("Killing Stremio Service.")
        exec("taskkill /F /IM stremio-service.exe && taskkill /F /IM stremio-runtime.exe");
    }catch(e) {
        logger.error(e);
    }
}

app.on("ready", async () => {
    logger.info("Running on NodeJS version: " + process.version)
    try {
        if(!existsSync(`${process.env.APPDATA}\\stremio-enhanced`)) mkdirSync(`${process.env.APPDATA}\\stremio-enhanced`);
        if(!existsSync(Properties.themesPath)) mkdirSync(Properties.themesPath);
        if(!existsSync(Properties.pluginsPath)) mkdirSync(Properties.pluginsPath);
    }catch {}
    
    const web = express();
    
    web.use(express.static(`${process.env.APPDATA}\\stremio-enhanced`));
    
    web.listen(3000, () => logger.info("Listening on port 3000."));
    
    if(!process.argv.includes("--no-stremio-service")) {
        const stremioServicePath = helpers.checkExecutableExists();
        if(!stremioServicePath) {
            const buttonClicked = await helpers.showAlert("error", "Stremio Service Is Required!", "Stremio Service not found. Please install it from https://github.com/Stremio/stremio-service", ['OK']);
            
            if(buttonClicked == 0) {
                shell.openExternal("https://github.com/Stremio/stremio-service/releases/latest");
            }
            
            return process.exit();
        }
        
        //check if stremio service is running or not, and if not start it.
        helpers.isProcessRunning("stremio-service")
        .then((result) => {
            if (result) {
                logger.info("Stremio Service is already running.");
            } else {
                logger.info("Stremio Service is not running, starting...");
                RunStremioService(stremioServicePath);
            }
        }).catch((error) => logger.error('Error checking process: ' + error));
    } else logger.info("Launching without Stremio Service.");
    
    createWindow();
    
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on('browser-window-created', (_, window) => {
    window.webContents.on('before-input-event', (event:any, input:any) => {
        if (input.control && input.shift && input.key === 'I') {
            window.webContents.toggleDevTools();
            event.preventDefault();
        }

        if (input.control && input.key === '=') {
            mainWindow.webContents.zoomFactor += 0.1;
            event.preventDefault();
        } else if (input.control && input.key === '-') {
            mainWindow.webContents.zoomFactor -= 0.1;
            event.preventDefault();
        }
    });
});