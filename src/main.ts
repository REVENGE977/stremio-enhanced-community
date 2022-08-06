import { app, BrowserWindow } from "electron";
import { resolve, join } from "path";
import * as cp from "child_process";

function createWindow() {
    const mainWindow = new BrowserWindow({
        height: 850,
        webPreferences: {
            preload: join(__dirname, "preload.js"),
        },
        width: 1300,
        icon: "./icon.ico"
    });

    mainWindow.setMenu(null);
    mainWindow.loadURL("http://127.0.0.1:11470");

    mainWindow.webContents.openDevTools();
}

function RunStreamServer() {
    setTimeout(() => { cp.fork(resolve(__dirname, '../node_modules/stremio-streaming-server/server.js'), { stdio: "ignore" }) && console.log("[ INFO ] stremio server is running.") }, 0);
}

app.on("ready", () => {
    createWindow();
    RunStreamServer();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});