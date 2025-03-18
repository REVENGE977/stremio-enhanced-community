import { app, BrowserWindow, shell, ipcMain } from "electron";
import { join } from "path";
import { mkdirSync, existsSync } from "fs";
import helpers from './utils/Helpers';
import Updater from "./core/Updater";
import Properties from "./core/Properties";
import DiscordPresence from "./utils/DiscordPresence";
import logger from "./utils/logger";
import StremioService from "./utils/StremioService";

let mainWindow: BrowserWindow | null;

app.commandLine.appendSwitch('use-angle', 'gl'); // Uses OpenGL for rendering. Having it on OpenGL enables the audio tracks menu in the video player
app.commandLine.appendSwitch('enable-gpu-rasterization'); // Uses GPU for rendering
app.commandLine.appendSwitch('enable-zero-copy'); // Improves video decoding
app.commandLine.appendSwitch('ignore-gpu-blocklist'); // Forces GPU acceleration
app.commandLine.appendSwitch('disable-software-rasterizer'); // Ensures no software fallback

async function createWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            preload: join(__dirname, "preload.js"),
            webSecurity: false,
            nodeIntegration: true,
            contextIsolation: false
        },
        width: 1500,
        height: 850,
        icon: "./images/icon.ico",
        backgroundColor: '#000000'
    });
        
    mainWindow.setMenu(null);
    mainWindow.loadURL("https://web.stremio.com/");
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
        logger.info(`DiscordRPC is set to ${status == "true" ? "enabled" : "disabled"}.`);
        if(status == "true") {
            DiscordPresence.start();
        } else if(DiscordPresence.started && status == "false") {
            DiscordPresence.stop();
        }
    });

    ipcMain.on('discordrpc-update', async (_, newDetails) => {
        logger.info("Updating DiscordRPC.");
        DiscordPresence.updateActivity(newDetails);
    });

    // Opens links in external browser instead of opening them in the Electron app.
    mainWindow.webContents.setWindowOpenHandler((edata:any) => {
        shell.openExternal(edata.url);
        return { action: "deny" };
    });
    
    // Devtools flag
    if(process.argv.includes("--devtools")) { 
        logger.info("Opening devtools."); 
        mainWindow.webContents.openDevTools(); 
    }

    mainWindow.on('closed', () => {
        StremioService.terminate();
    });
}

app.on("ready", async () => {
    logger.info("Running on NodeJS version: " + process.version);
    logger.info("Running on Electron version: v" + process.versions.electron);
    logger.info("Running on Chromium version: v" + process.versions.chrome);

    try {
        if(!existsSync(`${process.env.APPDATA}\\stremio-enhanced`)) mkdirSync(`${process.env.APPDATA}\\stremio-enhanced`);
        if(!existsSync(Properties.themesPath)) mkdirSync(Properties.themesPath);
        if(!existsSync(Properties.pluginsPath)) mkdirSync(Properties.pluginsPath);
    }catch {}
    
    if(!process.argv.includes("--no-stremio-service")) {
        const stremioServicePath = StremioService.checkExecutableExists();
        if(!stremioServicePath) {
            const buttonClicked = await helpers.showAlert("error", "Stremio Service Is Required!", "Stremio Service not found. Please install it from https://github.com/Stremio/stremio-service", ['OK']);
            
            if(buttonClicked == 0) {
                shell.openExternal("https://www.stremio.com/download-service");
            }
            
            return process.exit();
        }
        
        // check if stremio service is running or not, and if not start it.
        if (!await StremioService.isProcessRunning()) {
            await StremioService.run(stremioServicePath);
        } else logger.info("Stremio Service is already running.");
        
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
        // Opens Devtools on Ctrl + Shift + I
        if (input.control && input.shift && input.key === 'I') {
            window.webContents.toggleDevTools();
            event.preventDefault();
        }

        // implements zooming in/out using shortcuts (ctrl =, ctrl -)
        if (input.control && input.key === '=') {
            mainWindow.webContents.zoomFactor += 0.1;
            event.preventDefault();
        } else if (input.control && input.key === '-') {
            mainWindow.webContents.zoomFactor -= 0.1;
            event.preventDefault();
        }
    });
});