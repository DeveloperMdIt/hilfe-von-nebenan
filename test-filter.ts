import { filterContactInfo } from './lib/utils';

const testCases = [
    "ich wohne an der Hohl 4 in Brauerschwend",
    "info ät mctrade24 mit com",
    "0172 ein zwei drei vier fünf sechs",
    "meine email ist test@example.com",
    "ruf mich an: +49 123 4567890",
    "Hauptstraße 12b in Berlin",
    "Bahnhofplatz 1"
];

testCases.forEach(tc => {
    console.log(`Original: ${tc}`);
    console.log(`Filtered: ${filterContactInfo(tc)}`);
    console.log('---');
});
