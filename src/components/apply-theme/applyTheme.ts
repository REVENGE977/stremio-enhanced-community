import { readFileSync } from 'fs';
import Properties from '../../core/Properties';

export function getApplyThemeTemplate() {
    let template = readFileSync(__dirname + '/apply-theme.js', 'utf8');

    return template
        .replace("{{ themesPath }}", Properties.themesPath.replace(/\\/g, "\\\\"));
}