class MapSystem {
    static MAP_SIZE = 20; // 20x20 grid
    static MAX_DISTANCE = Math.sqrt(2 * Math.pow(this.MAP_SIZE/2, 2)); // Max distance from center
    
    static LOCATION_TYPES = {
        SETTLEMENT: 'settlement',
        MONSTER: 'monster',
        RESOURCE: 'resource',
        LANDMARK: 'landmark',
        DUNGEON: 'dungeon'
    };

    static RESOURCE_NODES = {
        wood_grove: {
            name: 'Dense Grove',
            type: 'resource',
            resource: 'wood',
            baseAmount: 20,
            skillReq: { woodcutting: 1 },
            respawnTime: 3600 // 1 hour in seconds
        },
        iron_deposit: {
            name: 'Iron Deposit',
            type: 'resource',
            resource: 'iron_ore',
            baseAmount: 15,
            skillReq: { mining: 5 },
            respawnTime: 7200
        },
        herb_patch: {
            name: 'Herb Patch',
            type: 'resource',
            resource: 'herbs',
            baseAmount: 10,
            skillReq: { herbalism: 3 },
            respawnTime: 1800
        }
    };

    static MONSTER_ZONES = {
        wolf_den: {
            name: 'Wolf Den',
            type: 'monster',
            monsters: ['wolf', 'dire_wolf'],
            difficulty: 1,
            minDistance: 2,
            maxDistance: 5,
            requirements: {
                combat: 5
            }
        },
        bandit_camp: {
            name: 'Bandit Camp',
            type: 'monster',
            monsters: ['bandit', 'bandit_archer'],
            difficulty: 2,
            minDistance: 4,
            maxDistance: 8,
            requirements: {
                combat: 15
            }
        },
        ancient_ruins: {
            name: 'Ancient Ruins',
            type: 'dungeon',
            monsters: ['skeleton', 'ancient_guardian'],
            difficulty: 3,
            minDistance: 6,
            maxDistance: 12,
            requirements: {
                combat: 25
            }
        }
    };

    static generateMap(gameState) {
        const map = {
            locations: [],
            lastGenerated: Date.now(),
            questLocations: new Map() // Maps quest IDs to location IDs
        };

        // Add settlement at center
        map.locations.push({
            id: 'settlement',
            type: this.LOCATION_TYPES.SETTLEMENT,
            name: 'Main Settlement',
            x: this.MAP_SIZE / 2,
            y: this.MAP_SIZE / 2
        });

        // Add resource nodes
        this.generateResourceNodes(map);

        // Add monster zones
        this.generateMonsterZones(map, gameState);

        // Add quest-specific locations
        this.generateQuestLocations(map, gameState);

        return map;
    }

    static generateResourceNodes(map) {
        const nodeCount = 10 + Math.floor(Math.random() * 10);
        for (let i = 0; i < nodeCount; i++) {
            const nodeType = this.randomResourceNode();
            const location = this.generateLocation(map, nodeType);
            if (location) {
                map.locations.push(location);
            }
        }
    }

    static generateMonsterZones(map, gameState) {
        for (const [zoneId, zone] of Object.entries(this.MONSTER_ZONES)) {
            if (this.meetsRequirements(gameState, zone.requirements)) {
                const distance = this.getDistanceRange(zone.difficulty);
                const location = this.generateLocation(map, zone, distance);
                if (location) {
                    map.locations.push(location);
                }
            }
        }
    }

    static generateQuestLocations(map, gameState) {
        for (const quest of gameState.questLog) {
            if (quest.locationType && !map.questLocations.has(quest.id)) {
                const location = this.generateLocation(map, quest.locationType);
                if (location) {
                    location.questId = quest.id;
                    map.locations.push(location);
                    map.questLocations.set(quest.id, location.id);
                }
            }
        }
    }

    static generateLocation(map, locationType, preferredDistance = null) {
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            const angle = Math.random() * 2 * Math.PI;
            const distance = preferredDistance || (Math.random() * this.MAX_DISTANCE);
            
            const x = (this.MAP_SIZE / 2) + Math.cos(angle) * distance;
            const y = (this.MAP_SIZE / 2) + Math.sin(angle) * distance;

            if (this.isValidLocation(map, x, y)) {
                return {
                    id: `${locationType.type}_${Date.now()}_${Math.random().toString(36)}`,
                    ...locationType,
                    x,
                    y,
                    discovered: false
                };
            }

            attempts++;
        }

        return null;
    }

    static isValidLocation(map, x, y) {
        if (x < 0 || x >= this.MAP_SIZE || y < 0 || y >= this.MAP_SIZE) {
            return false;
        }

        // Check minimum distance from other locations
        const minDistance = 2;
        return !map.locations.some(loc => 
            this.getDistance(x, y, loc.x, loc.y) < minDistance
        );
    }

    static getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    static getDistanceRange(difficulty) {
        const baseDistance = 3;
        return baseDistance * difficulty + Math.random() * 2;
    }

    static meetsRequirements(gameState, requirements) {
        if (!requirements) return true;
        
        if (requirements.combat) {
            return gameState.getCombatLevel() >= requirements.combat;
        }
        return true;
    }

    static exploreLocation(gameState, locationId) {
        const location = gameState.map.locations.find(l => l.id === locationId);
        if (!location || !this.canExplore(gameState, location)) return false;

        location.discovered = true;

        // Handle different location types
        switch (location.type) {
            case this.LOCATION_TYPES.RESOURCE:
                return this.harvestResource(gameState, location);
            case this.LOCATION_TYPES.MONSTER:
            case this.LOCATION_TYPES.DUNGEON:
                return this.initiateCombat(gameState, location);
            default:
                return true;
        }
    }

    static canExplore(gameState, location) {
        if (location.discovered && location.lastHarvested) {
            const timeSinceHarvest = (Date.now() - location.lastHarvested) / 1000;
            if (timeSinceHarvest < location.respawnTime) return false;
        }

        if (location.skillReq) {
            for (const [skill, level] of Object.entries(location.skillReq)) {
                if (gameState.skills[skill].level < level) return false;
            }
        }

        return true;
    }

    static harvestResource(gameState, location) {
        const baseAmount = location.baseAmount;
        const skillLevel = gameState.skills[location.skillReq].level;
        const amount = Math.floor(baseAmount * (1 + skillLevel * 0.1));

        gameState.resources[location.resource] += amount;
        location.lastHarvested = Date.now();

        return {
            success: true,
            resource: location.resource,
            amount: amount
        };
    }

    static initiateCombat(gameState, location) {
        // This will be handled by the combat system
        return {
            success: true,
            combatInitiated: true,
            location: location
        };
    }
} 