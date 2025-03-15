import { readFileSync } from 'fs';

export function getDefaultThemeTemplate(applied:boolean) {
    let template = readFileSync(__dirname + '/default-theme.html', 'utf8');

    return template
        .replace("{{ disabled }}", applied ? "disabled" : "")
        .replace("{{ label }}", applied ? "Applied" : "Apply")
        .replace("{{ backgroundColor }}", applied ? "var(--overlay-color)" : "var(--secondary-accent-color)");
}