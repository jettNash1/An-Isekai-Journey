class CraftingSystem {
    static EQUIPMENT_TYPES = {
        CLOTH: 'cloth',
        LEATHER: 'leather',
        MAIL: 'mail',
        PLATE: 'plate',
        WEAPON: 'weapon',
        SHIELD: 'shield'
    };

    static RECIPES = {
        // Cloth Armor
        apprentice_robe: {
            name: 'Apprentice Robe',
            type: 'chest',
            equipmentType: 'cloth',
            materials: { cloth: 5 },
            requirements: {
                skills: { tailoring: 1 }
            },
            stats: {
                armor: 1,
                magicBonus: 1
            }
        },
        
        // Leather Armor
        leather_vest: {
            name: 'Leather Vest',
            type: 'chest',
            equipmentType: 'leather',
            materials: { leather: 6 },
            requirements: {
                skills: { leatherworking: 5 }
            },
            stats: {
                armor: 3,
                rangedBonus: 1
            }
        },

        // Metal Armor
        iron_chainmail: {
            name: 'Iron Chainmail',
            type: 'chest',
            equipmentType: 'mail',
            materials: { metal: 8 },
            requirements: {
                skills: { blacksmithing: 10 }
            },
            stats: {
                armor: 5,
                meleeBonus: 1
            }
        },

        // Weapons
        iron_sword: {
            name: 'Iron Sword',
            type: 'mainHand',
            equipmentType: 'weapon',
            materials: { metal: 5, wood: 2 },
            requirements: {
                skills: { blacksmithing: 5 }
            },
            stats: {
                damage: 5,
                meleeBonus: 2
            }
        },

        wooden_shield: {
            name: 'Wooden Shield',
            type: 'offHand',
            equipmentType: 'shield',
            materials: { wood: 8 },
            requirements: {
                skills: { woodcutting: 3 }
            },
            stats: {
                armor: 2,
                defenseBonus: 2
            }
        },

        // Magic Weapons
        crystal_staff: {
            name: 'Crystal Staff',
            type: 'mainHand',
            equipmentType: 'weapon',
            materials: { 
                enchanted_wood: 5,
                mana_crystals: 3
            },
            requirements: {
                skills: { 
                    enchanting: 10,
                    woodcutting: 5
                }
            },
            stats: {
                damage: 8,
                magicBonus: 5
            }
        },

        // Ranged Weapons
        longbow: {
            name: 'Longbow',
            type: 'mainHand',
            equipmentType: 'weapon',
            materials: {
                hardened_wood: 8,
                string: 2
            },
            requirements: {
                skills: {
                    woodcutting: 10,
                    crafting: 5
                }
            },
            stats: {
                damage: 6,
                rangedBonus: 4
            }
        },

        // Advanced Armor
        mage_robes: {
            name: 'Mage Robes',
            type: 'chest',
            equipmentType: 'cloth',
            materials: {
                enchanted_cloth: 8,
                mana_crystals: 2
            },
            requirements: {
                skills: {
                    tailoring: 15,
                    enchanting: 10
                }
            },
            stats: {
                armor: 3,
                magicBonus: 5,
                manaRegeneration: 2
            }
        }
    };

    static ARMOR_TIERS = {
        cloth: {
            1: ['apprentice_robe'],
            5: ['mystic_robe'],
            10: ['sage_robe'],
            // ... more tiers
        },
        leather: {
            5: ['leather_vest'],
            10: ['studded_leather'],
            15: ['hardened_leather'],
            // ... more tiers
        },
        mail: {
            10: ['iron_chainmail'],
            15: ['steel_chainmail'],
            20: ['mithril_chainmail'],
            // ... more tiers
        },
        plate: {
            20: ['iron_plate'],
            25: ['steel_plate'],
            30: ['mithril_plate'],
            // ... more tiers
        }
    };

    static STORAGE_ITEMS = {
        small_backpack: {
            name: 'Small Backpack',
            type: 'storage',
            description: 'A simple leather backpack',
            materials: {
                leather: 5,
                string: 2
            },
            requirements: {
                skills: { leatherworking: 5 }
            },
            storageBonus: 5,
            weight: 1
        },
        large_backpack: {
            name: 'Large Backpack',
            type: 'storage',
            description: 'A sturdy leather backpack with multiple compartments',
            materials: {
                leather: 12,
                string: 4,
                metal: 2
            },
            requirements: {
                skills: { leatherworking: 15 }
            },
            storageBonus: 10,
            weight: 2
        },
        wooden_cart: {
            name: 'Wooden Cart',
            type: 'storage',
            description: 'A simple cart for hauling goods',
            materials: {
                wood: 20,
                metal: 5,
                leather: 2
            },
            requirements: {
                skills: { 
                    woodcutting: 10,
                    crafting: 15
                }
            },
            storageBonus: 20,
            weight: 5,
            movementPenalty: 0.2
        },
        enchanted_chest: {
            name: 'Enchanted Chest',
            type: 'storage',
            description: 'A magical chest that follows you',
            materials: {
                wood: 15,
                metal: 8,
                mana_crystals: 5
            },
            requirements: {
                skills: {
                    enchanting: 20,
                    woodcutting: 15
                }
            },
            storageBonus: 25,
            weight: 0
        },
        bag_of_holding: {
            name: 'Bag of Holding',
            type: 'storage',
            description: 'A magical bag with seemingly endless space',
            materials: {
                leather: 20,
                mana_crystals: 15,
                void_essence: 3
            },
            requirements: {
                skills: {
                    enchanting: 40,
                    leatherworking: 30
                }
            },
            storageBonus: 50,
            weight: 0
        }
    };

    static canCraft(gameState, recipeId) {
        const recipe = this.RECIPES[recipeId];
        if (!recipe) return false;

        // Check if recipe is unlocked
        if (!gameState.unlockedRecipes.has(recipeId)) return false;

        // Check skill requirements
        if (recipe.requirements.skills) {
            for (const [skill, level] of Object.entries(recipe.requirements.skills)) {
                if (gameState.skills[skill].level < level) return false;
            }
        }

        // Check materials
        for (const [material, amount] of Object.entries(recipe.materials)) {
            if ((gameState.resources[material] || 0) < amount) return false;
        }

        return true;
    }

    static craft(gameState, recipeId) {
        if (!this.canCraft(gameState, recipeId)) return false;

        const recipe = this.RECIPES[recipeId];
        
        // Consume materials
        for (const [material, amount] of Object.entries(recipe.materials)) {
            gameState.resources[material] -= amount;
        }

        // Create item
        const item = {
            id: recipeId,
            name: recipe.name,
            type: recipe.type,
            equipmentType: recipe.equipmentType,
            stats: { ...recipe.stats }
        };

        // Add to inventory or equip
        this.addItemToInventory(gameState, item);

        // Grant crafting experience
        const expGain = this.calculateCraftingExp(recipe);
        const craftingSkill = this.getCraftingSkillForRecipe(recipe);
        SkillSystem.addExperience(gameState, craftingSkill, expGain);

        return true;
    }

    static getCraftingSkillForRecipe(recipe) {
        switch (recipe.equipmentType) {
            case 'cloth': return 'tailoring';
            case 'leather': return 'leatherworking';
            case 'mail':
            case 'plate':
            case 'weapon': return 'blacksmithing';
            case 'shield': return recipe.materials.metal ? 'blacksmithing' : 'woodcutting';
            default: return 'crafting';
        }
    }

    static calculateCraftingExp(recipe) {
        // Base exp based on material costs
        let totalMaterials = Object.values(recipe.materials).reduce((a, b) => a + b, 0);
        return totalMaterials * 5;
    }

    static craftStorageItem(gameState, itemId) {
        const item = this.STORAGE_ITEMS[itemId];
        if (!item) return false;

        // Check requirements
        if (!this.meetsCraftingRequirements(gameState, item)) return false;

        // Consume materials
        if (!this.consumeMaterials(gameState, item.materials)) return false;

        // Create the item with potential rarity
        const rarity = ItemSystem.determineRarity(
            item.requirements.skills[Object.keys(item.requirements.skills)[0]],
            Math.max(...Object.entries(item.requirements.skills)
                .map(([skill, _]) => gameState.skills[skill].level))
        );

        const craftedItem = ItemSystem.applyRarity({
            ...item,
            id: `storage_${Date.now()}_${Math.random().toString(36)}`,
            equipable: true,
            slot: 'storage'
        }, rarity);

        // Add to inventory
        return InventorySystem.addItem(gameState, craftedItem);
    }
} 