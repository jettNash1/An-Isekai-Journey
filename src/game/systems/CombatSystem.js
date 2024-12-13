class CombatSystem {
    static COMBAT_STYLES = {
        melee: {
            name: 'Melee Combat',
            mainStats: ['melee', 'defense'],
            weaponTypes: ['sword', 'axe', 'mace', 'spear'],
            baseAccuracy: 0.8
        },
        ranged: {
            name: 'Ranged Combat',
            mainStats: ['ranged', 'defense'],
            weaponTypes: ['bow', 'crossbow', 'thrown'],
            baseAccuracy: 0.7
        },
        magic: {
            name: 'Magic Combat',
            mainStats: ['magic', 'defense'],
            weaponTypes: ['staff', 'wand', 'orb'],
            baseAccuracy: 0.75
        }
    };

    static calculateDamage(attacker, defender, style) {
        const weaponDamage = this.getWeaponDamage(attacker);
        const styleBonus = attacker.skills[style].level;
        const armorReduction = this.calculateArmorReduction(defender);
        
        let baseDamage = weaponDamage * (1 + styleBonus / 50);
        let finalDamage = Math.max(1, baseDamage - armorReduction);
        
        // Critical hit chance based on skill level
        if (Math.random() < attacker.skills[style].level / 200) {
            finalDamage *= 2;
        }

        return Math.floor(finalDamage);
    }

    static calculateArmorReduction(character) {
        const baseArmor = character.skills.armor.level;
        const equipmentArmor = Object.values(character.equipment)
            .filter(item => item && item.stats.armor)
            .reduce((sum, item) => sum + item.stats.armor, 0);

        return baseArmor + equipmentArmor;
    }

    static getWeaponDamage(character) {
        const weapon = character.equipment.mainHand;
        if (!weapon) return 1;
        return weapon.stats.damage || 1;
    }

    static calculateHitChance(attacker, defender, style) {
        const baseAccuracy = this.COMBAT_STYLES[style].baseAccuracy;
        const attackerBonus = attacker.skills[style].level / 100;
        const defenderBonus = defender.skills.defense.level / 100;

        return Math.min(0.95, Math.max(0.1, baseAccuracy + attackerBonus - defenderBonus));
    }
} 