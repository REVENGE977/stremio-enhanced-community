import { readFileSync } from 'fs';

export function getPluginItemTemplate(filename: string, metaData: {
    name: string,
    description: string,
    author: string,
    version: string,
}, checked: boolean) {
    let template = readFileSync(__dirname + '/plugin-item.html', 'utf8');
    
    Object.keys(metaData).forEach((key: keyof typeof metaData) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        template = template.replace(regex, metaData[key] as string);
    });

    return template
        .replace("{{ checked }}", checked ? "checked" : "")
        .replace("{{ fileName }}", filename)
        .replace("{{ fileName }}", filename)
}