class MaterialSystem {
    static PROCESSING = {
        // Basic Materials
        iron_ore_to_ingot: {
            name: 'Smelt Iron Ore',
            input: { iron_ore: 1 },
            output: { iron_ingot: 1 },
            requirements: {
                buildings: ['furnace'],
                skills: { blacksmithing: 1 }
            },
            duration: 5,
            exp: { blacksmithing: 2 }
        },
        hide_to_leather: {
            name: 'Tan Hide',
            input: { hide: 1 },
            output: { leather: 1 },
            requirements: {
                buildings: ['tannery'],
                skills: { leatherworking: 1 }
            },
            duration: 4,
            exp: { leatherworking: 2 }
        },
        wool_to_cloth: {
            name: 'Weave Cloth',
            input: { wool: 2 },
            output: { cloth: 1 },
            requirements: {
                buildings: ['loom'],
                skills: { tailoring: 1 }
            },
            duration: 3,
            exp: { tailoring: 2 }
        },

        // Advanced Materials
        steel_ingot: {
            name: 'Forge Steel',
            input: { iron_ingot: 2, coal: 1 },
            output: { steel_ingot: 1 },
            requirements: {
                buildings: ['forge'],
                skills: { blacksmithing: 15 }
            },
            duration: 8,
            exp: { blacksmithing: 5 }
        },
        hardened_leather: {
            name: 'Harden Leather',
            input: { leather: 2, wax: 1 },
            output: { hardened_leather: 1 },
            requirements: {
                buildings: ['tannery'],
                skills: { leatherworking: 10 }
            },
            duration: 6,
            exp: { leatherworking: 4 }
        },
        enchanted_cloth: {
            name: 'Enchant Cloth',
            input: { cloth: 2, mana_crystals: 1 },
            output: { enchanted_cloth: 1 },
            requirements: {
                buildings: ['enchanting_table'],
                skills: { enchanting: 5, tailoring: 5 }
            },
            duration: 10,
            exp: { enchanting: 5, tailoring: 2 }
        }
    };

    static canProcess(gameState, processId) {
        const process = this.PROCESSING[processId];
        if (!process) return false;

        // Check building requirements
        if (process.requirements.buildings) {
            for (const building of process.requirements.buildings) {
                if (!gameState.buildings.some(b => b.type === building)) {
                    return false;
                }
            }
        }

        // Check skill requirements
        if (process.requirements.skills) {
            for (const [skill, level] of Object.entries(process.requirements.skills)) {
                if (gameState.skills[skill].level < level) return false;
            }
        }

        // Check input materials
        for (const [material, amount] of Object.entries(process.input)) {
            if ((gameState.resources[material] || 0) < amount) return false;
        }

        return true;
    }

    static process(gameState, processId) {
        if (!this.canProcess(gameState, processId)) return false;

        const process = this.PROCESSING[processId];

        // Consume input materials
        for (const [material, amount] of Object.entries(process.input)) {
            gameState.resources[material] -= amount;
        }

        // Add output materials
        for (const [material, amount] of Object.entries(process.output)) {
            gameState.resources[material] = (gameState.resources[material] || 0) + amount;
        }

        // Grant experience
        if (process.exp) {
            for (const [skill, amount] of Object.entries(process.exp)) {
                SkillSystem.addExperience(gameState, skill, amount);
            }
        }

        return true;
    }
} 