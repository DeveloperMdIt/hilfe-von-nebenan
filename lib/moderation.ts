/**
 * Content Moderation Utility
 * Handles automated checks for offensive content.
 */

const BLACKLIST = [
    // Hate Speech & Discrimination
    'nazi', 'hitler', 'rassist', 'ausländer raus', 'kanake', 'neger',
    // Sexual Content
    'sex', 'porno', 'porn', 'fick', 'blowjob', 'prostituierte', 'escort',
    // Negative/Scam Patterns
    'scam', 'betrug', 'geldwäsche', 'droge', 'kokain', 'heroin',
];

export interface ModerationResult {
    isFlagged: boolean;
    reason?: string;
}

export function checkContentModeration(text: string): ModerationResult {
    if (!text) return { isFlagged: false };

    const lowerText = text.toLowerCase();

    for (const word of BLACKLIST) {
        if (lowerText.includes(word)) {
            return {
                isFlagged: true,
                reason: `Inhalt enthält nicht erlaubte Begriffe.`
            };
        }
    }

    return { isFlagged: false };
}
