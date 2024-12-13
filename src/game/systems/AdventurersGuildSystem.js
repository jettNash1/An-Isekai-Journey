class AdventurersGuildSystem {
    static QUEST_TYPES = {
        HUNT: 'hunt',
        GATHER: 'gather',
        EXPLORE: 'explore'
    };

    static QUEST_DIFFICULTIES = {
        1: { name: '★☆☆☆☆', minDistance: 2, maxDistance: 5, rewards: 1 },
        2: { name: '★★☆☆☆', minDistance: 4, maxDistance: 8, rewards: 1.5 },
        3: { name: '★★★☆☆', minDistance: 6, maxDistance: 12, rewards: 2 },
        4: { name: '★★★★☆', minDistance: 10, maxDistance: 16, rewards: 3 },
        5: { name: '★★★★★', minDistance: 14, maxDistance: 20, rewards: 5 }
    };

    static generateQuests(gameState) {
        const availableQuests = [];
        const playerLevel = gameState.getCombatLevel();
        const questCount = 3 + Math.floor(Math.random() * 3);

        for (let i = 0; i < questCount; i++) {
            const quest = this.generateQuest(playerLevel);
            if (quest) availableQuests.push(quest);
        }

        return availableQuests;
    }

    static generateQuest(playerLevel) {
        const difficulty = this.determineQuestDifficulty(playerLevel);
        const type = this.randomQuestType();
        const questData = this.generateQuestData(type, difficulty);

        return {
            id: `quest_${Date.now()}_${Math.random().toString(36)}`,
            type,
            difficulty,
            ...questData,
            completed: false,
            progress: 0
        };
    }

    static generateQuestData(type, difficulty) {
        switch (type) {
            case this.QUEST_TYPES.HUNT:
                return this.generateHuntQuest(difficulty);
            case this.QUEST_TYPES.GATHER:
                return this.generateGatherQuest(difficulty);
            case this.QUEST_TYPES.EXPLORE:
                return this.generateExploreQuest(difficulty);
            default:
                return null;
        }
    }

    static generateHuntQuest(difficulty) {
        const monsters = Object.entries(MapSystem.MONSTER_ZONES)
            .filter(([_, zone]) => zone.difficulty <= difficulty);
        
        if (!monsters.length) return null;

        const [_, zone] = monsters[Math.floor(Math.random() * monsters.length)];
        const monster = zone.monsters[Math.floor(Math.random() * zone.monsters.length)];
        const count = Math.floor(5 * difficulty.rewards);

        return {
            title: `Hunt ${monster}s`,
            description: `Defeat ${count} ${monster}s`,
            objective: { monster, count },
            rewards: this.calculateRewards(difficulty),
            locationType: zone
        };
    }

    // ... More quest generation methods ...
} 