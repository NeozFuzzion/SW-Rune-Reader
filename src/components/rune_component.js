import React from 'react';
import runeSets from "../runeSets";
import runeStats from "../runeStats";

const RuneComponent = ({ rune, monster }) => {
    return (
        <div style={{padding: '10px', margin: '10px', width: '400px'}} className={"border_rune "+`border_rune${rune.rank}`}>
            <div>
                <span className="rune-title">+{rune.upgrade_curr} {rune.set_name} ({rune.slot_no})</span>
            </div>
            <div className="rune-header">
                <div className="rune-img-main">
                    <div className="div-rune-img">
                        <img className="rune-set" src={`runes/${runeSets[rune.set_id].image}`}/>
                        <img className="rune-class" src={`runes/${rune.rank % 10}.png`}/>
                        <img className={`rune-slot${rune.slot_no}`} src={`runes/rune${rune.slot_no}.png`}/>
                        <div className="stars">
                            {[...Array(rune.runeclass%10)].map((_, index) => (
                                <img key={index} className="star" src={"runes/star-awakened.png"} alt={`star ${index + 1}`} />
                            ))}
                        </div>
                    </div>
                    <div className="rune-main">
                        <span>{runeStats[rune.main_id]['name']} {rune.main_stat}</span>
                        {rune.prefix_id !== 0 && <span>{runeStats[rune.prefix_id]['name']} {rune.prefix_stat}</span>}
                    </div>
                </div>
                <div>
                    {monster && (
                        <img className="monster" src={`${monster.image}`} alt={monster.name} />
                    )}
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ width: '150px' }}>
                    {[1, 2, 3, 4].map((num) => {
                        const subId = rune[`sub${num}_id`];
                        const subStat = rune[`sub${num}_stat`];
                        const subGrind = rune[`sub${num}_grind`];

                        return (
                            <div key={num}>
                                {/* Check if subId exists in runeStats and handle undefined case */}
                                {runeStats[subId] && runeStats[subId]['name']} {subStat}
                                {subGrind > 0 && <span style={{color: "orange"}}>+{subGrind}</span>}
                            </div>
                        );
                    })}
                </div>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <p>Eff. : {rune.efficiency.toFixed(2)}%</p>
                        {rune.efficiency !== rune.efficiency_max && <p>Eff. max: {rune.efficiency_max.toFixed(2)}%</p>}

                    </div>
                    <div style={{display: 'flex'}}>
                        <p>Eff. min hero: {rune.efficiency_min_hero.toFixed(2)}%</p>
                        <p>Eff. max hero: {rune.efficiency_max_hero.toFixed(2)}%</p>
                    </div>
                    <div style={{display: 'flex'}}>
                        <p>Eff. min leg: {rune.efficiency_min_leg.toFixed(2)}%</p>
                        <p>Eff. max leg: {rune.efficiency_max_leg.toFixed(2)}%</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default RuneComponent;