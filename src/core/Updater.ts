import { readFileSync } from "fs";
import { shell } from "electron";
import helpers from '../utils/Helpers';
import logger from "../utils/logger";
import { join } from "path";

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
            logger.error(e);
            return false;
        }
    }

    private static async getLatestVersion() {
        const request = await fetch("https://github.com/REVENGE977/stremio-enhanced-community/raw/main/version");
        const response = await request.text();

        logger.info(`Latest version available is v${response}.`);
        return response;
    }

    public static getCurrentVersion() {
        const currentVersion = readFileSync(join(__dirname, "../", "../", "version"), "utf-8");
        logger.info(`Current running version is v${currentVersion}.`);
        return currentVersion;
    }
}

export default Updater;