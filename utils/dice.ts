// utils/dice.ts

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
export function getSeededDice(seed: string): string[] {
    let rng = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return DICE.map(sides => {
        rng = (rng * 9301 + 49297) % 233280;
        const idx = rng % sides.length;
        return sides[idx];
    });
}
