class MagicSystem {
    static SPELL_SCHOOLS = {
        elemental: {
            name: 'Elemental Magic',
            description: 'Harness the power of the elements',
            primaryStat: 'magic'
        },
        divine: {
            name: 'Divine Magic',
            description: 'Channel healing and protective energies',
            primaryStat: 'magic'
        },
        arcane: {
            name: 'Arcane Magic',
            description: 'Manipulate raw magical energy',
            primaryStat: 'magic'
        }
    };

    static SPELLS = {
        // Elemental Spells
        fireball: {
            name: 'Fireball',
            school: 'elemental',
            manaCost: 10,
            requirements: {
                skills: { magic: 5 }
            },
            effect: (caster, target) => ({
                damage: 15 + caster.skills.magic.level * 2,
                type: 'fire'
            })
        },

        // Divine Spells
        heal: {
            name: 'Heal',
            school: 'divine',
            manaCost: 15,
            requirements: {
                skills: { magic: 8 }
            },
            effect: (caster, target) => ({
                healing: 20 + caster.skills.magic.level * 1.5
            })
        },

        // Arcane Spells
        manaShield: {
            name: 'Mana Shield',
            school: 'arcane',
            manaCost: 20,
            duration: 30, // seconds
            requirements: {
                skills: { magic: 10 }
            },
            effect: (caster) => ({
                shield: caster.skills.magic.level * 3,
                manaEfficiency: 1.2
            })
        }
    };

    static ENCHANTMENTS = {
        sharpness: {
            name: 'Sharpness',
            type: 'weapon',
            requirements: {
                skills: { enchanting: 5 }
            },
            effect: (item) => {
                item.stats.damage = Math.floor(item.stats.damage * 1.2);
                return item;
            },
            materials: { mana_crystals: 2 }
        },
        protection: {
            name: 'Protection',
            type: 'armor',
            requirements: {
                skills: { enchanting: 8 }
            },
            effect: (item) => {
                item.stats.armor = Math.floor(item.stats.armor * 1.25);
                return item;
            },
            materials: { mana_crystals: 3 }
        }
    };

    static canCastSpell(caster, spellId) {
        const spell = this.SPELLS[spellId];
        if (!spell) return false;

        if (caster.resources.mana < spell.manaCost) return false;

        if (spell.requirements.skills) {
            for (const [skill, level] of Object.entries(spell.requirements.skills)) {
                if (caster.skills[skill].level < level) return false;
            }
        }

        return true;
    }

    static castSpell(caster, spellId, target) {
        if (!this.canCastSpell(caster, spellId)) return false;

        const spell = this.SPELLS[spellId];
        caster.resources.mana -= spell.manaCost;

        const effect = spell.effect(caster, target);
        this.applySpellEffect(effect, target);

        // Grant magic experience
        SkillSystem.addExperience(caster, 'magic', spell.manaCost / 2);

        return true;
    }
} 