import { useEffect, useState, useMemo, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import Select from 'react-select';
import { getAllItems, getAllMonsters } from '../indexedDB';
import runeSets from '../runeSets';
import RuneComponent from './rune_component';
import { useI18n } from '../i18n';

const COLORS = [
    '#61dafb', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3',
    '#54a0ff', '#5f27cd', '#01a3a4', '#f368e0', '#ff9f43',
    '#ee5a24', '#0abde3', '#10ac84', '#341f97', '#c8d6e5',
    '#8395a7', '#222f3e', '#576574', '#1dd1a1', '#ffeaa7',
    '#dfe6e9', '#b2bec3', '#636e72', '#2d3436', '#a29bfe'
];

const EFFICIENCY_BUCKETS = [
    { label: '0-40%', min: 0, max: 40 },
    { label: '40-50%', min: 40, max: 50 },
    { label: '50-60%', min: 50, max: 60 },
    { label: '60-70%', min: 60, max: 70 },
    { label: '70-80%', min: 70, max: 80 },
    { label: '80-90%', min: 80, max: 90 },
    { label: '90-100%', min: 90, max: 100 },
    { label: '100-110%', min: 100, max: 110 },
    { label: '110-120%', min: 110, max: 120 },
    { label: '120%+', min: 120, max: Infinity },
];

const CHART_CARD_IDS = [
    'setDistribution', 'slotDistribution', 'ancientDistribution',
    'efficiencyDistribution', 'efficiencyBySet', 'efficiencyBySlot', 'scatterExplorer',
];

const CHART_CARD_LABELS = {
    setDistribution: 'chartSetDistribution',
    slotDistribution: 'chartSlotDistribution',
    ancientDistribution: 'chartAncientDistribution',
    efficiencyDistribution: 'chartEfficiencyDistribution',
    efficiencyBySet: 'chartEfficiencyBySet',
    efficiencyBySlot: 'chartEfficiencyBySlot',
    scatterExplorer: 'chartExplorer',
};

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

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ backgroundColor: '#1e2229', border: '1px solid #61dafb', borderRadius: '6px', padding: '10px', color: 'white', fontSize: '13px' }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ margin: '2px 0', color: entry.color || entry.fill }}>{entry.name}: {entry.value}</p>
                ))}
            </div>
        );
    }
    return null;
};

const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const entry = payload[0];
        const pct = typeof entry.percent === 'number' ? (entry.percent * 100).toFixed(1) : null;
        return (
            <div style={{ backgroundColor: '#1e2229', border: '1px solid #61dafb', borderRadius: '6px', padding: '10px', color: 'white', fontSize: '13px' }}>
                <p style={{ margin: '2px 0' }}>{entry.name}: {entry.value}{pct !== null ? ` (${pct}%)` : ''}</p>
            </div>
        );
    }
    return null;
};

const LineTooltipContent = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0]?.payload;
        if (!data) return null;
        return (
            <div style={{ backgroundColor: '#1e2229', border: '1px solid #61dafb', borderRadius: '6px', padding: '10px', color: 'white', fontSize: '12px' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>
                    Rune #{label} — {data.setName} Slot {data.slot} +{data.upgrade}
                </p>
                {payload.map((entry, i) => (
                    <p key={i} style={{ margin: '2px 0', color: entry.stroke }}>{entry.name}: {entry.value?.toFixed(2)}%</p>
                ))}
            </div>
        );
    }
    return null;
};

const renderCustomLabel = ({ name, percent }) => {
    if (percent < 0.03) return null;
    return `${name} (${(percent * 100).toFixed(0)}%)`;
};

const METRIC_COLORS = {
    efficiency: '#61dafb',
    efficiency_max: '#54a0ff',
    efficiency_min_hero: '#d4a0ff',
    efficiency_max_hero: '#b86cff',
    efficiency_min_leg: '#ffe0a0',
    efficiency_max_leg: '#feca57',
};

