import { readFileSync } from "fs";
import { shell } from "electron";
import helpers from './helpers';

class Updater {
    public static async checkForUpdates(noUpdatePrompt: boolean) {
        try {
            let latestVersion = await this.getLatestVersion();
            if(latestVersion > this.getCurrentVersion()) {
                let updatePrompt = await helpers.showAlert("info", "Update Available", "An update is available. Open latest release page?", ["Yes", "No"]);
                if(updatePrompt == 0) {
                    shell.openExternal("https://github.com/REVENGE977/stremio-enhanced-community/releases/latest");
                    return true;
                }
            } else if(noUpdatePrompt) {
                await helpers.showAlert("info", "No update available!", "You seem to have the latest version.", ["OK"]);
                return false;
            }
        } catch(e) {
            console.error(e);
            return false;
        }
    }

    public static async getLatestVersion() {
        const request = await fetch("https://github.com/REVENGE977/stremio-enhanced-community/raw/main/version");
        const response = await request.text();

        console.log(`[ UpdateChecker ] Latest version fetch returned status code: ${request.status}`);
        return response;
    }

    public static getCurrentVersion() {
        const currentVersion = readFileSync(__dirname + "/version", "utf-8");
        console.log("[ UpdateChecker ] Current Version is " + currentVersion);
        return currentVersion;
    }
}

export default Updater;