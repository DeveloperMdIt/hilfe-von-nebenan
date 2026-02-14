export function filterContactInfo(text: string): string {
    // 1. Email Regex (Standard + Bypass patterns like "info ät mctrade24 mit com")
    // We catch common words used to bypass @ and .
    const emailRegex = /([a-zA-Z0-9._%+-]+(?:\s*(?:@|ät|\(at\)|\[at\]|at)\s*)[a-zA-Z0-9.-]+(?:\s*(?:\.|punkt|dot|mit)\s*)(?:com|de|net|org|io|at|ch))/gi;

    // 2. Phone Number Regex (Flexible for common formats + word-based numbers)
    const phoneRegex = /((\+?[0-9]{1,4}[\s/-]?)?([0-9]{3,}[\s/-]?){2,})|((?:null|eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf)(?:\s*(?:-|und| )?\s*(?:null|eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf)){3,})/gi;

    // 3. Address Regex (Common German street patterns)
    // Matches "Street 123" or "Street 123 in City" or "an der Hohl 4 in Brauerschwend"
    // Also matches composite names like "Hauptstraße 12"
    const addressRegex = /\b(?:an der |am |im |in der |in )?((?:[A-Z][a-zßäöü-]+[\s-]*)*(?:straße|str\.|weg|gasse|platz|allee|ring|markt|damm|hohl|rain|zeile|hang|pfad|bach|grund|feld|blick|hof|tor|ufer)\b\s+\d+[a-z]?)(?:\s+(?:in|bei|hinter|vor)\s+([A-Z][a-zßäöü-]+))?\b/gi;

    return text
        .replace(emailRegex, '[E-Mail ausgeblendet]')
        .replace(phoneRegex, (match) => {
            const digits = match.replace(/[^0-9]/g, '');
            // Only mask if it looks like more than a simple short number (e.g. at least 7 digits)
            // Or if it's a long sequence of number-words
            if (digits.length >= 7 || match.length > 20) {
                return '[Telefonnummer ausgeblendet]';
            }
            return match;
        })
        .replace(addressRegex, (match) => {
            // Check if it really looks like an address (e.g. contains at least one Capitalized word and a number)
            if (/\d+/.test(match) && /[A-Z]/.test(match)) {
                return '[Adresse ausgeblendet]';
            }
            return match;
        });
}

/**
 * Formats a full name to "Firstname L." (e.g., "Michael Deja" -> "Michael D.")
 * to protect user privacy in public listings.
 */
export function formatName(fullName?: string | null): string {
    if (!fullName) return 'Anonymer Nutzer';

    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];

    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    const lastNameInitial = lastName.charAt(0).toUpperCase();

    return `${firstName} ${lastNameInitial}.`;
}
