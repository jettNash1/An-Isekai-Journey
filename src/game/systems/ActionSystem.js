class ActionSystem {
    static ACTIONS = {
        gather_wood: {
            name: 'Gather Wood',
            description: 'Gather wood from nearby trees',
            duration: 3000,
            skillGain: {
                woodcutting: 1
            },
            resources: {
                wood: (gameState) => {
                    const baseAmount = 1;
                    const skillBonus = ((gameState.skills.woodcutting?.level || 1) - 1) * 0.1;
                    const buildingBonus = gameState.woodGatheringBonus || 0;
                    return Math.floor(baseAmount * (1 + skillBonus + buildingBonus));
                }
            }
        },
        gather_herbs: {
            name: 'Gather Herbs',
            description: 'Search the forest for medicinal herbs',
            duration: 4000,
            skillGain: {
                gathering: 1
            },
            resources: {
                herbs: (gameState) => {
                    const baseAmount = 1;
                    const skillBonus = ((gameState.skills.gathering?.level || 1) - 1) * 0.1;
                    return Math.floor(baseAmount * (1 + skillBonus));
                }
            }
        },
        gather_food: {
            name: 'Forage for Food',
            description: 'Search for edible plants and small game',
            duration: 4000,
            skillGain: {
                gathering: 1
            },
            resources: {
                food: (gameState) => {
                    const baseAmount = 2;
                    const skillBonus = ((gameState.skills.gathering?.level || 1) - 1) * 0.1;
                    return Math.floor(baseAmount * (1 + skillBonus));
                }
            }
        },
        gather_wood_faster: {
            name: 'Gather Wood Faster',
            description: 'More efficient wood gathering',
            duration: 5000,
            skillGain: {
                woodcutting: 2
            },
            resources: {
                wood: (gameState) => {
                    const baseAmount = 3;
                    const skillBonus = ((gameState.skills.woodcutting?.level || 1) - 1) * 0.1;
                    const buildingBonus = gameState.woodGatheringBonus || 0;
                    return Math.floor(baseAmount * (1 + skillBonus + buildingBonus));
                }
            },
            requirements: {
                buildings: ['campfire']
            }
        },
        craft_healing_potion: {
            name: 'Craft Healing Potion',
            description: 'Create a basic healing potion',
            duration: 5000,
            requirements: {
                buildings: ['herbalist_hut'],
                resources: { herbs: 5 }
            },
            skillGain: {
                herbalism: 2
            },
            resources: {
                herbs: -5,
                healing_potion: 1
            }
        },
        trade: {
            name: 'Trade with Merchants',
            description: 'Exchange resources with traveling merchants',
            duration: 10000,
            requirements: {
                buildings: ['marketplace']
            },
            effect: (gameState) => {
                gameState.addMessage('A merchant offers their wares...');
            }
        }
    };

    static canPerformAction(gameState, actionId) {
        if (!gameState) return false;
        
        const action = this.ACTIONS[actionId];
        if (!action) return false;

        // Check if another action is in progress
        if (gameState.currentAction) return false;

        // Check building requirements
        if (action.requirements?.buildings) {
            for (const building of action.requirements.buildings) {
                if (!gameState.buildings.some(b => b.type === building)) {
                    return false;
                }
            }
        }

        return true;
    }

    static performAction(gameState, actionId) {
        if (!this.canPerformAction(gameState, actionId)) return false;

        const action = this.ACTIONS[actionId];
        
        gameState.currentAction = {
            id: actionId,
            startTime: Date.now(),
            duration: action.duration
        };

        return true;
    }

    static isActionInProgress(gameState, actionId) {
        return gameState.currentAction?.id === actionId;
    }

    static getActionProgress(gameState, actionId) {
        if (!gameState.currentAction || gameState.currentAction.id !== actionId) return 0;
        
        const elapsed = Date.now() - gameState.currentAction.startTime;
        const progress = Math.min(elapsed / gameState.currentAction.duration, 1);
        
        if (progress >= 1) {
            this.completeAction(gameState, gameState.currentAction);
            return 0; // Return 0 after completion to reset progress bar
        }
        
        return progress;
    }

    static completeAction(gameState, action) {
        const actionData = this.ACTIONS[action.id];
        
        // Grant resources
        if (actionData.resources) {
            Object.entries(actionData.resources).forEach(([resource, calculator]) => {
                const amount = typeof calculator === 'function' 
                    ? calculator(gameState) 
                    : calculator;
                gameState.resources[resource] = (gameState.resources[resource] || 0) + amount;
            });
        }

        // Grant skill experience
        if (actionData.skillGain) {
            Object.entries(actionData.skillGain).forEach(([skill, exp]) => {
                if (!gameState.skills[skill]) {
                    gameState.skills[skill] = { level: 1, exp: 0 };
                }
                gameState.skills[skill].exp += exp;
                while (gameState.skills[skill].exp >= SkillSystem.getRequiredXP(gameState.skills[skill].level)) {
                    gameState.skills[skill].level += 1;
                    gameState.addMessage(`${skill} skill increased to level ${gameState.skills[skill].level}!`);
                }
            });
        }

        // Reset current action to allow new actions
        gameState.currentAction = null;

        // Force UI update for the action button
        if (window.game && window.game.ui) {
            window.game.ui.updateActionPanel();
        }
    }
} 