class ItemSystem {
    static RARITY = {
        COMMON: {
            name: 'Common',
            color: '#ffffff',
            statMultiplier: 1.0,
            dropChance: 1.0
        },
        UNCOMMON: {
            name: 'Uncommon',
            color: '#2ecc71',
            statMultiplier: 1.2,
            dropChance: 0.4
        },
        RARE: {
            name: 'Rare',
            color: '#3498db',
            statMultiplier: 1.5,
            dropChance: 0.15
        },
        EPIC: {
            name: 'Epic',
            color: '#9b59b6',
            statMultiplier: 2.0,
            dropChance: 0.05
        },
        LEGENDARY: {
            name: 'Legendary',
            color: '#f1c40f',
            statMultiplier: 3.0,
            dropChance: 0.01
        }
    };

    static calculateRarityChance(baseLevel, playerLevel) {
        const levelDiff = Math.max(0, playerLevel - baseLevel);
        const bonusChance = levelDiff * 0.01; // 1% per level above base

        return {
            LEGENDARY: Math.min(0.05, 0.01 + bonusChance),
            EPIC: Math.min(0.15, 0.05 + bonusChance * 2),
            RARE: Math.min(0.30, 0.15 + bonusChance * 3),
            UNCOMMON: Math.min(0.50, 0.40 + bonusChance * 4),
            COMMON: 1.0
        };
    }

    static determineRarity(baseLevel, playerLevel) {
        const chances = this.calculateRarityChance(baseLevel, playerLevel);
        const roll = Math.random();

        if (roll < chances.LEGENDARY) return 'LEGENDARY';
        if (roll < chances.EPIC) return 'EPIC';
        if (roll < chances.RARE) return 'RARE';
        if (roll < chances.UNCOMMON) return 'UNCOMMON';
        return 'COMMON';
    }

    static applyRarity(item, rarity) {
        const rarityData = this.RARITY[rarity];
        if (!rarityData) return item;

        return {
            ...item,
            rarity,
            name: `${rarityData.name} ${item.name}`,
            stats: Object.entries(item.stats || {}).reduce((acc, [stat, value]) => ({
                ...acc,
                [stat]: Math.floor(value * rarityData.statMultiplier)
            }), {})
        };
    }
} 