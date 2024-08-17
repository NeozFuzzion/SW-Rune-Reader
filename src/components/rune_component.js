import React from 'react';

const RuneComponent = ({ data }) => {
    return (
        <div style={{ border: '1px solid black', padding: '10px', margin: '10px' }}>
            <h3>Rune ID: {data.rune_id}</h3>
            <p>Set: {data.set_name}</p>
            <p>Slot: {data.slot_no}</p>
            <p>Rank: {data.rank}</p>
            <p>Main Stat: {data.main_stat}</p>
            <p>Efficiency: {data.efficiency.toFixed(2)}%</p>
        </div>
    );
};

export default RuneComponent;