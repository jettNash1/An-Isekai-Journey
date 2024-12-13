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
        this.createCraftingPanel();
        this.createSkillPanel();
        this.createQuestPanel();
        this.createMessageLog();
        this.startUpdateLoop();
    }

    createMainContainer() {
        const container = document.createElement('div');
        container.id = 'game-container';
        container.className = 'game-container';
        document.body.appendChild(container);
        this.gameContainer = container;
    }

    startUpdateLoop() {
        // Initial update
        this.updateAll();
        
        // Fast updates for smooth progress bars (60fps)
        const progressInterval = 1000 / 60; // ~16.7ms for 60fps
        setInterval(() => {
            this.updateActionProgress();
        }, progressInterval);

        // Regular updates for resources and other panels
        setInterval(() => {
            this.updateResourceDisplay();
        }, 100); // 10 times per second

        // Slower updates for non-critical panels
        setInterval(() => {
            this.updateSkills();
            this.updateCraftingPanel();
            this.updateQuestPanel();
        }, 1000);
    }

    updateAll() {
        this.updateResourceDisplay();
        this.updateSkills();
        this.updateCraftingPanel();
        this.updateQuestPanel();
        this.updateActionPanel();
    }

    updateActionProgress() {
        if (!this.gameState.currentAction) return;
        
        const actionId = this.gameState.currentAction.id;
        const progress = ActionSystem.getActionProgress(this.gameState, actionId);
        
        const progressOverlay = document.querySelector(`.action-button[data-action="${actionId}"] .progress-overlay`);
        if (progressOverlay) {
            progressOverlay.style.width = `${progress * 100}%`;
        }
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
            <div class="section">
                <h2 class="panel-header">Actions</h2>
                <div id="action-list"></div>
            </div>
            <div class="section">
                <h2 class="panel-header">Quests</h2>
                <div id="quest-list"></div>
            </div>
        `;
        this.gameContainer.appendChild(panel);
        
        // Remove the separate quest panel creation
        this.createQuestPanel = () => {}; // Empty function to prevent errors
    }

    createCraftingPanel() {
        const panel = document.createElement('div');
        panel.className = 'crafting-panel';
        panel.innerHTML = `
            <h2>Crafting</h2>
            <div id="crafting-list"></div>
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

    updateResources() {
        const resourceList = document.getElementById('resource-list');
        const mainResources = [
            { name: 'Wood', key: 'wood' },
            { name: 'Stone', key: 'stone' },
            { name: 'Food', key: 'food' },
            { name: 'Population', key: 'population' },
            { name: 'Energy', key: 'energy' },
            { name: 'Cloth', key: 'cloth' },
            { name: 'Leather', key: 'leather' },
            { name: 'Metal', key: 'metal' },
            { name: 'Herbs', key: 'herbs' },
            { name: 'Mana crystals', key: 'mana_crystals' },
            { name: 'Mana', key: 'mana' }
        ];

        resourceList.innerHTML = mainResources
            .map(resource => `
                <div class="resource-item" data-name="${resource.name}">
                    <div class="resource-icon">${ResourceIcons[resource.key] || ''}</div>
                    <span class="resource-amount">${Math.floor(this.gameState.resources[resource.key] || 0)}</span>
                </div>
            `).join('');
    }

    formatResourceName(resource) {
        // Convert camelCase or snake_case to Title Case
        return resource
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
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
        if (!actionList) {
            console.error("Action list element not found!");
            return;
        }
        
        actionList.innerHTML = this.gameState.unlockedActions
            .map(actionId => {
                const action = ActionSystem.ACTIONS[actionId];
                if (!action) {
                    console.error(`Action not found: ${actionId}`);
                    return '';
                }
                
                const canPerform = ActionSystem.canPerformAction(this.gameState, actionId);
                const inProgress = ActionSystem.isActionInProgress(this.gameState, actionId);
                const progress = ActionSystem.getActionProgress(this.gameState, actionId);
                
                return `
                    <div class="action-item">
                        <div class="action-info">
                            <h3>${action.name}</h3>
                            <p>${action.description}</p>
                        </div>
                        <button 
                            onclick="window.game.performAction('${actionId}')"
                            ${canPerform && !inProgress ? '' : 'disabled'}
                            class="action-button"
                            data-action="${actionId}"
                        >
                            <div class="progress-overlay" style="width: ${progress * 100}%"></div>
                            <span class="button-text">
                                ${inProgress ? 'In Progress...' : 'Perform'}
                            </span>
                        </button>
                    </div>
                `;
            }).join('');
    }

    updateQuestPanel() {
        const questList = document.getElementById('quest-list');
        if (!questList) return;

        questList.innerHTML = this.gameState.questLog
            .map(quest => {
                const allObjectivesComplete = quest.objectives.every(obj => obj.completed);
                const questStatus = quest.completed ? 'completed' : (allObjectivesComplete ? 'ready' : '');
                
                return `
                    <div class="quest-item ${questStatus}">
                        <h3>${quest.name}</h3>
                        <p>${quest.description}</p>
                        <div class="quest-objectives">
                            ${quest.objectives.map(obj => `
                                <div class="objective ${obj.completed ? 'completed' : ''}"
                                     data-objective="${obj.id}">
                                    ${obj.description}
                                </div>
                            `).join('')}
                        </div>
                        ${!quest.completed && allObjectivesComplete ? `
                            <button 
                                class="quest-complete-button"
                                onclick="window.game.completeQuest('${quest.id}')"
                            >
                                Complete Quest
                            </button>
                        ` : ''}
                    </div>
                `;
            }).join('');
    }

    updateCraftingPanel() {
        const craftingList = document.getElementById('crafting-list');
        if (!craftingList) return;

        // Get available buildings that can be crafted
        const availableBuildings = this.gameState.unlockedBuildings
            .map(buildingId => {
                const building = BuildingSystem.BUILDINGS[buildingId];
                if (!building) return '';

                const canBuild = BuildingSystem.canBuild(this.gameState, buildingId);
                const costText = Object.entries(building.cost)
                    .map(([resource, amount]) => `${resource}: ${amount}`)
                    .join(', ');

                return `
                    <div class="crafting-item ${canBuild ? '' : 'disabled'}">
                        <div class="crafting-info">
                            <h3>${building.name}</h3>
                            <p>${building.description}</p>
                            <div class="crafting-cost">Cost: ${costText}</div>
                        </div>
                        <button 
                            onclick="window.game.buildStructure('${buildingId}')"
                            ${canBuild ? '' : 'disabled'}
                        >
                            Build
                        </button>
                    </div>
                `;
            })
            .join('');

        craftingList.innerHTML = availableBuildings || '<p>No buildings available to craft yet.</p>';
    }

    renderResourceItem(resource) {
        const icon = ResourceIcons[resource.key] || '';
        return `
            <div class="resource-item">
                ${icon ? `<div class="resource-icon">${icon}</div>` : ''}
                <span class="resource-name">${resource.name}</span>
                <span class="resource-amount">${Math.floor(resource.amount)}</span>
            </div>
        `;
    }

    updateResourceDisplay() {
        const resourceList = document.getElementById('resource-list');
        if (!resourceList) return;

        const resources = [
            { key: 'wood', name: 'Wood' },
            { key: 'stone', name: 'Stone' },
            { key: 'food', name: 'Food' },
            { key: 'energy', name: 'Energy' }
        ];

        resourceList.innerHTML = resources
            .map(resource => `
                <div class="resource-item" data-name="${resource.name}">
                    <div class="resource-icon">${ResourceIcons[resource.key]}</div>
                    <span class="resource-amount">${Math.floor(this.gameState.resources[resource.key] || 0)}</span>
                </div>
            `).join('');
    }
} 