const RuneStatsPage = () => {
    const { t, lang } = useI18n();
    const [runes, setRunes] = useState([]);
    const [monsters, setMonsters] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedRune, setSelectedRune] = useState(null);

    const getSetName = useCallback((setId) => {
        const s = runeSets[setId];
        if (!s) return `Set ${setId}`;
        return lang === 'fr' && s.name_fr ? s.name_fr : s.name;
    }, [lang]);

    const [visibleCards, setVisibleCards] = useState(() => {
        try {
            const saved = localStorage.getItem('dashboard_visible_cards');
            if (saved) return JSON.parse(saved);
        } catch (_) { /* ignore */ }
        return ['scatterExplorer'];
    });

    const [scatterSets, setScatterSets] = useState([]);
    const [scatterSlots, setScatterSlots] = useState([]);
    const [scatterLimit, setScatterLimit] = useState(100);
    const [scatterSortBy, setScatterSortBy] = useState('efficiency');
    const [scatterMetrics, setScatterMetrics] = useState([
        { value: 'efficiency', label: 'efficiencyShort' },
        { value: 'efficiency_max_hero', label: 'effiMaxHeroShort' },
        { value: 'efficiency_max_leg', label: 'effiMaxLegShort' },
    ]);

    const toggleCard = useCallback((cardId) => {
        setVisibleCards(prev => {
            const next = prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId];
            localStorage.setItem('dashboard_visible_cards', JSON.stringify(next));
            return next;
        });
    }, []);

    const isVisible = useCallback((cardId) => visibleCards.includes(cardId), [visibleCards]);

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

    const setNameOptions = useMemo(() =>
        Object.values(runeSets).map(s => ({ value: s.id_set, label: lang === 'fr' && s.name_fr ? s.name_fr : s.name })), [lang]);

    const slotOptions = useMemo(() =>
        [1,2,3,4,5,6].map(s => ({ value: s, label: `${t('slotPrefix')} ${s}` })), [t]);

    const metricOptions = useMemo(() => [
        { value: 'efficiency', label: 'efficiencyShort' },
        { value: 'efficiency_max', label: 'effiMaxShort' },
        { value: 'efficiency_min_hero', label: 'effiMinHeroShort' },
        { value: 'efficiency_max_hero', label: 'effiMaxHeroShort' },
        { value: 'efficiency_min_leg', label: 'effiMinLegShort' },
        { value: 'efficiency_max_leg', label: 'effiMaxLegShort' },
    ], []);

    const setDistribution = useMemo(() => {
        const counts = {};
        runes.forEach((rune) => {
            const name = getSetName(rune.set_id);
            counts[name] = (counts[name] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [runes, getSetName]);

    const slotDistribution = useMemo(() => {
        const prefix = t('slotPrefix');
        const counts = {};
        runes.forEach((rune) => { counts[`${prefix} ${rune.slot_no}`] = (counts[`${prefix} ${rune.slot_no}`] || 0) + 1; });
        return [1,2,3,4,5,6].map((s) => ({ name: `${prefix} ${s}`, value: counts[`${prefix} ${s}`] || 0 }));
    }, [runes, t]);

    const efficiencyDistribution = useMemo(() => {
        return EFFICIENCY_BUCKETS.map((bucket) => ({
            name: bucket.label,
            count: runes.filter((r) => r.efficiency >= bucket.min && r.efficiency < bucket.max).length
        }));
    }, [runes]);

    const efficiencyBySet = useMemo(() => {
        const setData = {};
        runes.forEach((rune) => {
            const name = getSetName(rune.set_id);
            if (!setData[name]) setData[name] = { total: 0, count: 0 };
            setData[name].total += rune.efficiency;
            setData[name].count += 1;
        });
        return Object.entries(setData)
            .map(([name, data]) => ({ name, avg: parseFloat((data.total / data.count).toFixed(2)), count: data.count }))
            .sort((a, b) => b.avg - a.avg);
    }, [runes, getSetName]);

    const efficiencyBySlot = useMemo(() => {
        const prefix = t('slotPrefix');
        const slotData = {};
        runes.forEach((rune) => {
            if (!slotData[rune.slot_no]) slotData[rune.slot_no] = { total: 0, count: 0 };
            slotData[rune.slot_no].total += rune.efficiency;
            slotData[rune.slot_no].count += 1;
        });
        return [1,2,3,4,5,6].map((s) => ({
            name: `${prefix} ${s}`,
            avg: slotData[s] ? parseFloat((slotData[s].total / slotData[s].count).toFixed(2)) : 0,
            count: slotData[s]?.count || 0
        }));
    }, [runes, t]);

    const qualityDistribution = useMemo(() => {
        const quality = { 'Normal': 0, 'Ancient': 0 };
        runes.forEach((rune) => { rune.ancient === 1 ? quality['Ancient']++ : quality['Normal']++; });
        return Object.entries(quality).map(([name, value]) => ({ name, value }));
    }, [runes]);

    const lineChartData = useMemo(() => {
        const selectedSetIds = scatterSets.map(s => s.value);
        const selectedSlots = scatterSlots.map(s => s.value);
        return runes
            .filter(rune => {
                if (selectedSetIds.length && !selectedSetIds.includes(rune.set_id)) return false;
                if (selectedSlots.length && !selectedSlots.includes(rune.slot_no)) return false;
                return true;
            })
            .map((rune) => ({
                _runeRef: rune,
                efficiency: parseFloat(rune.efficiency?.toFixed(2)),
                efficiency_max: parseFloat(rune.efficiency_max?.toFixed(2)),
                efficiency_min_hero: parseFloat(rune.efficiency_min_hero?.toFixed(2)),
                efficiency_max_hero: parseFloat(rune.efficiency_max_hero?.toFixed(2)),
                efficiency_min_leg: parseFloat(rune.efficiency_min_leg?.toFixed(2)),
                efficiency_max_leg: parseFloat(rune.efficiency_max_leg?.toFixed(2)),
                setName: getSetName(rune.set_id),
                slot: rune.slot_no,
                upgrade: rune.upgrade_curr,
            }))
            .sort((a, b) => b[scatterSortBy] - a[scatterSortBy])
            .slice(0, scatterLimit)
            .map((item, index) => ({ ...item, index: index + 1 }));
    }, [runes, scatterSets, scatterSlots, scatterLimit, scatterSortBy, getSetName]);

    const yDomain = useMemo(() => {
        if (!lineChartData.length || !scatterMetrics.length) return [0, 100];
        let min = Infinity, max = -Infinity;
        const activeKeys = scatterMetrics.map(m => m.value);
        lineChartData.forEach(d => { activeKeys.forEach(key => { const v = d[key]; if (v != null) { if (v < min) min = v; if (v > max) max = v; } }); });
        const range = max - min || 1;
        return [Math.max(0, Math.floor(min - range * 0.1)), Math.ceil(max + range * 0.1)];
    }, [lineChartData, scatterMetrics]);

    const currentSortLabel = t(metricOptions.find(m => m.value === scatterSortBy)?.label || 'efficiencyShort');

    if (loading) return <div style={{ padding: '40px', color: 'white' }}>{t('loading')}</div>;
    if (runes.length === 0) return <div style={{ padding: '40px', color: 'white' }}><p>{t('noRunesStats')}</p></div>;

    return (
        <div style={{ padding: '20px', color: 'white', maxWidth: '1400px', margin: '0 auto' }}>
            <h2>{t('statsTitle')} ({runes.length} {t('runesCount')})</h2>

            <div className="dashboard-config">
                <span className="dashboard-config-label">{t('chartsDisplayed')}</span>
                <div className="dashboard-toggles">
                    {CHART_CARD_IDS.map(id => (
                        <button key={id} className={`dashboard-toggle ${isVisible(id) ? 'active' : ''}`} onClick={() => toggleCard(id)}>
                            {t(CHART_CARD_LABELS[id])}
                        </button>
                    ))}
                </div>
            </div>

            <div className="stats-grid">
                {isVisible('setDistribution') && (
                    <div className="stats-card">
                        <h3>{t('chartSetDistribution')}</h3>
                        <ResponsiveContainer width="100%" height={450}>
                            <PieChart><Pie data={setDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={renderCustomLabel} labelLine={true}>
                                {setDistribution.map((_, i) => <Cell key={`s-${i}`} fill={COLORS[i % COLORS.length]} />)}
                            </Pie><Tooltip content={<PieTooltip />} /></PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {isVisible('slotDistribution') && (
                    <div className="stats-card">
                        <h3>{t('chartSlotDistribution')}</h3>
                        <ResponsiveContainer width="100%" height={450}>
                            <PieChart><Pie data={slotDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={renderCustomLabel} labelLine={true}>
                                {slotDistribution.map((_, i) => <Cell key={`sl-${i}`} fill={COLORS[i % COLORS.length]} />)}
                            </Pie><Tooltip content={<PieTooltip />} /></PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {isVisible('ancientDistribution') && (
                    <div className="stats-card">
                        <h3>{t('chartAncientDistribution')}</h3>
                        <ResponsiveContainer width="100%" height={450}>
                            <PieChart><Pie data={qualityDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={renderCustomLabel} labelLine={true}>
                                <Cell fill="#61dafb" /><Cell fill="#feca57" />
                            </Pie><Tooltip content={<PieTooltip />} /></PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {isVisible('efficiencyDistribution') && (
                    <div className="stats-card stats-card-wide">
                        <h3>{t('chartEfficiencyDistribution')}</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={efficiencyDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="name" stroke="#ccc" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#ccc" />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" name={t('runeCountLabel')} fill="#61dafb" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {isVisible('efficiencyBySet') && (
                    <div className="stats-card stats-card-wide">
                        <h3>{t('chartEfficiencyBySet')}</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={efficiencyBySet} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis type="number" stroke="#ccc" domain={[0, 'auto']} />
                                <YAxis dataKey="name" type="category" stroke="#ccc" width={110} tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} /><Legend />
                                <Bar dataKey="avg" name={t('average')} fill="#61dafb" radius={[0,4,4,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {isVisible('efficiencyBySlot') && (
                    <div className="stats-card">
                        <h3>{t('chartEfficiencyBySlot')}</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={efficiencyBySlot}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="name" stroke="#ccc" /><YAxis stroke="#ccc" />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="avg" name={t('avgEfficiency')} fill="#ff9f43" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {isVisible('scatterExplorer') && (
                    <div className="stats-card stats-card-wide">
                        <h3>{t('chartExplorer')}</h3>
                        <div className="scatter-filters">
                            <div className="scatter-filter">
                                <label>{t('sets')}</label>
                                <Select isMulti options={setNameOptions} value={scatterSets} onChange={setScatterSets} styles={customStyles} placeholder={t('allSets')} className="scatter-select" />
                            </div>
                            <div className="scatter-filter">
                                <label>{t('slots')}</label>
                                <Select isMulti options={slotOptions} value={scatterSlots} onChange={setScatterSlots} styles={customStyles} placeholder={t('allSlots')} className="scatter-select" />
                            </div>
                            <div className="scatter-filter">
                                <label>{t('metrics')}</label>
                                <Select
                                    isMulti
                                    options={metricOptions.map(m => ({ ...m, label: t(m.label) }))}
                                    value={scatterMetrics.map(m => ({ ...m, label: t(m.label) }))}
                                    onChange={(val) => setScatterMetrics((val || []).map(v => {
                                        const orig = metricOptions.find(mo => mo.value === v.value);
                                        return orig || v;
                                    }))}
                                    styles={customStyles}
                                    placeholder={t('chooseMetrics')}
                                    className="scatter-select"
                                />
                            </div>
                            <div className="scatter-filter">
                                <label>{t('runeCount')}</label>
                                <div className="scatter-limit-buttons">
                                    {[50, 100, 200, 400].map(n => (
                                        <button key={n} className={`scatter-limit-btn ${scatterLimit === n ? 'active' : ''}`} onClick={() => setScatterLimit(n)}>{n}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="scatter-filter">
                                <label>{t('sortBy')}</label>
                                <select className="scatter-sort-select" value={scatterSortBy} onChange={(e) => setScatterSortBy(e.target.value)}>
                                    {metricOptions.map(m => <option key={m.value} value={m.value}>{t(m.label)}</option>)}
                                </select>
                            </div>
                        </div>
                        <p style={{ color: '#8395a7', fontSize: '12px', margin: '5px 0 10px 0' }}>
                            {lineChartData.length} {t('runesDisplayed')} — {t('sortedBy')} {currentSortLabel} {t('sortDesc')} ({t('top')} {scatterLimit}) — {t('clickToView')}
                        </p>
                        <ResponsiveContainer width="100%" height={500}>
                            <LineChart data={lineChartData} margin={{ top: 10, right: 30, bottom: 40, left: 10 }}
                                onClick={(e) => { if (e?.activePayload?.length) { const d = e.activePayload[0].payload; if (d?._runeRef) setSelectedRune(d._runeRef); } }}
                                style={{ cursor: 'pointer' }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="index" stroke="#ccc" tick={{ fontSize: 11 }}
                                    label={{ value: `${t('runeAxisLabel')} (${currentSortLabel} ${t('sortDesc')})`, position: 'insideBottom', offset: 0, fill: '#8395a7', fontSize: 12 }} />
                                <YAxis stroke="#ccc" tick={{ fontSize: 11 }} domain={yDomain} allowDataOverflow={true}
                                    label={{ value: t('efficiencyAxisLabel'), angle: -90, position: 'insideLeft', fill: '#8395a7', fontSize: 12 }} />
                                <Tooltip content={<LineTooltipContent />} /><Legend />
                                {scatterMetrics.map((metric) => (
                                    <Line key={metric.value} type="monotone" dataKey={metric.value} name={t(metric.label)}
                                        stroke={METRIC_COLORS[metric.value] || '#61dafb'} dot={false} strokeWidth={2} opacity={0.8} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                        {selectedRune && (
                            <div className="rune-preview-panel">
                                <div className="rune-preview-header">
                                    <h4>{t('selectedRune')}</h4>
                                    <button className="rune-preview-close" onClick={() => setSelectedRune(null)}>✕</button>
                                </div>
                                <RuneComponent rune={selectedRune} monster={monsters[selectedRune.occupied_id]} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RuneStatsPage;
