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

export default Activity;