class InventorySystem {
    static DEFAULT_INVENTORY_SIZE = 20;

    static calculateTotalInventorySize(gameState) {
        if (!gameState.equipment || !gameState.equipment.storage) {
            return this.DEFAULT_INVENTORY_SIZE;
        }

        const storageBonus = Object.values(gameState.equipment.storage)
            .reduce((total, item) => total + (item.storageBonus || 0), 0);
        
        return this.DEFAULT_INVENTORY_SIZE + storageBonus;
    }

    static getInventoryWeight(gameState) {
        if (!gameState.inventory) return 0;
        
        return gameState.inventory.reduce((total, item) => {
            return total + (item.weight || 0) * (item.stackSize || 1);
        }, 0);
    }
} 