const crypto = require('crypto');

const DICE = [
    "BNSZXK",
    "YMBLML",
    "MTTCSC",
    "CDCJTB",
    "PFGKPV",
    "EAOIUU",
    "HRNRNH",
    "LWRLDF",
    "AOEAOE",
    "PHTWHT",
    "RDGGLR",
    "NOIYNI",
];

export function rollDice(): string[] {
    return DICE.map(sides => {
        const idx = Math.floor(Math.random() * sides.length);
        return sides[idx];
    });
}

// Deterministic roll using a seed (for Daily puzzle)
export function getSeededDice(dateStr: string): string[] {
    // Get a SHA-256 hash as a Buffer
    const hash = crypto.createHash('sha256').update(dateStr).digest();
    // Use each byte to pick a face for each die
    return DICE.map((sides, i) => {
        // Use the i-th byte (wrap if needed)
        const byte = hash[i % hash.length];
        const idx = byte % sides.length;
        return sides[idx];
    });
}
