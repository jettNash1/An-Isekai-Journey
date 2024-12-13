class BuildingSystem {
    static BUILDINGS = {
        hut: {
            name: 'Hut',
            description: 'Basic shelter for villagers',
            cost: { wood: 50, stone: 20 },
            effect: (gameState) => {
                gameState.resources.population += 1;
            },
            requirements: {
                population: 1,
                skills: { construction: 1 }
            }
        },
        woodcutter: {
            name: 'Woodcutter\'s Lodge',
            description: 'Automatically generates wood',
            cost: { wood: 100, stone: 50 },
            produces: {
                resource: 'wood',
                amount: 0.1 // per second
            },
            requirements: {
                buildings: ['hut'],
                skills: { woodcutting: 2 }
            }
        },
        stoneMine: {
            name: 'Stone Mine',
            description: 'Produces stone automatically',
            cost: { wood: 150, stone: 50 },
            produces: {
                resource: 'stone',
                amount: 0.2
            },
            requirements: {
                skills: { mining: 3 }
            }
        },
        farm: {
            name: 'Farm',
            description: 'Produces food for your population',
            cost: { wood: 100, stone: 50 },
            produces: {
                resource: 'food',
                amount: 0.3
            },
            requirements: {
                skills: { farming: 2 }
            }
        },
        barracks: {
            name: 'Barracks',
            description: 'Train warriors to defend the settlement',
            cost: { wood: 200, stone: 100 },
            effect: (gameState) => {
                gameState.combatPower = (gameState.combatPower || 0) + 1;
            },
            requirements: {
                buildings: ['hut'],
                skills: { combat: 2 }
            }
        },
        // Crafting Buildings
        furnace: {
            name: 'Furnace',
            description: 'Required for smelting ores into ingots',
            cost: { stone: 50, wood: 20 },
            requirements: {
                skills: { construction: 5, mining: 3 }
            }
        },
        forge: {
            name: 'Forge',
            description: 'Advanced metalworking station',
            cost: { stone: 100, iron_ingot: 10 },
            requirements: {
                buildings: ['furnace'],
                skills: { blacksmithing: 10 }
            }
        },
        tannery: {
            name: 'Tannery',
            description: 'Process hides into leather',
            cost: { wood: 40, stone: 30 },
            requirements: {
                skills: { leatherworking: 5 }
            }
        },
        loom: {
            name: 'Loom',
            description: 'Weave cloth from wool and other materials',
            cost: { wood: 30, iron_ingot: 5 },
            requirements: {
                skills: { tailoring: 5 }
            }
        },
        enchanting_table: {
            name: 'Enchanting Table',
            description: 'Infuse items with magical properties',
            cost: { wood: 50, mana_crystals: 5 },
            requirements: {
                skills: { enchanting: 5 }
            }
        },
        alchemy_lab: {
            name: 'Alchemy Lab',
            description: 'Brew potions and process magical ingredients',
            cost: { wood: 40, glass: 10 },
            requirements: {
                skills: { alchemy: 5 }
            }
        },
        // Combat Training Buildings
        training_ground: {
            name: 'Training Ground',
            description: 'Basic area for combat practice',
            cost: { wood: 50, stone: 30 },
            level: 1,
            maxLevel: 4,
            trainingBonus: 1.0,
            requirements: {
                skills: { construction: 3 }
            },
            upgrades: {
                2: {
                    name: 'Training Field',
                    cost: { wood: 100, stone: 80 },
                    trainingBonus: 1.25,
                    unlocks: ['train_others', 'paid_training']
                },
                3: {
                    name: 'Combat Academy',
                    cost: { wood: 200, stone: 150, iron_ingot: 20 },
                    trainingBonus: 1.5,
                    unlocks: ['advanced_training']
                },
                4: {
                    name: 'Grand Dojo',
                    cost: { wood: 400, stone: 300, iron_ingot: 50, gold: 100 },
                    trainingBonus: 2.0,
                    unlocks: ['master_training']
                }
            }
        }
    };

    static canBuild(gameState, buildingType) {
        const building = this.BUILDINGS[buildingType];
        if (!building) return false;

        // Check resources
        for (const [resource, amount] of Object.entries(building.cost)) {
            if ((gameState.resources[resource] || 0) < amount) return false;
        }

        // Check requirements
        if (building.requirements) {
            if (building.requirements.population > gameState.resources.population) return false;
            
            if (building.requirements.skills) {
                for (const [skill, level] of Object.entries(building.requirements.skills)) {
                    if (gameState.skills[skill].level < level) return false;
                }
            }

            if (building.requirements.buildings) {
                for (const requiredBuilding of building.requirements.buildings) {
                    if (!gameState.buildings.some(b => b.type === requiredBuilding)) return false;
                }
            }
        }

        return true;
    }

    static build(gameState, buildingType) {
        if (!this.canBuild(gameState, buildingType)) return false;

        const building = this.BUILDINGS[buildingType];
        
        // Deduct resources
        for (const [resource, amount] of Object.entries(building.cost)) {
            gameState.resources[resource] -= amount;
        }

        // Add building
        gameState.buildings.push({
            type: buildingType,
            ...building
        });

        return true;
    }

    static upgradeBuilding(gameState, buildingId) {
        const building = gameState.buildings.find(b => b.id === buildingId);
        if (!building) return false;

        const buildingType = this.BUILDINGS[building.type];
        const nextLevel = building.level + 1;
        
        if (nextLevel > buildingType.maxLevel) return false;

        const upgrade = buildingType.upgrades[nextLevel];
        if (!upgrade) return false;

        // Check resource costs
        for (const [resource, amount] of Object.entries(upgrade.cost)) {
            if ((gameState.resources[resource] || 0) < amount) return false;
        }

        // Deduct resources
        for (const [resource, amount] of Object.entries(upgrade.cost)) {
            gameState.resources[resource] -= amount;
        }

        // Apply upgrade
        building.level = nextLevel;
        building.name = upgrade.name;
        building.trainingBonus = upgrade.trainingBonus;

        // Unlock new actions
        if (upgrade.unlocks) {
            gameState.unlockedActions.push(...upgrade.unlocks);
        }

        return true;
    }
} 