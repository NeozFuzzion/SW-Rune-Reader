import React from 'react';
import runeSets from "../runeSets";
import runeStats from "../runeStats";

const RuneComponent = ({rune, monster}) => {

    return (
        <div style={{padding: '10px', margin: '10px', width: '350px'}}
             className={`border_rune border_rune${rune.rank}`}>
            <div style={{marginBottom: '10px'}}>
                <span className="rune-title">+{rune.upgrade_curr} {rune.set_name} ({rune.slot_no})  {rune.ancient ===1 && <img src="runes/ancient.png" alt='ancient'/>}</span>
            </div>
            <div className="rune-header">
                <div className="rune-img-main">
                    <div className="div-rune-img">
                        <img className="rune-set" src={`runes/${runeSets[rune.set_id].image}`} alt={`set/runes/${runeSets[rune.set_id].image}`}/>
                        <img className="rune-class" src={`runes/${rune.extra % 10}.png`} alt={`class/runes/${rune.extra % 10}.png`}/>
                        <img className={`rune-slot${rune.slot_no}`} src={`runes/rune${rune.slot_no}.png`} alt={`slot/runes/rune${rune.slot_no}.png`}/>
                        <div className="stars">
                            {[...Array(rune.runeclass % 10)].map((_, index) => (
                                <img key={index} className="star" src={"runes/star-awakened.png"}
                                     alt={`star ${index + 1}`}/>
                            ))}
                        </div>
                    </div>
                    <div className="rune-main">
                        <span className="rune-main-stat">{runeStats[rune.main_id]['name']} {rune.main_stat}</span>
                        {rune.prefix_id !== 0 && <span className="rune-main-substat">{runeStats[rune.prefix_id]['name']} {rune.prefix_stat}</span>}
                    </div>
                </div>
                <div>
                    {monster && (
                        <img className="monster" src={`${monster.image}`} alt={monster.name}/>
                    )}
                </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <div className="rune_substats" style={{width: '130px'}}>
                    {[1, 2, 3, 4].map((num) => {
                        const subId = rune[`sub${num}_id`];
                        const subStat = rune[`sub${num}_stat`];
                        const subGrind = rune[`sub${num}_grind`];

                        return (
                            <div key={num}>
                                {(rune["sub_gemme"] === num) ? (
                                    <div className="gemmed">
                                        {runeStats[subId] && <span style={{
                                            width: 'max-content',
                                        }}> {runeStats[subId]['name']} +{subStat} </span>}

                                        {subGrind > 0 && <span style={{color: "orange"}}>+{subGrind}</span>}
                                        <img style={{scale: "80%"}} src="runes/enchanted.png" alt='runes/enchanted.png'/>
                                    </div>

                                ) : (
                                    <div className="notgemmed">
                                        {runeStats[subId] && <span>{runeStats[subId]['name']} +{subStat} </span>}
                                        {subGrind > 0 && <span style={{color: "orange"}}>+{subGrind}</span>}
                                    </div>
                                )
                                }
                            </div>
                        );
                    })}
                </div>
                <div className="rune_efficiency" style={{display: 'flex', flexDirection: 'column', alignItems: "flex-end"}}>

                    <div style={{display: 'flex', alignItems: 'center', justifyContent: "flex-end"}}>
                        <span>Efficiency :</span>{rune.efficiency !== rune.efficiency_max ?
                        (<p>{rune.efficiency.toFixed(2)}% : {rune.efficiency_max.toFixed(2)}%</p>
                        )
                        : (
                            <p>{rune.efficiency.toFixed(2)}%</p>
                        )}


                    </div>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: "flex-end"}}>
                        <span>Hero :</span><p style={{color: "#b86cff"}}> {rune.efficiency_min_hero.toFixed(2)}%
                            : {rune.efficiency_max_hero.toFixed(2)}%</p>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: "flex-end"}}>
                        <span>Leg :</span><p style={{color: "orange"}}> {rune.efficiency_min_leg.toFixed(2)}%
                        : {rune.efficiency_max_leg.toFixed(2)}%</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default RuneComponent;