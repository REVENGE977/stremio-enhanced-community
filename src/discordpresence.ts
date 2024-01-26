import DiscordRPC from 'discord-rpc';
import logger from './logger';

class DiscordPresence {
    public rpc:any;
    constructor() {
        try {
            const clientId = '1200186750727893164';
            DiscordRPC.register(clientId);
            
            this.rpc = new DiscordRPC.Client({ transport: 'ipc' });
            this.rpc.on('ready', () => {
                logger.info('Connected to DiscordRPC.');
                this.updateActivity({
                    details: "Main Menu",
                    largeImageKey: '1024stremio',
                    largeImageText: 'Stremio Enhanced',
                    smallImageKey: "menuburger",
                    smallImageText: "Main Menu",
                    instance: false,
                })
            });

            this.rpc.login({ clientId }).catch(logger.error);
        }catch(e) {
            logger.error(e);
        }
    }

    public updateActivity(newActivity: Activity) {
        try {
            this.rpc.setActivity(newActivity);
        }catch(e) {
            logger.error(e)
        }
    }

    public stopActivity() {
        logger.info('Clearing DiscordRPC.');
        this.rpc.clearActivity();
    }
}

interface Activity {
    details: string,
    state?: string,
    startTimestamp?: Date,
    endTimestamp?: Date,
    largeImageKey: string,
    largeImageText?: string,
    smallImageKey?: string,
    smallImageText?: string,
    partySize?: number,
    partyMax?: number,
    instance: boolean
}

export default DiscordPresence;