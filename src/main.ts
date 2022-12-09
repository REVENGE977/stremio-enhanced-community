import { app, BrowserWindow } from "electron";
import { resolve, join } from "path";
import { fork } from "child_process";
import { mkdirSync, existsSync } from "fs";
import * as express from "express";

var mainWindow:any;

function createWindow() {
    mainWindow = new BrowserWindow({
        height: 850,
        webPreferences: {
            preload: join(__dirname, "preload.js"),
            webSecurity: false,
            nodeIntegration: true
        },
        width: 1500,
        icon: "./images/icon.ico"
    });

    mainWindow.setMenu(null);
    mainWindow.loadURL("https://app.strem.io/shell-v4.4/?streamingServer=http%3A%2F%2F127.0.0.1%3A11470#/");

    //mainWindow.webContents.openDevTools();
}

function RunStreamServer() {
    setTimeout(() => { fork(resolve(__dirname, './server.js'), { stdio: "ignore" }) && console.log("[ INFO ] stremio server is running on port 11470.") }, 0);
}

app.on("ready", () => {
    if(existsSync(`${process.env.APPDATA}\\stremio-enhanced`) || existsSync(`${process.env.APPDATA}\\stremio-enhanced\\themes`)) {
        try {
            if(existsSync(`${process.env.APPDATA}\\stremio-enhanced`)) mkdirSync(`${process.env.APPDATA}\\stremio-enhanced`);
            if(existsSync(`${process.env.APPDATA}\\stremio-enhanced\\themes`)) mkdirSync(`${process.env.APPDATA}\\stremio-enhanced\\themes`);
        }catch {}
    }

    const app = express();

    app.use(express.static(`${process.env.APPDATA}\\stremio-enhanced`));
    
    app.listen(3000, () => console.log("[ INFO ] listening on port 3000"));

    RunStreamServer();
    createWindow();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});