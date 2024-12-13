class ActionSystem {
    static ACTIONS = {
        'gather wood': {
            name: 'Gather Wood',
            description: 'Gather wood from nearby trees',
            duration: 3, // seconds
            energyCost: 1,
            location: 'town', // or 'exploration'
            skillGain: {
                woodcutting: 1
            },
            resources: {
                wood: (gameState) => {
                    const baseAmount = 1;
                    const skillBonus = (gameState.skills.woodcutting.level - 1) * 0.1;
                    return baseAmount * (1 + skillBonus);
                }
            }
        },
        'mine stone': {
            name: 'Mine Stone',
            description: 'Mine stone from nearby rocks',
            duration: 4,
            energyCost: 2,
            skillGain: {
                mining: 1
            },
            resources: {
                stone: (gameState) => {
                    const baseAmount = 1;
                    const skillBonus = (gameState.skills.mining.level - 1) * 0.1;
                    return baseAmount * (1 + skillBonus);
                }
            },
            requirements: {
                skills: {
                    mining: 1
                }
            }
        },
        'forage food': {
            name: 'Forage for Food',
            description: 'Search the forest for edible plants and berries',
            duration: 5,
            energyCost: 2,
            skillGain: {
                farming: 1
            },
            resources: {
                food: (gameState) => {
                    const baseAmount = 1;
                    const skillBonus = (gameState.skills.farming.level - 1) * 0.1;
                    return baseAmount * (1 + skillBonus);
                }
            }
        },
        'train combat': {
            name: 'Combat Training',
            description: 'Practice combat techniques',
            duration: 6,
            energyCost: 3,
            skillGain: {
                combat: 2
            },
            requirements: {
                buildings: ['barracks']
            }
        },
        'craft tools': {
            name: 'Craft Tools',
            description: 'Create basic tools to improve efficiency',
            duration: 8,
            energyCost: 4,
            cost: {
                wood: 10,
                stone: 5
            },
            skillGain: {
                crafting: 2
            },
            effect: (gameState) => {
                gameState.resources.tools = (gameState.resources.tools || 0) + 1;
            },
            requirements: {
                skills: { crafting: 2 }
            }
        },
        // Training Actions
        basic_training: {
            name: 'Basic Combat Training',
            description: 'Practice basic combat techniques',
            duration: 10,
            energyCost: 5,
            requirements: {
                buildings: ['training_ground']
            },
            skillGain: {
                melee: 2,
                defense: 1
            },
            modifiers: (gameState) => {
                const trainingGround = gameState.buildings.find(b => 
                    b.type === 'training_ground');
                return trainingGround ? trainingGround.trainingBonus : 1;
            }
        },

        train_others: {
            name: 'Train Villagers',
            description: 'Train villagers in basic combat, earning money and experience',
            duration: 20,
            energyCost: 8,
            requirements: {
                buildings: ['training_ground'],
                skills: {
                    melee: 10,
                    defense: 5
                }
            },
            resources: {
                gold: (gameState) => {
                    const baseGold = 5;
                    const skillBonus = (gameState.skills.melee.level - 10) * 0.2;
                    return Math.floor(baseGold * (1 + skillBonus));
                }
            },
            skillGain: {
                melee: 3,
                defense: 2
            }
        },

        paid_training: {
            name: 'Train with Expert',
            description: 'Pay for advanced combat training',
            duration: 15,
            energyCost: 10,
            cost: {
                gold: 10
            },
            requirements: {
                buildings: ['training_ground']
            },
            skillGain: {
                melee: 5,
                defense: 3
            },
            modifiers: (gameState) => {
                const trainingGround = gameState.buildings.find(b => 
                    b.type === 'training_ground');
                return trainingGround ? trainingGround.trainingBonus * 1.5 : 1;
            }
        },

        advanced_training: {
            name: 'Advanced Combat Training',
            description: 'Learn advanced combat techniques',
            duration: 25,
            energyCost: 15,
            cost: {
                gold: 25
            },
            requirements: {
                buildings: ['training_ground'],
                skills: {
                    melee: 20,
                    defense: 15
                }
            },
            skillGain: {
                melee: 8,
                defense: 5,
                armor: 2
            }
        },

        master_training: {
            name: 'Master Combat Training',
            description: 'Train under a combat master',
            duration: 40,
            energyCost: 25,
            cost: {
                gold: 50
            },
            requirements: {
                buildings: ['training_ground'],
                skills: {
                    melee: 40,
                    defense: 30
                }
            },
            skillGain: {
                melee: 15,
                defense: 10,
                armor: 5
            }
        }
    };

    static canPerformAction(gameState, actionId) {
        const action = this.ACTIONS[actionId];
        if (!action) return false;

        if (action.requirements) {
            if (action.requirements.skills) {
                for (const [skill, level] of Object.entries(action.requirements.skills)) {
                    if ((gameState.skills[skill]?.level || 0) < level) return false;
                }
            }
        }

        return true;
    }

    static startAction(gameState, actionId) {
        const action = this.ACTIONS[actionId];
        if (!this.canPerformAction(gameState, actionId)) return false;

        // Deduct energy cost immediately
        if (action.energyCost) {
            if (gameState.resources.energy < action.energyCost) return false;
            gameState.resources.energy -= action.energyCost;
        }

        // Start the action
        return gameState.startAction(actionId);
    }

    static completeAction(gameState, actionId) {
        const action = this.ACTIONS[actionId];
        if (!action) return false;

        // Add resources with modifiers
        if (action.resources) {
            for (const [resource, calculator] of Object.entries(action.resources)) {
                const amount = typeof calculator === 'function' 
                    ? calculator(gameState) 
                    : calculator;
                gameState.resources[resource] = (gameState.resources[resource] || 0) + amount;
            }
        }

        // Add skill experience with modifiers
        if (action.skillGain) {
            const modifier = action.modifiers ? action.modifiers(gameState) : 1;
            for (const [skill, exp] of Object.entries(action.skillGain)) {
                SkillSystem.addExperience(gameState, skill, exp * modifier);
            }
        }

        // Handle any special effects
        if (action.effect) {
            action.effect(gameState);
        }

        return true;
    }

    static getActionProgress(gameState, actionId) {
        if (!gameState.currentAction || gameState.currentAction.id !== actionId) {
            return 0;
        }
        return gameState.currentAction.progress;
    }

    static isActionInProgress(gameState, actionId) {
        return gameState.currentAction && gameState.currentAction.id === actionId;
    }
} 