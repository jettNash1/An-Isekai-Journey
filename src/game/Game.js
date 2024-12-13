class Game {
    constructor() {
        this.gameState = new GameState();
        this.gameLoop = new GameLoop(this.gameState);
        this.ui = new GameUI(this.gameState, this.gameLoop);
        
        this.initialize();
    }

    initialize() {
        // Load save if exists
        const savedGame = localStorage.getItem('darkRoomSave');
        if (savedGame) {
            this.gameState.importSave(savedGame);
        }

        // Start game loop
        this.gameLoop.start();

        // Set up auto-save
        setInterval(() => this.autoSave(), 60000);

        // Add initial quest
        this.gameState.questLog.push(QuestSystem.QUESTS.firstSettlement);
    }

    autoSave() {
        const saveData = this.gameState.exportSave();
        localStorage.setItem('darkRoomSave', saveData);
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
} 