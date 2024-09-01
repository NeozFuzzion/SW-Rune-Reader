import runeSets from "./runeSets";
import runeStats from "./runeStats";

class Rune {
    maxProcEffi = [1/51,1/34,5/102,1/17,7/102,1/14]
    constructor(data) {
        this.rune_id = data['rune_id'];
        this.occupied_type = data['occupied_type'];
        this.occupied_id = data['occupied_id'];
        this.slot_no = data['slot_no'];
        this.rank = data['rank'];
        this.ancient = (data['rank']>10) ? 1:0;
        this.runeclass = data['class'];
        this.set_id = data['set_id'];
        this.set_name = runeSets[data['set_id']]['name']
        this.upgrade_limit = data['upgrade_limit'];
        this.upgrade_curr = data['upgrade_curr'];
        this.base_value = data['base_value'];
        this.sell_value = data['sell_value'];
        this.main_id = data['pri_eff'][0];
        this.main_stat = data['pri_eff'][1];
        this.prefix_id = data['prefix_eff'][0];
        this.prefix_stat = data['prefix_eff'][1];
        this[`sub_gemme`] = 0;
        const max_hero = [];
        const max_leg = [];
        const min_leg = [];
        const min_hero = [];
        data['sec_eff'].forEach((item, index) => {
            this[`sub${index + 1}_id`] = item[0];
            this[`sub${index + 1}_stat`] = item[1];
            this[`sub${index + 1}_grind`] = item[3];
            if (item[2] === 1) {
                this[`sub_gemme`] = index+1;
            }
            max_hero[index] = [item[0],item[1],item[2],runeStats[item[0]]['max_hero']];
            min_hero[index] = [item[0],item[1],item[2],runeStats[item[0]]['min_hero']];
            min_leg[index] = [item[0],item[1],item[2],runeStats[item[0]]['min_leg']];
            max_leg[index] = [item[0],item[1],item[2],runeStats[item[0]]['max_leg']];
        });
        this.extra = data['extra'];
        this.efficiency = this.calcEfficiency(data['sec_eff'],data['prefix_eff'],data['pri_eff'],data['class'])*100;
        const tmp_max =  (data['upgrade_curr']<12) ? (4-Math.trunc(data['upgrade_curr']/3))*100*this.maxProcEffi[data['class']%10-1] : 0;
        this.efficiency_max = this.efficiency + tmp_max;
        this.efficiency_min_hero = this.calcEfficiency(min_hero,data['prefix_eff'],data['pri_eff'],data['class'])*100 + tmp_max;
        this.efficiency_max_hero = this.calcEfficiency(max_hero,data['prefix_eff'],data['pri_eff'],data['class'])*100 + tmp_max;
        this.efficiency_min_leg = this.calcEfficiency(min_leg,data['prefix_eff'],data['pri_eff'],data['class'])*100 + tmp_max;
        this.efficiency_max_leg = this.calcEfficiency(max_leg,data['prefix_eff'],data['pri_eff'],data['class'])*100 + tmp_max;
    }

    calcEfficiency(sub_rune,prefix,main,runeclass) {
        let sum = runeStats[main[0]][`max_main${runeclass%10}`]/runeStats[main[0]][`max_main6`];
        if (prefix[0] !== 0){
            sum += prefix[1]/runeStats[prefix[0]][`max_sub${runeclass}`] * (([1,3,5].includes(prefix[0])) ? 0.5 : 1);
        }
        for (const sumKey in sub_rune) {
            sum +=  (sub_rune[sumKey][1]+sub_rune[sumKey][3])/runeStats[sub_rune[sumKey][0]][`max_sub${runeclass}`] * (([1,3,5].includes(sub_rune[sumKey][0])) ? 0.5 : 1);
        }
        return sum/2.8;
    }

}

export default Rune;
