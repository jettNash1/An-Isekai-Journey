class StorySystem {
    static STORY_STAGES = {
        arrival: {
            id: 'arrival',
            title: 'A New Beginning',
            text: 'You arrive in a strange new world. The air is crisp, and the forest around you seems endless.',
            triggers: {
                initial: true
            },
            unlocks: {
                actions: ['gather wood'],
                quests: ['firstSettlement']
            }
        },
        firstHut: {
            id: 'firstHut',
            title: 'Shelter',
            text: 'With the first hut built, others may join your settlement. The beginnings of a community take shape.',
            triggers: {
                buildings: { hut: 1 }
            },
            unlocks: {
                actions: ['mine stone'],
                quests: ['woodWorking']
            }
        },
        mining: {
            id: 'mining',
            title: 'Stone Age',
            text: 'As you discover stone deposits nearby, new possibilities for construction emerge.',
            triggers: {
                resources: { stone: 10 }
            },
            unlocks: {
                buildings: ['stoneMine'],
                quests: ['buildMine']
            }
        }
    };

    static checkStoryProgress(gameState) {
        for (const [stageId, stage] of Object.entries(this.STORY_STAGES)) {
            if (gameState.completedStoryStages.includes(stageId)) continue;
            if (this.checkStageTriggers(gameState, stage)) {
                this.triggerStoryStage(gameState, stage);
            }
        }
    }

    static checkStageTriggers(gameState, stage) {
        const triggers = stage.triggers;

        if (triggers.initial && !gameState.completedStoryStages.length) {
            return true;
        }

        if (triggers.buildings) {
            for (const [building, count] of Object.entries(triggers.buildings)) {
                const built = gameState.buildings.filter(b => b.type === building).length;
                if (built < count) return false;
            }
        }

        if (triggers.resources) {
            for (const [resource, amount] of Object.entries(triggers.resources)) {
                if ((gameState.resources[resource] || 0) < amount) return false;
            }
        }

        if (triggers.skills) {
            for (const [skill, level] of Object.entries(triggers.skills)) {
                if ((gameState.skills[skill]?.level || 0) < level) return false;
            }
        }

        return true;
    }

    static triggerStoryStage(gameState, stage) {
        // Add story message
        gameState.messageLog.unshift({
            text: stage.text,
            type: 'story',
            timestamp: Date.now()
        });

        // Unlock new content
        if (stage.unlocks) {
            if (stage.unlocks.actions) {
                gameState.unlockedActions.push(...stage.unlocks.actions);
            }
            if (stage.unlocks.buildings) {
                gameState.unlockedBuildings.push(...stage.unlocks.buildings);
            }
            if (stage.unlocks.quests) {
                for (const questId of stage.unlocks.quests) {
                    if (QuestSystem.QUESTS[questId]) {
                        gameState.questLog.push(QuestSystem.QUESTS[questId]);
                    }
                }
            }
        }

        // Mark stage as completed
        gameState.completedStoryStages.push(stage.id);
    }
} 