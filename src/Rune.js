import runeSets from "./runeSets";
import runeStats from "./runeStats";

class Rune {
    constructor({
                    rune_id,
                    wizard_id,
                    occupied_type,
                    occupied_id,
                    slot_no,
                    rank,
                    runeclass,
                    set_id,
                    upgrade_limit,
                    upgrade_curr,
                    base_value,
                    sell_value,
                    pri_eff,
                    prefix_eff,
                    sec_eff,
                    extra
                }) {
        this.rune_id = rune_id;
        this.occupied_type = occupied_type;
        this.occupied_id = occupied_id;
        this.slot_no = slot_no;
        this.rank = rank;
        this.runeclass = runeclass;
        this.set_id = set_id;
        console.log(set_id);
        console.log({
            rune_id,
            wizard_id,
            occupied_type,
            occupied_id,
            slot_no,
            rank,
            runeclass,
            set_id,
            upgrade_limit,
            upgrade_curr,
            base_value,
            sell_value,
            pri_eff,
            prefix_eff,
            sec_eff,
            extra
        });
        this.set_name = runeSets[set_id]['name']
        this.upgrade_limit = upgrade_limit;
        this.upgrade_curr = upgrade_curr;
        this.base_value = base_value;
        this.sell_value = sell_value;
        this.main_id = pri_eff[0];
        this.main_stat = pri_eff[1];
        this.prefix_id = prefix_eff[0];
        this.prefix_stat = prefix_eff[1];
        this[`sub_gemme`] = 0;
        sec_eff.forEach((item, index) => {
            this[`sub${index + 1}_id`] = item[0];
            this[`sub${index + 1}_stat`] = item[1];
            this[`sub${index + 1}_grind`] = item[3];
            if (item[2] === 1) {
                this[`sub_gemme`] = index+1;
            }
        });
        this.extra = extra;
        this.efficiency = this.calcEfficiency(sec_eff)*100;
        this.efficiency_max = this.efficiency + (4-sec_eff.length)*7.14;
    }

    calcEfficiency(sub_rune) {
        let sum = 1;

        for (const sumKey in sub_rune) {
            sum += (sub_rune[sumKey][1]+sub_rune[sumKey][3])/runeStats[sub_rune[sumKey][0]]["max_sub6"];
        }
        return sum/2.8;
    }

}

export default Rune;
