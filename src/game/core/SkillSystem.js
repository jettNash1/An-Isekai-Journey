class SkillSystem {
    static SKILL_BASE_XP = 100;
    static XP_MULTIPLIER = 1.5;

    static addExperience(gameState, skill, amount) {
        const skillData = gameState.skills[skill];
        if (!skillData) return;

        skillData.exp += amount;
        while (this.canLevelUp(skillData)) {
            this.levelUp(skillData);
        }
    }

    static canLevelUp(skillData) {
        return skillData.exp >= this.getRequiredXP(skillData.level);
    }

    static getRequiredXP(level) {
        return Math.floor(this.SKILL_BASE_XP * Math.pow(this.XP_MULTIPLIER, level - 1));
    }

    static levelUp(skillData) {
        const requiredXP = this.getRequiredXP(skillData.level);
        skillData.exp -= requiredXP;
        skillData.level += 1;
    }
} 