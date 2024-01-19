import { app, BrowserWindow, shell, ipcMain } from "electron";
import { join } from "path";
import { exec } from "child_process";
import { mkdirSync, existsSync } from "fs";
import express from "express";
import helpers from './helpers';
import Updater from "./updater";
var mainWindow: BrowserWindow | null;

async function createWindow() {
    mainWindow = new BrowserWindow({
        height: 850,
        webPreferences: {
            preload: join(__dirname, "preload.js"),
            webSecurity: false,
            nodeIntegration: true
        },
        width: 1500,
        icon: "./images/icon.ico",
        backgroundColor: '#000000'
    });
        
    mainWindow.setMenu(null);
    mainWindow.loadURL("https://app.strem.io/shell-v4.4/?streamingServer=http%3A%2F%2F127.0.0.1%3A11470#/");
    helpers.setMainWindow(mainWindow);

    ipcMain.on('update-check-on-startup', async (_, checkForUpdatesOnStartup) => {
        console.log("[ INFO ] Checking for updates on startup: " + checkForUpdatesOnStartup);
        if(checkForUpdatesOnStartup == "true") await Updater.checkForUpdates(false);
    });

    ipcMain.on('update-check-userrequest', async () => {
        console.log("[ INFO ] Checking for updates on user request.");
        await Updater.checkForUpdates(true);
    });

    mainWindow.webContents.setWindowOpenHandler((edata:any) => {
        shell.openExternal(edata.url);
        return { action: "deny" };
    });
    
    if(process.argv.includes("--devtools")) { 
        console.log("[ INFO ] Opening devtools."); 
        mainWindow.webContents.openDevTools(); 
    }
}

function RunStremioService(ServicePath: string) {
    setTimeout(() => { exec(ServicePath) && console.log("[ INFO ] Stremio Service Started.") }, 0);
}

app.on("ready", async () => {
    console.log("[ INFO ] Running on NodeJS version: " + process.version)
    if(!existsSync(`${process.env.APPDATA}\\stremio-enhanced`) || !existsSync(`${process.env.APPDATA}\\stremio-enhanced\\themes`) || !existsSync(`${process.env.APPDATA}\\stremio-enhanced\\plugins`)) {
        try {
            if(!existsSync(`${process.env.APPDATA}\\stremio-enhanced`)) mkdirSync(`${process.env.APPDATA}\\stremio-enhanced`);
            if(!existsSync(`${process.env.APPDATA}\\stremio-enhanced\\themes`)) mkdirSync(`${process.env.APPDATA}\\stremio-enhanced\\themes`);
            if(!existsSync(`${process.env.APPDATA}\\stremio-enhanced\\plugins`)) mkdirSync(`${process.env.APPDATA}\\stremio-enhanced\\plugins`);
        }catch {}
    }
    
    const web = express();
    
    web.use(express.static(`${process.env.APPDATA}\\stremio-enhanced`));
    
    web.listen(3000, () => console.log("[ INFO ] Listening on port 3000."));
    
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
                console.log(`[ INFO ] Stremio Service is already running.`);
            } else {
                console.log(`[ INFO ] Stremio Service is not running, starting...`);
                RunStremioService(stremioServicePath);
            }
        }).catch((error) => console.error('Error checking process:', error));
    } else console.log("[ INFO ] Launching without Stremio Service.");
    
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