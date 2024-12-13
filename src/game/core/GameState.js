class GameState {
    constructor() {
        this.resources = {
            wood: 0,
            stone: 0,
            food: 0,
            population: 1,
            energy: 100,
            maxEnergy: 100,
            cloth: 0,
            leather: 0,
            metal: 0,
            herbs: 0,
            mana_crystals: 0,
            mana: 100,
            maxMana: 100,
            manaRegenRate: 1
        };
        
        this.skills = {
            // Gathering skills
            woodcutting: { level: 1, exp: 0 },
            mining: { level: 1, exp: 0 },
            farming: { level: 1, exp: 0 },
            herbalism: { level: 1, exp: 0 },
            
            // Crafting skills
            tailoring: { level: 1, exp: 0 },
            leatherworking: { level: 1, exp: 0 },
            blacksmithing: { level: 1, exp: 0 },
            stonemasonary: { level: 1, exp: 0 },
            alchemy: { level: 1, exp: 0 },
            enchanting: { level: 1, exp: 0 },
            
            // Combat skills
            melee: { level: 1, exp: 0 },
            ranged: { level: 1, exp: 0 },
            magic: { level: 1, exp: 0 },
            defense: { level: 1, exp: 0 },
            armor: { level: 1, exp: 0 },
            
            // Base skills
            construction: { level: 1, exp: 0 }
        };

        this.equipment = {
            head: null,
            chest: null,
            legs: null,
            feet: null,
            mainHand: null,
            offHand: null
        };

        this.unlockedRecipes = new Set();
        
        this.buildings = [];
        this.unlockedActions = [];
        this.unlockedBuildings = [];
        this.questLog = [];
        this.messageLog = [];
        this.completedStoryStages = [];
        this.completedQuests = [];
        
        this.lastTick = Date.now();
        this.saveVersion = '1.0.0';

        this.activeEffects = new Map(); // Stores active spell effects
        this.knownSpells = new Set(); // Stores unlocked spells
        this.spellCooldowns = new Map(); // Tracks spell cooldowns

        // Add current action tracking
        this.currentAction = null; // { id, startTime, duration, progress }
        this.actionQueue = []; // For potential future action queuing

        this.inventory = [];
        this.inventorySize = InventorySystem.DEFAULT_INVENTORY_SIZE;
        this.stats = {
            maxHealth: 100,
            health: 100,
            armor: 0,
            damage: 0,
            magicPower: 0,
            carryCapacity: 100
        };
    }

    exportSave() {
        const saveData = {
            resources: this.resources,
            skills: this.skills,
            buildings: this.buildings,
            unlockedActions: this.unlockedActions,
            questLog: this.questLog,
            saveVersion: this.saveVersion
        };
        return btoa(JSON.stringify(saveData));
    }

    importSave(saveString) {
        try {
            const saveData = JSON.parse(atob(saveString));
            if (saveData.saveVersion === this.saveVersion) {
                Object.assign(this, saveData);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Failed to load save:', e);
            return false;
        }
    }

    regenerateEnergy(delta) {
        const regenerationRate = 5; // energy per second
        this.resources.energy = Math.min(
            this.resources.maxEnergy,
            this.resources.energy + (regenerationRate * delta)
        );
    }

    getCombatLevel() {
        const combatSkills = ['melee', 'ranged', 'magic', 'defense', 'armor'];
        const totalLevels = combatSkills.reduce((sum, skill) => 
            sum + this.skills[skill].level, 0);
        return Math.floor(totalLevels / combatSkills.length);
    }

    regenerateMana(delta) {
        const regenAmount = this.resources.manaRegenRate * delta;
        this.resources.mana = Math.min(
            this.resources.maxMana,
            this.resources.mana + regenAmount
        );
    }

    // Add to the tick method
    tick(delta) {
        this.regenerateEnergy(delta);
        this.regenerateMana(delta);
        this.updateEffects(delta);
        this.updateCurrentAction(delta);
    }

    updateEffects(delta) {
        for (const [effectId, effect] of this.activeEffects.entries()) {
            effect.duration -= delta;
            if (effect.duration <= 0) {
                this.activeEffects.delete(effectId);
                effect.onExpire?.(this);
            } else {
                effect.onTick?.(this, delta);
            }
        }
    }

    updateCurrentAction(delta) {
        if (!this.currentAction) return;

        const elapsed = (Date.now() - this.currentAction.startTime) / 1000;
        this.currentAction.progress = Math.min(1, elapsed / this.currentAction.duration);

        // Check if action is complete
        if (this.currentAction.progress >= 1) {
            ActionSystem.completeAction(this, this.currentAction.id);
            this.currentAction = null;
        }
    }

    startAction(actionId) {
        if (this.currentAction) return false;

        const action = ActionSystem.ACTIONS[actionId];
        if (!action) return false;

        this.currentAction = {
            id: actionId,
            startTime: Date.now(),
            duration: action.duration,
            progress: 0
        };

        return true;
    }

    cancelAction() {
        this.currentAction = null;
    }

    getEquippedItemInSlot(slot) {
        return this.equipment[slot];
    }

    getTotalStats() {
        const baseStats = { ...this.stats };
        
        // Add equipment stats
        Object.values(this.equipment).forEach(item => {
            if (item && item.stats) {
                Object.entries(item.stats).forEach(([stat, value]) => {
                    baseStats[stat] = (baseStats[stat] || 0) + value;
                });
            }
        });

        return baseStats;
    }
} 