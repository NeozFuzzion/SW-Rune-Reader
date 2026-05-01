import {useEffect, useState} from 'react';
import ReactSlider from 'react-slider';
import Select from 'react-select';
import Rune from "../Rune";
import Monster from "../Monster";
import monstersData from '../data/monsters_data.json';
import RuneComponent from "./rune_component";
import runeSets from "../runeSets";
import runeStats from "../runeStats";
import Pagination from "./pagination";
import {clearStore, getAllItems, getAllMonsters, setItem} from '../indexedDB';
import { useI18n } from '../i18n';


const customStyles = {
    control: (provided) => ({
        ...provided,
        backgroundColor: '#282c34',
        color: 'white',
        borderColor: '#282c34',
        boxShadow: 'none',
        '&:hover': {
            borderColor: '#61dafb',
        },
        margin: '5px 10px 5px 10px',
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#282c34',
        zIndex: 11,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#61dafb' : '#282c34',
        color: state.isSelected ? '#282c34' : 'white',
        '&:hover': {
            backgroundColor: '#61dafb',
            color: '#282c34',
        },
    }),
    singleValue: (provided) => ({
        ...provided,
        color: 'white',
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: '#61dafb',
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: '#282c34',
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        color: '#282c34',
        '&:hover': {
            backgroundColor: '#61dafb',
            color: '#282c34',
        },
    }),
};

