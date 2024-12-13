class GameLoop {
    constructor(gameState) {
        this.gameState = gameState;
        this.tickRate = 100; // 10 ticks per second
        this.running = false;
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.tick();
    }

    stop() {
        this.running = false;
    }

    tick() {
        if (!this.running) return;

        const now = Date.now();
        const delta = (now - this.gameState.lastTick) / 1000;
        this.gameState.lastTick = now;

        this.processResources(delta);
        this.processBuildings(delta);
        this.checkTriggers();

        requestAnimationFrame(() => this.tick());
    }

    processResources(delta) {
        // Process automatic resource generation
        for (const building of this.gameState.buildings) {
            if (building.produces) {
                const amount = building.produces.amount * delta;
                this.gameState.resources[building.produces.resource] += amount;
            }
        }
    }

    processBuildings(delta) {
        // Process building effects
        for (const building of this.gameState.buildings) {
            if (building.effect) {
                building.effect(this.gameState, delta);
            }
        }
    }

    checkTriggers() {
        // Check for story triggers and unlock conditions
    }
} 