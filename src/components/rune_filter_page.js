import { useEffect, useState, useMemo, useCallback } from 'react';
import Select from 'react-select';
import { getAllItems, getAllMonsters } from '../indexedDB';
import runeSets from '../runeSets';
import runeStats from '../runeStats';
import RuneComponent from './rune_component';
import Pagination from './pagination';
import { useI18n } from '../i18n';

const customStyles = {
    control: (provided) => ({
        ...provided, backgroundColor: '#282c34', color: 'white',
        borderColor: '#3a3f4b', boxShadow: 'none',
        '&:hover': { borderColor: '#61dafb' }, minHeight: '36px',
    }),
    menu: (provided) => ({ ...provided, backgroundColor: '#282c34', zIndex: 20 }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#61dafb' : '#282c34',
        color: state.isSelected ? '#282c34' : 'white',
        '&:hover': { backgroundColor: '#61dafb', color: '#282c34' },
    }),
    singleValue: (provided) => ({ ...provided, color: 'white' }),
    multiValue: (provided) => ({ ...provided, backgroundColor: '#61dafb' }),
    multiValueLabel: (provided) => ({ ...provided, color: '#282c34' }),
    multiValueRemove: (provided) => ({
        ...provided, color: '#282c34',
        '&:hover': { backgroundColor: '#61dafb', color: '#282c34' },
    }),
    input: (provided) => ({ ...provided, color: 'white' }),
    placeholder: (provided) => ({ ...provided, color: '#8395a7' }),
};

const LEVEL_THRESHOLDS = [
    { value: 0, label: '+0' },
    { value: 3, label: '+3' },
    { value: 6, label: '+6' },
    { value: 9, label: '+9' },
    { value: 12, label: '+12' },
    { value: 15, label: '+15' },
];

const DEFAULT_RULE = {
    id: Date.now(),
    name: '',
    sets: [],         // empty = all sets
    minLevel: 0,
    maxLevel: 15,
    metric: 'efficiency',
    minValue: 0,
    substats: [],     // required substats (at least N of these)
    minSubstatCount: 0,
};

