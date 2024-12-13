class Game {
    constructor() {
        // Assign to window immediately
        window.game = this;
        
        this.gameState = new GameState();
        this.gameLoop = new GameLoop(this.gameState);
        this.ui = new GameUI(this.gameState, this.gameLoop);
        
        // Initialize systems
        this.initialize();
    }

    initialize() {
        try {
            // Load save if exists
            const savedGame = localStorage.getItem('darkRoomSave');
            if (savedGame) {
                this.gameState.importSave(savedGame);
            }
        } catch (error) {
            console.warn('Failed to load save, starting new game:', error);
        }

        // Add initial quest if needed
        if (!this.gameState.questLog.some(q => q.id === 'firstSettlement')) {
            this.gameState.questLog.push(QuestSystem.QUESTS.firstSettlement);
        }
    }

    start() {
        this.gameLoop.start();
        this.ui.updateAll();
        
        // Initial message
        this.gameState.addMessage('The room is dark.');
        this.gameState.addMessage('You need to gather wood for a fire.');
        
        // Set up auto-save
        setInterval(() => this.autoSave(), 60000);
    }

    autoSave() {
        try {
            const saveData = this.gameState.exportSave();
            localStorage.setItem('darkRoomSave', saveData);
        } catch (error) {
            console.error('Failed to save game:', error);
        }
    }

    performAction(actionId) {
        console.log('Attempting action:', actionId);
        if (!this.ui) {
            console.error('UI not initialized');
            return;
        }
        
        if (ActionSystem.performAction(this.gameState, actionId)) {
            try {
                this.ui.updateActionPanel();
                this.ui.updateResourceDisplay();
            } catch (error) {
                console.error('Error updating UI:', error);
            }
        }
    }

    buildStructure(buildingType) {
        console.log('Attempting to build:', buildingType);
        if (BuildingSystem.build(this.gameState, buildingType)) {
            // Update UI
            this.ui.updateCraftingPanel();
            this.ui.updateResourceDisplay();
            this.ui.updateQuestPanel();
            
            // Check quest progress
            QuestSystem.checkQuestProgress(this.gameState);
        }
    }

    addMessage(text, type = 'normal') {
        this.gameState.messageLog.unshift({
            text,
            type,
            timestamp: Date.now()
        });

        // Keep only last 100 messages
        if (this.gameState.messageLog.length > 100) {
            this.gameState.messageLog.pop();
        }
    }

    completeQuest(questId) {
        const quest = this.gameState.questLog.find(q => q.id === questId);
        if (!quest || quest.completed) {
            console.log('Quest not found or already completed:', questId);
            return;
        }

        const allObjectivesComplete = quest.objectives.every(obj => obj.completed);
        if (!allObjectivesComplete) {
            console.log('Not all objectives complete for quest:', questId);
            return;
        }

        const questData = QuestSystem.QUESTS[questId];
        if (questData.reward) {
            questData.reward(this.gameState);
        }
        
        quest.completed = true;
        this.gameState.addMessage(`Quest completed: ${quest.name}!`);
        
        // Force UI updates
        this.ui.updateQuestPanel();
        this.ui.updateResourceDisplay();
        this.ui.updateCraftingPanel();
        this.ui.updateActionPanel(); // Also update actions in case quest unlocked new ones
    }
} 