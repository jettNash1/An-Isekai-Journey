class GameUI {
    constructor(gameState, gameLoop) {
        this.gameState = gameState;
        this.gameLoop = gameLoop;
        this.initializeUI();
    }

    initializeUI() {
        this.createMainContainer();
        this.createResourcePanel();
        this.createActionPanel();
        this.createBuildingPanel();
        this.createSkillPanel();
        this.createQuestPanel();
        this.createMessageLog();
        this.createInventoryPanel();
        this.createEquipmentPanel();
        this.startUpdateLoop();
    }

    createMainContainer() {
        const container = document.createElement('div');
        container.id = 'game-container';
        container.className = 'game-container';
        document.body.appendChild(container);
    }

    startUpdateLoop() {
        setInterval(() => this.updateUI(), 100);
    }

    updateUI() {
        this.updateResources();
        this.updateSkills();
        this.updateBuildings();
        this.updateQuests();
        this.updateInventoryPanel();
        this.updateEquipmentPanel();
    }

    createResourcePanel() {
        const panel = document.createElement('div');
        panel.className = 'resource-panel';
        panel.innerHTML = `
            <h2>Resources</h2>
            <div id="resource-list"></div>
        `;
        this.gameContainer.appendChild(panel);
    }

    createActionPanel() {
        const panel = document.createElement('div');
        panel.className = 'action-panel';
        panel.innerHTML = `
            <h2>Actions</h2>
            <div id="action-list"></div>
        `;
        this.gameContainer.appendChild(panel);
    }

    createBuildingPanel() {
        const panel = document.createElement('div');
        panel.className = 'building-panel';
        panel.innerHTML = `
            <h2>Buildings</h2>
            <div id="building-list"></div>
        `;
        this.gameContainer.appendChild(panel);
    }

    createSkillPanel() {
        const panel = document.createElement('div');
        panel.className = 'skill-panel';
        panel.innerHTML = `
            <h2>Skills</h2>
            <div id="skill-list"></div>
        `;
        this.gameContainer.appendChild(panel);
    }

    createQuestPanel() {
        const panel = document.createElement('div');
        panel.className = 'quest-panel';
        panel.innerHTML = `
            <h2>Quests</h2>
            <div id="quest-list"></div>
        `;
        this.gameContainer.appendChild(panel);
    }

    createMessageLog() {
        const log = document.createElement('div');
        log.className = 'message-log';
        log.innerHTML = `
            <div id="message-list"></div>
        `;
        this.gameContainer.appendChild(log);
    }

    createInventoryPanel() {
        const panel = document.createElement('div');
        panel.className = 'inventory-panel';
        panel.innerHTML = `
            <h2>Inventory</h2>
            <div class="inventory-stats">
                <span class="weight"></span>
                <span class="slots"></span>
            </div>
            <div id="inventory-grid"></div>
        `;
        this.gameContainer.appendChild(panel);
    }

    createEquipmentPanel() {
        const panel = document.createElement('div');
        panel.className = 'equipment-panel';
        panel.innerHTML = `
            <h2>Equipment</h2>
            <div class="equipment-slots">
                <div class="equipment-slot" data-slot="head">
                    <div class="slot-label">Head</div>
                </div>
                <div class="equipment-slot" data-slot="chest">
                    <div class="slot-label">Chest</div>
                </div>
                <div class="equipment-slot" data-slot="legs">
                    <div class="slot-label">Legs</div>
                </div>
                <div class="equipment-slot" data-slot="feet">
                    <div class="slot-label">Feet</div>
                </div>
                <div class="equipment-slot" data-slot="mainHand">
                    <div class="slot-label">Main Hand</div>
                </div>
                <div class="equipment-slot" data-slot="offHand">
                    <div class="slot-label">Off Hand</div>
                </div>
            </div>
            <div class="character-stats"></div>
        `;
        this.gameContainer.appendChild(panel);
    }

    updateResources() {
        const resourceList = document.getElementById('resource-list');
        resourceList.innerHTML = Object.entries(this.gameState.resources)
            .map(([resource, amount]) => `
                <div class="resource-item">
                    <span class="resource-name">${resource}</span>
                    <span class="resource-amount">${Math.floor(amount)}</span>
                </div>
            `).join('');
    }

    updateSkills() {
        const skillList = document.getElementById('skill-list');
        skillList.innerHTML = Object.entries(this.gameState.skills)
            .map(([skill, data]) => `
                <div class="skill-item">
                    <span class="skill-name">${skill}</span>
                    <span class="skill-level">Level ${data.level}</span>
                    <div class="skill-progress">
                        <div class="skill-progress-bar" style="width: ${this.calculateExpPercentage(data)}%"></div>
                    </div>
                </div>
            `).join('');
    }

    calculateExpPercentage(skillData) {
        const requiredXP = SkillSystem.getRequiredXP(skillData.level);
        return (skillData.exp / requiredXP) * 100;
    }

    updateActionPanel() {
        const actionList = document.getElementById('action-list');
        actionList.innerHTML = this.gameState.unlockedActions
            .map(actionId => {
                const action = ActionSystem.ACTIONS[actionId];
                const canPerform = ActionSystem.canPerformAction(this.gameState, actionId);
                const inProgress = ActionSystem.isActionInProgress(this.gameState, actionId);
                const progress = ActionSystem.getActionProgress(this.gameState, actionId);
                
                return `
                    <div class="action-item">
                        <div class="action-info">
                            <h3>${action.name}</h3>
                            <p>${action.description}</p>
                            ${inProgress ? `
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progress * 100}%"></div>
                                </div>
                            ` : ''}
                        </div>
                        <button 
                            onclick="game.performAction('${actionId}')"
                            ${canPerform && !inProgress ? '' : 'disabled'}
                            class="action-button"
                        >
                            ${inProgress ? 'In Progress' : 'Perform'}
                        </button>
                    </div>
                `;
            }).join('');
    }

    updateQuestPanel() {
        const questList = document.getElementById('quest-list');
        questList.innerHTML = this.gameState.questLog
            .map(quest => `
                <div class="quest-item">
                    <h3>${quest.title}</h3>
                    <p>${quest.description}</p>
                    <div class="quest-objectives">
                        ${this.renderQuestObjectives(quest)}
                    </div>
                </div>
            `).join('');
    }

    renderQuestObjectives(quest) {
        let html = '';
        if (quest.objectives.buildings) {
            for (const [building, count] of Object.entries(quest.objectives.buildings)) {
                const built = this.gameState.buildings.filter(b => b.type === building).length;
                html += `<div class="objective ${built >= count ? 'complete' : ''}">
                    Build ${count} ${BuildingSystem.BUILDINGS[building].name}: ${built}/${count}
                </div>`;
            }
        }
        return html;
    }

    updateInventoryPanel() {
        const inventoryGrid = document.getElementById('inventory-grid');
        const weight = InventorySystem.getInventoryWeight(this.gameState);
        const slots = `${this.gameState.inventory.length}/${this.gameState.inventorySize}`;

        document.querySelector('.inventory-stats .weight').textContent = 
            `Weight: ${weight}/${this.gameState.stats.carryCapacity}`;
        document.querySelector('.inventory-stats .slots').textContent = 
            `Slots: ${slots}`;

        const storageBonus = InventorySystem.calculateTotalInventorySize(this.gameState) - 
            InventorySystem.DEFAULT_INVENTORY_SIZE;
        
        document.querySelector('.inventory-stats').innerHTML += `
            <span class="storage-bonus">Storage Bonus: +${storageBonus}</span>
        `;

        // Show equipped storage items
        if (this.gameState.equipment.storage?.length > 0) {
            const storageSection = document.createElement('div');
            storageSection.className = 'storage-items';
            storageSection.innerHTML = `
                <h3>Storage Items</h3>
                ${this.gameState.equipment.storage.map(item => `
                    <div class="storage-item" style="color: ${ItemSystem.RARITY[item.rarity].color}">
                        <span>${item.name}</span>
                        <span>+${item.storageBonus} slots</span>
                        <button onclick="game.unequipStorageItem('${item.id}')">Unequip</button>
                    </div>
                `).join('')}
            `;
            document.querySelector('.inventory-panel').appendChild(storageSection);
        }

        inventoryGrid.innerHTML = this.gameState.inventory
            .map(item => this.renderInventoryItem(item))
            .join('');
    }

    updateEquipmentPanel() {
        const slots = document.querySelectorAll('.equipment-slot');
        slots.forEach(slot => {
            const slotName = slot.dataset.slot;
            const equippedItem = this.gameState.getEquippedItemInSlot(slotName);
            
            slot.innerHTML = `
                <div class="slot-label">${slotName}</div>
                ${equippedItem ? this.renderEquippedItem(equippedItem) : ''}
            `;
        });

        const stats = this.gameState.getTotalStats();
        document.querySelector('.character-stats').innerHTML = 
            this.renderCharacterStats(stats);
    }

    renderInventoryItem(item) {
        return `
            <div class="inventory-item" data-item-id="${item.id}" 
                style="color: ${ItemSystem.RARITY[item.rarity].color}">
                <div class="item-icon ${item.type}"></div>
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    ${item.storageBonus ? `<div class="item-bonus">+${item.storageBonus} slots</div>` : ''}
                    ${item.stackable ? `<div class="item-count">x${item.stackSize}</div>` : ''}
                </div>
                ${item.equipable ? `
                    <button onclick="game.equipItem('${item.id}')" class="equip-button">
                        ${item.type === 'storage' ? 'Use' : 'Equip'}
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderEquippedItem(item) {
        return `
            <div class="equipped-item" data-item-id="${item.id}">
                <div class="item-icon ${item.type}"></div>
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                </div>
                <button onclick="game.unequipItem('${item.slot}')" class="unequip-button">
                    Unequip
                </button>
            </div>
        `;
    }

    renderCharacterStats(stats) {
        return `
            <div class="stat-list">
                <div class="stat">Health: ${stats.health}/${stats.maxHealth}</div>
                <div class="stat">Armor: ${stats.armor}</div>
                <div class="stat">Damage: ${stats.damage}</div>
                <div class="stat">Magic Power: ${stats.magicPower}</div>
            </div>
        `;
    }
} 