const RuneFilterPage = () => {
    const { t, lang } = useI18n();
    const [runes, setRunes] = useState([]);
    const [monsters, setMonsters] = useState({});
    const [loading, setLoading] = useState(true);

    // Presets
    const [presets, setPresets] = useState(() => {
        try {
            const saved = localStorage.getItem('rune_filter_presets');
            if (saved) return JSON.parse(saved);
        } catch (_) { /* ignore */ }
        return [];
    });
    const [activePresetIndex, setActivePresetIndex] = useState(0);
    const [presetName, setPresetName] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);

    // View mode: 'sell' or 'keep'
    const [viewMode, setViewMode] = useState('sell');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedRunes = await getAllItems('runes');
                const storedMonsters = await getAllMonsters('monsters');
                setRunes(storedRunes);
                setMonsters(storedMonsters);
            } catch (err) {
                console.error('Error loading runes:', err);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const savePresets = useCallback((newPresets) => {
        setPresets(newPresets);
        localStorage.setItem('rune_filter_presets', JSON.stringify(newPresets));
    }, []);

    const getSetName = useCallback((setId) => {
        const s = runeSets[setId];
        if (!s) return `Set ${setId}`;
        return lang === 'fr' && s.name_fr ? s.name_fr : s.name;
    }, [lang]);

    const getStatName = useCallback((statId) => {
        const s = runeStats[statId];
        if (!s) return '?';
        return lang === 'fr' && s.name_fr ? s.name_fr : s.name;
    }, [lang]);

    const setNameOptions = useMemo(() =>
        Object.values(runeSets).map(s => ({ value: s.id_set, label: lang === 'fr' && s.name_fr ? s.name_fr : s.name })),
    [lang]);

    const statOptions = useMemo(() =>
        Object.values(runeStats).map(s => ({ value: s.id_stat, label: lang === 'fr' && s.name_fr ? s.name_fr : s.name })),
    [lang]);

    const metricOptions = useMemo(() => [
        { value: 'efficiency', label: t('efficiencyShort') },
        { value: 'efficiency_max', label: t('effiMaxShort') },
        { value: 'efficiency_min_hero', label: t('effiMinHeroShort') },
        { value: 'efficiency_max_hero', label: t('effiMaxHeroShort') },
        { value: 'efficiency_min_leg', label: t('effiMinLegShort') },
        { value: 'efficiency_max_leg', label: t('effiMaxLegShort') },
    ], [t]);

    // Current preset
    const currentPreset = presets[activePresetIndex] || null;
    const currentRules = currentPreset?.rules || [];

    // Add a new preset
    const addPreset = () => {
        const name = presetName.trim() || `Preset ${presets.length + 1}`;
        const newPresets = [...presets, { name, rules: [{ ...DEFAULT_RULE, id: Date.now() }] }];
        savePresets(newPresets);
        setActivePresetIndex(newPresets.length - 1);
        setPresetName('');
    };

    const deletePreset = (index) => {
        const newPresets = presets.filter((_, i) => i !== index);
        savePresets(newPresets);
        if (activePresetIndex >= newPresets.length) setActivePresetIndex(Math.max(0, newPresets.length - 1));
    };

    // Add rule to current preset
    const addRule = () => {
        if (!currentPreset) return;
        const updated = [...presets];
        updated[activePresetIndex] = {
            ...currentPreset,
            rules: [...currentRules, { ...DEFAULT_RULE, id: Date.now() }]
        };
        savePresets(updated);
    };

    const updateRule = (ruleIndex, field, value) => {
        const updated = [...presets];
        const rules = [...currentRules];
        rules[ruleIndex] = { ...rules[ruleIndex], [field]: value };
        updated[activePresetIndex] = { ...currentPreset, rules };
        savePresets(updated);
    };

    const deleteRule = (ruleIndex) => {
        const updated = [...presets];
        updated[activePresetIndex] = {
            ...currentPreset,
            rules: currentRules.filter((_, i) => i !== ruleIndex)
        };
        savePresets(updated);
    };

    // Export preset
    const exportPreset = () => {
        if (!currentPreset) return;
        const blob = new Blob([JSON.stringify(currentPreset, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentPreset.name.replace(/\s+/g, '_')}_preset.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Import preset
    const importPreset = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.name && data.rules) {
                    const newPresets = [...presets, data];
                    savePresets(newPresets);
                    setActivePresetIndex(newPresets.length - 1);
                }
            } catch (err) {
                alert(t('importError') || 'Invalid preset file');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    // Evaluate runes against current preset rules
    const { sellRunes, keepRunes } = useMemo(() => {
        if (!currentPreset || currentRules.length === 0) {
            return { sellRunes: [], keepRunes: runes };
        }

        const keep = [];
        const sell = [];

        runes.forEach(rune => {
            let shouldKeep = false;

            for (const rule of currentRules) {
                // Check level range
                if (rune.upgrade_curr < rule.minLevel || rune.upgrade_curr > rule.maxLevel) continue;

                // Check set filter
                if (rule.sets && rule.sets.length > 0) {
                    if (!rule.sets.includes(rune.set_id)) continue;
                }

                // Check metric threshold
                const metricValue = rune[rule.metric] || 0;
                if (metricValue < rule.minValue) continue;

                // Check required substats
                if (rule.substats && rule.substats.length > 0 && rule.minSubstatCount > 0) {
                    const runeSubstats = [rune.sub1_id, rune.sub2_id, rune.sub3_id, rune.sub4_id].filter(Boolean);
                    const matchCount = rule.substats.filter(s => runeSubstats.includes(s)).length;
                    if (matchCount < rule.minSubstatCount) continue;
                }

                shouldKeep = true;
                break;
            }

            if (shouldKeep) {
                keep.push(rune);
            } else {
                sell.push(rune);
            }
        });

        return { sellRunes: sell, keepRunes: keep };
    }, [runes, currentPreset, currentRules]);

    const displayedRunes = viewMode === 'sell' ? sellRunes : keepRunes;
    const totalPages = Math.ceil(displayedRunes.length / itemsPerPage);
    const currentRulesDisplay = displayedRunes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [viewMode, activePresetIndex, presets]);

    if (loading) return <div style={{ padding: '40px', color: 'white' }}>{t('loading')}</div>;
    if (runes.length === 0) return <div style={{ padding: '40px', color: 'white' }}><p>{t('noRunesStats')}</p></div>;

    return (
        <div style={{ padding: '20px', color: 'white', maxWidth: '1400px', margin: '0 auto' }}>
            <h2>{t('filterPageTitle')}</h2>

            {/* Preset management */}
            <div className="filter-preset-bar">
                <div className="filter-preset-tabs">
                    {presets.map((preset, i) => (
                        <div key={i} className={`filter-preset-tab ${i === activePresetIndex ? 'active' : ''}`}>
                            <button className="filter-preset-tab-btn" onClick={() => setActivePresetIndex(i)}>
                                {preset.name}
                            </button>
                            <button className="filter-preset-delete" onClick={() => deletePreset(i)}>×</button>
                        </div>
                    ))}
                </div>
                <div className="filter-preset-actions">
                    <input
                        type="text"
                        className="filter-preset-input"
                        placeholder={t('presetNamePlaceholder')}
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addPreset()}
                    />
                    <button className="filter-btn" onClick={addPreset}>+ {t('addPreset')}</button>
                    <button className="filter-btn" onClick={exportPreset} disabled={!currentPreset}>{t('exportPreset')}</button>
                    <label className="filter-btn filter-import-btn">
                        {t('importPreset')}
                        <input type="file" accept=".json" onChange={importPreset} style={{ display: 'none' }} />
                    </label>
                </div>
            </div>

            {/* Rules editor */}
            {currentPreset && (
                <div className="filter-rules-section">
                    <h3>{t('rulesTitle')} — {currentPreset.name}</h3>
                    <p className="filter-rules-desc">{t('rulesDesc')}</p>

                    {currentRules.map((rule, ruleIdx) => (
                        <div key={rule.id || ruleIdx} className="filter-rule-card">
                            <div className="filter-rule-header">
                                <span className="filter-rule-number">#{ruleIdx + 1}</span>
                                <button className="filter-rule-delete" onClick={() => deleteRule(ruleIdx)}>×</button>
                            </div>
                            <div className="filter-rule-fields">
                                <div className="filter-rule-field">
                                    <label>{t('filterSet')}</label>
                                    <Select
                                        isMulti
                                        options={setNameOptions}
                                        value={setNameOptions.filter(o => (rule.sets || []).includes(o.value))}
                                        onChange={(val) => updateRule(ruleIdx, 'sets', (val || []).map(v => v.value))}
                                        styles={customStyles}
                                        placeholder={t('allSets')}
                                    />
                                </div>
                                <div className="filter-rule-field filter-rule-field-small">
                                    <label>{t('minLevel')}</label>
                                    <select value={rule.minLevel} onChange={(e) => updateRule(ruleIdx, 'minLevel', Number(e.target.value))}>
                                        {LEVEL_THRESHOLDS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                    </select>
                                </div>
                                <div className="filter-rule-field filter-rule-field-small">
                                    <label>{t('maxLevel')}</label>
                                    <select value={rule.maxLevel} onChange={(e) => updateRule(ruleIdx, 'maxLevel', Number(e.target.value))}>
                                        {LEVEL_THRESHOLDS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                    </select>
                                </div>
                                <div className="filter-rule-field filter-rule-field-small">
                                    <label>{t('metricLabel')}</label>
                                    <select value={rule.metric} onChange={(e) => updateRule(ruleIdx, 'metric', e.target.value)}>
                                        {metricOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select>
                                </div>
                                <div className="filter-rule-field filter-rule-field-small">
                                    <label>{t('minValueLabel')}</label>
                                    <input
                                        type="number"
                                        className="filter-number-input"
                                        value={rule.minValue}
                                        onChange={(e) => updateRule(ruleIdx, 'minValue', Number(e.target.value))}
                                        min={0} max={200} step={1}
                                    />
                                </div>
                                <div className="filter-rule-field">
                                    <label>{t('requiredSubstats')}</label>
                                    <Select
                                        isMulti
                                        options={statOptions}
                                        value={statOptions.filter(o => (rule.substats || []).includes(o.value))}
                                        onChange={(val) => updateRule(ruleIdx, 'substats', (val || []).map(v => v.value))}
                                        styles={customStyles}
                                        placeholder={t('anySubstats')}
                                    />
                                </div>
                                <div className="filter-rule-field filter-rule-field-small">
                                    <label>{t('minSubstatCount')}</label>
                                    <input
                                        type="number"
                                        className="filter-number-input"
                                        value={rule.minSubstatCount}
                                        onChange={(e) => updateRule(ruleIdx, 'minSubstatCount', Number(e.target.value))}
                                        min={0} max={4} step={1}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <button className="filter-btn filter-add-rule" onClick={addRule}>+ {t('addRule')}</button>
                </div>
            )}

            {/* Results */}
            {currentPreset && (
                <div className="filter-results">
                    <div className="filter-results-header">
                        <div className="filter-results-tabs">
                            <button className={`filter-results-tab ${viewMode === 'sell' ? 'active sell' : ''}`} onClick={() => setViewMode('sell')}>
                                🗑️ {t('toSell')} ({sellRunes.length})
                            </button>
                            <button className={`filter-results-tab ${viewMode === 'keep' ? 'active keep' : ''}`} onClick={() => setViewMode('keep')}>
                                ✅ {t('toKeep')} ({keepRunes.length})
                            </button>
                        </div>
                        <div>
                            <label>{t('itemsPerPage')} </label>
                            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>

                    <div className="runes">
                        {currentRulesDisplay.map((rune) => (
                            <RuneComponent key={rune.rune_id} rune={rune} monster={monsters[rune.occupied_id]} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    )}
                </div>
            )}

            {!currentPreset && (
                <div className="filter-empty">
                    <p>{t('noPresetMessage')}</p>
                </div>
            )}
        </div>
    );
};

export default RuneFilterPage;
