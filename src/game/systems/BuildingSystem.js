class BuildingSystem {
    static BUILDINGS = {
        campfire: {
            name: 'Campfire',
            description: 'A basic fire for warmth and cooking. The first step to civilization.',
            cost: { wood: 5 },
            unique: true,
            effect: (gameState) => {
                gameState.addMessage('The fire crackles warmly. You can now see better in the darkness.');
                gameState.unlockedBuildings.push('hut');
            }
        },
        hut: {
            name: 'Wooden Hut',
            description: 'A simple shelter that will attract wandering travelers',
            cost: { wood: 15 },
            unique: true,
            effect: (gameState) => {
                gameState.addMessage('A traveler appears, seeking shelter...');
                gameState.resources.population = (gameState.resources.population || 0) + 1;
                gameState.unlockedBuildings.push('woodcutter_lodge', 'gathering_hut');
            }
        },
        woodcutter_lodge: {
            name: 'Woodcutter\'s Lodge',
            description: 'Automatically generates wood and improves wood gathering',
            cost: { wood: 25 },
            unique: true,
            produces: {
                resource: 'wood',
                amount: 0.2
            },
            effect: (gameState) => {
                gameState.unlockedActions = gameState.unlockedActions.filter(action => action !== 'gather_wood');
                gameState.addMessage('The lodge will now automatically gather wood for you.');
                gameState.unlockedBuildings.push('warehouse');
            }
        },
        gathering_hut: {
            name: 'Gathering Hut',
            description: 'Collect herbs and food from the forest',
            cost: { wood: 20 },
            unique: true,
            effect: (gameState) => {
                gameState.addMessage('Villagers can now gather food and medicinal herbs.');
                gameState.unlockedActions.push('gather_herbs', 'gather_food');
                gameState.unlockedBuildings.push('herbalist_hut');
            }
        },
        herbalist_hut: {
            name: 'Herbalist\'s Hut',
            description: 'Process herbs into potions and medicines',
            cost: { wood: 30, herbs: 10 },
            unique: true,
            effect: (gameState) => {
                gameState.addMessage('You can now create basic potions.');
                gameState.unlockedActions.push('craft_healing_potion');
                gameState.unlockedBuildings.push('alchemist_tower');
            }
        },
        warehouse: {
            name: 'Warehouse',
            description: 'Store more resources and attract merchants',
            cost: { wood: 50 },
            unique: true,
            effect: (gameState) => {
                gameState.resourceStorageBonus = 2;
                gameState.addMessage('Merchants have noticed your settlement.');
                gameState.unlockedBuildings.push('marketplace');
            }
        },
        marketplace: {
            name: 'Marketplace',
            description: 'Enable trading and attract more villagers',
            cost: { wood: 75, stone: 25 },
            unique: true,
            effect: (gameState) => {
                gameState.addMessage('The marketplace brings new life to your settlement.');
                gameState.resources.population += 2;
                gameState.unlockedActions.push('trade');
                gameState.unlockedBuildings.push('blacksmith', 'guild_hall');
            }
        },
        blacksmith: {
            name: 'Blacksmith',
            description: 'Craft weapons and armor for adventurers',
            cost: { wood: 50, stone: 30, metal: 20 },
            unique: true,
            effect: (gameState) => {
                gameState.addMessage('The sound of hammering fills the air.');
                gameState.unlockedActions.push('craft_weapon', 'craft_armor');
            }
        },
        guild_hall: {
            name: 'Adventurer\'s Guild Hall',
            description: 'Accept quests and recruit adventurers',
            cost: { wood: 100, stone: 50 },
            unique: true,
            effect: (gameState) => {
                gameState.addMessage('Your settlement is now officially recognized by the Adventurer\'s Guild!');
                gameState.unlockedActions.push('recruit_adventurer', 'accept_quest');
                gameState.unlockedBuildings.push('training_grounds', 'magic_tower');
            }
        },
        training_grounds: {
            name: 'Training Grounds',
            description: 'Train adventurers and improve their skills',
            cost: { wood: 75, stone: 40 },
            unique: true,
            effect: (gameState) => {
                gameState.addMessage('Adventurers can now train their combat skills.');
                gameState.unlockedActions.push('train_adventurer');
            }
        },
        magic_tower: {
            name: 'Magic Tower',
            description: 'Research spells and train mages',
            cost: { wood: 80, stone: 60, mana_crystals: 10 },
            unique: true,
            effect: (gameState) => {
                gameState.addMessage('The tower hums with magical energy.');
                gameState.unlockedActions.push('research_spell', 'train_mage');
                gameState.unlockedBuildings.push('enchanting_workshop');
            }
        },
        alchemist_tower: {
            name: 'Alchemist\'s Tower',
            description: 'Research advanced potions and magical ingredients',
            cost: { wood: 60, stone: 40, herbs: 30 },
            unique: true,
            effect: (gameState) => {
                gameState.addMessage('Strange smells waft from the tower\'s windows.');
                gameState.unlockedActions.push('research_potion', 'craft_advanced_potion');
            }
        }
    };

    static canBuild(gameState, buildingType) {
        const building = this.BUILDINGS[buildingType];
        if (!building) return false;

        // Check if building is unlocked
        if (!gameState.unlockedBuildings.includes(buildingType)) return false;

        // Check if unique building already exists
        if (building.unique && gameState.buildings.some(b => b.type === buildingType)) {
            return false;
        }

        // Check resources
        for (const [resource, amount] of Object.entries(building.cost)) {
            if ((gameState.resources[resource] || 0) < amount) return false;
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

        // Add building to constructed buildings
        const newBuilding = {
            type: buildingType,
            built: Date.now()
        };
        gameState.buildings.push(newBuilding);

        // Remove from available buildings if unique
        if (building.unique) {
            gameState.unlockedBuildings = gameState.unlockedBuildings.filter(b => b !== buildingType);
        }

        // Apply building effects (which may unlock new buildings)
        if (building.effect) {
            building.effect(gameState);
        }

        // Add message
        gameState.addMessage(`Built ${building.name}`);

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