import { readFileSync } from 'fs';

export function getThemeItemTemplate(filename: string, metaData: {
    name: string,
    description: string,
    author: string,
    version: string,
}, applied: boolean) {
    let template = readFileSync(__dirname + '/theme-item.html', 'utf8');
    
    Object.keys(metaData).forEach((key: keyof typeof metaData) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        template = template.replace(regex, metaData[key] as string);
    });

    return template
        .replace("{{ disabled }}", applied ? "disabled" : "")
        .replace("{{ fileName }}", filename)
        .replace("{{ fileName }}", filename)
        .replace("{{ fileName }}", filename)
        .replace("{{ label }}", applied ? "Applied" : "Apply")
        .replace("{{ buttonClass }}", applied ? "uninstall-button-container-oV4Yo" : "install-button-container-yfcq5");
}