const JsonUploader = () => {
    const { t, lang } = useI18n();
    const [runes, setRunes] = useState([]);
    const [monsters, setMonsters] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [filters, setFilters] = useState({
        setName: [],
        slotNo: [],
        runeMain: [],
        substat: [],
        level: [0, 15],
        rank: '',
        ancient: '1',
    });

    const ancientOptions = [
        { value: '0', label: t('ancientWithout') },
        { value: '1', label: t('ancientAll') },
        { value: '2', label: t('ancientOnly') },
    ];

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

    const setNameOptions = Object.values(runeSets).map(runeSet => ({
        value: runeSet.id_set,
        label: lang === 'fr' && runeSet.name_fr ? runeSet.name_fr : runeSet.name
    }));

    const statOptions = Object.values(runeStats).map(runeStat => ({
        value: runeStat.id_stat,
        label: lang === 'fr' && runeStat.name_fr ? runeStat.name_fr : runeStat.name
    }));

    const slotOptions = [
        {value: '1', label: `${t('slotPrefix')} 1`},
        {value: '2', label: `${t('slotPrefix')} 2`},
        {value: '3', label: `${t('slotPrefix')} 3`},
        {value: '4', label: `${t('slotPrefix')} 4`},
        {value: '5', label: `${t('slotPrefix')} 5`},
        {value: '6', label: `${t('slotPrefix')} 6`},
    ];

    useEffect(() => {
        const fetchData = async () => {
            const storedRunes = await getAllItems('runes');
            const storedMonsters = await getAllMonsters('monsters');
            setRunes(storedRunes);
            setMonsters(storedMonsters);
        };
        fetchData();
    }, []);

    const clearData = async () => {
        setRunes([]);
        setMonsters([]);
        await clearStore('runes');
        await clearStore('monsters');
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        const runeset = {};
        const monsterset = {};

        reader.onload = async (e) => {
            const data = JSON.parse(e.target.result);
            for (let datumKey in data['unit_list']) {
                const unitData = data['unit_list'][datumKey];
                const monster = monstersData[unitData["unit_master_id"]];

                if (monster) {
                    monsterset[unitData["unit_id"]] = new Monster(
                        unitData["unit_id"],
                        unitData["unit_lvl"],
                        monster["name"],
                        monster["image_filename"],
                        monster["element"]
                    );
                } else {
                    console.warn(`Monster inconnu (unit_master_id: ${unitData["unit_master_id"]}), utilisation de valeurs par défaut.`);
                    monsterset[unitData["unit_id"]] = new Monster(
                        unitData["unit_id"],
                        unitData["unit_lvl"],
                        `Unknown (${unitData["unit_master_id"]})`,
                        "",
                        "unknown"
                    );
                }

                for (let datum in unitData["runes"]) {
                    const runeData = new Rune(unitData["runes"][datum]);
                    runeset[unitData["runes"][datum]["rune_id"]] = runeData;
                    await setItem('runes', runeData); // Store rune in IndexedDB
                }
            }
            for (let datumKey in data['runes']) {
                const runeData = new Rune(data["runes"][datumKey]);
                runeset[data["runes"][datumKey]["rune_id"]] = runeData;
                await setItem('runes', runeData); // Store rune in IndexedDB
            }

            for (const monsterId in monsterset) {
                await setItem('monsters', monsterset[monsterId]); // Store monster in IndexedDB
            }

            // Fetch and update the state after uploading
            const storedRunes = await getAllItems('runes');
            const storedMonsters = await getAllMonsters('monsters');
            setRunes(storedRunes);
            setMonsters(storedMonsters);
        };
        reader.readAsText(file);
    };

    // The rest of your code remains unchanged
    const handleFilterChange = (name, value) => {
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
            direction: prevSortOrder.attribute === attribute
                ? prevSortOrder.direction === 'asc' ? 'desc' : 'asc' // Toggle direction if the same attribute is clicked
                : 'desc' // Default to 'asc' if a new attribute is clicked
        }));
    };

    const filteredRunes = runes.filter((rune) => {
        const matchesSlot = !filters.slotNo.length || filters.slotNo.some((slot) => rune.slot_no.toString() === slot.value);
        const matchesRuneMain = !filters.runeMain.length || filters.runeMain.some((mainStat) => rune.main_id === mainStat.value);
        const matchesSubstat = filters.substat.length === 0 || filters.substat.every((sub) => {
            return (
                rune[`sub1_id`] === sub.value ||
                rune[`sub2_id`] === sub.value ||
                rune[`sub3_id`] === sub.value ||
                rune[`sub4_id`] === sub.value
            );
        });
        const matchesLevel = rune.upgrade_curr >= filters.level[0] && rune.upgrade_curr <= filters.level[1];
        const matchesAncientFilter = filters.ancient === '1'  // Show all runes
            || (filters.ancient === '0' && rune.ancient === 0)  // Without ancient runes
            || (filters.ancient === '2' && rune.ancient === 1); // Only ancient runes
        return (
            (!filters.setName.length || filters.setName.some((set) => rune.set_id === set.value)) &&
            matchesSlot &&
            matchesAncientFilter &&
            matchesRuneMain &&
            matchesSubstat &&
            matchesLevel &&
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
        <div style={{padding: '20px'}}>
            {runes.length === 0 ? (
                <div>
                    <p>{t('noRunes')}</p>
                    <input type="file" accept=".json" onChange={handleFileUpload}/>
                </div>
            ) : (
                <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <button onClick={clearData}>{t('clearData')}</button>
                    <div className="filters" style={{marginBottom: '10px'}}>
                        <div className="select_filter">
                            <div className="filter">
                                <div className="filter_name">{t('filterSet')}</div>
                                <Select
                                    isMulti
                                    name="setName"
                                    options={setNameOptions}
                                    value={filters.setName}
                                    styles={customStyles}
                                    onChange={(selectedOptions) =>
                                        handleFilterChange('setName', selectedOptions)
                                    }
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                />
                            </div>
                            <div className="filter">
                                <div className="filter_name">{t('filterSlot')}</div>
                                <Select
                                    isMulti
                                    name="slotNo"
                                    options={slotOptions}
                                    value={filters.slotNo}
                                    styles={customStyles}
                                    onChange={(selectedOptions) =>
                                        handleFilterChange('slotNo', selectedOptions)
                                    }
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                />
                            </div>
                            <div className="filter">
                                <div className="filter_name">{t('filterMain')}</div>
                                <Select
                                    isMulti
                                    name="runeMain"
                                    options={statOptions}
                                    value={filters.runeMain}
                                    styles={customStyles}
                                    onChange={(selectedOptions) =>
                                        handleFilterChange('runeMain', selectedOptions)
                                    }
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                />
                            </div>
                            <div className="filter">
                                <div className="filter_name">{t('filterSubstats')}</div>
                                <Select
                                    isMulti
                                    name="substat"
                                    options={statOptions}
                                    value={filters.substat}
                                    styles={customStyles}
                                    onChange={(selectedOptions) =>
                                        handleFilterChange('substat', selectedOptions)
                                    }
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                />
                            </div>
                            <div className="filter_efficiency">
                                <div className="filter_efficiency_name">{t('filterLevel')}</div>
                                <div>{filters.level[0]} : {filters.level[1]}
                                    <ReactSlider
                                        className="horizontal-slider"
                                        thumbClassName="thumb"
                                        trackClassName="track"
                                        value={filters.level}
                                        onChange={(values) => handleFilterChange('level', values)}
                                        min={0}
                                        max={15}
                                        ariaLabel={['Lower thumb', 'Upper thumb']}
                                        ariaValuetext={(state) => `Thumb value ${state.valueNow}`}
                                    /></div>
                            </div>
                            <div className="filter_ancient">
                                <div className="filter_name">{t('filterAncient')}</div>
                                <Select
                                    name="ancient"
                                    options={ancientOptions}
                                    value={ancientOptions.find(option => option.value === filters.ancient)}  // Set the selected value
                                    styles={customStyles}  // Optional custom styles if you have them
                                    onChange={(selectedOption) => handleFilterChange('ancient', selectedOption.value)}  // Handle the change
                                    className="basic-single-select"
                                    classNamePrefix="select"
                                />
                            </div>
                        </div>


                        {/* Efficiency Range Sliders */}
                        <div className="filter_sliders">

                            <div className="filter_efficiency_couple">
                                <div className="filter filter_efficiency">
                                    <div className="filter_efficiency_name">{t('efficiencyLabel')}</div>

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
                                <div className="filter filter_efficiency">
                                    <div className="filter_efficiency_name">{t('effiMax')}</div>

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
                            </div>
                            <div className="filter_efficiency_couple">
                                <div className="filter filter_efficiency">
                                    <div className="filter_efficiency_name">{t('effiMinHeroLabel')}</div>

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
                                <div className="filter filter_efficiency">
                                    <div className="filter_efficiency_name">{t('effiMaxHeroLabel')}</div>

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
                            </div>
                            <div className="filter_efficiency_couple">
                                <div className="filter filter_efficiency">
                                    <div className="filter_efficiency_name">{t('effiMinLegLabel')}</div>

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
                                <div className="filter filter_efficiency">
                                    <div className="filter_efficiency_name">{t('effiMaxLegLabel')}</div>
                                    <div>{efficiencyRange.max_leg[0]} : {efficiencyRange.max_leg[1]}
                                        <ReactSlider
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
                        </div>
                    </div>

                    {/* Sorting controls */}
                    <div style={{marginBottom: '10px'}}>
                        <label>{t('orderBy')}</label>
                        <select onChange={(e) => handleSortOrderChange(e.target.value)}>
                            <option value="efficiency">{t('efficiency')}</option>
                            <option value="efficiency_min_hero">{t('efficiencyMinHero')}</option>
                            <option value="efficiency_max_hero">{t('efficiencyMaxHero')}</option>
                            <option value="efficiency_min_leg">{t('efficiencyMinLeg')}</option>
                            <option value="efficiency_max_leg">{t('efficiencyMaxLeg')}</option>
                            <option value="tominhero">{t('gapMinHero')}</option>
                            <option value="tomaxhero">{t('gapMaxHero')}</option>
                            <option value="tominleg">{t('gapMinLeg')}</option>
                            <option value="tomaxleg">{t('gapMaxLeg')}</option>
                        </select>
                        <button onClick={() => handleSortOrderChange(sortOrder.attribute)}>
                            {sortOrder.direction === 'asc' ? t('ascending') : t('descending')}
                        </button>
                    </div>

                    {/* Select to change items per page */}
                    <div style={{marginTop: '10px'}}>
                    <label>{t('itemsPerPage')} </label>
                        <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>

                    <div className="runes">
                        {currentRunes.map((rune) => (
                            <RuneComponent key={rune.rune_id} rune={rune} monster={monsters[rune.occupied_id]}/>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {/* Pagination Component */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default JsonUploader;
