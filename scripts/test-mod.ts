
import { checkContentModeration } from '../lib/moderation';

const text = "Fahrgemeinschaft";
const res = checkContentModeration(text);
console.log(`Testing: "${text}"`);
console.log(`Flagged: ${res.isFlagged}`);
if (res.isFlagged) {
    console.log(`Reason: ${res.reason}`);

    // Find which word triggered it
    const BLACKLIST = [
        'nazi', 'hitler', 'rassist', 'ausländer raus', 'kanake', 'neger',
        'sex', 'porno', 'porn', 'fick', 'blowjob', 'prostituierte', 'escort',
        'scam', 'betrug', 'geldwäsche', 'droge', 'kokain', 'heroin',
    ];
    for (const word of BLACKLIST) {
        if (text.toLowerCase().includes(word)) {
            console.log(`Triggered by word: "${word}"`);
        }
    }
}
