class Properties {
    public static themeLinkSelector: string = "head > link[rel=stylesheet]";
    public static themesPath = `${process.env.APPDATA}\\stremio-enhanced\\themes`;
    public static pluginsPath = `${process.env.APPDATA}\\stremio-enhanced\\plugins`;
}

export default Properties;