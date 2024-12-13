class QuestSystem {
    static QUESTS = {
        firstSettlement: {
            id: 'firstSettlement',
            name: 'First Settlement',
            description: 'Build a shelter to survive the night',
            objectives: [
                {
                    id: 'gather_wood',
                    description: 'Gather 15 wood',
                    isComplete: (gameState) => gameState.resources.wood >= 15,
                    completed: false
                },
                {
                    id: 'build_hut',
                    description: 'Build a hut',
                    isComplete: (gameState) => gameState.buildings.some(b => b.type === 'hut'),
                    completed: false
                }
            ],
            reward: (gameState) => {
                gameState.addMessage('Your settlement has begun! Time to expand...');
                // Add the next quest
                gameState.questLog.push({ ...QuestSystem.QUESTS.establishProduction });
            }
        },
        
        establishProduction: {
            id: 'establishProduction',
            name: 'Establish Production',
            description: 'Set up basic resource production',
            objectives: [
                {
                    id: 'build_woodcutter',
                    description: 'Build a Woodcutter\'s Lodge',
                    isComplete: (gameState) => gameState.buildings.some(b => b.type === 'woodcutter_lodge'),
                    completed: false
                },
                {
                    id: 'build_gathering',
                    description: 'Build a Gathering Hut',
                    isComplete: (gameState) => gameState.buildings.some(b => b.type === 'gathering_hut'),
                    completed: false
                }
            ],
            reward: (gameState) => {
                gameState.addMessage('Your settlement can now produce its own resources!');
                gameState.resources.food += 10;
                gameState.resources.herbs += 5;
            }
        }
    };

    static checkQuestProgress(gameState) {
        gameState.questLog.forEach(quest => {
            if (quest.completed) return;

            // Check each objective
            let allComplete = true;
            quest.objectives.forEach(objective => {
                if (!objective.completed && objective.isComplete(gameState)) {
                    objective.completed = true;
                    gameState.addMessage(`Objective completed: ${objective.description}`);
                }
                if (!objective.completed) allComplete = false;
            });

            // Don't automatically complete the quest anymore
            // Just update the UI to show it's ready for completion
            if (allComplete && !quest.completed) {
                gameState.addMessage(`${quest.name} is ready to complete!`);
            }
        });
    }
} 