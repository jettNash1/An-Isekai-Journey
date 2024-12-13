class GameState {
    constructor() {
        // Initialize resources
        this.resources = {
            wood: 0,
            food: 0,
            herbs: 0,
            population: 0
        };
        
        // Initialize skills
        this.skills = {
            woodcutting: { level: 1, exp: 0 },
            gathering: { level: 1, exp: 0 },
            herbalism: { level: 1, exp: 0 }
        };
        
        // Initialize actions and buildings
        this.unlockedActions = ['gather_wood'];
        this.unlockedBuildings = ['campfire'];  // Start with campfire available
        this.buildings = [];
        this.currentAction = null;
        
        // Game state flags
        this.woodGatheringBonus = 0;
        
        // Message system
        this.messageLog = [];
        
        // Quest system - Start with first quest
        this.questLog = [{ ...QuestSystem.QUESTS.firstSettlement }];
    }

    addMessage(text, type = 'story') {
        this.messageLog.unshift({
            text,
            type,
            timestamp: Date.now()
        });
    }

    getEquippedItemInSlot(slot) {
        return this.equipment?.[slot] || null;
    }

    exportSave() {
        return JSON.stringify({
            resources: this.resources,
            skills: this.skills,
            unlockedActions: this.unlockedActions,
            buildings: this.buildings,
            unlockedBuildings: this.unlockedBuildings,
            questLog: this.questLog,
            inventory: this.inventory,
            inventorySize: this.inventorySize,
            equipment: this.equipment,
            stats: this.stats,
            woodGatheringBonus: this.woodGatheringBonus
        });
    }

    importSave(saveData) {
        try {
            const data = JSON.parse(saveData);
            if (data && typeof data === 'object') {
                this.resources = { ...this.resources, ...data.resources };
                this.skills = { ...this.skills, ...data.skills };
                this.unlockedActions = data.unlockedActions || ['gather_wood'];
                this.buildings = data.buildings || [];
                this.unlockedBuildings = data.unlockedBuildings || [];
                this.questLog = data.questLog || [];
                this.inventory = data.inventory || [];
                this.inventorySize = data.inventorySize || 20;
                this.equipment = { ...this.equipment, ...data.equipment };
                this.stats = { ...this.stats, ...data.stats };
                this.woodGatheringBonus = data.woodGatheringBonus || 0;
            }
        } catch (error) {
            console.error('Failed to load save:', error);
        }
    }
} 