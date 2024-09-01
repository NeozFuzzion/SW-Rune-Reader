import React, { useEffect, useState } from 'react';
import ReactSlider from 'react-slider';
import Rune from "../Rune";
import Monster from "../Monster";
import monstersData from '../data/monsters_data.json';
import RuneComponent from "./rune_component";

const JsonUploader = () => {
    const [runes, setRunes] = useState([]);
    const [monsters, setMonsters] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [filters, setFilters] = useState({
        setName: '',
        slotNo: '',
        rank: '',
    });
    const [sortOrder, setSortOrder] = useState({
        attribute: 'efficiency',
        direction: 'desc'
    });
    const [efficiencyRange, setEfficiencyRange] = useState({
        efficiency: [0, 160],
        max_efficiency: [0, 160],
        min_hero: [0, 160],
        min_leg: [0, 160],
        max_hero: [0, 160],
        max_leg: [0, 160]
    });

    useEffect(() => {
        const storedRunes = localStorage.getItem('runes');
        if (storedRunes) {
            const parsedRunes = JSON.parse(storedRunes);
            setRunes(Object.values(parsedRunes));
        }
        const storedMonsters = localStorage.getItem('monsters');
        if (storedMonsters) {
            const parsedMonsters = JSON.parse(storedMonsters);
            setMonsters(parsedMonsters);
        }
    }, []);

    const clearData = () => {
        setRunes([]);
        localStorage.removeItem('runes');
        localStorage.removeItem('monsters');
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        const runeset = {};
        const monsterset = {};

        reader.onload = async (e) => {
            const data = JSON.parse(e.target.result);
            for (let datumKey in data['unit_list']) {
                const monster = monstersData[data['unit_list'][datumKey]["unit_master_id"]];
                monsterset[data['unit_list'][datumKey]["unit_id"]] = new Monster(
                    data['unit_list'][datumKey]["unit_id"],
                    data['unit_list'][datumKey]["unit_lvl"],
                    monster["name"],
                    monster["image_filename"],
                    monster["element"]
                );

                for (let datum in data['unit_list'][datumKey]["runes"]) {
                    runeset[data['unit_list'][datumKey]["runes"][datum]["rune_id"]] = new Rune(data['unit_list'][datumKey]["runes"][datum]);
                }
            }
            for (let datumKey in data['runes']) {
                runeset[data["runes"][datumKey]["rune_id"]] = new Rune(data["runes"][datumKey]);
            }
            localStorage.setItem('userData', JSON.stringify(data['unit_list']));
            localStorage.setItem('runes', JSON.stringify(runeset));
            localStorage.setItem('monsters', JSON.stringify(monsterset));

            const storedRunes = localStorage.getItem('runes');
            if (storedRunes) {
                const parsedRunes = JSON.parse(storedRunes);
                setRunes(Object.values(parsedRunes));
            }
            const storedMonsters = localStorage.getItem('monsters');
            if (storedMonsters) {
                const parsedMonsters = JSON.parse(storedMonsters);
                setMonsters(parsedMonsters);
            }
        };
        reader.readAsText(file);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const handleEfficiencyRangeChange = (name, values) => {
        setEfficiencyRange((prevRange) => ({
            ...prevRange,
            [name]: values
        }));
    };

    const handleSortOrderChange = (attribute) => {
        setSortOrder((prevSortOrder) => ({
            attribute,
            direction: prevSortOrder.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const filteredRunes = runes.filter((rune) => {
        return (
            (!filters.setName || rune.set_name.toLowerCase().includes(filters.setName.toLowerCase())) &&
            (!filters.slotNo || rune.slot_no.toString() === filters.slotNo) &&
            (!filters.rank || rune.rank.toString() === filters.rank) &&
            rune.efficiency >= efficiencyRange.efficiency[0] && rune.efficiency <= efficiencyRange.efficiency[1] &&
            rune.efficiency_max >= efficiencyRange.max_efficiency[0] && rune.efficiency_max <= efficiencyRange.max_efficiency[1] &&
            rune.efficiency_min_hero >= efficiencyRange.min_hero[0] && rune.efficiency_min_hero <= efficiencyRange.min_hero[1] &&
            rune.efficiency_max_hero >= efficiencyRange.max_hero[0] && rune.efficiency_max_hero <= efficiencyRange.max_hero[1] &&
            rune.efficiency_min_leg >= efficiencyRange.min_leg[0] && rune.efficiency_min_leg <= efficiencyRange.min_leg[1] &&
            rune.efficiency_max_leg >= efficiencyRange.max_leg[0] && rune.efficiency_max_leg <= efficiencyRange.max_leg[1]
        );
    });

    const sortedRunes = filteredRunes.sort((a, b) => {
        const valueA = a[sortOrder.attribute];
        const valueB = b[sortOrder.attribute];
        if (valueA < valueB) return sortOrder.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortOrder.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedRunes.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRunes = sortedRunes.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Your Runes</h1>
            <button onClick={clearData}>Clear Data</button>
            {runes.length === 0 ? (
                <div>
                    <p>No runes to display. Please upload a JSON file.</p>
                    <input type="file" accept=".json" onChange={handleFileUpload} />
                </div>
            ) : (
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label>
                            Set Name:
                            <input
                                type="text"
                                name="setName"
                                value={filters.setName}
                                onChange={handleFilterChange}
                            />
                        </label>
                        <label>
                            Slot Number:
                            <input
                                type="number"
                                name="slotNo"
                                value={filters.slotNo}
                                onChange={handleFilterChange}
                            />
                        </label>
                        <label>
                            Rank:
                            <input
                                type="number"
                                name="rank"
                                value={filters.rank}
                                onChange={handleFilterChange}
                            />
                        </label>
                    </div>

                    {/* Efficiency Range Sliders */}
                    <div style={{marginBottom: '10px', display: 'flex', flexDirection: 'row', justifyContent:'center', alignItems: 'center' }}>
                        <div>
                            Efficiency:

                            <div>{efficiencyRange.efficiency[0]} : {efficiencyRange.efficiency[1]}<ReactSlider
                                className="horizontal-slider"
                                thumbClassName="thumb"
                                trackClassName="track"
                                value={efficiencyRange.efficiency}
                                onChange={(values) => handleEfficiencyRangeChange('efficiency', values)}
                                min={0}
                                max={160}
                                ariaLabel={['Lower thumb', 'Upper thumb']}
                                ariaValuetext={(state) => `Thumb value ${state.valueNow}`}
                            /></div>
                        </div>
                        <div>
                            Efficiency Max:

                            <div>{efficiencyRange.max_efficiency[0]} : {efficiencyRange.max_efficiency[1]}<ReactSlider
                                className="horizontal-slider"
                                thumbClassName="thumb"
                                trackClassName="track"
                                value={efficiencyRange.max_efficiency}
                                onChange={(values) => handleEfficiencyRangeChange('max_efficiency', values)}
                                min={0}
                                max={160}
                                ariaLabel={['Lower thumb', 'Upper thumb']}
                                ariaValuetext={(state) => `Thumb value ${state.valueNow}`}
                            /></div>
                        </div>
                        <div>
                            Efficiency Min Hero:

                            <div>{efficiencyRange.min_hero[0]} : {efficiencyRange.min_hero[1]}<ReactSlider
                                className="horizontal-slider"
                                thumbClassName="thumb"
                                trackClassName="track"
                                value={efficiencyRange.min_hero}
                                onChange={(values) => handleEfficiencyRangeChange('min_hero', values)}
                                min={0}
                                max={160}
                                ariaLabel={['Lower thumb', 'Upper thumb']}
                                ariaValuetext={(state) => `Thumb value ${state.valueNow}`}
                            /></div>
                        </div>
                        <div>
                            Efficiency Max Hero:

                            <div>{efficiencyRange.max_hero[0]} : {efficiencyRange.max_hero[1]}<ReactSlider
                                className="horizontal-slider"
                                thumbClassName="thumb"
                                trackClassName="track"
                                value={efficiencyRange.max_hero}
                                onChange={(values) => handleEfficiencyRangeChange('max_hero', values)}
                                min={0}
                                max={160}
                                ariaLabel={['Lower thumb', 'Upper thumb']}
                                ariaValuetext={(state) => `Thumb value ${state.valueNow}`}
                            /></div>
                        </div>
                        <div>
                            Efficiency Min Leg:

                            <div>{efficiencyRange.min_leg[0]} : {efficiencyRange.min_leg[1]}<ReactSlider
                                className="horizontal-slider"
                                thumbClassName="thumb"
                                trackClassName="track"
                                value={efficiencyRange.min_leg}
                                onChange={(values) => handleEfficiencyRangeChange('min_leg', values)}
                                min={0}
                                max={160}
                                ariaLabel={['Lower thumb', 'Upper thumb']}
                                ariaValuetext={(state) => `Thumb value ${state.valueNow}`}
                            /></div>
                        </div>
                        <div>
                            Efficiency Max Leg:

                            <div>{efficiencyRange.max_leg[0]} : {efficiencyRange.max_leg[1]}<ReactSlider
                                className="horizontal-slider"
                                thumbClassName="thumb"
                                trackClassName="track"
                                value={efficiencyRange.max_leg}
                                onChange={(values) => handleEfficiencyRangeChange('max_leg', values)}
                                min={0}
                                max={160}
                                ariaLabel={['Lower thumb', 'Upper thumb']}
                                ariaValuetext={(state) => `Thumb value ${state.valueNow}`}
                            /></div>
                        </div>
                    </div>

                    {/* Sorting controls */}
                    <div style={{marginBottom: '10px'}}>
                        <label>Sort by:</label>
                        <select onChange={(e) => handleSortOrderChange(e.target.value)}>
                            <option value="efficiency">Efficiency</option>
                            <option value="efficiency_min_hero">Efficiency Min Hero</option>
                            <option value="efficiency_max_hero">Efficiency Max Hero</option>
                            <option value="efficiency_min_leg">Efficiency Min Leg</option>
                            <option value="efficiency_max_leg">Efficiency Max Leg</option>
                        </select>
                        <button onClick={() => handleSortOrderChange(sortOrder.attribute)}>
                        {sortOrder.direction === 'asc' ? 'Ascending' : 'Descending'}
                        </button>
                    </div>

                    {/* Select to change items per page */}
                    <div style={{ marginTop: '10px' }}>
                        <label>Items per page: </label>
                        <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {currentRunes.map((rune) => (
                            <RuneComponent key={rune.rune_id} rune={rune} monster={monsters[rune.occupied_id]} />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    <div style={{ marginTop: '20px' }}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span> Page {currentPage} of {totalPages} </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JsonUploader;
