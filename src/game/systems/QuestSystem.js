class QuestSystem {
    static QUESTS = {
        firstSettlement: {
            id: 'firstSettlement',
            title: 'Establish First Settlement',
            description: 'Build a hut to house new villagers',
            objectives: {
                buildings: { hut: 1 }
            },
            rewards: {
                resources: { food: 50, wood: 50 },
                unlocks: ['woodcutter']
            }
        },
        woodWorking: {
            id: 'woodWorking',
            title: 'Master of Wood',
            description: 'Reach level 5 in woodcutting',
            objectives: {
                skills: { woodcutting: 5 }
            },
            rewards: {
                resources: { wood: 100 },
                unlocks: ['sawmill']
            }
        }
    };

    static checkQuestCompletion(gameState, quest) {
        const objectives = quest.objectives;

        if (objectives.buildings) {
            for (const [building, count] of Object.entries(objectives.buildings)) {
                const built = gameState.buildings.filter(b => b.type === building).length;
                if (built < count) return false;
            }
        }

        if (objectives.skills) {
            for (const [skill, level] of Object.entries(objectives.skills)) {
                if (gameState.skills[skill].level < level) return false;
            }
        }

        return true;
    }

    static completeQuest(gameState, questId) {
        const quest = this.QUESTS[questId];
        if (!quest) return false;

        // Add rewards
        if (quest.rewards.resources) {
            for (const [resource, amount] of Object.entries(quest.rewards.resources)) {
                gameState.resources[resource] = (gameState.resources[resource] || 0) + amount;
            }
        }

        if (quest.rewards.unlocks) {
            gameState.unlockedActions.push(...quest.rewards.unlocks);
        }

        // Remove from active quests
        gameState.questLog = gameState.questLog.filter(q => q.id !== questId);
        
        return true;
    }
} 