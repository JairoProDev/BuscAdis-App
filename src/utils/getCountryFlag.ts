// A simple mapping from country code (ISO 3166-1 alpha-2) to a flag emoji.

export const getCountryFlag = (countryCode: string): string => {
    // Offset between ASCII 'A' and Regional Indicator Symbol Letter 'A'
    const regionalIndicatorOffset = 127397;

    if (!countryCode || countryCode.length !== 2) {
        return '🏳️'; // Default flag
    }
    
    const code = countryCode.toUpperCase();

    const char1 = code.charCodeAt(0);
    const char2 = code.charCodeAt(1);
    
    // Check if they are valid uppercase letters A-Z
    if (char1 < 65 || char1 > 90 || char2 < 65 || char2 > 90) {
        return '🏳️';
    }

    const flag = String.fromCodePoint(char1 + regionalIndicatorOffset) + String.fromCodePoint(char2 + regionalIndicatorOffset);
    return flag;
}; 