class InventorySystem {
    static MAX_STACK_SIZE = 100;
    static DEFAULT_INVENTORY_SIZE = 20;

    static ITEM_TYPES = {
        WEAPON: 'weapon',
        ARMOR: 'armor',
        RESOURCE: 'resource',
        CONSUMABLE: 'consumable',
        MATERIAL: 'material'
    };

    static EQUIPMENT_SLOTS = {
        HEAD: 'head',
        CHEST: 'chest',
        LEGS: 'legs',
        FEET: 'feet',
        MAIN_HAND: 'mainHand',
        OFF_HAND: 'offHand',
        STORAGE: 'storage'
    };

    static createItem(itemData) {
        return {
            id: `item_${Date.now()}_${Math.random().toString(36)}`,
            stackSize: 1,
            ...itemData
        };
    }

    static addItem(gameState, item, quantity = 1) {
        if (this.isInventoryFull(gameState) && !this.canStack(gameState, item)) {
            return false;
        }

        // Try to stack with existing items
        if (item.stackable) {
            const existingStack = gameState.inventory.find(i => 
                i.type === item.type && i.name === item.name);
            
            if (existingStack) {
                const spaceInStack = this.MAX_STACK_SIZE - existingStack.stackSize;
                const amountToAdd = Math.min(quantity, spaceInStack);
                existingStack.stackSize += amountToAdd;
                quantity -= amountToAdd;

                if (quantity <= 0) return true;
            }
        }

        // Add new stack if needed
        if (quantity > 0 && !this.isInventoryFull(gameState)) {
            const newItem = this.createItem({
                ...item,
                stackSize: Math.min(quantity, this.MAX_STACK_SIZE)
            });
            gameState.inventory.push(newItem);
            return true;
        }

        return false;
    }

    static removeItem(gameState, itemId, quantity = 1) {
        const itemIndex = gameState.inventory.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return false;

        const item = gameState.inventory[itemIndex];
        if (item.stackSize > quantity) {
            item.stackSize -= quantity;
        } else {
            gameState.inventory.splice(itemIndex, 1);
        }

        return true;
    }

    static equipItem(gameState, itemId) {
        const item = gameState.inventory.find(i => i.id === itemId);
        if (!item || !item.equipable) return false;

        const slot = item.slot;
        if (!slot || !this.EQUIPMENT_SLOTS[slot.toUpperCase()]) return false;

        // Unequip current item in slot if any
        const currentEquipped = gameState.equipment[slot];
        if (currentEquipped) {
            this.unequipItem(gameState, slot);
        }

        // Remove from inventory and equip
        this.removeItem(gameState, itemId);
        gameState.equipment[slot] = item;

        // Apply item stats
        if (item.stats) {
            for (const [stat, value] of Object.entries(item.stats)) {
                gameState.stats[stat] = (gameState.stats[stat] || 0) + value;
            }
        }

        return true;
    }

    static unequipItem(gameState, slot) {
        const item = gameState.equipment[slot];
        if (!item) return false;

        if (this.isInventoryFull(gameState)) return false;

        // Remove stats
        if (item.stats) {
            for (const [stat, value] of Object.entries(item.stats)) {
                gameState.stats[stat] -= value;
            }
        }

        // Move item to inventory
        gameState.equipment[slot] = null;
        this.addItem(gameState, item);

        return true;
    }

    static isInventoryFull(gameState) {
        return gameState.inventory.length >= gameState.inventorySize;
    }

    static canStack(gameState, item) {
        if (!item.stackable) return false;
        return gameState.inventory.some(i => 
            i.type === item.type && 
            i.name === item.name && 
            i.stackSize < this.MAX_STACK_SIZE
        );
    }

    static getInventoryWeight(gameState) {
        return gameState.inventory.reduce((total, item) => 
            total + (item.weight || 0) * item.stackSize, 0);
    }

    static calculateTotalInventorySize(gameState) {
        const baseSize = this.DEFAULT_INVENTORY_SIZE;
        const storageBonus = Object.values(gameState.equipment)
            .filter(item => item && item.type === 'storage')
            .reduce((total, item) => total + item.storageBonus, 0);

        return baseSize + storageBonus;
    }

    static equipStorageItem(gameState, itemId) {
        const item = gameState.inventory.find(i => i.id === itemId);
        if (!item || item.type !== 'storage') return false;

        // Check if we can stack storage items (some might be stackable)
        const currentStorage = gameState.equipment.storage || [];
        if (currentStorage.length >= 3) return false; // Max 3 storage items

        // Remove from inventory
        this.removeItem(gameState, itemId);
        
        // Add to storage equipment
        if (!Array.isArray(gameState.equipment.storage)) {
            gameState.equipment.storage = [];
        }
        gameState.equipment.storage.push(item);

        // Update inventory size
        gameState.inventorySize = this.calculateTotalInventorySize(gameState);

        return true;
    }

    static unequipStorageItem(gameState, storageItemId) {
        const storageItems = gameState.equipment.storage;
        if (!storageItems) return false;

        const itemIndex = storageItems.findIndex(item => item.id === storageItemId);
        if (itemIndex === -1) return false;

        const item = storageItems[itemIndex];

        // Check if removing this would cause overflow
        const newSize = this.calculateTotalInventorySize(gameState) - item.storageBonus;
        if (gameState.inventory.length > newSize) return false;

        // Remove from storage
        storageItems.splice(itemIndex, 1);
        
        // Add to inventory
        const success = this.addItem(gameState, item);
        if (success) {
            gameState.inventorySize = this.calculateTotalInventorySize(gameState);
        }

        return success;
    }
} 