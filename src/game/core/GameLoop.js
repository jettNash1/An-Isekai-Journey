class GameLoop {
    constructor(gameState) {
        this.gameState = gameState;
        this.lastTick = Date.now();
        this.accumulatedTime = 0;
        this.tickRate = 1000 / 60; // 60fps for smooth updates
    }

    start() {
        // Use requestAnimationFrame for smoother updates
        this.frameId = requestAnimationFrame(() => this.loop());
    }

    stop() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
        }
    }

    loop() {
        const now = Date.now();
        const deltaTime = now - this.lastTick;
        this.lastTick = now;

        this.accumulatedTime += deltaTime;

        // Process updates at a fixed time step
        while (this.accumulatedTime >= this.tickRate) {
            this.tick(this.tickRate / 1000); // Convert to seconds
            this.accumulatedTime -= this.tickRate;
        }

        // Schedule next frame
        this.frameId = requestAnimationFrame(() => this.loop());
    }

    tick(deltaTime) {
        // Process building production
        this.gameState.buildings.forEach(building => {
            const buildingData = BuildingSystem.BUILDINGS[building.type];
            if (buildingData.produces) {
                Object.entries(buildingData.produces).forEach(([resource, amount]) => {
                    this.gameState.resources[resource] = (this.gameState.resources[resource] || 0) + amount * deltaTime;
                });
            }
        });

        // Check quest progress
        QuestSystem.checkQuestProgress(this.gameState);
    }
} 