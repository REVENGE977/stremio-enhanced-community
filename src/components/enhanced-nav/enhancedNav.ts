import { readFileSync } from 'fs';

export function getEnhancedNav() {
    let template = readFileSync(__dirname + '/enhanced-nav.html', 'utf8');
    return template;
}